// Build-time data fetcher for the public mors.coffee site.
//
// The catalog lives in the staff PWA at edb.mors.coffee and is served as a
// single feed at /api/v1/products: every category, every product, every
// rich field (i18n translations, image, in-stock/featured/maker flags,
// the free-form `properties` bag, variations, option sets).
//
// There's only ONE kind of "product" on the Rails side now — it's just
// categories with products. This module knows which category slugs feed
// which page on the marketing site:
//
//   beans     → category with slug = "kaffebonner"
//   menu      → categories with slug ∈ MENU_CATEGORY_SLUGS
//   crafts    → categories with slug ∈ CRAFT_CATEGORY_SLUGS
//   giftcards → the category whose slug contains GIFTCARD_SLUG_MATCH
//
// On fetch failure (network down, non-2xx response, malformed payload)
// we fall back to the static src/data/*.ts arrays so local dev and
// offline builds keep working.

import { beans as beansFallback, type CoffeeBean } from '../data/beans';
import { giftCards as giftCardsFallback, type GiftCard } from '../data/giftcards';
import { menuCategories as menuFallback, type MenuCategory } from '../data/menu';
import {
  productCategories as productsFallback,
  type ProductCategory,
} from '../data/products';
import {
  brewGuidesFallback,
  PUBLIC_BREW_GUIDES,
  type BrewGuideCopy,
  type BrewGuidePublic,
  type BrewGuideRecipe,
  type BrewGuideStepCopy,
} from '../data/brew-guides';
import type { Lang } from '../i18n/ui';

const API_ROOT = (
  process.env.MORS_API_URL ||
  process.env.PUBLIC_MORS_API_URL ||
  'https://edb.mors.coffee/api/v1'
).replace(/\/+$/, '');

const FETCH_TIMEOUT_MS = 8_000;

const BEANS_CATEGORY_SLUG  = 'kaffebonner';
const MENU_CATEGORY_SLUGS  = ['hot-drinks', 'pastries', 'food', 'cold-drinks'];
const CRAFT_CATEGORY_SLUGS = ['ceramics', 'carpentry', 'other'];
// The gift card category is ordered in the POS by a numeric name prefix, which
// ends up in the slug ("9) Gavekort" → "9-gavekort"). Match the meaningful part
// so re-ordering the category in the POS doesn't empty the page.
const GIFTCARD_SLUG_MATCH  = 'gavekort';

interface ApiOrigin   { country?: string; region?: string; farm?: string }
interface ApiCategory {
  id: number;
  slug: string;
  name: string;
  translations: Record<string, string>;
  hero_image?: string;
  products: ApiProduct[];
}
interface ApiProduct {
  id: number;
  slug?: string;
  name: string;
  translations: { name?: Record<string, string>; description?: Record<string, string> };
  description?: string;
  image_url?: string;
  price_kr: number | null;
  tax_rate?: number;
  currency: string;
  in_stock: boolean;
  featured: boolean;
  maker?: string;
  properties?: {
    origin?: ApiOrigin;
    roast_level?: string;
    process?: string;
    weight_g?: number;
    flavor_notes?: string[];
    tags?: string[];
    clips?: number;
  };
}
interface CatalogPayload {
  categories: ApiCategory[];
}

