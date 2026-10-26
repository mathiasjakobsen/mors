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
  /** "signup" is a solid "Tilmeld" button; "notify" an outline "Giv mig
   *  besked" for events without a date yet. Both are e-mails to hej@. */
  cta: 'signup' | 'notify';
}

/**
 * Our own events, shown on /events and /en/events and counted in the nav.
 * Use `upcomingEvents()` rather than this list directly: it drops dated
 * events once their day has passed (as of the build, which runs on every
 * push) and puts dated ones first, soonest first.
 */
const publicEvents: PublicEvent[] = [
  {
    id: 'juleklippe-aften',
    kind: { da: 'Julehygge', en: 'Christmas' },
    title: { da: 'Juleklippe-aften', en: 'Christmas paper-cutting evening' },
    body: {
      da: 'Vi finder sakse, karton og glanspapir frem og klipper julehjerter, stjerner og guirlander. Der er noget varmt i koppen og lidt sødt til, og du behøver ikke kunne flette et hjerte for at være med. Det lærer du nok.',
      en: 'We bring out the scissors, card and glossy paper and cut Christmas hearts, stars and garlands. There is something warm in your cup and a little something sweet, and you do not need to know how to weave a heart to join. You will probably learn.',
    },
    date: '2026-11-27',
    time: { from: '17:00', to: '20:00' },
    cta: 'signup',
  },
  {
    id: 'baristakursus',
    kind: { da: 'Kursus', en: 'Course' },
    title: { da: 'Baristakursus', en: 'Barista course' },
    body: {
      da: 'Lær at trække en god espresso og skumme mælken, så den bliver blank og blød. Bagefter øver vi latte art, til hjertet sidder (eller næsten sidder). Vi er kun få ad gangen, så der er god tid til spørgsmål og til at drikke det, du har lavet.',
      en: 'Learn to pull a good espresso and steam milk until it is glossy and soft. Then we practise latte art until the heart sits right (or nearly). We are only a few at a time, so there is plenty of time for questions, and for drinking what you have made.',
    },
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
