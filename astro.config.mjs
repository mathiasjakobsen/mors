// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mors.coffee',
  integrations: [tailwind(), sitemap()],
  i18n: {
    locales: ['da', 'en'],
    defaultLocale: 'da',
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
