import type { Lang } from '../i18n/ui';
import type { MenuCategory } from '../data/menu';
import type { Product } from '../data/products';
import { config } from '../config';
import { hours } from '../data/hours';
import { socialLinks } from '../data/social';
import { pageUrl } from './url';

/** Stable id of the business node, so every page's JSON-LD points at one place. */
export const BUSINESS_ID = `${config.siteUrl}/#kaffebar`;

export function cafeSchema(lang: Lang) {
  return {
    '@type': 'CafeOrCoffeeShop',
    '@id': BUSINESS_ID,
    name: config.name,
    // How people actually type it, plus "café", which is how most search.
    alternateName: ['mors', 'mors coffee', 'morˢ kaffebar', 'mors kaffebar', 'mors café'],
    description:
      lang === 'da'
        ? 'Specialty kaffebar og café i et bindingsværkshus fra 1702 på Klostergade i Aarhus C. Kaffe, sprødt bagværk og morgenmad.'
        : 'Specialty coffee bar and café in a half-timbered house from 1702 on Klostergade, Aarhus C. Coffee, pastries and breakfast.',
    url: lang === 'da' ? `${config.siteUrl}/` : `${config.siteUrl}/en/`,
    image: `${config.siteUrl}/og-default.jpg`,
    logo: `${config.siteUrl}/brand/mors-logo.png`,
    telephone: config.phoneTel,
    email: config.email,
    servesCuisine: ['Coffee', 'Specialty coffee', 'Breakfast', 'Pastries'],
    menu: pageUrl(lang === 'da' ? '/menu' : '/en/menu'),
    acceptsReservations: false,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: config.address.street,
      addressLocality: config.address.city,
      postalCode: config.address.zip,
      addressRegion: 'Aarhus',
      addressCountry: 'DK',
    },
    // "Århus" is the older spelling many still search with.
    areaServed: { '@type': 'City', name: 'Aarhus', alternateName: 'Århus' },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: config.geo.lat,
      longitude: config.geo.lng,
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`morˢ, ${config.address.street}, ${config.address.zip} Aarhus`)}`,
    sameAs: [
      ...socialLinks.map((s) => s.url),
      'https://europeancoffeetrip.com/cafe/mors-aarhus/',
    ],
    openingHoursSpecification: hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dayOfWeek,
      opens: h.open,
      closes: h.close,
    })),
  };
}

/**
 * The JSON-LD every page carries: the business itself plus a WebPage node
 * that is `about` it, so Google ties every URL on the site to the one place.
 */
export function siteGraph(lang: Lang, canonicalUrl: string, title: string, extra?: object | object[]) {
  const extras = extra === undefined ? [] : Array.isArray(extra) ? extra : [extra];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      cafeSchema(lang),
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        inLanguage: lang === 'da' ? 'da-DK' : 'en',
        about: { '@id': BUSINESS_ID },
        publisher: { '@id': BUSINESS_ID },
      },
      ...extras.map(stripContext),
    ],
  };
}

function stripContext(node: object): object {
  const { '@context': _, ...rest } = node as Record<string, unknown>;
  return rest;
}

export function menuSchema(categories: MenuCategory[], lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: lang === 'da' ? 'Menukort' : 'Menu',
    hasMenuSection: categories.map((cat) => ({
      '@type': 'MenuSection',
      name: cat.name[lang],
      hasMenuItem: cat.items.map((item) => ({
        '@type': 'MenuItem',
        name: item.name[lang],
        offers: {
          '@type': 'Offer',
          price: item.price,
          priceCurrency: 'DKK',
        },
        ...(item.description ? { description: item.description[lang] } : {}),
      })),
    })),
  };
}

export function productSchema(product: Product, lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name[lang],
    description: product.description[lang],
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'DKK',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: pageUrl(item.url),
    })),
  };
}
