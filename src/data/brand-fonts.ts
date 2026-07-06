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
    id: 'mors-display-medium',
    family: 'Mors Display',
    cssFamily: "'Mors Display', 'Roboto', system-ui, sans-serif",
    cssWeight: 500,
    styleLabel: 'Medium',
    source: {
      kind: 'download',
      files: [
        { format: 'WOFF2', path: '/fonts/mors-display-medium.woff2', filename: 'mors-display-medium.woff2' },
        { format: 'OTF', path: '/fonts/mors-display-medium.otf', filename: 'mors-display-medium.otf' },
      ],
    },
    role: {
      da: 'Mellemvægt mellem Regular og Bold — til overskrifter med lidt ekstra tyngde.',
      en: 'Mid weight between Regular and Bold — for headings that want a little more presence.',
    },
  },
  {
    id: 'mors-display-bold',
    family: 'Mors Display',
    cssFamily: "'Mors Display', 'Roboto', system-ui, sans-serif",
    cssWeight: 700,
    styleLabel: 'Bold',
    source: {
      kind: 'download',
      files: [
        { format: 'WOFF2', path: '/fonts/mors-display-bold.woff2', filename: 'mors-display-bold.woff2' },
        { format: 'OTF', path: '/fonts/mors-display-bold.otf', filename: 'mors-display-bold.otf' },
      ],
    },
    role: {
      da: 'Kraftig variant til overskrifter og accenter, hvor der er brug for mere vægt.',
      en: 'Heavier cut for headlines and accents that need more weight.',
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
