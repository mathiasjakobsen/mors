import sharp from 'sharp';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// Rasterise the brand logo + wordmark, and derive black / white colourways from
// the default (brand brown) source SVGs. Outputs live in public/brand/ and are
// committed so `astro dev` serves them without running this first.
//   default → PNG (transparent) + JPG (on cream)
//   black   → SVG + PNG (transparent)
//   white   → SVG + PNG (transparent)

const BRAND_DIR = new URL('../public/brand/', import.meta.url).pathname;
const SIZE = 1024;
const BRAND_HEX = /#713b2a/gi; // the only visible colour in both source SVGs

const BASES = ['mors-logo', 'mors-wordmark'];
const COLORWAYS = [
  { suffix: '', color: null },          // default — keep the source brown
  { suffix: '-black', color: '#000000' },
  { suffix: '-white', color: '#ffffff' },
];

let count = 0;
for (const base of BASES) {
  const isWide = base.includes('wordmark');
  const width = isWide ? SIZE * 4 : SIZE;
  const height = SIZE;
  const baseSvg = await readFile(join(BRAND_DIR, `${base}.svg`), 'utf8');

  for (const { suffix, color } of COLORWAYS) {
    const name = `${base}${suffix}`;
    let svg = baseSvg;
    if (color) {
      // Recolour the visible marks and write the variant SVG as a real asset.
      svg = baseSvg.replace(BRAND_HEX, color);
      await writeFile(join(BRAND_DIR, `${name}.svg`), svg, 'utf8');
    }
    const svgBuf = Buffer.from(svg);

    // PNG — transparent background for every colourway.
    await sharp(svgBuf)
      .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(join(BRAND_DIR, `${name}.png`));

    // JPG — only the default colourway (JPG has no transparency; on cream).
    if (!color) {
      await sharp(svgBuf)
        .resize(width, height, { fit: 'contain', background: { r: 245, g: 240, b: 232, alpha: 1 } })
        .flatten({ background: { r: 245, g: 240, b: 232 } })
        .jpeg({ quality: 95 })
        .toFile(join(BRAND_DIR, `${name}.jpg`));
    }
    console.log(`  ✓ ${name}`);
    count++;
  }
}

console.log(`Generated ${count} brand colourway asset sets`);
