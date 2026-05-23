// Build the Mors Display font from potrace'd source bitmaps.
//   node scripts/font/build-font.mjs
//
// Inputs:
//   scripts/font/glyphs/_traced.json  (from trace-glyphs.mjs)
// Outputs:
//   public/fonts/mors-display.otf
//   public/fonts/mors-display.woff2
//   scripts/font/_sample.svg / _sample.png

import opentype from 'opentype.js';
import wawoff2 from 'wawoff2';
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const FONT_OUT_DIR = join(ROOT, 'public', 'fonts');
const TRACED_PATH = join(__dirname, 'glyphs', '_traced.json');

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
  const advanceWidth = Math.round(g.bbox.w * SCALE + SIDE_BEARING * 2);

  glyphList.push(new opentype.Glyph({
    name: g.name,
    unicode: g.codepoint,
    advanceWidth,
    path,
  }));
}

console.log(`assembled ${glyphList.length} glyphs (incl. .notdef + space)`);

const font = new opentype.Font({
  familyName: 'Mors Display',
  styleName: 'Regular',
  unitsPerEm: UPEM,
  ascender: ASCENDER,
  descender: DESCENDER,
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
      familyName: 'Mors Display', styleName: 'Regular',
      unitsPerEm: UPEM, ascender: ASCENDER, descender: DESCENDER,
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
await writeFile(join(FONT_OUT_DIR, 'mors-display.otf'), otfBuffer);
console.log(`✓ wrote mors-display.otf  (${otfBuffer.length} bytes)`);

const woff2 = await wawoff2.compress(otfBuffer);
await writeFile(join(FONT_OUT_DIR, 'mors-display.woff2'), Buffer.from(woff2));
console.log(`✓ wrote mors-display.woff2 (${woff2.length} bytes)`);

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

await writeFile(join(__dirname, '_sample.svg'), svg);
await sharp(Buffer.from(svg)).png().toFile(join(__dirname, '_sample.png'));
console.log(`✓ wrote scripts/font/_sample.png (${SAMPLE_LINES.length} lines)`);
