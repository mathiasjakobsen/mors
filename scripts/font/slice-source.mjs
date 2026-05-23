// Slice scripts/font/source.png into per-glyph bitmaps.
//   node scripts/font/slice-source.mjs
//
// Outputs:
//   scripts/font/glyphs/<name>.png   — one cropped bitmap per glyph
//   scripts/font/glyphs/_mapping.json — { name, char, bbox, sourceBbox } per glyph
//   scripts/font/_slice-debug.png    — original with bboxes + char labels overlaid
//
// Strategy:
//   1. Binarize by color distance to brand red (#713B2A).
//   2. Find ink ROWS via horizontal projection (regions of y with any ink).
//   3. Within each row, find ink COLUMNS via vertical projection.
//   4. Each column = one glyph (user confirmed no detached marks).
//   5. Map sorted columns to the user-provided character order.

import sharp from 'sharp';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, 'source.png');
const OUT_DIR = join(__dirname, 'glyphs');
const DEBUG_PATH = join(__dirname, '_slice-debug.png');

// Character order, row by row, as they appear in the PNG.
// NOTE: line 3 corrected — the first symbol after digits is ¢ (cent), not $.
const ROWS = [
  'abcdefghijklmnopqrstuvwxyzæøå',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ',
  '0123456789¢£€¥$',
  '!"”#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~™©®',
];

// Binarization threshold: pixels within this colour distance from FG are "ink".
const FG = [0x71, 0x3b, 0x2a];
const COLOR_TOLERANCE = 80;

// Filter spurious tiny components (anti-aliasing noise, etc.)
const MIN_GLYPH_WIDTH = 4;

// Characters whose glyph consists of multiple horizontally-separated marks
// (so column projection produces N columns for one character).
const MULTI_COLUMN = { '"': 2, '”': 2 };

// ── Load + binarize ────────────────────────────────────────────────────────
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
console.log(`source: ${width}×${height}, ${channels} channels`);

const mask = new Uint8Array(width * height);
for (let i = 0, p = 0; i < data.length; i += channels, p++) {
  const dr = data[i] - FG[0];
  const dg = data[i + 1] - FG[1];
  const db = data[i + 2] - FG[2];
  mask[p] = (dr * dr + dg * dg + db * db) < COLOR_TOLERANCE * COLOR_TOLERANCE ? 1 : 0;
}

// ── Find ink rows ──────────────────────────────────────────────────────────
const rowProjection = new Uint32Array(height);
for (let y = 0; y < height; y++) {
  let c = 0;
  for (let x = 0; x < width; x++) c += mask[y * width + x];
  rowProjection[y] = c;
}

const inkRows = [];
{
  let inRow = false;
  let startY = 0;
  for (let y = 0; y < height; y++) {
    if (rowProjection[y] > 0) {
      if (!inRow) {
        startY = y;
        inRow = true;
      }
    } else if (inRow) {
      inkRows.push({ yStart: startY, yEnd: y - 1 });
      inRow = false;
    }
  }
  if (inRow) inkRows.push({ yStart: startY, yEnd: height - 1 });
}

console.log(`found ${inkRows.length} ink rows`);
if (inkRows.length !== ROWS.length) {
  console.warn(`⚠ expected ${ROWS.length} rows, found ${inkRows.length} — check binarization`);
}

