import type { Lang } from '../i18n/ui';

// Brew guides are the recipes the bar brews by, kept in EDB
// (app/handbooks/recipes) and served by GET /api/v1/brew_guides. The recipe
// itself (name, ratio, grind, steps) is the shop's own copy and is never
// rewritten here.
//
// What lives here is only what the public site adds on top:
//   • an allowlist — EDB also serves staff workflows (e.g. the morning
//     espresso dial-in), and a new recipe in EDB must not go public by
//     accident;
//   • descriptive URL slugs and search titles per language;
//   • a fallback copy of the recipes for offline builds.

export interface BrewGuideStep {
  id: string;
  label: string;
  seconds: number;
  /** Total water on the scale at the end of this step, if it's a pour. */
  pourG: number | null;
}

/** Recipe copy in another language, from EDB's `translations`. */
export interface BrewGuideTranslation {
  name: string;
  summary: string;
  ratioText: string;
  grind: string;
  /** Step id → label. */
  steps: Record<string, string>;
}

/** One recipe, as EDB serves it: Danish, plus any translations. */
export interface BrewGuideRecipe {
  edbSlug: string;
  name: string;
  summary: string;
  ratioText: string;
  grind: string;
  waterTempC: number | null;
  totalSeconds: number;
  steps: BrewGuideStep[];
  translations?: Partial<Record<Lang, BrewGuideTranslation>>;
}

export interface BrewGuidePublic {
  slug: Partial<Record<Lang, string>>;
  /** <title> per language: method + "bryggeguide"/"brew guide". */
  seoTitle: Partial<Record<Lang, string>>;
  /** The brewer, for the page eyebrow. */
  brewer: string;
  /** What you need, for the equipment list and HowTo `tool`. */
  equipment: Partial<Record<Lang, string[]>>;
  /**
   * Whether the step times mean anything to a home brewer. The filter
   * recipe's steps time the barista's handling, not the machine's brew.
   */
  timed: boolean;
  /** How to correct the taste, shown under the steps. */
  adjust: Partial<Record<Lang, string>>;
  heroBrief: string;
  imagesNeeded: string[];
}

