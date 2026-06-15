export interface BrandFontFile {
  format: 'OTF' | 'WOFF2' | 'TTF';
  path: string;
  filename: string;
}

export interface BrandFont {
  id: string;
  family: string;
  /** CSS font-family value used to render the preview. */
  cssFamily: string;
  /** CSS font-weight used in the preview. */
  cssWeight: 300 | 400 | 500 | 600 | 700 | 900;
  /** Label shown next to the family name. */
  styleLabel: string;
  /** Where to get it (download files or external link). */
  source:
    | { kind: 'download'; files: BrandFontFile[] }
    | { kind: 'external'; url: string; provider: string };
  role: { da: string; en: string };
}

export const brandFonts: BrandFont[] = [
  {
    id: 'mors-display-regular',
    family: 'Mors Display',
    cssFamily: "'Mors Display', 'Roboto', system-ui, sans-serif",
    cssWeight: 400,
    styleLabel: 'Regular',
    source: {
      kind: 'download',
      files: [
        { format: 'WOFF2', path: '/fonts/mors-display.woff2', filename: 'mors-display.woff2' },
        { format: 'OTF', path: '/fonts/mors-display.otf', filename: 'mors-display.otf' },
      ],
    },
    role: {
      da: 'Husfont — afledt af ordmærket. Til display og accenter.',
      en: 'House display face — derived from the wordmark. For display and accents.',
    },
  },
  {
    id: 'mors-display-light',
    family: 'Mors Display',
    cssFamily: "'Mors Display', 'Roboto', system-ui, sans-serif",
    cssWeight: 300,
    styleLabel: 'Light',
    source: {
      kind: 'download',
      files: [
        { format: 'WOFF2', path: '/fonts/mors-display-light.woff2', filename: 'mors-display-light.woff2' },
        { format: 'OTF', path: '/fonts/mors-display-light.otf', filename: 'mors-display-light.otf' },
      ],
    },
    role: {
      da: 'Tyndere variant til større overskrifter, hvor regular bliver for tung.',
      en: 'Thinner cut for larger headlines where Regular feels too heavy.',
    },
  },
  {
    id: 'roboto',
    family: 'Roboto',
    cssFamily: "'Roboto', system-ui, sans-serif",
    cssWeight: 400,
    styleLabel: 'Light · Regular · Medium · Bold',
    source: {
      kind: 'download',
      files: [
        { format: 'WOFF2', path: '/fonts/roboto-latin.woff2', filename: 'roboto-latin.woff2' },
        { format: 'WOFF2', path: '/fonts/roboto-latin-italic.woff2', filename: 'roboto-latin-italic.woff2' },
      ],
    },
    role: {
      da: 'Vores hovedskrift. Bruges til alt — overskrifter, brødtekst og UI.',
      en: 'Our primary typeface. Used for everything — headings, body copy and UI.',
    },
  },
];
