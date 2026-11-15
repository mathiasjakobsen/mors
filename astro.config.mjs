// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Event photos come from EDB's API as remote URLs; Astro downloads and resizes
// them at build time (src/components/shared/PhotoStack.astro), but only from
// hosts listed here. The same env vars as src/lib/api.ts pick the host.
const apiHost = new URL(
  process.env.MORS_API_URL || process.env.PUBLIC_MORS_API_URL || 'https://edb.mors.coffee/api/v1',
);

export default defineConfig({
  site: 'https://mors.coffee',
  image: {
    remotePatterns: [{
      protocol: apiHost.protocol.replace(':', ''),
      hostname: apiHost.hostname,
      ...(apiHost.port && { port: apiHost.port }),
    }],
  },
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