/** EDB slug → how it's published. Recipes not listed here stay internal. */
export const PUBLIC_BREW_GUIDES: Record<string, BrewGuidePublic> = {
  pour_over: {
    slug: { da: 'v60-pour-over-bryggeguide', en: 'v60-pour-over-brew-guide' },
    seoTitle: {
      da: 'V60 pour over — bryggeguide og opskrift | morˢ kaffebar, Aarhus',
      en: 'V60 pour over — brew guide and recipe | morˢ coffee bar, Aarhus',
    },
    brewer: 'Hario V60',
    equipment: {
      da: ['Hario V60 og papirfilter', 'Kværn (vi bruger Fellow Ode)', 'Vægt med timer', 'Svanehalskande', 'Kande eller kop'],
      en: ['Hario V60 and paper filter', 'Grinder (we use a Fellow Ode)', 'Scale with timer', 'Gooseneck kettle', 'Server or cup'],
    },
    timed: true,
    adjust: {
      da: 'Løber vandet igennem meget hurtigere end 3:30, og smager kaffen tynd eller sur, så kværn finere. Tager det meget længere, og smager den bitter og tør, så kværn grovere.',
      en: 'If the water runs through much faster than 3:30 and the coffee tastes thin or sour, grind finer. If it takes much longer and tastes bitter and drying, grind coarser.',
    },
    heroBrief: 'V60 på vægt med kande under, midt i bloom: vand hældes i cirkler, damp, kaffebaren i baggrunden. Liggende 3:2.',
    imagesNeeded: [
      'Close-up af kværnet kaffe i filteret ("som groft sand"), ved siden af en bønne til størrelse.',
      'Ovenfra: V60, filter, vægt, svanehalskande og 15 g bønner – alt der skal bruges.',
    ],
  },
  espresso: {
    slug: { da: 'espresso-bryggeguide', en: 'espresso-brew-guide' },
    seoTitle: {
      da: 'Espresso — bryggeguide og opskrift | morˢ kaffebar, Aarhus',
      en: 'Espresso — brew guide and recipe | morˢ coffee bar, Aarhus',
    },
    brewer: 'Espresso',
    equipment: {
      da: ['Espressomaskine med portafilter', 'Espressokværn', 'Vægt med timer', 'Tamper', 'Lille kop'],
      en: ['Espresso machine with portafilter', 'Espresso grinder', 'Scale with timer', 'Tamper', 'Small cup'],
    },
    timed: true,
    adjust: {
      da: 'Espresso indstilles på tiden: 36 g ud skal tage 25–30 sekunder. Løber den hurtigere og smager surt, så kværn finere. Løber den langsommere og smager bittert, så kværn grovere. Vi gør det hver morgen og igen i løbet af dagen.',
      en: 'Espresso is dialled in on time: 36 g out should take 25–30 seconds. If it runs faster and tastes sour, grind finer. If it runs slower and tastes bitter, grind coarser. We do it every morning and again through the day.',
    },
    heroBrief: 'Espresso der løber fra portafilteret ned i en lille kop på vægten, tæt på, crema synlig. Liggende 3:2.',
    imagesNeeded: [
      'Tamp: hånd med tamper i portafilteret, ovenfra.',
      'Færdig espresso i lille kop på stålbakke i vindueskarmen.',
    ],
  },
  aeropress: {
    slug: { da: 'aeropress-bryggeguide', en: 'aeropress-brew-guide' },
    seoTitle: {
      da: 'AeroPress — bryggeguide og opskrift | morˢ kaffebar, Aarhus',
      en: 'AeroPress — brew guide and recipe | morˢ coffee bar, Aarhus',
    },
    brewer: 'AeroPress',
    equipment: {
      da: ['AeroPress og papirfilter', 'Kværn', 'Vægt med timer', 'Kedel', 'Robust kop eller kande'],
      en: ['AeroPress and paper filter', 'Grinder', 'Scale with timer', 'Kettle', 'Sturdy mug or server'],
    },
    timed: true,
    adjust: {
      da: 'Smager det surt, så kværn lidt finere eller lad den trække lidt længere. Smager det bittert og tørt, så kværn lidt grovere.',
      en: 'If it tastes sour, grind a little finer or steep a little longer. If it tastes bitter and drying, grind a little coarser.',
    },
    heroBrief: 'Hænder der trykker AeroPressen ned i en kop på baren, lidt fra siden. Liggende 3:2.',
    imagesNeeded: [
      'AeroPress skilt ad med filter, hætte og kværnet kaffe, ovenfra.',
    ],
  },
  stempelkande: {
    slug: { da: 'stempelkande-french-press-bryggeguide', en: 'french-press-brew-guide' },
    seoTitle: {
      da: 'Stempelkande (French press) — bryggeguide og opskrift | morˢ, Aarhus',
      en: 'French press — brew guide and recipe | morˢ coffee bar, Aarhus',
    },
    brewer: 'French press',
    equipment: {
      da: ['Stempelkande', 'Kværn der kan kværne groft', 'Vægt med timer', 'Kedel', 'Ske'],
      en: ['French press', 'Grinder that can grind coarse', 'Scale with timer', 'Kettle', 'Spoon'],
    },
    timed: true,
    adjust: {
      da: 'Smager det surt og tyndt, så kværn lidt finere eller lad den trække længere. Smager det bittert eller mudret, så kværn grovere – og hæld altid al kaffen op, så den ikke trækker videre i kanden.',
      en: 'If it tastes sour and thin, grind a little finer or steep longer. If it tastes bitter or muddy, grind coarser – and always pour it all out, so it does not keep steeping in the press.',
    },
    heroBrief: 'Stempelkande på bordet i bindingsværkshuset, stemplet halvt nede, to kopper ved siden af. Liggende 3:2.',
    imagesNeeded: [
      'Skorpen der bliver brudt med en ske, tæt på ovenfra.',
    ],
  },
  filterkaffe: {
    slug: { da: 'filterkaffe-bryggeguide', en: 'filter-coffee-brew-guide' },
    seoTitle: {
      da: 'Filterkaffe — bryggeguide og opskrift | morˢ kaffebar, Aarhus',
      en: 'Filter coffee — brew guide and recipe | morˢ coffee bar, Aarhus',
    },
    brewer: 'Fellow Aiden',
    equipment: {
      da: ['Filterkaffemaskine (vi bruger Fellow Aiden)', 'Papirfilter', 'Kværn (vi bruger Fellow Ode)', 'Vægt'],
      en: ['Filter coffee machine (we use a Fellow Aiden)', 'Paper filter', 'Grinder (we use a Fellow Ode)', 'Scale'],
    },
    timed: false,
    adjust: {
      da: 'Hold ratioen – ca. 57 g kaffe pr. liter vand – og juster kværningen: tynd eller sur, kværn finere; bitter og tør, kværn grovere. Filterkaffe er bedst frisk; vi brygger ny efter højst 2 timer.',
      en: 'Keep the ratio – about 57 g of coffee per litre of water – and adjust the grind: thin or sour, grind finer; bitter and drying, grind coarser. Filter coffee is best fresh; we brew a new batch after 2 hours at most.',
    },
    heroBrief: 'Fellow Aiden på baren midt i brygning, kanden fyldes, Fellow Ode ved siden af. Liggende 3:2.',
    imagesNeeded: [
      'Kværnede bønner i filterkurven, ovenfra.',
    ],
  },
};

