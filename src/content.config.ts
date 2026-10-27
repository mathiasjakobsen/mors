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

export const collections = { viden };
