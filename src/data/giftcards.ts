import type { Lang } from '../i18n/ui';

export interface GiftCard {
  id: string;
  name: Record<Lang, string>;
  description?: Record<Lang, string>;
  /** Incl-VAT price in DKK. */
  price: number;
  /** Total number of clips on the card, when it can be determined. */
  clips?: number;
  inStock: boolean;
}

/**
 * Offline fallback for `getGiftCards()`, used when the catalog API is
 * unreachable at build time — same role as `menuCategories` in `data/menu.ts`.
 *
 * The POS carries no English copy for gift cards, so `en` mirrors `da` here
 * exactly as the API mapper does. Fill `translations.name.en` in on the Rails
 * side and both the live page and this file's purpose stay correct.
 */
export const giftCards: GiftCard[] = [
  {
    id: 'gavkort-2x-2x',
    name: {
      da: '2× bagværk + 2× varm/kold drik',
      en: '2× bagværk + 2× varm/kold drik',
    },
    description: {
      da: 'Gavekort. Indløses ved disken — et klip pr. vare.',
      en: 'Gavekort. Indløses ved disken — et klip pr. vare.',
    },
    price: 150,
    clips: 4,
    inStock: true,
  },
  {
    id: 'gavkort-5x',
    name: {
      da: '5× valgfri varm/kold drik',
      en: '5× valgfri varm/kold drik',
    },
    description: {
      da: 'Gavekort. Indløses ved disken — et klip pr. vare.',
      en: 'Gavekort. Indløses ved disken — et klip pr. vare.',
    },
    price: 200,
    clips: 5,
    inStock: true,
  },
  {
    id: 'gavkort-10x',
    name: {
      da: '10× valgfri varm/kold drik',
      en: '10× valgfri varm/kold drik',
    },
    description: {
      da: 'Gavekort. Indløses ved disken — et klip pr. vare.',
      en: 'Gavekort. Indløses ved disken — et klip pr. vare.',
    },
    price: 375,
    clips: 10,
    inStock: true,
  },
];
