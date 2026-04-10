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
    '/om': { da: '/om', en: '/en/about' },
    '/kontakt': { da: '/kontakt', en: '/en/contact' },
    '/en/': { da: '/', en: '/en/' },
    '/en/menu': { da: '/menu', en: '/en/menu' },
    '/en/coffee': { da: '/kaffe', en: '/en/coffee' },
    '/en/crafts': { da: '/haandvaerk', en: '/en/crafts' },
    '/en/about': { da: '/om', en: '/en/about' },
    '/en/contact': { da: '/kontakt', en: '/en/contact' },
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

/** Navigation items for a given language */
export function getNavItems(lang: Lang) {
  return [
    { label: t(lang, 'nav.menu'), href: lang === 'da' ? '/menu' : '/en/menu' },
    { label: t(lang, 'nav.beans'), href: lang === 'da' ? '/kaffe' : '/en/coffee' },
    { label: t(lang, 'nav.products'), href: lang === 'da' ? '/haandvaerk' : '/en/crafts' },
    { label: t(lang, 'nav.about'), href: lang === 'da' ? '/om' : '/en/about' },
    { label: t(lang, 'nav.contact'), href: lang === 'da' ? '/kontakt' : '/en/contact' },
  ];
}
