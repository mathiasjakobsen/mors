// Shared helpers for the content sections (viden, bryggeguides): which
// entries are published, and where each one lives in either language.

import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

export type VidenEntry = CollectionEntry<'viden'>;

/** Section roots per language. Descriptive on purpose; they show up in search results. */
export const SECTION_ROOTS = {
  viden: { da: '/viden', en: '/en/knowledge' },
  brewguides: { da: '/bryggeguides', en: '/en/brewguides' },
} as const;

export function videnPath(lang: Lang, slug: string): string {
  return `${SECTION_ROOTS.viden[lang]}/${slug}`;
}

/** Published viden entries for one language, drafts included only in dev. */
export async function getViden(lang: Lang): Promise<VidenEntry[]> {
  const entries = await getCollection(
    'viden',
    ({ data }) => data.lang === lang && (import.meta.env.DEV || !data.draft),
  );
  return entries.sort((a, b) => a.data.order - b.data.order);
}

/** The other language's version of an entry, if it exists and is published. */
export async function getVidenTranslation(entry: VidenEntry): Promise<VidenEntry | undefined> {
  const other: Lang = entry.data.lang === 'da' ? 'en' : 'da';
  const entries = await getViden(other);
  return entries.find((e) => e.data.translationKey === entry.data.translationKey);
}
