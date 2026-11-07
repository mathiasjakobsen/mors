import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// "Viden" (coffee knowledge) articles. One markdown file per language in
// src/content/viden/{da,en}/; the two versions of an article share a
// `translationKey` so they can point at each other (hreflang, language
// switcher). The URL slug is set explicitly and descriptively per language
// ("vand-til-kaffe", "water-for-coffee"), because that is what people search.
const viden = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/viden' }),
  schema: z.object({
    title: z.string(),
    /** Meta description: one sentence, under ~155 characters. */
    description: z.string(),
    /** Short intro under the title. */
    lead: z.string().optional(),
    lang: z.enum(['da', 'en']),
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    translationKey: z.string(),
    /** Order on the index page, lowest first. */
    order: z.number().default(50),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    /** Drafts render in `astro dev` and are left out of production builds. */
    draft: z.boolean().default(false),
    /** What the hero photo should show, until we have one. */
    heroBrief: z.string().optional(),
    /** Further photos the article needs, listed for the shoot. */
    imagesNeeded: z.array(z.string()).default([]),
  }),
});

// Legal pages (privacy and cookie policy). Plain markdown so they can be
// edited without touching code; each language version links the other via
// `translationKey`, like viden.
const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lang: z.enum(['da', 'en']),
    translationKey: z.string(),
    updatedAt: z.coerce.date(),
  }),
});

// Open positions, shown on /job and /en/jobs. One markdown file per position
// in src/content/jobs/{da,en}/: the body is the ad, the frontmatter holds the
// list under it. A position only shows in the languages it has a file for, so
// a job that requires Danish is left out of /en/jobs. With no files the page
// says nothing is open, rather than leaving visitors to wonder.
const jobs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/jobs' }),
  schema: z.object({
    title: z.string(),
    /** The ad's own page: /job/<slug>. Descriptive, like viden's slugs. */
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    /** Shown in the list on /job and as the meta description. */
    description: z.string(),
    /** Hours and type, e.g. "1–2 vagter om ugen". */
    hours: z.string(),
    lang: z.enum(['da', 'en']),
    /** Where the apply button goes. Without it, an e-mail to job@. */
    applyHref: z.string().optional(),
    /** The practical bits under the ad, e.g. pay and start date. */
    facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  }),
});

export const collections = { viden, legal, jobs };