async function fetchCatalog(): Promise<ApiCategory[] | null> {
  const url = `${API_ROOT}/products`;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: ctl.signal,
    });
    if (!res.ok) {
      console.warn(`[mors-api] ${url} → ${res.status}; using local fallback`);
      return null;
    }
    const data = (await res.json()) as CatalogPayload;
    return data.categories || [];
  } catch (err) {
    console.warn(`[mors-api] ${url} fetch failed (${(err as Error).message}); using local fallback`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// The API serves ex-VAT `price_kr`; every customer-facing page (menu,
// beans, crafts) shows incl-VAT prices. Danish default rate is 25%.
function priceInclVat(p: ApiProduct): number {
  return Math.round((p.price_kr ?? 0) * (1 + (p.tax_rate ?? 25) / 100));
}

// Memoise the single round-trip so each page doesn't re-fetch.
let cached: Promise<ApiCategory[] | null> | null = null;
function getCatalog(): Promise<ApiCategory[] | null> {
  cached ??= fetchCatalog();
  return cached;
}

// ---- Beans -------------------------------------------------------------

export async function getBeans(): Promise<CoffeeBean[]> {
  const categories = await getCatalog();
  const bean = categories?.find((c) => c.slug === BEANS_CATEGORY_SLUG);
  if (!bean?.products?.length) return beansFallback;
  return bean.products.map(toCoffeeBean);
}

function toCoffeeBean(p: ApiProduct): CoffeeBean {
  const props = p.properties || {};
  return {
    id:          p.slug || String(p.id),
    slug:        p.slug || String(p.id),
    name:        p.name,
    origin: {
      country: props.origin?.country || '',
      region:  props.origin?.region  || '',
      farm:    props.origin?.farm,
    },
    roastLevel:  (props.roast_level as CoffeeBean['roastLevel']) || 'medium',
    process:     props.process     || '',
    flavorNotes: props.flavor_notes || [],
    weight:      props.weight_g    || 250,
    price:       priceInclVat(p),
    description: (p.translations.description as CoffeeBean['description']) || {
      da: p.description || '',
      en: p.description || '',
    },
    inStock:     p.in_stock,
    featured:    p.featured,
    image:       p.image_url || '',
  };
}

// ---- Menu --------------------------------------------------------------

export async function getMenuCategories(): Promise<MenuCategory[]> {
  const categories = await getCatalog();
  const menu = categories?.filter((c) => MENU_CATEGORY_SLUGS.includes(c.slug)) ?? [];
  // Preserve the order declared by MENU_CATEGORY_SLUGS (applies to the
  // offline fallback too, so cold drinks land at the bottom either way).
  if (!menu.length) {
    return MENU_CATEGORY_SLUGS
      .map((slug) => menuFallback.find((c) => c.id === slug))
      .filter((c): c is MenuCategory => !!c);
  }
  const ordered = MENU_CATEGORY_SLUGS
    .map((slug) => menu.find((c) => c.slug === slug))
    .filter((c): c is ApiCategory => !!c);
  return ordered.map(toMenuCategory);
}

function toMenuCategory(c: ApiCategory): MenuCategory {
  return {
    id:    c.slug,
    name:  (c.translations as MenuCategory['name']) || { da: c.name, en: c.name },
    items: c.products.map((p) => ({
      id:    p.slug || String(p.id),
      name:  (p.translations.name as MenuCategory['items'][number]['name']) || { da: p.name, en: p.name },
      price: priceInclVat(p),
      description: p.translations.description as MenuCategory['items'][number]['description'],
      tags: p.properties?.tags as MenuCategory['items'][number]['tags'],
      image: p.image_url || undefined,
    })),
  };
}

// ---- Craft -------------------------------------------------------------

export async function getProductCategories(): Promise<ProductCategory[]> {
  const categories = await getCatalog();
  const craft = categories?.filter((c) => CRAFT_CATEGORY_SLUGS.includes(c.slug)) ?? [];
  if (!craft.length) return productsFallback;
  const ordered = CRAFT_CATEGORY_SLUGS
    .map((slug) => craft.find((c) => c.slug === slug))
    .filter((c): c is ApiCategory => !!c);
  return ordered.map(toProductCategory);
}

// Bare-bones Latin slugifier — good enough for the current category
// names (Keramik / Snedkeri / Andet). Extend if Danish chars appear in
// future categories.
function slugify(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toProductCategory(c: ApiCategory): ProductCategory {
  const daName = c.translations?.da || c.name;
  // The Rails API exposes one slug per category (used for the routing
  // key on the staff side). Astro's ProductCategory expects per-language
  // slugs so the Danish URL stays `/haandvaerk/keramik` and the English
  // one stays `/en/crafts/ceramics`. Derive the Danish one from the
  // Danish name; use the API slug for English.
  const slugDa = slugify(daName);
  const slugEn = c.slug;
  return {
    id:        c.slug,
    slug:      { da: slugDa, en: slugEn } as ProductCategory['slug'],
    name:      (c.translations as ProductCategory['name']) || { da: c.name, en: c.name },
    heroImage: c.hero_image || '',
    products:  c.products.map((p) => ({
      id:    p.slug || String(p.id),
      slug:  p.slug || String(p.id),
      name:  (p.translations.name as ProductCategory['products'][number]['name']) || { da: p.name, en: p.name },
      description: (p.translations.description as ProductCategory['products'][number]['description']) || {
        da: p.description || '',
        en: p.description || '',
      },
      price:   priceInclVat(p),
      inStock: p.in_stock,
      maker:   p.maker,
    })),
  };
}

// ---- Gift cards --------------------------------------------------------

export async function getGiftCards(): Promise<GiftCard[]> {
  const categories = await getCatalog();
  const gift = categories?.find((c) => c.slug.includes(GIFTCARD_SLUG_MATCH));
  if (!gift?.products?.length) return giftCardsFallback;
  return gift.products.map(toGiftCard);
}

// A gift card is a clip card, and how many clips it holds only lives in the
// product name the shop maintains in the POS ("2× bagværk + 2× varm/kold drik"
// → 4 clips). Sum every `N×` token; `properties.clips` wins when it's set, so
// the count can be stated explicitly without renaming the product.
//
// The negative lookahead keeps the `x` branch from firing inside a word, so
// "6 x kaffe" counts but "Box kaffe" doesn't.
const CLIP_COUNT_RE = /(\d+)\s*[×x](?![a-zæøåA-ZÆØÅ])/g;

function clipCount(p: ApiProduct): number | undefined {
  if (typeof p.properties?.clips === 'number') return p.properties.clips;
  const source = p.translations.name?.da || p.name || '';
  const matches = [...source.matchAll(CLIP_COUNT_RE)];
  if (!matches.length) return undefined;
  return matches.reduce((sum, m) => sum + Number(m[1]), 0);
}

function toGiftCard(p: ApiProduct): GiftCard {
  // The POS has no English copy for gift cards yet. Show the Danish string on
  // the English page rather than an empty card; the moment `en` is filled in
  // on the Rails side it takes over with no change here.
  const daName = p.translations.name?.da || p.name;
  const daDesc = p.translations.description?.da || p.description || '';
  return {
    id:    p.slug || String(p.id),
    name:  { da: daName, en: p.translations.name?.en || daName },
    description: daDesc
      ? { da: daDesc, en: p.translations.description?.en || daDesc }
      : undefined,
    price:   priceInclVat(p),
    clips:   clipCount(p),
    inStock: p.in_stock,
  };
}

// ---- Brew guides -------------------------------------------------------
//
// A separate feed (/api/v1/brew_guides) of the recipes the bar brews by.
// Only the ones allowlisted in PUBLIC_BREW_GUIDES are returned; EDB serves
// staff workflows from the same endpoint.

interface ApiBrewGuide {
  slug: string;
  water_temp_c?: number | null;
  steps?: { id: string; seconds: number; pour_g: number | null }[];
}

/** One step of a guide: the visitor's copy, plus EDB's numbers when it has them. */
export interface BrewGuidePageStep extends BrewGuideStepCopy {
  /** Clock time from the first pour, on timed guides. */
  fromSeconds: number | null;
  toSeconds: number | null;
  pourG: number | null;
}

/** A public guide in one language: the site's copy over EDB's recipe. */
export interface BrewGuide {
  public: BrewGuidePublic;
  copy: BrewGuideCopy;
  waterTempC: number | null;
  /** From the first pour to the last step, on timed guides. */
  totalSeconds: number | null;
  steps: BrewGuidePageStep[];
  /** Languages the guide is published in. */
  langs: Lang[];
}

let cachedBrewGuides: Promise<BrewGuideRecipe[]> | null = null;

async function fetchBrewGuides(): Promise<BrewGuideRecipe[]> {
  const url = `${API_ROOT}/brew_guides`;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: ctl.signal });
    if (!res.ok) {
      console.warn(`[mors-api] ${url} → ${res.status}; using local fallback`);
      return brewGuidesFallback;
    }
    const data = (await res.json()) as { brew_guides?: ApiBrewGuide[] };
    if (!data.brew_guides?.length) return brewGuidesFallback;
    return data.brew_guides.map(toBrewGuideRecipe);
  } catch (err) {
    console.warn(`[mors-api] ${url} fetch failed (${(err as Error).message}); using local fallback`);
    return brewGuidesFallback;
  } finally {
    clearTimeout(timer);
  }
}

