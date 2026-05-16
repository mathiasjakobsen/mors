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
//   beans   → category with slug = "kaffebonner"
//   menu    → categories with slug ∈ MENU_CATEGORY_SLUGS
//   crafts  → categories with slug ∈ CRAFT_CATEGORY_SLUGS
//
// On fetch failure (network down, non-2xx response, malformed payload)
// we fall back to the static src/data/*.ts arrays so local dev and
// offline builds keep working.

import { beans as beansFallback, type CoffeeBean } from '../data/beans';
import { menuCategories as menuFallback, type MenuCategory } from '../data/menu';
import {
  productCategories as productsFallback,
  type ProductCategory,
} from '../data/products';

const API_ROOT = (
  process.env.MORS_API_URL ||
  process.env.PUBLIC_MORS_API_URL ||
  'https://edb.mors.coffee/api/v1'
).replace(/\/+$/, '');

const FETCH_TIMEOUT_MS = 8_000;

const BEANS_CATEGORY_SLUG  = 'kaffebonner';
const MENU_CATEGORY_SLUGS  = ['hot-drinks', 'cold-drinks', 'pastries', 'food'];
const CRAFT_CATEGORY_SLUGS = ['ceramics', 'carpentry', 'other'];

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
    price:       p.price_kr ?? 0,
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
  if (!menu.length) return menuFallback;
  // Preserve the order declared by MENU_CATEGORY_SLUGS.
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
      price: p.price_kr ?? 0,
      description: p.translations.description as MenuCategory['items'][number]['description'],
      tags: p.properties?.tags as MenuCategory['items'][number]['tags'],
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
      price:   p.price_kr ?? 0,
      inStock: p.in_stock,
      maker:   p.maker,
    })),
  };
}
