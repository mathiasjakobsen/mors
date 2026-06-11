import type { Lang } from '../i18n/ui';

export type MenuTag = 'oeko' | 'vegan' | 'glutenfri' | 'seasonal';

export interface MenuItem {
  id: string;
  name: Record<Lang, string>;
  price: number;
  description?: Record<Lang, string>;
  tags?: MenuTag[];
  /** When set, the item renders as an image card instead of a text row. */
  image?: string;
}

export interface MenuCategory {
  id: string;
  name: Record<Lang, string>;
  items: MenuItem[];
}

export const menuCategories: MenuCategory[] = [
  {
    id: 'hot-drinks',
    name: { da: 'Varme drikke', en: 'Hot drinks' },
    items: [
      { id: 'espresso', name: { da: 'Espresso', en: 'Espresso' }, price: 32 },
      { id: 'double-espresso', name: { da: 'Dobbelt espresso', en: 'Double espresso' }, price: 42 },
      { id: 'americano', name: { da: 'Americano', en: 'Americano' }, price: 38 },
      {
        id: 'cappuccino',
        name: { da: 'Cappuccino', en: 'Cappuccino' },
        price: 45,
        description: {
          da: 'Espresso med dampet mælk og mælkeskum',
          en: 'Espresso with steamed milk and foam',
        },
      },
      {
        id: 'flat-white',
        name: { da: 'Flat white', en: 'Flat white' },
        price: 48,
        description: {
          da: 'Dobbelt espresso med silkeblød mikro-mælkeskum',
          en: 'Double espresso with silky micro-foam milk',
        },
      },
      {
        id: 'cafe-latte',
        name: { da: 'Cafe latte', en: 'Cafe latte' },
        price: 48,
        description: {
          da: 'Espresso med dampet mælk',
          en: 'Espresso with steamed milk',
        },
      },
      { id: 'cortado', name: { da: 'Cortado', en: 'Cortado' }, price: 40 },
      {
        id: 'filter-coffee',
        name: { da: 'Filterkaffe', en: 'Filter coffee' },
        price: 38,
        tags: ['oeko'],
      },
      {
        id: 'chai-latte',
        name: { da: 'Chai latte', en: 'Chai latte' },
        price: 45,
        tags: ['vegan'],
      },
      {
        id: 'hot-chocolate',
        name: { da: 'Varm chokolade', en: 'Hot chocolate' },
        price: 42,
      },
      {
        id: 'tea',
        name: { da: 'Te', en: 'Tea' },
        price: 32,
        tags: ['vegan'],
      },
    ],
  },
  {
    id: 'cold-drinks',
    name: { da: 'Kolde drikke', en: 'Cold drinks' },
    items: [
      {
        id: 'iced-coffee',
        name: { da: 'Iskaffe', en: 'Iced coffee' },
        price: 52,
        tags: ['seasonal'],
      },
      {
        id: 'iced-latte',
        name: { da: 'Iced latte', en: 'Iced latte' },
        price: 52,
        tags: ['seasonal'],
      },
      {
        id: 'cold-brew',
        name: { da: 'Cold brew', en: 'Cold brew' },
        price: 48,
        description: {
          da: 'Koldbrygget kaffe trukket i 18 timer',
          en: 'Cold-brewed coffee steeped for 18 hours',
        },
        tags: ['seasonal'],
      },
      { id: 'juice', name: { da: 'Juice', en: 'Juice' }, price: 45 },
      { id: 'soda', name: { da: 'Sodavand', en: 'Soda' }, price: 30 },
      { id: 'sparkling-water', name: { da: 'Danskvand', en: 'Sparkling water' }, price: 20 },
      {
        id: 'raw-culture-hyldeblomst',
        name: { da: 'Hyldeblomst', en: 'Elderflower' },
        price: 35,
        description: {
          da: 'Letboblende økologisk kombucha med smag af hyldeblomst — lækker syrlighed og mild sødme. Omvender enhver booch-kritiker.',
          en: 'Lightly sparkling organic kombucha with elderflower — pleasantly tart with a mild sweetness. Converts any booch skeptic.',
        },
        tags: ['oeko', 'vegan'],
        image: '/images/products/raw-culture-hyldeblomst.png',
      },
      {
        id: 'raw-culture-rabarber',
        name: { da: 'Rabarber', en: 'Rhubarb' },
        price: 35,
        description: {
          da: 'Forfriskende økologisk kombucha brygget i Danmark med smag af klassisk dansk rabarber.',
          en: 'Refreshing organic kombucha brewed in Denmark with the taste of classic Danish rhubarb.',
        },
        tags: ['oeko', 'vegan'],
        image: '/images/products/raw-culture-rabarber.png',
      },
      {
        id: 'raw-culture-hindbaer',
        name: { da: 'Hindbær', en: 'Raspberry' },
        price: 35,
        description: {
          da: 'Aromatisk økologisk kombucha med smag af hindbær — nostalgisk som den velkendte hindbærbrus og dejligt forfriskende.',
          en: 'Aromatic organic kombucha with raspberry — nostalgic like classic raspberry soda and wonderfully refreshing.',
        },
        tags: ['oeko', 'vegan'],
        image: '/images/products/raw-culture-hindbaer.png',
      },
      {
        id: 'raw-culture-solbaer',
        name: { da: 'Solbær', en: 'Blackcurrant' },
        price: 35,
        description: {
          da: 'Forfriskende økologisk kombucha brygget i Danmark med smag af danske solbær.',
          en: 'Refreshing organic kombucha brewed in Denmark with the taste of Danish blackcurrants.',
        },
        tags: ['oeko', 'vegan'],
        image: '/images/products/raw-culture-solbaer.png',
      },
      {
        id: 'moster-rabarber',
        name: { da: 'Mosters Rabarber', en: 'Mosters Rhubarb' },
        price: 34,
        description: {
          da: 'Lækker økologisk rabarbersaft, der smager friskt af rabarber uden at være for syrlig. Sødet med æble i stedet for sukker og afrundet med en dejlig tørhed.',
          en: "Delicious organic rhubarb juice — fresh and not too tart, sweetened with apple instead of sugar and rounded off with a pleasant dryness.",
        },
        tags: ['oeko', 'vegan'],
        image: '/images/products/moster-rabarber.jpg',
      },
      {
        id: 'moster-hyldeblomst',
        name: { da: 'Mosters Hyldeblomst', en: 'Mosters Elderflower' },
        price: 34,
        description: {
          da: 'Rund og fyldig økologisk hyldeblomstsaft, der smager som traditionel hjemmelavet dansk saft. Sødet med æble.',
          en: 'A round, full-bodied organic elderflower juice that tastes like traditional homemade Danish cordial. Sweetened with apple.',
        },
        tags: ['oeko', 'vegan'],
        image: '/images/products/moster-hyldeblomst.jpg',
      },
      {
        id: 'moster-appelsin',
        name: { da: 'Mosters Appelsin', en: 'Mosters Orange' },
        price: 34,
        description: {
          da: 'Læskende økologisk appelsinsaft lavet på rendyrkede økologiske appelsiner. Skal nydes iskold!',
          en: 'Refreshing organic orange juice made purely from organic oranges. Best enjoyed ice-cold!',
        },
        tags: ['oeko', 'vegan'],
        image: '/images/products/moster-appelsin.jpg',
      },
      {
        id: 'moster-aeble',
        name: { da: 'Mosters Æble', en: 'Mosters Apple' },
        price: 34,
        description: {
          da: 'Økologisk æblesaft uden tilsat sukker eller tilsætningsstoffer — blød og rund med en mild syrlighed.',
          en: 'Organic apple juice with no added sugar or additives — soft and round with a mild acidity.',
        },
        tags: ['oeko', 'vegan'],
        image: '/images/products/moster-aeble.jpg',
      },
      {
        id: 'moster-ingefaer-lemon',
        name: { da: 'Mosters Ingefær-Lemon', en: 'Mosters Ginger Lemon' },
        price: 34,
        description: {
          da: 'Skarp og forfriskende økologisk saft med frisk citrus og en krydret eftersmag af ingefær. Sødet med æble.',
          en: 'Sharp, refreshing organic juice with fresh citrus and a spicy ginger finish. Sweetened with apple.',
        },
        tags: ['oeko', 'vegan'],
        image: '/images/products/moster-ingefaer-lemon.jpg',
      },
      {
        id: 'moster-tranebaer',
        name: { da: 'Mosters Tranebær', en: 'Mosters Cranberry' },
        price: 34,
        description: {
          da: 'Lækker økologisk tranebærsaft, hvor bærrenes lette bitterhed er afrundet med æble — med tørhed og lidt kant.',
          en: "Delicious organic cranberry juice — the berries' light bitterness rounded off with apple, with dryness and a bit of edge.",
        },
        tags: ['oeko', 'vegan'],
        image: '/images/products/moster-tranebaer.jpg',
      },
      {
        id: 'nonnen-pale-ale-non-alc',
        name: { da: 'Nonnen Pale Ale (alkoholfri)', en: 'Nonnen Pale Ale (alcohol-free)' },
        price: 34,
        description: {
          da: 'Alkoholfri økologisk Pale Ale med masser af smag — ekstra humle og tørhumlet med Citra for friskhed.',
          en: 'Alcohol-free organic pale ale full of flavour — extra hops and dry-hopped with Citra for freshness.',
        },
        tags: ['oeko'],
        image: '/images/products/nonnen-pale-ale-non-alc.jpg',
      },
    ],
  },
  {
    id: 'pastries',
    name: { da: 'Bagværk', en: 'Pastries' },
    items: [
      {
        id: 'croissant',
        name: { da: 'Croissant', en: 'Croissant' },
        price: 35,
        description: {
          da: 'Friskbagt smørcroissant',
          en: 'Freshly baked butter croissant',
        },
      },
      {
        id: 'cinnamon-roll',
        name: { da: 'Kanelsnegl', en: 'Cinnamon roll' },
        price: 42,
      },
      {
        id: 'cardamom-bun',
        name: { da: 'Kardemommebolle', en: 'Cardamom bun' },
        price: 42,
      },
      {
        id: 'banana-bread',
        name: { da: 'Bananbrød', en: 'Banana bread' },
        price: 38,
        tags: ['vegan'],
      },
      {
        id: 'cookie',
        name: { da: 'Cookie', en: 'Cookie' },
        price: 32,
      },
    ],
  },
  {
    id: 'food',
    name: { da: 'Mad', en: 'Food' },
    items: [
      {
        id: 'avocado-toast',
        name: { da: 'Avocado toast', en: 'Avocado toast' },
        price: 72,
        description: {
          da: 'Surdejsbrød med avocado, radiser og chiliflager',
          en: 'Sourdough with avocado, radishes and chili flakes',
        },
        tags: ['vegan'],
      },
      {
        id: 'granola',
        name: { da: 'Granola med yoghurt', en: 'Granola with yoghurt' },
        price: 58,
        description: {
          da: 'Hjemmelavet granola med sæsonens bær',
          en: 'Homemade granola with seasonal berries',
        },
        tags: ['oeko'],
      },
      {
        id: 'sandwich',
        name: { da: 'Sandwich', en: 'Sandwich' },
        price: 68,
        description: {
          da: 'Dagens sandwich — spørg personalet',
          en: "Today's sandwich — ask staff",
        },
      },
      {
        id: 'focaccia',
        name: { da: 'Focaccia', en: 'Focaccia' },
        price: 65,
        description: {
          da: 'Hjemmebagt focaccia med olivenolie og rosmarin',
          en: 'Home-baked focaccia with olive oil and rosemary',
        },
      },
    ],
  },
];
