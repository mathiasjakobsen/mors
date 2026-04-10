import type { Lang } from '../i18n/ui';
import type { MenuCategory } from '../data/menu';
import type { Product } from '../data/products';
import { config } from '../config';
import { hours } from '../data/hours';

export function cafeSchema(lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    name: config.name,
    description:
      lang === 'da'
        ? 'Specialkaffe og hjemmebagt bagværk i hjertet af Aarhus.'
        : 'Specialty coffee and homemade pastries in the heart of Aarhus.',
    url: lang === 'da' ? `${config.siteUrl}/` : `${config.siteUrl}/en/`,
    telephone: config.phoneTel,
    email: config.email,
    servesCuisine: ['Coffee', 'Pastries', 'Brunch'],
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: config.address.street,
      addressLocality: config.address.city,
      postalCode: config.address.zip,
      addressCountry: 'DK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: config.geo.lat,
      longitude: config.geo.lng,
    },
    openingHoursSpecification: hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dayOfWeek,
      opens: h.open,
      closes: h.close,
    })),
  };
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
      item: item.url,
    })),
  };
}
