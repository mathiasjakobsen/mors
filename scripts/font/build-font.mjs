// Build the Mors Display font from potrace'd source bitmaps.
//   node scripts/font/build-font.mjs                 → Regular (weight 400)
//   WEIGHT=medium node scripts/font/build-font.mjs   → Medium  (weight 500)
//   WEIGHT=bold node scripts/font/build-font.mjs     → Bold    (weight 700)
//
// Inputs:
//   scripts/font/glyphs/_traced{,-medium,-bold}.json  (from trace-glyphs.mjs)
// Outputs:
//   public/fonts/mors-display{,-medium,-bold}.otf / .woff2
//   scripts/font/_sample{,-medium,-bold}.svg / .png

import opentype from 'opentype.js';
import wawoff2 from 'wawoff2';
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const FONT_OUT_DIR = join(ROOT, 'public', 'fonts');

const WEIGHTS = {
  regular: { style: 'Regular', class: 400, base: 'mors-display',        traced: '_traced.json',        sample: '_sample' },
  medium:  { style: 'Medium',  class: 500, base: 'mors-display-medium', traced: '_traced-medium.json', sample: '_sample-medium' },
  bold:    { style: 'Bold',    class: 700, base: 'mors-display-bold',   traced: '_traced-bold.json',   sample: '_sample-bold' },
};
const WEIGHT = WEIGHTS[process.env.WEIGHT] ? process.env.WEIGHT : 'regular';
const cfg = WEIGHTS[WEIGHT];
const STYLE_NAME = cfg.style;
const WEIGHT_CLASS = cfg.class;
const FONT_BASENAME = cfg.base;
const TRACED_PATH = join(__dirname, 'glyphs', cfg.traced);
const SAMPLE_BASENAME = cfg.sample;
console.log(`weight=${WEIGHT}  style=${STYLE_NAME}  weightClass=${WEIGHT_CLASS}`);

await mkdir(FONT_OUT_DIR, { recursive: true });

// ── Font metric targets (in em units) ──────────────────────────────────────
const UPEM = 1000;
const TARGET_CAP_HEIGHT = 700; // unit-target for uppercase baseline-to-top
const SIDE_BEARING = 60;       // left/right whitespace per glyph
const SPACE_ADVANCE = 280;     // width of U+0020

// ── Load traced glyphs ─────────────────────────────────────────────────────
const traced = JSON.parse(await readFile(TRACED_PATH, 'utf8'));

// ── Baselines per row ──────────────────────────────────────────────────────
// Reference characters that sit cleanly on the baseline for each row.
const BASELINE_REFS = {
  0: new Set('acemnorsuvwxz'),         // lowercase non-descender, non-ascender
  1: new Set('ABCDEFHIKLMNOPRSTUVWXYZ'), // uppercase (all sit on baseline)
  2: new Set('0123456789'),             // digits
  3: new Set('.,:;-+=*'),               // punctuation that sits on baseline
};

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

const rowBaselinePx = {};
for (const [row, refs] of Object.entries(BASELINE_REFS)) {
  const bottoms = traced
    .filter((g) => g.row === Number(row) && refs.has(g.char))
    .map((g) => g.bbox.y + g.bbox.h);
  if (bottoms.length === 0) {
    console.warn(`row ${row}: no baseline refs found`);
    continue;
  }
  rowBaselinePx[row] = median(bottoms);
}
console.log('row baselines (px):', rowBaselinePx);

// ── Scale from uppercase cap height ────────────────────────────────────────
const capRow = traced.filter((g) => g.row === 1);
const capBaselinePx = rowBaselinePx[1];
const capTopPx = Math.min(...capRow.map((g) => g.bbox.y));
const capHeightPx = capBaselinePx - capTopPx;
const SCALE = TARGET_CAP_HEIGHT / capHeightPx;
console.log(`cap height: ${capHeightPx}px → scale ${SCALE.toFixed(4)} (target ${TARGET_CAP_HEIGHT}u)`);

