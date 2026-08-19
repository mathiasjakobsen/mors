export const config = {
  name: 'morˢ',
  legalName: 'Mors ApS',
  cvr: 'DK46441508',
  siteUrl: 'https://mors.coffee',
  phone: '+45 93 96 76 88',
  phoneTel: '+4593967688',
  email: 'hej@mors.coffee',
  address: {
    street: 'Klostergade 58',
    city: 'Aarhus C',
    zip: '8000',
    country: { da: 'Danmark', en: 'Denmark' },
  },
  geo: {
    lat: 56.1572,
    lng: 10.2107,
    region: 'DK-82',
  },
  founders: 'Mathias og Johanne',
  foundersEn: 'Mathias and Johanne',
  foundingYear: 2026,
  findsmiley: {
    url: 'https://www.findsmiley.dk/1580970',
    image: '/findsmiley/smiley.svg',
    // Date of the latest food-safety inspection report, ISO. Formatted per
    // locale in the footer (da: 14-08-26, en: 14 Aug 2026).
    date: '2026-08-14',
  },
} as const;
