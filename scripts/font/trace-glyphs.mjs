// Trace per-glyph bitmaps into SVG path data via potrace.
//   node scripts/font/trace-glyphs.mjs
//
// Reads:  scripts/font/glyphs/<name>.png + _mapping.json
// Writes: scripts/font/glyphs/_traced.json
//          { name, char, codepoint, bbox, row, commands: [{op, args}, ...] }

import potrace from 'potrace';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GLYPHS_DIR = join(__dirname, 'glyphs');
const MAPPING_PATH = join(GLYPHS_DIR, '_mapping.json');
const OUT_PATH = join(GLYPHS_DIR, '_traced.json');

const POTRACE_OPTS = {
  threshold: 128,        // already binarized 0/255
  turdSize: 0,           // already clean — keep every shape
  alphaMax: 1.0,         // smoothness threshold
  optCurve: true,
  optTolerance: 0.4,     // lower = closer to bitmap, higher = smoother
  turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
};

function traceFile(path) {
  return new Promise((resolve, reject) => {
    potrace.trace(path, POTRACE_OPTS, (err, svg) => {
      if (err) reject(err);
      else resolve(svg);
    });
  });
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
    const svg = await traceFile(join(GLYPHS_DIR, filename));
    const d = extractPathD(svg);
    if (!d) {
      console.warn(`✗ ${g.name} (${g.char}): no path in SVG output`);
      continue;
    }
    const commands = normalize(parsePathD(d));
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
