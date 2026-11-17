import type { Lang } from '../i18n/ui';

export interface PublicEvent {
  id: string;
  /** Short kind label shown above the title, e.g. "Kursus". */
  kind: Record<Lang, string>;
  title: Record<Lang, string>;
  body: Record<Lang, string>;
  /** ISO date (YYYY-MM-DD), when one is set. Without it the page says the
   *  next date is coming. */
  date?: string;
  /** Start and end, 24-hour "HH:MM", when set. Only shown with a date. */
  time?: { from: string; to: string };
  /** Length, e.g. "2 timer". */
  duration?: Record<Lang, string>;
  /** Price per person in kr., incl. VAT. */
  priceKr?: number;
  /** "signup" is a solid "Tilmeld" button; "notify" an outline "Giv mig
   *  besked" for events without a date yet. Both are e-mails to hej@. */
  cta: 'signup' | 'notify';
}

/**
 * Our own events, shown on /events and /en/events and counted in the nav.
 * An `id` that matches the slug of an event selling tickets in EDB
 * (/api/v1/events) gets that event's real dates, price and a buy button on
 * the page; the copy here stays the site's own.
 * Use `upcomingEvents()` rather than this list directly: it drops dated
 * events once their day has passed (as of the build, which runs on every
 * push) and puts dated ones first, soonest first.
 */
const publicEvents: PublicEvent[] = [
  {
    id: 'baristakursus',
    kind: { da: 'Kursus', en: 'Course' },
    title: { da: 'Baristakursus', en: 'Barista course' },
    body: {
      da: 'Lær at trække en god espresso og skumme mælken, så den bliver blank og blød. Bagefter øver vi latte art, til hjertet sidder (eller næsten sidder). Vi er kun få ad gangen, så der er god tid til spørgsmål og til at drikke det, du har lavet.',
      en: 'Learn to pull a good espresso and steam milk until it is glossy and soft. Then we practise latte art until the heart sits right (or nearly). We are only a few at a time, so there is plenty of time for questions, and for drinking what you have made.',
    },
    duration: { da: '2 timer', en: '2 hours' },
    priceKr: 350,
    cta: 'notify',
  },
  {
    id: 'pour-over',
    kind: { da: 'Kursus', en: 'Course' },
    title: { da: 'Pour over & håndbryg', en: 'Pour over & manual brewing' },
    body: {
      da: 'En aften om filterkaffe, og om hvordan den bliver bedre derhjemme. Vi brygger på V60 og AeroPress og skruer på én ting ad gangen (kværn, vand, temperatur og tid), mens vi smager forskellen side om side. Så ved du, hvad du skal ændre, når koppen er for sur, for bitter eller bare lidt flad. Tag gerne din egen brygger med.',
      en: 'An evening about filter coffee, and how to make it better at home. We brew on a V60 and an AeroPress and change one thing at a time (grind, water, temperature and time), tasting the difference side by side. Then you know what to change when the cup is too sour, too bitter or just a bit flat. Feel free to bring your own brewer.',
    },
    duration: { da: '2 timer', en: '2 hours' },
    priceKr: 300,
    cta: 'notify',
  },
];

export function upcomingEvents(today: Date = new Date()): PublicEvent[] {
  // Copenhagen calendar date, so an event stays listed all through its day.
  const todayIso = today.toLocaleDateString('sv-SE', { timeZone: 'Europe/Copenhagen' });
  return publicEvents
    .filter((e) => !e.date || e.date >= todayIso)
    .sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999'));
}
