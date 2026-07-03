// Trace per-glyph bitmaps into SVG path data via potrace.
//   node scripts/font/trace-glyphs.mjs                  → regular weight (strokes thinned 0.7px/side)
//   WEIGHT=light node scripts/font/trace-glyphs.mjs     → light weight   (thinned 1.5px/side)
//   THIN=<px> …                                         → override the per-side thinning
//
// Strokes are thinned by smoothly shrinking the ink (blur-then-threshold on an
// 8x supersample). The signature 'r' is rendered from public/brand/mors-logo.svg
// and run through the same pipeline so it picks up each weight automatically.
//
// Reads:  scripts/font/glyphs/<name>.png + _mapping.json + public/brand/mors-logo.svg
// Writes: scripts/font/glyphs/_traced.json  (regular)  or  _traced-light.json  (light)

import potrace from 'potrace';
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { extractPathD, parsePathD, normalize, bboxOfCommands } from './svg-path.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GLYPHS_DIR = join(__dirname, 'glyphs');
const MAPPING_PATH = join(GLYPHS_DIR, '_mapping.json');

const WEIGHT = process.env.WEIGHT === 'light' ? 'light' : 'regular';

// Stroke thinning, expressed in *native* pixels peeled off EACH side of every
// stroke. Source strokes are ~7 px wide, so 0.7 px/side ≈ 20 % thinner (Regular).
// Light starts from a ~5 px stroke (it used to erode a whole native px/side), so
// 1.5 px/side keeps it ~20 % thinner than the old Light — and clearly lighter
// than the new Regular. Values can be fractional: the bitmap is supersampled
// (see UPSCALE) before erosion, giving sub-pixel control native integer erosion
// can't. THIN env var overrides the per-weight default (in native px/side).
const ERODE_PER_SIDE_PX = process.env.THIN != null
  ? Number(process.env.THIN)
  : (WEIGHT === 'light' ? 1.5 : 0.7);
const UPSCALE = 8; // supersample factor for sub-pixel erosion

const OUT_PATH = WEIGHT === 'light'
  ? join(GLYPHS_DIR, '_traced-light.json')
  : join(GLYPHS_DIR, '_traced.json');

console.log(`weight=${WEIGHT}  erosion=${ERODE_PER_SIDE_PX}px/side  upscale=${UPSCALE}x  out=${OUT_PATH.split('/').pop()}`);

const POTRACE_OPTS = {
  threshold: 128,        // already binarized 0/255
  turdSize: 0,           // already clean — keep every shape
  alphaMax: 1.334,       // corner threshold — max value rounds nearly every vertex (silky curves)
  optCurve: true,
  optTolerance: 0.8,     // higher = fewer, smoother bezier segments
  turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
};

function traceInput(input, upscale = 1) {
  // input can be a file path or a Buffer.
  // optTolerance is in pixel units, so scale it with the supersample factor to
  // keep curve smoothness equivalent to a native-resolution trace.
  const opts = { ...POTRACE_OPTS, optTolerance: POTRACE_OPTS.optTolerance * upscale };
  return new Promise((resolve, reject) => {
    potrace.trace(input, opts, (err, svg) => {
      if (err) reject(err);
      else resolve(svg);
    });
  });
}

// Standard-normal CDF via a rational erf approximation (Abramowitz & Stegun 7.1.26).
function normCdf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-z * z / 2);
  const p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 +
    t * (-1.821255978 + t * 1.330274429))));
  return z >= 0 ? 1 - p : p;
}

// Smoothly shrink the BLACK ink region by `perSideNativePx` (native px), pulling
// every stroke edge inward isotropically. Uses the blur-then-threshold identity
// for morphology: a Gaussian-blurred step edge has value 255·Φ(x/σ) at signed
// distance x inside the ink, so thresholding at L = 255·Φ(d/σ) moves the boundary
// inward by exactly d — with round, smooth corners (unlike diamond-shaped
// 4-connectivity erosion, which facets curves).
//
// The bitmap is supersampled by `upscale` first so the shifted boundary lands on
// a fine grid; tracing then happens at that resolution and the caller scales the
// path coords back to native units.
async function shrinkInkToBuffer(input, perSideNativePx, upscale) {
  // `input` may be a PNG path or a raw PNG Buffer.
  const meta = await sharp(input).metadata();
  const W = meta.width * upscale;
  const H = meta.height * upscale;
  const d = perSideNativePx * upscale;               // erosion distance, upscaled px
  // Blur radius must exceed one native pixel (= `upscale` px) or the source's
  // per-pixel blockiness survives thresholding as lumpy "scalloped" edges.
  const sigma = Math.max(d, upscale * 1.7);          // ≥1.7 native px: dissolves the pixel grid, keeps curves silky
  const L = 255 * normCdf(d / sigma);                // threshold that shifts the edge inward by d
  const margin = Math.ceil(sigma * 3);               // white pad so blur near real edges stays correct

  // ink→255, bg→0, with a white border added before blurring, then blur.
  const { data, info } = await sharp(input)
    .resize(W, H, { kernel: 'nearest' })
    .greyscale()
    .extend({ top: margin, bottom: margin, left: margin, right: margin, background: '#ffffff' })
    .negate()
    .blur(sigma)
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Threshold and crop back to the un-padded WxH so coords match the upscaled grid.
  const ew = info.width;
  const out = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const v = data[((y + margin) * ew + (x + margin)) * info.channels];
      out[y * W + x] = v >= L ? 0 : 255; // 0 = ink (black) for potrace
    }
  }
  return sharp(out, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
}

