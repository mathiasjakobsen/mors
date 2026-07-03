// Trace per-glyph bitmaps into SVG path data via potrace.
//   node scripts/font/trace-glyphs.mjs                  → regular weight
//   WEIGHT=light node scripts/font/trace-glyphs.mjs     → erode strokes first
//
// Reads:  scripts/font/glyphs/<name>.png + _mapping.json
// Writes: scripts/font/glyphs/_traced.json        (regular)
//      or scripts/font/glyphs/_traced-light.json  (light: bitmap eroded 1px before tracing)

import potrace from 'potrace';
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

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
  alphaMax: 1.0,         // smoothness threshold
  optCurve: true,
  optTolerance: 0.4,     // lower = closer to bitmap, higher = smoother
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
async function shrinkInkToBuffer(pngPath, perSideNativePx, upscale) {
  const meta = await sharp(pngPath).metadata();
  const W = meta.width * upscale;
  const H = meta.height * upscale;
  const d = perSideNativePx * upscale;               // erosion distance, upscaled px
  // Blur radius must exceed one native pixel (= `upscale` px) or the source's
  // per-pixel blockiness survives thresholding as lumpy "scalloped" edges.
  const sigma = Math.max(d, upscale * 1.5);          // ≥1.5 native px: dissolves the pixel grid, keeps curves smooth
  const L = 255 * normCdf(d / sigma);                // threshold that shifts the edge inward by d
  const margin = Math.ceil(sigma * 3);               // white pad so blur near real edges stays correct

  // ink→255, bg→0, with a white border added before blurring, then blur.
  const { data, info } = await sharp(pngPath)
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

function extractPathD(svg) {
  const m = svg.match(/d="([^"]+)"/);
  return m ? m[1] : null;
}

// Parse an SVG path "d" string into command tokens.
// Supports: M m L l H h V v C c S s Q q T t Z z
function parsePathD(d) {
  const tokens = [];
  const re = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
  let match;
  while ((match = re.exec(d))) {
    const op = match[1];
    const args = match[2].trim()
      ? match[2].trim().split(/[\s,]+/).map(Number)
      : [];
    tokens.push({ op, args });
  }
  return tokens;
}

// Normalize tokens into absolute M/L/C/Z primitives only.
// (No Q, S, T, H, V, A, or relative variants downstream.)
function normalize(tokens) {
  const out = [];
  let cx = 0, cy = 0;       // current point
  let startX = 0, startY = 0; // subpath start
  let prevCtrl = null;       // previous control point for S/T smoothing

  for (const { op, args } of tokens) {
    const isRel = op === op.toLowerCase();
    const O = op.toUpperCase();

    switch (O) {
      case 'M': {
        // First M is moveto; subsequent pairs are implicit L.
        for (let i = 0; i < args.length; i += 2) {
          let x = args[i], y = args[i + 1];
          if (isRel && (i > 0 || out.length > 0)) { x += cx; y += cy; }
          if (i === 0) {
            out.push({ op: 'M', args: [x, y] });
            startX = x; startY = y;
          } else {
            out.push({ op: 'L', args: [x, y] });
          }
          cx = x; cy = y;
          prevCtrl = null;
        }
        break;
      }
      case 'L': {
        for (let i = 0; i < args.length; i += 2) {
          let x = args[i], y = args[i + 1];
          if (isRel) { x += cx; y += cy; }
          out.push({ op: 'L', args: [x, y] });
          cx = x; cy = y;
          prevCtrl = null;
        }
        break;
      }
      case 'H': {
        for (const a of args) {
          let x = a;
          if (isRel) x += cx;
          out.push({ op: 'L', args: [x, cy] });
          cx = x;
          prevCtrl = null;
        }
        break;
      }
      case 'V': {
        for (const a of args) {
          let y = a;
          if (isRel) y += cy;
          out.push({ op: 'L', args: [cx, y] });
          cy = y;
          prevCtrl = null;
        }
        break;
      }
      case 'C': {
        for (let i = 0; i < args.length; i += 6) {
          let x1 = args[i], y1 = args[i + 1];
          let x2 = args[i + 2], y2 = args[i + 3];
          let x = args[i + 4], y = args[i + 5];
          if (isRel) { x1 += cx; y1 += cy; x2 += cx; y2 += cy; x += cx; y += cy; }
          out.push({ op: 'C', args: [x1, y1, x2, y2, x, y] });
          cx = x; cy = y;
          prevCtrl = [x2, y2];
        }
        break;
      }
      case 'S': {
        for (let i = 0; i < args.length; i += 4) {
          let x2 = args[i], y2 = args[i + 1];
          let x = args[i + 2], y = args[i + 3];
          if (isRel) { x2 += cx; y2 += cy; x += cx; y += cy; }
          const x1 = prevCtrl ? 2 * cx - prevCtrl[0] : cx;
          const y1 = prevCtrl ? 2 * cy - prevCtrl[1] : cy;
          out.push({ op: 'C', args: [x1, y1, x2, y2, x, y] });
          cx = x; cy = y;
          prevCtrl = [x2, y2];
        }
        break;
      }
      case 'Q': {
        // Convert quadratic to cubic.
        for (let i = 0; i < args.length; i += 4) {
          let qx = args[i], qy = args[i + 1];
          let x = args[i + 2], y = args[i + 3];
          if (isRel) { qx += cx; qy += cy; x += cx; y += cy; }
          const x1 = cx + (2 / 3) * (qx - cx);
          const y1 = cy + (2 / 3) * (qy - cy);
          const x2 = x + (2 / 3) * (qx - x);
          const y2 = y + (2 / 3) * (qy - y);
          out.push({ op: 'C', args: [x1, y1, x2, y2, x, y] });
          cx = x; cy = y;
          prevCtrl = [qx, qy];
        }
        break;
      }
      case 'Z': {
        out.push({ op: 'Z', args: [] });
        cx = startX; cy = startY;
        prevCtrl = null;
        break;
      }
      default:
        console.warn(`unhandled SVG path op: ${op}`);
    }
  }
  return out;
}

// ── Main ───────────────────────────────────────────────────────────────────
const mapping = JSON.parse(await readFile(MAPPING_PATH, 'utf8'));
const traced = [];

for (const g of mapping) {
  try {
    const filename = g.filename ?? `${g.name}.png`;
    const pngPath = join(GLYPHS_DIR, filename);
    // When thinning, we supersample by UPSCALE so path coords come back in the
    // enlarged space; scale them back to native px afterwards.
    const scaleBack = ERODE_PER_SIDE_PX > 0 ? UPSCALE : 1;
    const input = ERODE_PER_SIDE_PX > 0
      ? await shrinkInkToBuffer(pngPath, ERODE_PER_SIDE_PX, UPSCALE)
      : pngPath;
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
      bbox: g.bbox,
      padding: g.padding ?? 0,
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