// Only the recipe is taken from EDB. Its names, summaries and step labels are
// written for staff and are never shown on the site.
function toBrewGuideRecipe(g: ApiBrewGuide): BrewGuideRecipe {
  return {
    edbSlug:    g.slug,
    waterTempC: g.water_temp_c ?? null,
    steps: (g.steps || []).map((s) => ({ id: s.id, seconds: s.seconds, pourG: s.pour_g ?? null })),
  };
}

const warnedMissingCopy = new Set<string>();

/** A language is published when it has a URL and copy for every step EDB has. */
function hasCopy(r: BrewGuideRecipe, pub: BrewGuidePublic, lang: Lang): boolean {
  const copy = pub.copy[lang];
  if (!pub.slug[lang] || !copy) return false;
  const missing = r.steps.filter((s) => !copy.steps[s.id]).map((s) => s.id);
  if (missing.length) {
    const key = `${r.edbSlug}:${lang}`;
    if (!warnedMissingCopy.has(key)) console.warn(`[mors-api] brew guide ${r.edbSlug} (${lang}) has no copy for step(s) ${missing.join(', ')}; left out`);
    warnedMissingCopy.add(key);
    return false;
  }
  return true;
}

function toBrewGuide(r: BrewGuideRecipe, pub: BrewGuidePublic, lang: Lang, langs: Lang[]): BrewGuide {
  const copy = pub.copy[lang]!;
  // The clock starts at the first pour; prep before it is untimed.
  const firstPour = r.steps.findIndex((s) => s.pourG != null);
  let clock = 0;
  const steps: BrewGuidePageStep[] = [
    ...copy.prep.map((p) => ({ ...p, fromSeconds: null, toSeconds: null, pourG: null })),
    ...r.steps.map((s, i) => {
      const timed = pub.timed && firstPour >= 0 && i >= firstPour;
      const from = clock;
      if (timed) clock += s.seconds;
      return {
        ...copy.steps[s.id],
        fromSeconds: timed ? from : null,
        toSeconds: timed ? clock : null,
        pourG: s.pourG,
      };
    }),
  ];
  return {
    public: pub,
    copy,
    waterTempC: r.waterTempC,
    totalSeconds: pub.timed && clock > 0 ? clock : null,
    steps,
    langs,
  };
}

const brewGuidesByLang = new Map<Lang, Promise<BrewGuide[]>>();

/** Public brew guides that are published in `lang`, in that language. */
export function getBrewGuides(lang: Lang): Promise<BrewGuide[]> {
  if (!brewGuidesByLang.has(lang)) brewGuidesByLang.set(lang, buildBrewGuides(lang));
  return brewGuidesByLang.get(lang)!;
}

async function buildBrewGuides(lang: Lang): Promise<BrewGuide[]> {
  cachedBrewGuides ??= fetchBrewGuides();
  const recipes = await cachedBrewGuides;
  return recipes
    .filter((r) => PUBLIC_BREW_GUIDES[r.edbSlug])
    .map((r) => {
      const pub = PUBLIC_BREW_GUIDES[r.edbSlug];
      const langs = (['da', 'en'] as Lang[]).filter((l) => hasCopy(r, pub, l));
      return langs.includes(lang) ? toBrewGuide(r, pub, lang, langs) : null;
    })
    .filter((g): g is BrewGuide => !!g);
}
