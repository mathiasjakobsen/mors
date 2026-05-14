import type { Lang } from '../i18n/ui';

export type RoastLevel = 'light' | 'medium' | 'medium-dark' | 'dark';

export interface CoffeeBean {
  id: string;
  slug: string;
  name: string;
  origin: {
    country: string;
    region: string;
    farm?: string;
  };
  roastLevel: RoastLevel;
  process: string;
  flavorNotes: string[];
  weight: number; // grams
  price: number; // DKK
  description: Record<Lang, string>;
  inStock: boolean;
  featured: boolean;
  image: string;
}

export const beans: CoffeeBean[] = [
  {
    id: 'papua-ny-guinea-baroida',
    slug: 'papua-ny-guinea-baroida',
    name: 'Papua Ny Guinea Baroida',
    origin: {
      country: 'Papua New Guinea',
      region: 'Eastern Highlands, Kainantu',
      farm: 'Baroida Estate',
    },
    roastLevel: 'medium',
    process: 'Washed',
    flavorNotes: ['tropisk frugt', 'karamel'],
    weight: 250,
    price: 119,
    description: {
      da: 'Sød og cremet kaffe med god kompleksitet og en fløjlsblød krop. Vi finder noter af tropisk frugt og karamel.',
      en: 'Sweet, creamy coffee with rich complexity and a velvety body. Notes of tropical fruit and caramel.',
    },
    inStock: true,
    featured: true,
    image: '/images/beans/papua-ny-guinea-baroida.png',
  },
  {
    id: 'burundi-rubagabaga',
    slug: 'burundi-rubagabaga',
    name: 'Burundi Rubagabaga',
    origin: {
      country: 'Burundi',
      region: 'Kayanza',
      farm: 'Rubagabaga Washing Station',
    },
    roastLevel: 'light',
    process: 'Washed',
    flavorNotes: ['sort te', 'appelsin'],
    weight: 250,
    price: 119,
    description: {
      da: 'Frisk og saftig kaffe med en spændende syrlighed og klassiske frugtige nuancer. Lys og let profil med noter, der minder os om sort te og appelsin.',
      en: 'Fresh, juicy coffee with vibrant acidity and classic fruit nuances. A light, delicate profile with notes reminiscent of black tea and orange.',
    },
    inStock: true,
    featured: true,
    image: '/images/beans/burundi-rubagabaga.png',
  },
  {
    id: 'rwanda-muzo',
    slug: 'rwanda-muzo',
    name: 'Rwanda Muzo',
    origin: {
      country: 'Rwanda',
      region: 'Muzo',
      farm: 'Muzo Washing Station',
    },
    roastLevel: 'light',
    process: 'Washed',
    flavorNotes: ['stenfrugt', 'hindbær', 'fudge'],
    weight: 250,
    price: 119,
    description: {
      da: 'Ren og behagelig kaffe med god sødme og et relativt saftigt udtryk. Frugtige og karamelagtige kvaliteter med noter, der minder os om stenfrugt, hindbær og fudge.',
      en: 'Clean and inviting coffee with deep sweetness and a juicy expression. Fruity, caramel-like qualities with notes of stone fruit, raspberry and fudge.',
    },
    inStock: true,
    featured: true,
    image: '/images/beans/rwanda-muzo.png',
  },
  {
    id: 'peru-el-mirante',
    slug: 'peru-el-mirante',
    name: 'Peru El Mirante',
    origin: {
      country: 'Peru',
      region: 'Amazonas',
      farm: 'Finca El Mirante (Mendoza-familien)',
    },
    roastLevel: 'medium-dark',
    process: 'Washed',
    flavorNotes: ['nougat', 'honning', 'abrikos'],
    weight: 250,
    price: 129,
    description: {
      da: 'Sød og rund kaffe med en floral aroma. God balance og en behagelig tekstur med noter, der minder os om nougat, honning og abrikos.',
      en: 'Sweet, rounded coffee with a floral aroma. Well balanced with a pleasant texture and notes of nougat, honey and apricot.',
    },
    inStock: true,
    featured: false,
    image: '/images/beans/peru-el-mirante.png',
  },
  {
    id: 'colombia-el-rosal',
    slug: 'colombia-el-rosal',
    name: 'Colombia El Rosal',
    origin: {
      country: 'Colombia',
      region: 'Huila, El Rosario',
      farm: 'Finca El Rosal',
    },
    roastLevel: 'light',
    process: 'Washed',
    flavorNotes: ['lavendel', 'honningmelon', 'vanilje'],
    weight: 250,
    price: 139,
    description: {
      da: 'Utroligt flot og ren kaffe med et elegant, floralt udtryk. Aromatisk, delikat kaffe med nuancer af lavendel og noter, der minder os om honningmelon og vanilje.',
      en: 'Strikingly clean coffee with an elegant, floral character. Aromatic and delicate with hints of lavender and notes of honeydew and vanilla.',
    },
    inStock: true,
    featured: false,
    image: '/images/beans/colombia-el-rosal.png',
  },
  {
    id: 'timbre-oekologisk',
    slug: 'timbre-oekologisk',
    name: 'Timbre Økologisk',
    origin: {
      country: 'Peru',
      region: 'Cajamarca',
      farm: 'El Gran Mirador (kooperativ)',
    },
    roastLevel: 'medium',
    process: 'Washed (Økologisk)',
    flavorNotes: ['brun farin', 'citrus'],
    weight: 250,
    price: 109,
    description: {
      da: 'Mild og balanceret økologisk kaffe med en rund og blød krop, afstemt syrlighed og noter af brun farin og citrus.',
      en: 'Mild, balanced organic coffee with a round, soft body, measured acidity and notes of brown sugar and citrus.',
    },
    inStock: true,
    featured: false,
    image: '/images/beans/timbre-oekologisk.png',
  },
  {
    id: 'nocturne-decaf',
    slug: 'nocturne-decaf',
    name: 'Nocturne Decaf',
    origin: {
      country: 'Colombia',
      region: 'Blend',
    },
    roastLevel: 'medium',
    process: 'Sugarcane EA Decaf',
    flavorNotes: ['brun farin', 'fersken', 'chokolade'],
    weight: 250,
    price: 109,
    description: {
      da: 'Sød, balanceret og letdrikkelig decaf med en chokoladeagtig, let frugtig profil og noter af brun farin og fersken.',
      en: 'Sweet, balanced and easy-drinking decaf with a chocolatey, lightly fruity profile and notes of brown sugar and peach.',
    },
    inStock: true,
    featured: false,
    image: '/images/beans/nocturne-decaf.png',
  },
  {
    id: 'stereo-espresso-blend',
    slug: 'stereo-espresso-blend',
    name: 'Stereo Espresso Blend',
    origin: {
      country: 'Nicaragua & Brazil',
      region: 'Espresso Blend',
    },
    roastLevel: 'medium-dark',
    process: 'Blend',
    flavorNotes: ['mild frugt', 'chokolade', 'nougat'],
    weight: 250,
    price: 99,
    description: {
      da: 'Cremet og behagelig kaffe med milde noter af frugt og en eftersmag af chokolade. God med og uden mælk.',
      en: 'Creamy, inviting coffee with mild fruit notes and a chocolate finish. Works equally well with or without milk.',
    },
    inStock: true,
    featured: false,
    image: '/images/beans/stereo-espresso-blend.png',
  },
  {
    id: 'guatemala-las-amapolas',
    slug: 'guatemala-las-amapolas',
    name: 'Guatemala Las Amapolas',
    origin: {
      country: 'Guatemala',
      region: 'Huehuetenango',
      farm: 'Las Amapolas',
    },
    roastLevel: 'medium',
    process: 'Washed',
    flavorNotes: ['stenfrugt', 'sødme'],
    weight: 250,
    price: 99,
    description: {
      da: 'Blød og balanceret kaffe med behagelig sødme samt noter af stenfrugter.',
      en: 'Smooth, balanced coffee with pleasant sweetness and notes of stone fruit.',
    },
    inStock: true,
    featured: false,
    image: '/images/beans/guatemala-las-amapolas.png',
  },
  {
    id: 'mono',
    slug: 'mono',
    name: 'Mono',
    origin: {
      country: 'Brazil',
      region: 'Single Origin Espresso',
      farm: 'Fazenda Paraíso',
    },
    roastLevel: 'medium-dark',
    process: 'Natural',
    flavorNotes: ['cremet', 'sødme', 'lav syre'],
    weight: 250,
    price: 99,
    description: {
      da: 'Single Origin espresso med et traditionelt udtryk. Fyldig, cremet struktur, behagelig sødme og begrænset syre. Særligt god til superautomatiske espressomaskiner.',
      en: 'Single origin espresso with a traditional profile. Full-bodied, creamy texture, pleasant sweetness and low acidity. Especially well-suited for super-automatic espresso machines.',
    },
    inStock: true,
    featured: false,
    image: '/images/beans/mono.png',
  },
];