// ── Main ───────────────────────────────────────────────────────────────────
const mapping = JSON.parse(await readFile(MAPPING_PATH, 'utf8'));

// The brand's signature 'r' is a tall brush shape (rounded top hook, stem
// sweeping into a curled foot). Rather than the plain sliced 'r', we render that
// exact vector from the logo into a bitmap at the SAME native resolution as the
// other glyphs, so it flows through the identical thinning + trace pipeline and
// picks up each weight's stroke weight automatically. Returns a PNG buffer plus
// a sheet-coordinate bbox that sits its foot on the row-0 baseline.
async function renderLogoR() {
  const LOGO_PATH = join(__dirname, '..', '..', 'public', 'brand', 'mors-logo.svg');
  const svg = await readFile(LOGO_PATH, 'utf8');
  const paths = [...svg.matchAll(/<path\s+d="([^"]+)"/g)].map((m) => m[1]);
  const rCmds = normalize(parsePathD(paths[2])); // [0]=m [1]=o [2]=r [3]=sup-s
  const rBox = bboxOfCommands(rCmds);
  const oBox = bboxOfCommands(normalize(parsePathD(paths[1])));

  // Scale so the logo 'o' counter-height equals the sliced x-height; share the
  // row-0 baseline (bottom of the sliced 'o').
  const oGlyph = mapping.find((m) => m.char === 'o');
  const pad = oGlyph.padding ?? 1;
  const scale = oGlyph.bbox.h / oBox.h;
  const baselinePx = oGlyph.bbox.y + oGlyph.bbox.h;
  const w = Math.round(rBox.w * scale);
  const h = Math.round(rBox.h * scale);

  // Draw the r black-on-white at native size, r's bbox mapped into [pad..pad+w/h].
  const cw = w + pad * 2;
  const ch = h + pad * 2;
  const glyphSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${ch}">`
    + `<rect width="100%" height="100%" fill="#fff"/>`
    + `<g transform="translate(${pad} ${pad}) scale(${scale}) translate(${-rBox.x} ${-rBox.y})">`
    + `<path d="${paths[2]}" fill="#000"/></g></svg>`;
  const buffer = await sharp(Buffer.from(glyphSvg)).png().toBuffer();

  return {
    buffer,
    bbox: { x: oGlyph.bbox.x, y: baselinePx - h, w, h }, // foot on baseline
    padding: pad,
  };
}
const logoR = await renderLogoR();

const traced = [];

for (const g of mapping) {
  try {
    const isLogoR = g.char === 'r';
    const filename = g.filename ?? `${g.name}.png`;
    const source = isLogoR ? logoR.buffer : join(GLYPHS_DIR, filename);
    const bbox = isLogoR ? logoR.bbox : g.bbox;
    const padding = isLogoR ? logoR.padding : (g.padding ?? 0);
    // When thinning, we supersample by UPSCALE so path coords come back in the
    // enlarged space; scale them back to native px afterwards.
    const scaleBack = ERODE_PER_SIDE_PX > 0 ? UPSCALE : 1;
    const input = ERODE_PER_SIDE_PX > 0
      ? await shrinkInkToBuffer(source, ERODE_PER_SIDE_PX, UPSCALE)
      : source;
    const svg = await traceInput(input, scaleBack);
    const d = extractPathD(svg);
    if (!d) {
      console.warn(`✗ ${g.name} (${g.char}): no path in SVG output`);
      continue;
    }
    const commands = normalize(parsePathD(d));
    if (scaleBack !== 1) {
      for (const cmd of commands) {
        cmd.args = cmd.args.map((v) => v / scaleBack);
      }
    }
    traced.push({
      name: g.name,
      char: g.char,
      codepoint: g.codepoint,
      bbox,
      padding,
      row: g.row,
      indexInRow: g.indexInRow,
      commands,
    });
  } catch (err) {
    console.warn(`✗ ${g.name} (${g.char}): ${err.message}`);
  }
}

await writeFile(OUT_PATH, JSON.stringify(traced, null, 2));
console.log(`✓ traced ${traced.length}/${mapping.length} glyphs → ${OUT_PATH}`);