// ── Vertical extents for font header ───────────────────────────────────────
// Find lowest descender and highest ascender across all glyphs.
let lowestY = 0, highestY = 0;
for (const g of traced) {
  const baseline = rowBaselinePx[g.row];
  if (baseline == null) continue;
  const top = (baseline - g.bbox.y) * SCALE;
  const bottom = (baseline - (g.bbox.y + g.bbox.h)) * SCALE;
  if (top > highestY) highestY = top;
  if (bottom < lowestY) lowestY = bottom;
}
const ASCENDER = Math.ceil(highestY + 50);
const DESCENDER = Math.floor(lowestY - 20);
console.log(`vertical extent: ${DESCENDER} to ${ASCENDER} (em ${UPEM})`);

// ── Build opentype glyphs ──────────────────────────────────────────────────
// Snap glyph bottoms to the row baseline when within this pixel tolerance.
// (Source PNG has 1–3px of vertical jitter per glyph; without snapping you get
// a bouncing baseline in the rendered font.)
const BASELINE_SNAP_PX = 4;

function transformPath(commands, bbox, rowBaseline, padding = 0) {
  // Transform from padded crop pixel coords (y-down) to font units (y-up, baseline-aligned).
  // Subtract padding so coords are relative to the unpadded glyph.
  const actualBottom = bbox.y + bbox.h;
  let baselineOffset;
  if (Math.abs(actualBottom - rowBaseline) <= BASELINE_SNAP_PX) {
    // Snap: pretend the glyph's bottom edge sits exactly on the baseline.
    // baselineOffset becomes bbox.h so that py = bbox.h maps to font_y = 0.
    baselineOffset = bbox.h;
  } else {
    // Preserve the actual vertical position (descenders, accents, etc.).
    baselineOffset = rowBaseline - bbox.y;
  }
  const tx = (px) => Math.round((px - padding) * SCALE + SIDE_BEARING);
  const ty = (py) => Math.round((baselineOffset - (py - padding)) * SCALE);

  const path = new opentype.Path();
  for (const { op, args } of commands) {
    switch (op) {
      case 'M':
        path.moveTo(tx(args[0]), ty(args[1]));
        break;
      case 'L':
        path.lineTo(tx(args[0]), ty(args[1]));
        break;
      case 'C':
        // Cubic bezier: ctrl1, ctrl2, end
        path.bezierCurveTo(
          tx(args[0]), ty(args[1]),
          tx(args[2]), ty(args[3]),
          tx(args[4]), ty(args[5]),
        );
        break;
      case 'Z':
        path.closePath();
        break;
    }
  }
  return path;
}

// ── Contour winding ─────────────────────────────────────────────────────────
// potrace winds every contour the same way, which only renders correctly under
// the even-odd fill rule. Installed OTF/TTF fonts are rasterised with the
// NON-ZERO rule (design apps, print, most OSes), where same-direction contours
// make counters (the hole in o, e, a, b, …) fill solid. Fix: orient contours by
// nesting depth — outer contours clockwise, holes counter-clockwise — so the
// hole's winding cancels the outer's and the counter stays open under non-zero.
function splitContours(commands) {
  const out = [];
  let cur = null;
  for (const c of commands) {
    if (c.type === 'M') { if (cur) out.push(cur); cur = [c]; }
    else if (cur) cur.push(c);
  }
  if (cur) out.push(cur);
  return out;
}

function onCurvePoints(contour) {
  const pts = [];
  for (const c of contour) if (c.type !== 'Z') pts.push([c.x, c.y]);
  return pts;
}

function signedArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2; // > 0 = counter-clockwise (font units are y-up)
}

function pointInPolygon(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > p[1]) !== (yj > p[1]) &&
        p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Reverse one contour (M + L/C/Q segments, optional Z), swapping cubic controls.
