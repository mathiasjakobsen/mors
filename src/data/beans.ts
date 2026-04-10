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
    id: 'ethiopia-yirgacheffe',
    slug: 'ethiopia-yirgacheffe',
    name: 'Ethiopia Yirgacheffe',
    origin: { country: 'Ethiopia', region: 'Yirgacheffe', farm: 'Konga Cooperative' },
    roastLevel: 'light',
    process: 'Washed',
    flavorNotes: ['blueberry', 'jasmine', 'citrus'],
    weight: 250,
    price: 129,
    description: {
      da: 'En let og blomstret kaffe fra Yirgacheffe-regionen i Etiopien. Tydelige noter af blåbær og jasmin med en frisk citrus-afslutning.',
      en: 'A light and floral coffee from the Yirgacheffe region of Ethiopia. Distinct notes of blueberry and jasmine with a bright citrus finish.',
    },
    inStock: true,
    featured: true,
    image: '/images/beans/ethiopia.svg',
  },
  {
    id: 'colombia-huila',
    slug: 'colombia-huila',
    name: 'Colombia Huila',
    origin: { country: 'Colombia', region: 'Huila', farm: 'Finca El Paraíso' },
    roastLevel: 'medium',
    process: 'Washed',
    flavorNotes: ['chocolate', 'caramel', 'nut'],
    weight: 250,
    price: 119,
    description: {
      da: 'En velbalanceret colombiansk kaffe med en blød krop. Rige noter af chokolade og karamel med et nøddeagtigt eftersmag.',
      en: 'A well-balanced Colombian coffee with a smooth body. Rich notes of chocolate and caramel with a nutty aftertaste.',
    },
    inStock: true,
    featured: true,
    image: '/images/beans/colombia.svg',
  },
  {
    id: 'kenya-aa-nyeri',
    slug: 'kenya-aa-nyeri',
    name: 'Kenya AA Nyeri',
    origin: { country: 'Kenya', region: 'Nyeri', farm: 'Othaya Estate' },
    roastLevel: 'light',
    process: 'Washed',
    flavorNotes: ['blackcurrant', 'grapefruit', 'brown sugar'],
    weight: 250,
    price: 139,
    description: {
      da: 'En kompleks og livlig kenyansk kaffe med intens frugtighed. Solbær og grapefrugt mødes i en sød afslutning af rørsukker.',
      en: 'A complex and vibrant Kenyan coffee with intense fruitiness. Blackcurrant and grapefruit meet in a sweet brown sugar finish.',
    },
    inStock: true,
    featured: true,
    image: '/images/beans/kenya.svg',
  },
  {
    id: 'guatemala-antigua',
    slug: 'guatemala-antigua',
    name: 'Guatemala Antigua',
    origin: { country: 'Guatemala', region: 'Antigua', farm: 'Finca La Hermosa' },
    roastLevel: 'medium-dark',
    process: 'Washed',
    flavorNotes: ['dark chocolate', 'almond', 'spice'],
    weight: 250,
    price: 119,
    description: {
      da: 'En fyldig guatemalansk kaffe dyrket i vulkansk jord. Dyb mørk chokolade og mandel med et varmt krydret eftersmag.',
      en: 'A full-bodied Guatemalan coffee grown in volcanic soil. Deep dark chocolate and almond with a warm spiced aftertaste.',
    },
    inStock: true,
    featured: false,
    image: '/images/beans/guatemala.svg',
  },
  {
    id: 'brazil-santos',
    slug: 'brazil-santos',
    name: 'Brazil Santos',
    origin: { country: 'Brazil', region: 'Santos', farm: 'Fazenda Santa Inês' },
    roastLevel: 'medium',
    process: 'Natural',
    flavorNotes: ['hazelnut', 'milk chocolate', 'vanilla'],
    weight: 250,
    price: 109,
    description: {
      da: 'En blød og indbydende brasiliansk kaffe. Behagelige noter af hasselnød og mælkechokolade med et strejf af vanilje.',
      en: 'A smooth and inviting Brazilian coffee. Pleasant notes of hazelnut and milk chocolate with a hint of vanilla.',
    },
    inStock: true,
    featured: false,
    image: '/images/beans/brazil.svg',
  },
  {
    id: 'rwanda-nyungwe',
    slug: 'rwanda-nyungwe',
    name: 'Rwanda Nyungwe',
    origin: { country: 'Rwanda', region: 'Nyungwe', farm: 'Buf Coffee Cooperative' },
    roastLevel: 'light',
    process: 'Natural',
    flavorNotes: ['raspberry', 'plum', 'hibiscus'],
    weight: 250,
    price: 129,
    description: {
      da: 'En frugtig og blomstret rwandisk kaffe fra Nyungwe-regnskoven. Sprøde hindbær og blommer med en elegant hibiscus-finish.',
      en: 'A fruity and floral Rwandan coffee from the Nyungwe rainforest. Crisp raspberry and plum with an elegant hibiscus finish.',
    },
    inStock: true,
    featured: false,
    image: '/images/beans/rwanda.svg',
  },
];
