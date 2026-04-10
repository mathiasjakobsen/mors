import type { Lang } from '../i18n/ui';

export type MenuTag = 'oeko' | 'vegan' | 'glutenfri' | 'seasonal';

export interface MenuItem {
  id: string;
  name: Record<Lang, string>;
  price: number;
  description?: Record<Lang, string>;
  tags?: MenuTag[];
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
