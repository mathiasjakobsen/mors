import sharp from 'sharp';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const BRAND_DIR = new URL('../public/brand/', import.meta.url).pathname;
const SIZE = 1024;

const svgFiles = (await readdir(BRAND_DIR)).filter((f) => f.endsWith('.svg'));

for (const file of svgFiles) {
  const name = file.replace('.svg', '');
  const svg = await readFile(join(BRAND_DIR, file));

  // Determine dimensions: wordmark gets a wider aspect ratio
  const isWide = name.includes('wordmark');
  const width = isWide ? SIZE * 4 : SIZE;
  const height = SIZE;

  const resized = sharp(svg).resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });

  await resized.png().toFile(join(BRAND_DIR, `${name}.png`));

  // JPG needs a solid background since it doesn't support transparency
  await sharp(svg)
    .resize(width, height, { fit: 'contain', background: { r: 245, g: 240, b: 232, alpha: 1 } })
    .flatten({ background: { r: 245, g: 240, b: 232 } })
    .jpeg({ quality: 95 })
    .toFile(join(BRAND_DIR, `${name}.jpg`));

  console.log(`  ✓ ${name}.png + ${name}.jpg`);
}

console.log(`Generated raster assets for ${svgFiles.length} SVGs`);
