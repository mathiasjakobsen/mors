// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mors.coffee',
  integrations: [
    tailwind(),
    sitemap({
      // The press kit is unlisted and 404 isn't a real page.
      filter: (page) => !/\/(brand|404)\/?$/.test(page),
    }),
  ],
  i18n: {
    locales: ['da', 'en'],
    defaultLocale: 'da',
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
