import { config } from '../config';

/**
 * Absolute URL of a page, with the trailing slash GitHub Pages serves it
 * under. `/menu` 301-redirects to `/menu/`, so a canonical, hreflang or
 * JSON-LD URL without the slash points search engines at a redirect.
 */
export function pageUrl(pathOrUrl: string): string {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${config.siteUrl}${pathOrUrl}`;
  const [base, hash = ''] = url.split('#');
  const withSlash = base.endsWith('/') ? base : `${base}/`;
  return hash ? `${withSlash}#${hash}` : withSlash;
}
