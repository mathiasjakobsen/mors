export const config = {
  name: 'morˢ',
  legalName: 'Mors ApS',
  cvr: 'DK12345678',
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
    url: 'https://www.findsmiley.dk/xxxxxx',
    image: 'https://www.findsmiley.dk/PublishingImages/1Smiley.png',
  },
} as const;
