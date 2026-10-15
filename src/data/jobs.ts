import type { Lang } from '../i18n/ui';

export interface JobPosition {
  id: string;
  title: Record<Lang, string>;
  /** Hours and type, e.g. "Deltid, 15–20 timer om ugen". */
  hours: Record<Lang, string>;
  summary: Record<Lang, string>;
}

/**
 * Positions shown on /job and /en/jobs.
 *
 * Deliberately empty: the page still shows the list, so visitors can see there
 * is nothing open rather than wondering whether they missed it. Add an entry
 * here to post a position; the page and footer pick it up on the next build.
 */
export const openPositions: JobPosition[] = [];
