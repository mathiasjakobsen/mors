export type BrandFormat = 'SVG' | 'PNG' | 'JPG';
export type BrandColor = 'default' | 'black' | 'white';

export interface BrandAssetFile {
  format: BrandFormat;
  filename: string;
  path: string;
}

export interface BrandColorway {
  color: BrandColor;
  label: { da: string; en: string };
  /** Tailwind background class for the preview tile so the mark stays visible. */
  previewBg: string;
  previewSrc: string;
  files: BrandAssetFile[];
}

export interface BrandLogo {
  id: 'logo' | 'wordmark';
  colorways: BrandColorway[];
}

const files = (base: string, formats: BrandFormat[]): BrandAssetFile[] =>
  formats.map((format) => {
    const ext = format.toLowerCase();
    return { format, filename: `${base}.${ext}`, path: `/brand/${base}.${ext}` };
  });

const colorways = (base: string): BrandColorway[] => [
  {
    color: 'default',
    label: { da: 'Standard', en: 'Default' },
    previewBg: 'bg-cream',
    previewSrc: `/brand/${base}.svg`,
    files: files(base, ['SVG', 'PNG', 'JPG']),
  },
  {
    color: 'black',
    label: { da: 'Sort', en: 'Black' },
    previewBg: 'bg-warm-white',
    previewSrc: `/brand/${base}-black.svg`,
    files: files(`${base}-black`, ['SVG', 'PNG']),
  },
  {
    color: 'white',
    label: { da: 'Hvid', en: 'White' },
    previewBg: 'bg-ink',
    previewSrc: `/brand/${base}-white.svg`,
    files: files(`${base}-white`, ['SVG', 'PNG']),
  },
];

export const brandLogos: BrandLogo[] = [
  { id: 'logo', colorways: colorways('mors-logo') },
  { id: 'wordmark', colorways: colorways('mors-wordmark') },
];

// ── Flat list for the right-click context menu ──────────────────────────────
// Kept short: the default (brand) colourway only — the full colourways live on
// the brand page.
export interface BrandAsset {
  id: string;
  label: { da: string; en: string };
  filename: string;
  path: string;
}

const NAME = { logo: { da: 'Logo', en: 'Logo' }, wordmark: { da: 'Ordmærke', en: 'Wordmark' } };

export const brandAssets: BrandAsset[] = brandLogos.flatMap((logo) => {
  const dflt = logo.colorways.find((c) => c.color === 'default')!;
  return dflt.files.map((f) => ({
    id: `${logo.id}-${f.format.toLowerCase()}`,
    label: {
      da: `${NAME[logo.id].da} (${f.format})`,
      en: `${NAME[logo.id].en} (${f.format})`,
    },
    filename: f.filename,
    path: f.path,
  }));
});
