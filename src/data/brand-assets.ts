export interface BrandAsset {
  id: string;
  label: { da: string; en: string };
  filename: string;
  path: string;
}

export const brandAssets: BrandAsset[] = [
  {
    id: 'logo-svg',
    label: { da: 'Logo (SVG)', en: 'Logo (SVG)' },
    filename: 'mors-logo.svg',
    path: '/brand/mors-logo-v2.svg',
  },
  {
    id: 'logo-png',
    label: { da: 'Logo (PNG)', en: 'Logo (PNG)' },
    filename: 'mors-logo.png',
    path: '/brand/mors-logo-v2.png',
  },
  {
    id: 'logo-jpg',
    label: { da: 'Logo (JPG)', en: 'Logo (JPG)' },
    filename: 'mors-logo.jpg',
    path: '/brand/mors-logo-v2.jpg',
  },
  {
    id: 'wordmark-svg',
    label: { da: 'Ordmærke (SVG)', en: 'Wordmark (SVG)' },
    filename: 'mors-wordmark.svg',
    path: '/brand/mors-wordmark-v2.svg',
  },
  {
    id: 'wordmark-png',
    label: { da: 'Ordmærke (PNG)', en: 'Wordmark (PNG)' },
    filename: 'mors-wordmark.png',
    path: '/brand/mors-wordmark-v2.png',
  },
  {
    id: 'wordmark-jpg',
    label: { da: 'Ordmærke (JPG)', en: 'Wordmark (JPG)' },
    filename: 'mors-wordmark.jpg',
    path: '/brand/mors-wordmark-v2.jpg',
  },
];