function reverseContour(contour) {
  const hasZ = contour[contour.length - 1].type === 'Z';
  const body = hasZ ? contour.slice(0, -1) : contour.slice();
  const P = body.map((c) => [c.x, c.y]);
  const k = P.length - 1;
  const out = [{ type: 'M', x: P[k][0], y: P[k][1] }];
  for (let i = k; i >= 1; i--) {
    const seg = body[i]; // original segment P[i-1] → P[i]
    const [x, y] = P[i - 1];
    if (seg.type === 'C') out.push({ type: 'C', x1: seg.x2, y1: seg.y2, x2: seg.x1, y2: seg.y1, x, y });
    else if (seg.type === 'Q') out.push({ type: 'Q', x1: seg.x1, y1: seg.y1, x, y });
    else out.push({ type: 'L', x, y });
  }
  if (hasZ) out.push({ type: 'Z' });
  return out;
}

function fixWinding(path) {
  const contours = splitContours(path.commands);
  if (contours.length <= 1) return; // no counters, nothing to orient
  const info = contours.map((c) => {
    const pts = onCurvePoints(c);
    return { pts, area: signedArea(pts) };
  });
  const oriented = contours.map((c, i) => {
    // Nesting depth = how many other contours enclose this one.
    let depth = 0;
    for (let j = 0; j < contours.length; j++) {
      if (j !== i && info[j].pts.length > 2 && pointInPolygon(info[i].pts[0], info[j].pts)) depth++;
    }
    const wantClockwise = depth % 2 === 0;      // outer levels CW (area < 0)
    const isClockwise = info[i].area < 0;
    return wantClockwise === isClockwise ? c : reverseContour(c);
  });
  path.commands = oriented.flat();
}

const notdef = new opentype.Glyph({
  name: '.notdef',
  unicode: 0,
  advanceWidth: 500,
  path: new opentype.Path(),
});

const space = new opentype.Glyph({
  name: 'space',
  unicode: 0x20,
  advanceWidth: SPACE_ADVANCE,
  path: new opentype.Path(),
});

const glyphList = [notdef, space];
const seenCodepoints = new Set([0x20]);

for (const g of traced) {
  if (seenCodepoints.has(g.codepoint)) {
    // Duplicate codepoint in source — keep the first only.
    continue;
  }
  seenCodepoints.add(g.codepoint);

  const baseline = rowBaselinePx[g.row];
  if (baseline == null) continue;

  const path = transformPath(g.commands, g.bbox, baseline, g.padding ?? 0);
  fixWinding(path);
  const advanceWidth = Math.round(g.bbox.w * SCALE + SIDE_BEARING * 2);

  glyphList.push(new opentype.Glyph({
    name: g.name,
    unicode: g.codepoint,
    advanceWidth,
    path,
  }));
}

// ── Superscript s (U+02E2) ─────────────────────────────────────────────────
// Not in the source sheet — the brand uses "morˢ" constantly, so we synthesise
// it from the lowercase 's': scale it down and raise it so its top sits at cap
// height. Computed in font units and reused by the QA sample below.
const SUP_SCALE = 0.465;  // size relative to the full lowercase 's'
const SUP_TOP = TARGET_CAP_HEIGHT; // align the superscript's top with cap height

function buildSuperscriptS() {
  const sG = traced.find((t) => t.char === 's');
  if (!sG) return null;
  const baseline = rowBaselinePx[sG.row];
  if (baseline == null) return null;
  const pad = sG.padding ?? 0;
  const actualBottom = sG.bbox.y + sG.bbox.h;
  const baselineOffset = Math.abs(actualBottom - baseline) <= BASELINE_SNAP_PX
    ? sG.bbox.h
    : baseline - sG.bbox.y;
  // Base 's' → font units (baseline-aligned), matching transformPath().
  const bx = (px) => (px - pad) * SCALE + SIDE_BEARING;
  const by = (py) => (baselineOffset - (py - pad)) * SCALE;

  let minX = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const { args } of sG.commands) {
    for (let i = 0; i < args.length; i += 2) {
      const X = bx(args[i]), Y = by(args[i + 1]);
      if (X < minX) minX = X;
      if (X > maxX) maxX = X;
      if (Y > maxY) maxY = Y;
    }
  }
  // Shrink around origin, shift left edge to the side bearing, raise to cap top.
  const ox = SIDE_BEARING - minX * SUP_SCALE;
  const oy = SUP_TOP - maxY * SUP_SCALE;
  const TX = (px) => bx(px) * SUP_SCALE + ox;
  const TY = (py) => by(py) * SUP_SCALE + oy;
  const advance = Math.round((maxX - minX) * SUP_SCALE + SIDE_BEARING * 2);

  return { commands: sG.commands, TX, TY, advance };
}

