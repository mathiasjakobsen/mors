import type { Lang } from '../i18n/ui';

export interface Product {
  id: string;
  slug: string;
  name: Record<Lang, string>;
  description: Record<Lang, string>;
  price: number; // DKK
  inStock: boolean;
  maker?: string;
}

export interface ProductCategory {
  id: string;
  slug: Record<Lang, string>;
  name: Record<Lang, string>;
  heroImage: string;
  products: Product[];
}

export const productCategories: ProductCategory[] = [
  {
    id: 'ceramics',
    slug: { da: 'keramik', en: 'ceramics' },
    name: { da: 'Keramik', en: 'Ceramics' },
    heroImage: '/images/products/ceramics.svg',
    products: [
      {
        id: 'cups',
        slug: 'kopper',
        name: { da: 'Kopper', en: 'Cups' },
        description: {
          da: 'Håndlavede keramikkopper i mat glasur — perfekte til din morgenkaffe.',
          en: 'Handmade ceramic cups in matte glaze — perfect for your morning coffee.',
        },
        price: 195,
        inStock: true,
        maker: 'Anne Birk Keramik',
      },
      {
        id: 'bowls',
        slug: 'skaale',
        name: { da: 'Skåle', en: 'Bowls' },
        description: {
          da: 'Organisk formede skåle til granola, suppe eller pynt.',
          en: 'Organically shaped bowls for granola, soup or decoration.',
        },
        price: 250,
        inStock: true,
        maker: 'Anne Birk Keramik',
      },
      {
        id: 'plates',
        slug: 'tallerkener',
        name: { da: 'Tallerkener', en: 'Plates' },
        description: {
          da: 'Rustikke tallerkener med unik glasur — ingen to er ens.',
          en: 'Rustic plates with unique glaze — no two are alike.',
        },
        price: 350,
        inStock: true,
        maker: 'Anne Birk Keramik',
      },
      {
        id: 'vases',
        slug: 'vaser',
        name: { da: 'Vaser', en: 'Vases' },
        description: {
          da: 'Minimalistiske vaser drejet på hjul i lokalt værksted.',
          en: 'Minimalist wheel-thrown vases made in a local workshop.',
        },
        price: 325,
        inStock: true,
        maker: 'Anne Birk Keramik',
      },
    ],
  },
  {
    id: 'carpentry',
    slug: { da: 'snedkeri', en: 'carpentry' },
    name: { da: 'Snedkeri', en: 'Carpentry' },
    heroImage: '/images/products/carpentry.svg',
    products: [
      {
        id: 'cutting-board',
        slug: 'skaerebrat',
        name: { da: 'Skærebræt', en: 'Cutting board' },
        description: {
          da: 'Massivt skærebræt i eg, olieret og klar til brug.',
          en: 'Solid oak cutting board, oiled and ready to use.',
        },
        price: 450,
        inStock: true,
        maker: 'Thomsen Træværk',
      },
      {
        id: 'coffee-scoop',
        slug: 'kaffeske',
        name: { da: 'Kaffeske', en: 'Coffee scoop' },
        description: {
          da: 'Håndskåret kaffeske i valnød — måler en perfekt kop.',
          en: 'Hand-carved walnut coffee scoop — measures a perfect cup.',
        },
        price: 120,
        inStock: true,
        maker: 'Thomsen Træværk',
      },
      {
        id: 'coaster-set',
        slug: 'underkop',
        name: { da: 'Underkop-sæt', en: 'Coaster set' },
        description: {
          da: 'Sæt med fire underkopper i ask med korkbund.',
          en: 'Set of four ash wood coasters with cork base.',
        },
        price: 180,
        inStock: true,
        maker: 'Thomsen Træværk',
      },
    ],
  },
  {
    id: 'other',
    slug: { da: 'andet', en: 'other' },
    name: { da: 'Andet', en: 'Other' },
    heroImage: '/images/products/other.svg',
    products: [
      {
        id: 'tote-bag',
        slug: 'stofpose',
        name: { da: 'Stofpose', en: 'Tote bag' },
        description: {
          da: 'Kraftig bomuldspose med Mors-logo i serigrafi.',
          en: 'Heavy-duty cotton tote bag with screen-printed Mors logo.',
        },
        price: 95,
        inStock: true,
      },
      {
        id: 'postcard-set',
        slug: 'postkort-saet',
        name: { da: 'Postkort-sæt', en: 'Postcard set' },
        description: {
          da: 'Sæt med seks illustrerede postkort fra Aarhus.',
          en: 'Set of six illustrated postcards from Aarhus.',
        },
        price: 50,
        inStock: true,
      },
      {
        id: 'gift-card',
        slug: 'gavekort',
        name: { da: 'Gavekort', en: 'Gift card' },
        description: {
          da: 'Gavekort til brug i caféen og webshoppen. Vælg beløb ved kassen.',
          en: 'Gift card for use in the cafe and webshop. Choose amount at checkout.',
        },
        price: 500,
        inStock: true,
      },
    ],
  },
];