// ── Find glyph columns within each row ────────────────────────────────────
function findGlyphs(row) {
  const colProj = new Uint32Array(width);
  for (let x = 0; x < width; x++) {
    let c = 0;
    for (let y = row.yStart; y <= row.yEnd; y++) c += mask[y * width + x];
    colProj[x] = c;
  }

  const cols = [];
  let inGlyph = false;
  let startX = 0;
  for (let x = 0; x < width; x++) {
    if (colProj[x] > 0) {
      if (!inGlyph) {
        startX = x;
        inGlyph = true;
      }
    } else if (inGlyph) {
      const xEnd = x - 1;
      if (xEnd - startX + 1 >= MIN_GLYPH_WIDTH) {
        cols.push({ xStart: startX, xEnd });
      }
      inGlyph = false;
    }
  }
  if (inGlyph) cols.push({ xStart: startX, xEnd: width - 1 });

  // Tighten y-bounds per glyph (the row range is a loose envelope).
  return cols.map((col) => {
    let minY = row.yEnd, maxY = row.yStart;
    for (let x = col.xStart; x <= col.xEnd; x++) {
      for (let y = row.yStart; y <= row.yEnd; y++) {
        if (mask[y * width + x]) {
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    return { xStart: col.xStart, xEnd: col.xEnd, yStart: minY, yEnd: maxY };
  });
}

const rowsGlyphs = inkRows.map(findGlyphs);
rowsGlyphs.forEach((g, i) => {
  console.log(`row ${i + 1}: found ${g.length} glyphs, expected ${ROWS[i].length}`);
});

// ── Map glyphs to characters ──────────────────────────────────────────────
const safeName = (ch) => {
  const NAMES = {
    ' ': 'space', '!': 'exclam', '"': 'quotedbl', '”': 'quoteright',
    '#': 'numbersign', '$': 'dollar', '%': 'percent', '&': 'ampersand',
    "'": 'quotesingle', '(': 'parenleft', ')': 'parenright', '*': 'asterisk',
    '+': 'plus', ',': 'comma', '-': 'hyphen', '.': 'period', '/': 'slash',
    ':': 'colon', ';': 'semicolon', '<': 'less', '=': 'equal', '>': 'greater',
    '?': 'question', '@': 'at', '[': 'bracketleft', '\\': 'backslash',
    ']': 'bracketright', '^': 'asciicircum', '_': 'underscore', '`': 'grave',
    '{': 'braceleft', '|': 'bar', '}': 'braceright', '~': 'asciitilde',
    '¢': 'cent', '£': 'sterling', '€': 'Euro', '¥': 'yen',
    '™': 'trademark', '©': 'copyright', '®': 'registered',
    'Æ': 'AE', 'Ø': 'Oslash', 'Å': 'Aring',
    'æ': 'ae', 'ø': 'oslash', 'å': 'aring',
  };
  if (NAMES[ch]) return NAMES[ch];
  if (/[A-Z]/.test(ch)) return ch;
  if (/[a-z]/.test(ch)) return ch;
  if (/[0-9]/.test(ch)) return ['zero','one','two','three','four','five','six','seven','eight','nine'][+ch];
  return `uni${ch.codePointAt(0).toString(16).padStart(4, '0').toUpperCase()}`;
};

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

const mapping = [];
const rowCount = Math.min(rowsGlyphs.length, ROWS.length);
const debugBoxes = [];

for (let r = 0; r < rowCount; r++) {
  const detectedCols = rowsGlyphs[r];
  const chars = [...ROWS[r]];

  // Consume columns one or more at a time depending on MULTI_COLUMN.
  let colIdx = 0;
  const consumedSpans = [];
  for (const ch of chars) {
    const span = MULTI_COLUMN[ch] ?? 1;
    if (colIdx + span > detectedCols.length) {
      console.warn(`⚠ row ${r + 1}: ran out of detected columns at '${ch}' (got ${detectedCols.length}, want index ${colIdx + span - 1})`);
      break;
    }
    const parts = detectedCols.slice(colIdx, colIdx + span);
    consumedSpans.push({ ch, parts });
    colIdx += span;
  }
  if (colIdx !== detectedCols.length) {
    console.warn(`⚠ row ${r + 1}: ${detectedCols.length - colIdx} unconsumed columns at the tail`);
  }

  for (let i = 0; i < consumedSpans.length; i++) {
    const { ch, parts } = consumedSpans[i];
    const xStart = Math.min(...parts.map((p) => p.xStart));
    const xEnd = Math.max(...parts.map((p) => p.xEnd));
    const yStart = Math.min(...parts.map((p) => p.yStart));
    const yEnd = Math.max(...parts.map((p) => p.yEnd));
    const name = safeName(ch);
    mapping.push({
      name,
      char: ch,
      codepoint: ch.codePointAt(0),
      row: r,
      indexInRow: i,
      bbox: { x: xStart, y: yStart, w: xEnd - xStart + 1, h: yEnd - yStart + 1 },
    });
    debugBoxes.push({ xStart, xEnd, yStart, yEnd, label: ch });
  }
}

// Write per-glyph crops as binary PNGs (black letter on white, for potrace).
// Pad with 1px white margin so potrace doesn't trace the image edge as a boundary.
// Filenames use codepoint hex (e.g. u0061.png) to avoid case-insensitive
// filesystem collisions (macOS treats a.png and A.png as the same file).
const PAD = 1;
for (const m of mapping) {
  const { x, y, w, h } = m.bbox;
  const padW = w + PAD * 2;
  const padH = h + PAD * 2;
  const buf = Buffer.alloc(padW * padH, 255); // white background
  for (let yy = 0; yy < h; yy++) {
    for (let xx = 0; xx < w; xx++) {
      if (mask[(y + yy) * width + (x + xx)]) {
        buf[(yy + PAD) * padW + (xx + PAD)] = 0; // letter pixels = black
      }
    }
  }
  m.padding = PAD;
  m.filename = `u${m.codepoint.toString(16).padStart(4, '0').toUpperCase()}.png`;
  await sharp(buf, { raw: { width: padW, height: padH, channels: 1 } })
    .png()
    .toFile(join(OUT_DIR, m.filename));
}

await writeFile(join(OUT_DIR, '_mapping.json'), JSON.stringify(mapping, null, 2));
console.log(`✓ wrote ${mapping.length} glyph crops to ${OUT_DIR}/`);

// ── Debug preview: original + bboxes + labels ─────────────────────────────
const svgOverlay = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  ${debugBoxes.map((b) => `
    <rect x="${b.xStart}" y="${b.yStart}" width="${b.xEnd - b.xStart + 1}" height="${b.yEnd - b.yStart + 1}"
          fill="none" stroke="#00ff88" stroke-width="1"/>
    <text x="${b.xStart}" y="${b.yStart - 2}" font-size="10" font-family="monospace" fill="#00ff88">${b.label
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</text>
  `).join('')}
</svg>`;

await sharp(SRC)
  .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
  .png()
  .toFile(DEBUG_PATH);
console.log(`✓ wrote ${DEBUG_PATH}`);
