// Build-time data fetcher for the public mors.coffee site. The catalog
// (menu, beans, craft products) lives in the staff PWA at edb.mors.coffee
// and is exposed via /api/v1. These functions are called from .astro
// pages during `astro build`; the result is bundled into the static HTML.
//
// Configure the API root via MORS_API_URL. On fetch failure (network down,
// API responding non-2xx, malformed payload) we fall back to the static
// data files committed in src/data — that way local dev and offline
// builds keep working, just with stale content.

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

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  const url = `${API_ROOT}${path}`;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: ctl.signal,
    });
    if (!res.ok) {
      console.warn(`[mors-api] ${url} → ${res.status}; using local fallback`);
      return fallback;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[mors-api] ${url} fetch failed (${(err as Error).message}); using local fallback`);
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

interface BeansPayload {
  beans: CoffeeBean[];
}
interface MenuPayload {
  categories: MenuCategory[];
}
interface CraftPayload {
  product_categories: ProductCategory[];
}

export async function getBeans(): Promise<CoffeeBean[]> {
  const data = await fetchJson<BeansPayload>('/beans', { beans: beansFallback });
  return data.beans?.length ? data.beans : beansFallback;
}

export async function getMenuCategories(): Promise<MenuCategory[]> {
  const data = await fetchJson<MenuPayload>('/menu', { categories: menuFallback });
  return data.categories?.length ? data.categories : menuFallback;
}

export async function getProductCategories(): Promise<ProductCategory[]> {
  const data = await fetchJson<CraftPayload>('/craft_products', {
    product_categories: productsFallback,
  });
  return data.product_categories?.length ? data.product_categories : productsFallback;
}
