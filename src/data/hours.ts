import type { Lang } from '../i18n/ui';

export interface OpeningHours {
  day: Record<Lang, string>;
  open: string;
  close: string;
  dayOfWeek: string[]; // schema.org day names
}

export const hours: OpeningHours[] = [
  {
    day: { da: 'Mandag', en: 'Monday' },
    open: '07:30',
    close: '18:00',
    dayOfWeek: ['Monday'],
  },
  {
    day: { da: 'Tirsdag', en: 'Tuesday' },
    open: '07:30',
    close: '18:00',
    dayOfWeek: ['Tuesday'],
  },
  {
    day: { da: 'Onsdag', en: 'Wednesday' },
    open: '07:30',
    close: '18:00',
    dayOfWeek: ['Wednesday'],
  },
  {
    day: { da: 'Torsdag', en: 'Thursday' },
    open: '07:30',
    close: '18:00',
    dayOfWeek: ['Thursday'],
  },
  {
    day: { da: 'Fredag', en: 'Friday' },
    open: '07:30',
    close: '18:00',
    dayOfWeek: ['Friday'],
  },
  {
    day: { da: 'Lørdag', en: 'Saturday' },
    open: '09:00',
    close: '16:00',
    dayOfWeek: ['Saturday'],
  },
  {
    day: { da: 'Søndag', en: 'Sunday' },
    open: '09:00',
    close: '16:00',
    dayOfWeek: ['Sunday'],
  },
];

/** Compact display string, e.g. "Man-Fre: 7:30-17:00" */
export function getHoursSummary(lang: Lang): string[] {
  return [
    `${lang === 'da' ? 'Man-Fre' : 'Mon-Fri'}: 7:30-18:00`,
    `${lang === 'da' ? 'Lørdag' : 'Saturday'}: 9:00-16:00`,
    `${lang === 'da' ? 'Søndag' : 'Sunday'}: 9:00-16:00`,
  ];
}