const supS = buildSuperscriptS();
if (supS) {
  const path = new opentype.Path();
  for (const { op, args } of supS.commands) {
    switch (op) {
      case 'M': path.moveTo(Math.round(supS.TX(args[0])), Math.round(supS.TY(args[1]))); break;
      case 'L': path.lineTo(Math.round(supS.TX(args[0])), Math.round(supS.TY(args[1]))); break;
      case 'C': path.bezierCurveTo(
        Math.round(supS.TX(args[0])), Math.round(supS.TY(args[1])),
        Math.round(supS.TX(args[2])), Math.round(supS.TY(args[3])),
        Math.round(supS.TX(args[4])), Math.round(supS.TY(args[5])),
      ); break;
      case 'Z': path.closePath(); break;
    }
  }
  fixWinding(path);
  glyphList.push(new opentype.Glyph({
    name: 'uni02E2',
    unicode: 0x02E2,
    advanceWidth: supS.advance,
    path,
  }));
}

console.log(`assembled ${glyphList.length} glyphs (incl. .notdef + space)`);

const font = new opentype.Font({
  familyName: 'Mors Display',
  styleName: STYLE_NAME,
  unitsPerEm: UPEM,
  ascender: ASCENDER,
  descender: DESCENDER,
  weightClass: WEIGHT_CLASS,
  glyphs: glyphList,
});

// ── Write OTF / WOFF2 ──────────────────────────────────────────────────────
let otfBuffer;
try {
  otfBuffer = Buffer.from(font.toArrayBuffer());
} catch (err) {
  console.error('toArrayBuffer failed:', err.message);
  // Binary search: find the first glyph index where adding it breaks the build.
  let lo = 1, hi = glyphList.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const sub = glyphList.slice(0, mid + 1);
    const f = new opentype.Font({
      familyName: 'Mors Display', styleName: STYLE_NAME,
      unitsPerEm: UPEM, ascender: ASCENDER, descender: DESCENDER,
      weightClass: WEIGHT_CLASS,
      glyphs: sub,
    });
    try { f.toArrayBuffer(); lo = mid + 1; }
    catch { hi = mid; }
  }
  const bad = glyphList[lo];
  console.error(`first failing glyph at index ${lo}: name=${JSON.stringify(bad.name)}, unicode=${bad.unicode}, advanceWidth=${bad.advanceWidth}, path.commands.length=${bad.path.commands.length}`);
  console.error('first 3 path commands:', JSON.stringify(bad.path.commands.slice(0, 3)));
  throw err;
}
await writeFile(join(FONT_OUT_DIR, `${FONT_BASENAME}.otf`), otfBuffer);
console.log(`✓ wrote ${FONT_BASENAME}.otf  (${otfBuffer.length} bytes)`);

const woff2 = await wawoff2.compress(otfBuffer);
await writeFile(join(FONT_OUT_DIR, `${FONT_BASENAME}.woff2`), Buffer.from(woff2));
console.log(`✓ wrote ${FONT_BASENAME}.woff2 (${woff2.length} bytes)`);

// ── Render visual QA sample ────────────────────────────────────────────────
const SAMPLE_LINES = [
  'morˢ',
  'abcdefghijklmnopqrstuvwxyz',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '0123456789 ¢£€¥$',
  'ÆØÅ æøå',
  '!"”#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~™©®',
  'The quick brown fox jumps over the lazy dog',
];
const SAMPLE_SIZE = 64;
const SAMPLE_SCALE = SAMPLE_SIZE / UPEM;
const LINE_HEIGHT = SAMPLE_SIZE * 1.4;
const PADDING = 40;