export const brewGuidesFallback: BrewGuideRecipe[] = [
  {
    edbSlug: 'pour_over',
    name: 'Pour over',
    summary: 'Klassisk håndbryg på V60 — 250 g vand, 15 g kaffe, ratio 1:16,7. 94 °C.',
    ratioText: '15 g kaffe : 250 g vand',
    grind: 'Mellem-fin, som groft sand',
    waterTempC: 94,
    totalSeconds: 210,
    steps: [
      { id: 'bloom', label: 'Bloom — hæld 45 g vand i cirkler over bønnerne', seconds: 45, pourG: 45 },
      { id: 'first', label: 'Første hæld — op til 150 g i alt', seconds: 30, pourG: 150 },
      { id: 'second', label: 'Andet hæld — op til 250 g i alt', seconds: 30, pourG: 250 },
      { id: 'drawdown', label: 'Lad det dryppe igennem', seconds: 105, pourG: null },
    ],
    translations: {
      en: {
        name: 'Pour over',
        summary: 'Classic hand brew on a V60 — 250 g water, 15 g coffee, ratio 1:16.7. 94 °C.',
        ratioText: '15 g coffee : 250 g water',
        grind: 'Medium-fine, like coarse sand',
        steps: {
          bloom: 'Bloom — pour 45 g of water in circles over the coffee',
          first: 'First pour — up to 150 g in total',
          second: 'Second pour — up to 250 g in total',
          drawdown: 'Let it drain through',
        },
      },
    },
  },
  {
    edbSlug: 'espresso',
    name: 'Espresso',
    summary: 'Enkelt shot, ~30 ml. Serveres i lille kop.',
    ratioText: '1:2 — 18 g i, 36 g ud',
    grind: 'Fin — justeres dagligt efter shot-tid',
    waterTempC: 93,
    totalSeconds: 60,
    steps: [
      { id: 'dose', label: 'Doser 18 g i portafilteret', seconds: 15, pourG: null },
      { id: 'tamp', label: 'Level og tamp ensartet', seconds: 10, pourG: null },
      { id: 'pull', label: 'Træk shot — 36 g ud på 25–30 sek', seconds: 30, pourG: null },
      { id: 'serve', label: 'Servér straks i lille kop', seconds: 5, pourG: null },
    ],
    translations: {
      en: {
        name: 'Espresso',
        summary: 'A single shot, about 30 ml. Served in a small cup.',
        ratioText: '1:2 — 18 g in, 36 g out',
        grind: 'Fine — adjusted daily to the shot time',
        steps: {
          dose: 'Dose 18 g into the portafilter',
          tamp: 'Level and tamp evenly',
          pull: 'Pull the shot — 36 g out in 25–30 seconds',
          serve: 'Serve straight away in a small cup',
        },
      },
    },
  },
  {
    edbSlug: 'filterkaffe',
    name: 'Filterkaffe',
    summary: '60 g bønner på 7,1, 1050 ml vand, "Instant brew". Stor kop med hank, ca. halv fuld.',
    ratioText: '60 g kaffe : 1050 ml vand',
    grind: 'Mellem — 7,1 på Fellow Ode',
    waterTempC: null,
    totalSeconds: 65,
    steps: [
      { id: 'grind', label: 'Kværn 60 g bønner på 7,1', seconds: 30, pourG: null },
      { id: 'water', label: '1050 ml vand i maskinen', seconds: 15, pourG: null },
      { id: 'filter', label: 'Sæt filter i', seconds: 10, pourG: null },
      { id: 'brew', label: 'Start på "Instant brew"', seconds: 5, pourG: null },
      { id: 'serve', label: 'Servér i stor kop med hank (ca. halv fuld)', seconds: 5, pourG: null },
    ],
    translations: {
      en: {
        name: 'Filter coffee',
        summary: 'Our batch brew on the Fellow Aiden — 60 g coffee to 1050 ml water.',
        ratioText: '60 g coffee : 1050 ml water',
        grind: 'Medium — 7.1 on a Fellow Ode',
        steps: {
          grind: 'Grind 60 g of beans at 7.1',
          water: '1050 ml of water in the machine',
          filter: 'Put the filter in',
          brew: 'Start on "Instant brew"',
          serve: 'Serve in a large mug (about half full)',
        },
      },
    },
  },
];
