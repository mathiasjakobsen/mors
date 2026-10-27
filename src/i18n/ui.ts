import da from './da';
import en from './en';

export const languages = { da: 'Dansk', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'da';

const translations: Record<Lang, typeof da> = { da, en };

export function t(lang: Lang, key: keyof typeof da): string {
  return translations[lang][key] ?? translations[defaultLang][key];
}

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in languages) return lang as Lang;
  return defaultLang;
}

export function getLocalizedPath(lang: Lang, path: string): string {
  if (lang === defaultLang) return path;
  return `/${lang}${path}`;
}

/** Get the alternate language path for hreflang links */
export function getAlternatePath(lang: Lang, currentPath: string): string {
  const pathMap: Record<string, Record<Lang, string>> = {
    '/': { da: '/', en: '/en/' },
    '/menu': { da: '/menu', en: '/en/menu' },
    '/kaffe': { da: '/kaffe', en: '/en/coffee' },
    '/haandvaerk': { da: '/haandvaerk', en: '/en/crafts' },
    '/gavekort': { da: '/gavekort', en: '/en/giftcard' },
    '/om': { da: '/om', en: '/en/about' },
    '/kontakt': { da: '/kontakt', en: '/en/contact' },
    '/job': { da: '/job', en: '/en/jobs' },
    '/events': { da: '/events', en: '/en/events' },
    '/stempelkort': { da: '/stempelkort', en: '/en/stamp-card' },
    '/erhverv': { da: '/erhverv', en: '/en/business' },
    '/brand': { da: '/brand', en: '/en/brand' },
    '/morgenmad-i-aarhus': { da: '/morgenmad-i-aarhus', en: '/en/breakfast-in-aarhus' },
    '/en/': { da: '/', en: '/en/' },
    '/en/menu': { da: '/menu', en: '/en/menu' },
    '/en/coffee': { da: '/kaffe', en: '/en/coffee' },
    '/en/crafts': { da: '/haandvaerk', en: '/en/crafts' },
    '/en/giftcard': { da: '/gavekort', en: '/en/giftcard' },
    '/en/about': { da: '/om', en: '/en/about' },
    '/en/contact': { da: '/kontakt', en: '/en/contact' },
    '/en/jobs': { da: '/job', en: '/en/jobs' },
    '/en/events': { da: '/events', en: '/en/events' },
    '/en/stamp-card': { da: '/stempelkort', en: '/en/stamp-card' },
    '/en/business': { da: '/erhverv', en: '/en/business' },
    '/en/brand': { da: '/brand', en: '/en/brand' },
    '/en/breakfast-in-aarhus': { da: '/morgenmad-i-aarhus', en: '/en/breakfast-in-aarhus' },
  };

  const cleanPath = currentPath.replace(/\/$/, '') || '/';
  const mapping = pathMap[cleanPath];
  if (mapping) return mapping[lang];

  if (lang === 'en' && !currentPath.startsWith('/en')) {
    return `/en${currentPath}`;
  }
  if (lang === 'da' && currentPath.startsWith('/en')) {
    return currentPath.replace(/^\/en/, '') || '/';
  }
  return currentPath;
}

/**
 * Navigation items for a given language.
 *
 * `inHeader` is false for items that only live in the footer.
 *
 * `match` is the section root the item stands for, which is not always its
 * `href`: the crafts link points at one category, but every craft page under
 * it should still mark the item as current.
 */
export function getNavItems(lang: Lang) {
  return [
    { key: 'menu',      inHeader: true,  label: t(lang, 'nav.menu'),      href: lang === 'da' ? '/menu' : '/en/menu',                          match: lang === 'da' ? '/menu' : '/en/menu' },
    { key: 'giftcards', inHeader: true,  label: t(lang, 'nav.giftcards'), href: lang === 'da' ? '/gavekort' : '/en/giftcard',                  match: lang === 'da' ? '/gavekort' : '/en/giftcard' },
    { key: 'beans',     inHeader: true,  label: t(lang, 'nav.beans'),     href: lang === 'da' ? '/kaffe' : '/en/coffee',                       match: lang === 'da' ? '/kaffe' : '/en/coffee' },
    { key: 'products',  inHeader: true,  label: t(lang, 'nav.products'),  href: lang === 'da' ? '/haandvaerk/keramik/' : '/en/crafts/ceramics/', match: lang === 'da' ? '/haandvaerk' : '/en/crafts' },
    { key: 'events',    inHeader: true,  label: t(lang, 'nav.events'),    href: lang === 'da' ? '/events' : '/en/events',                       match: lang === 'da' ? '/events' : '/en/events' },
    { key: 'about',     inHeader: false, label: t(lang, 'nav.about'),     href: lang === 'da' ? '/om' : '/en/about',                           match: lang === 'da' ? '/om' : '/en/about' },
    { key: 'contact',   inHeader: false, label: t(lang, 'nav.contact'),   href: lang === 'da' ? '/kontakt' : '/en/contact',                    match: lang === 'da' ? '/kontakt' : '/en/contact' },
    { key: 'stampcard', inHeader: false, label: t(lang, 'nav.stampcard'), href: lang === 'da' ? '/stempelkort' : '/en/stamp-card',             match: lang === 'da' ? '/stempelkort' : '/en/stamp-card' },
    { key: 'breakfast', inHeader: false, label: t(lang, 'nav.breakfast'), href: lang === 'da' ? '/morgenmad-i-aarhus' : '/en/breakfast-in-aarhus', match: lang === 'da' ? '/morgenmad-i-aarhus' : '/en/breakfast-in-aarhus' },
    { key: 'business',  inHeader: false, label: t(lang, 'nav.business'),  href: lang === 'da' ? '/erhverv' : '/en/business',                   match: lang === 'da' ? '/erhverv' : '/en/business' },
  ];
}

/**
 * Is `currentPath` inside the section a nav item stands for?
 *
 * Trailing slashes are ignored, since whether a page is served as `/menu` or
 * `/menu/` is up to the host. Sub-paths only count on a segment boundary, so
 * `/kaffe` never claims a hypothetical `/kaffebar`.
 */
export function isNavItemActive(currentPath: string, match: string): boolean {
  const path = currentPath.replace(/\/+$/, '') || '/';
  const root = match.replace(/\/+$/, '') || '/';
  return path === root || path.startsWith(`${root}/`);
}