function ringsForChar(ch) {
  if (ch === 'ˢ' && supS) {
    let svgPath = '';
    for (const { op, args } of supS.commands) {
      const px = (i) => supS.TX(args[i]).toFixed(2);
      const py = (i) => supS.TY(args[i]).toFixed(2);
      switch (op) {
        case 'M': svgPath += `M ${px(0)} ${py(1)} `; break;
        case 'L': svgPath += `L ${px(0)} ${py(1)} `; break;
        case 'C': svgPath += `C ${px(0)} ${py(1)} ${px(2)} ${py(3)} ${px(4)} ${py(5)} `; break;
        case 'Z': svgPath += 'Z '; break;
      }
    }
    return { paths: svgPath, advance: supS.advance };
  }
  const g = traced.find((t) => t.char === ch);
  if (!g) return { paths: '', advance: 500 };
  const baseline = rowBaselinePx[g.row];
  const pad = g.padding ?? 0;
  const actualBottom = g.bbox.y + g.bbox.h;
  const baselineOffset = (Math.abs(actualBottom - baseline) <= BASELINE_SNAP_PX)
    ? g.bbox.h
    : (baseline - g.bbox.y);
  const advance = g.bbox.w * SCALE + SIDE_BEARING * 2;
  let svgPath = '';
  for (const { op, args } of g.commands) {
    const px = (i) => ((args[i] - pad) * SCALE + SIDE_BEARING).toFixed(2);
    const py = (i) => ((baselineOffset - (args[i] - pad)) * SCALE).toFixed(2);
    switch (op) {
      case 'M': svgPath += `M ${px(0)} ${py(1)} `; break;
      case 'L': svgPath += `L ${px(0)} ${py(1)} `; break;
      case 'C': svgPath += `C ${px(0)} ${py(1)} ${px(2)} ${py(3)} ${px(4)} ${py(5)} `; break;
      case 'Z': svgPath += 'Z '; break;
    }
  }
  return { paths: svgPath, advance };
}

function lineWidth(line) {
  let w = 0;
  for (const ch of line) {
    if (ch === ' ') { w += SPACE_ADVANCE; continue; }
    if (ch === 'ˢ' && supS) { w += supS.advance; continue; }
    const g = traced.find((t) => t.char === ch);
    if (!g) { w += 500; continue; }
    w += g.bbox.w * SCALE + SIDE_BEARING * 2;
  }
  return w;
}

const widthsPx = SAMPLE_LINES.map((l) => lineWidth(l) * SAMPLE_SCALE);
const width = Math.ceil(Math.max(...widthsPx)) + PADDING * 2;
const height = Math.ceil(SAMPLE_LINES.length * LINE_HEIGHT) + PADDING * 2;

function lineToSvg(line, baselineY) {
  let cursor = PADDING;
  let out = '';
  for (const ch of line) {
    if (ch === ' ') { cursor += SPACE_ADVANCE * SAMPLE_SCALE; continue; }
    const { paths, advance } = ringsForChar(ch);
    // Local transform: translate to (cursor, baselineY), scale by SAMPLE_SCALE, flip Y.
    out += `<g transform="translate(${cursor.toFixed(2)} ${baselineY.toFixed(2)}) scale(${SAMPLE_SCALE} ${-SAMPLE_SCALE})"><path d="${paths}"/></g>`;
    cursor += advance * SAMPLE_SCALE;
  }
  return out;
}

const lineSvgs = SAMPLE_LINES.map((line, i) => {
  const baselineY = PADDING + (i + 1) * LINE_HEIGHT - SAMPLE_SIZE * 0.25;
  return lineToSvg(line, baselineY);
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#FDFBF7"/>
  <g fill="#713B2A" fill-rule="evenodd">${lineSvgs}</g>
</svg>`;

await writeFile(join(__dirname, `${SAMPLE_BASENAME}.svg`), svg);
await sharp(Buffer.from(svg)).png().toFile(join(__dirname, `${SAMPLE_BASENAME}.png`));
console.log(`✓ wrote scripts/font/${SAMPLE_BASENAME}.png (${SAMPLE_LINES.length} lines)`);
