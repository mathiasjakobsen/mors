import type { Lang } from '../i18n/ui';

// Brew guides are the recipes the bar brews by, kept in EDB
// (app/handbooks/recipes) and served by GET /api/v1/brew_guides. EDB's text
// is written for staff ("Servér i stor kop med hank"), so the site takes only
// the recipe from it: which steps, in what order, how long, and how much
// water on the scale. Everything a visitor reads is written here, per guide
// and language.
//
// Also here:
//   • an allowlist — EDB also serves staff workflows (e.g. the morning
//     espresso dial-in), and a new recipe in EDB must not go public by
//     accident;
//   • descriptive URL slugs and search titles per language;
//   • a fallback copy of the recipes for offline builds.

export interface BrewGuideStep {
  id: string;
  seconds: number;
  /** Total water on the scale at the end of this step, if it's a pour. */
  pourG: number | null;
}

/** One recipe, as EDB serves it. Only the numbers are used, never its copy. */
export interface BrewGuideRecipe {
  edbSlug: string;
  waterTempC: number | null;
  steps: BrewGuideStep[];
}

/** One step as a visitor reads it. */
export interface BrewGuideStepCopy {
  title: string;
  text: string;
}

/** Everything a visitor reads on a guide, in one language. */
export interface BrewGuideCopy {
  name: string;
  /** Intro under the heading; also the meta description and index blurb. */
  intro: string;
  ratio: string;
  grind: string;
  /** Untimed steps before EDB's first one (rinse the filter, weigh the coffee). */
  prep: BrewGuideStepCopy[];
  /** EDB step id → copy. Every step in the recipe needs one. */
  steps: Record<string, BrewGuideStepCopy>;
}

/** EDB slug → how it's published. Recipes not listed here stay internal. */
export const PUBLIC_BREW_GUIDES: Record<string, BrewGuidePublic> = {
  pour_over: {
    slug: { da: 'v60-pour-over-bryggeguide', en: 'v60-pour-over-brew-guide' },
    copy: {
      da: {
        name: 'V60 pour over',
        intro: 'Den kop, vi brygger i hånden bag baren: ren, klar og let at gentage derhjemme. Du skal bruge 15 g kaffe, 250 g vand og omkring tre et halvt minut.',
        ratio: '15 g kaffe til 250 g vand',
        grind: 'Mellemfin, som groft sand',
        prep: [
          { title: 'Skyl filteret', text: 'Læg filteret i V60’en, og skyl det med varmt vand. Det fjerner smagen af papir og varmer det hele op. Hæld skyllevandet ud.' },
          { title: 'Kværn og vej', text: 'Kværn 15 g kaffe lige før, du brygger, hæld den i filteret, og ryst let, så overfladen bliver flad. Stil det hele på vægten, og nulstil den.' },
        ],
        steps: {
          bloom: { title: 'Bloom', text: 'Start uret, og hæld vand i små cirkler, til al kaffen er våd. Den bobler lidt, mens kuldioxiden slipper ud. Det er det, der hedder bloom.' },
          first: { title: 'Første hæld', text: 'Hæld roligt i cirkler fra midten og ud, uden at ramme filterets kant.' },
          second: { title: 'Andet hæld', text: 'Samme rolige cirkler, til vægten viser 250 g. Giv V60’en et lille sving bagefter, så kaffen lægger sig fladt.' },
          drawdown: { title: 'Lad det løbe igennem', text: 'Vent, til vandet er løbet igennem kaffen, og tag så filteret af. Kaffen i bunden skal ligge fladt, ikke i en kegle.' },
        },
      },
      en: {
        name: 'V60 pour over',
        intro: 'The cup we brew by hand behind the bar: clean, clear and easy to repeat at home. You need 15 g of coffee, 250 g of water and about three and a half minutes.',
        ratio: '15 g coffee to 250 g water',
        grind: 'Medium-fine, like coarse sand',
        prep: [
          { title: 'Rinse the filter', text: 'Put the filter in the V60 and rinse it with hot water. It takes away the papery taste and warms everything up. Pour the rinse water away.' },
          { title: 'Grind and weigh', text: 'Grind 15 g of coffee just before you brew, tip it into the filter and shake gently so the surface is flat. Put it all on the scale and zero it.' },
        ],
        steps: {
          bloom: { title: 'Bloom', text: 'Start the timer and pour water in small circles until all the coffee is wet. It bubbles a little as the carbon dioxide escapes. That is the bloom.' },
          first: { title: 'First pour', text: 'Pour steadily in circles from the centre outwards, without hitting the edge of the filter.' },
          second: { title: 'Second pour', text: 'The same steady circles until the scale reads 250 g. Give the V60 a gentle swirl afterwards so the coffee settles flat.' },
          drawdown: { title: 'Let it run through', text: 'Wait until the water has run through the coffee, then lift the filter off. The coffee left in the bottom should lie flat, not in a cone.' },
        },
      },
    },
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
    copy: {
      da: {
        name: 'Espresso',
        intro: 'Sådan trækker vi en espresso: 18 g kaffe ind, 36 g ud, på 25–30 sekunder. Den er også grundlaget for alle vores mælkedrikke.',
        ratio: '1:2 – 18 g kaffe, 36 g espresso',
        grind: 'Fin – finjusteres efter tiden',
        prep: [
          { title: 'Varm op', text: 'Lad maskinen varme helt op, og skyl bryggehovedet med lidt vand, før du starter.' },
        ],
        steps: {
          dose: { title: 'Doser', text: 'Kværn 18 g kaffe direkte i portafilteret, og bank det let, så kaffen fordeler sig.' },
          tamp: { title: 'Tamp', text: 'Gør overfladen jævn, og tamp lige ned med et fast tryk. En skæv tamp giver en skæv espresso, fordi vandet tager den nemmeste vej igennem.' },
          pull: { title: 'Træk espressoen', text: 'Sæt portafilteret i, stil koppen på vægten, og start. Stop ved 36 g. Det skal tage 25–30 sekunder.' },
          serve: { title: 'Drik den med det samme', text: 'Espresso ændrer sig hurtigt, så drik den, mens cremaen stadig ligger på toppen.' },
        },
      },
      en: {
        name: 'Espresso',
        intro: 'How we pull an espresso: 18 g of coffee in, 36 g out, in 25–30 seconds. It is also the base of every milk drink we make.',
        ratio: '1:2 – 18 g coffee, 36 g espresso',
        grind: 'Fine – fine-tuned to the shot time',
        prep: [
          { title: 'Warm up', text: 'Let the machine heat up fully, and flush the group head with a little water before you start.' },
        ],
        steps: {
          dose: { title: 'Dose', text: 'Grind 18 g of coffee straight into the portafilter and tap it gently so the coffee spreads out.' },
          tamp: { title: 'Tamp', text: 'Level the surface and tamp straight down with firm pressure. An uneven tamp gives an uneven shot, because the water takes the easiest way through.' },
          pull: { title: 'Pull the shot', text: 'Lock in the portafilter, put the cup on the scale and start. Stop at 36 g. It should take 25–30 seconds.' },
          serve: { title: 'Drink it straight away', text: 'Espresso changes quickly, so drink it while the crema is still on top.' },
        },
      },
    },
    seoTitle: {
      da: 'Espresso — bryggeguide og opskrift | morˢ kaffebar, Aarhus',
      en: 'Espresso — brew guide and recipe | morˢ coffee bar, Aarhus',
    },
    brewer: 'Espresso',
    equipment: {
      da: ['Espressomaskine med portafilter', 'Espressokværn', 'Vægt med timer', 'Tamper', 'Lille kop'],
      en: ['Espresso machine with portafilter', 'Espresso grinder', 'Scale with timer', 'Tamper', 'Small cup'],
    },
    timed: false,
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
    copy: {
      da: {
        name: 'AeroPress',
        intro: 'En hurtig, fyldig kop, der tilgiver det meste. God på arbejdet, på tur, eller når kun én skal have kaffe.',
        ratio: '15 g kaffe til 230 g vand',
        grind: 'Mellem – lidt finere end til V60',
        prep: [],
        steps: {
          rinse: { title: 'Skyl filteret, og kom kaffen i', text: 'Læg papirfilteret i hætten, skyl det med varmt vand, og skru hætten på. Stil AeroPressen på koppen, kom 15 g kværnet kaffe i, og stil det hele på vægten.' },
          pour: { title: 'Hæld vandet på', text: 'Start uret, og hæld vandet over kaffen, så den bliver helt våd.' },
          stir: { title: 'Rør rundt', text: 'Rør tre gange, og sæt stemplet let på toppen. Det holder på varmen og stopper dryppet.' },
          steep: { title: 'Lad den trække', text: 'Lad den stå. Det er her, smagen bliver trukket ud.' },
          press: { title: 'Tryk ned', text: 'Tryk langsomt og jævnt, til du hører en hvæsen. Stop der, så du ikke presser den sidste, bitre rest med.' },
        },
      },
      en: {
        name: 'AeroPress',
        intro: 'A quick, full-bodied cup that forgives most things. Good at work, on a trip, or when only one of you wants coffee.',
        ratio: '15 g coffee to 230 g water',
        grind: 'Medium – a little finer than for a V60',
        prep: [],
        steps: {
          rinse: { title: 'Rinse the filter and add the coffee', text: 'Put the paper filter in the cap, rinse it with hot water and screw the cap on. Set the AeroPress on your mug, add 15 g of ground coffee and put it all on the scale.' },
          pour: { title: 'Pour the water', text: 'Start the timer and pour the water over the coffee so it is all wet.' },
          stir: { title: 'Stir', text: 'Stir three times and set the plunger lightly on top. It keeps the heat in and stops the dripping.' },
          steep: { title: 'Let it steep', text: 'Leave it. This is where the flavour comes out.' },
          press: { title: 'Press', text: 'Press down slowly and evenly until you hear a hiss. Stop there, so you do not push the last bitter bit through.' },
        },
      },
    },
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
    copy: {
      da: {
        name: 'Stempelkande (French press)',
        intro: 'Den nemmeste måde at brygge en fyldig kande til flere. Ingen filtre, bare groft kværnet kaffe, varmt vand og lidt tålmodighed.',
        ratio: '30 g kaffe til 500 g vand',
        grind: 'Grov, som havsalt',
        prep: [
          { title: 'Kværn og vej', text: 'Kværn 30 g kaffe groft, og kom den i kanden. Stil kanden på vægten, og nulstil den.' },
        ],
        steps: {
          pour: { title: 'Hæld vandet på', text: 'Start uret, og hæld vandet over kaffen, så den bliver helt våd.' },
          steep: { title: 'Lad den trække', text: 'Læg låget på uden at trykke stemplet ned, og lad den stå.' },
          crust: { title: 'Bryd skorpen', text: 'Kaffen har lagt sig som en skorpe på toppen. Rør den i stykker med en ske, så den synker, og tag skummet af.' },
          press: { title: 'Tryk stemplet ned', text: 'Sæt låget på, og tryk stemplet langsomt ned.' },
          pour_out: { title: 'Hæld op', text: 'Hæld al kaffen op med det samme, også det, du ikke skal drikke nu. Bliver den i kanden, trækker den videre og bliver bitter.' },
        },
      },
      en: {
        name: 'French press',
        intro: 'The easiest way to brew a full-bodied pot for several people. No filters, just coarse coffee, hot water and a little patience.',
        ratio: '30 g coffee to 500 g water',
        grind: 'Coarse, like sea salt',
        prep: [
          { title: 'Grind and weigh', text: 'Grind 30 g of coffee coarse and tip it into the press. Put the press on the scale and zero it.' },
        ],
        steps: {
          pour: { title: 'Pour the water', text: 'Start the timer and pour the water over the coffee so it is all wet.' },
          steep: { title: 'Let it steep', text: 'Put the lid on without pressing the plunger, and leave it.' },
          crust: { title: 'Break the crust', text: 'The coffee has settled into a crust on top. Break it up with a spoon so it sinks, and skim off the foam.' },
          press: { title: 'Press the plunger', text: 'Put the lid back on and press the plunger down slowly.' },
          pour_out: { title: 'Pour it out', text: 'Pour all the coffee out straight away, including what you will not drink now. Left in the press, it keeps steeping and turns bitter.' },
        },
      },
    },
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
    copy: {
      da: {
        name: 'Filterkaffe',
        intro: 'Vores filterkaffe brygges på en Fellow Aiden, en hel kande ad gangen. Har du en filtermaskine derhjemme, kan du bruge samme opskrift.',
        ratio: '60 g kaffe til 1050 ml vand',
        grind: 'Mellem – 7,1 på en Fellow Ode',
        prep: [],
        steps: {
          grind: { title: 'Kværn', text: 'Kværn 60 g bønner lige før, du brygger. Vi bruger 7,1 på en Fellow Ode. På andre kværne svarer det til mellem, lidt grovere end til V60.' },
          water: { title: 'Fyld vand på', text: 'Hæld 1050 ml koldt vand i tanken, gerne filtreret.' },
          filter: { title: 'Filter og kaffe', text: 'Sæt et papirfilter i kurven, hæld kaffen i, og ryst let, så den ligger fladt.' },
          brew: { title: 'Start maskinen', text: 'På Fellow Aiden bruger vi programmet "Instant brew". På andre maskiner trykker du bare start.' },
          serve: { title: 'Drik den frisk', text: 'Filterkaffe er bedst den første time. Står den længe på en varmeplade, bliver den bitter.' },
        },
      },
      en: {
        name: 'Filter coffee',
        intro: 'We brew our filter coffee on a Fellow Aiden, a full pot at a time. If you have a filter machine at home, the same recipe works.',
        ratio: '60 g coffee to 1050 ml water',
        grind: 'Medium – 7.1 on a Fellow Ode',
        prep: [],
        steps: {
          grind: { title: 'Grind', text: 'Grind 60 g of beans just before you brew. We use 7.1 on a Fellow Ode. On other grinders that is medium, a little coarser than for a V60.' },
          water: { title: 'Add the water', text: 'Pour 1050 ml of cold water into the tank, filtered if you can.' },
          filter: { title: 'Filter and coffee', text: 'Put a paper filter in the basket, tip the coffee in and shake gently so it lies flat.' },
          brew: { title: 'Start the machine', text: 'On the Fellow Aiden we use the "Instant brew" programme. On other machines, just press start.' },
          serve: { title: 'Drink it fresh', text: 'Filter coffee is best in the first hour. Left on a hot plate for long, it turns bitter.' },
        },
      },
    },
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
    waterTempC: 94,
    steps: [
      { id: 'bloom', seconds: 45, pourG: 45 },
      { id: 'first', seconds: 30, pourG: 150 },
      { id: 'second', seconds: 30, pourG: 250 },
      { id: 'drawdown', seconds: 105, pourG: null },
    ],
  },
  {
    edbSlug: 'espresso',
    waterTempC: 93,
    steps: [
      { id: 'dose', seconds: 15, pourG: null },
      { id: 'tamp', seconds: 10, pourG: null },
      { id: 'pull', seconds: 30, pourG: null },
      { id: 'serve', seconds: 5, pourG: null },
    ],
  },
  {
    edbSlug: 'aeropress',
    waterTempC: 92,
    steps: [
      { id: 'rinse', seconds: 15, pourG: null },
      { id: 'pour', seconds: 15, pourG: 230 },
      { id: 'stir', seconds: 10, pourG: null },
      { id: 'steep', seconds: 50, pourG: null },
      { id: 'press', seconds: 30, pourG: null },
    ],
  },
  {
    edbSlug: 'stempelkande',
    waterTempC: 94,
    steps: [
      { id: 'pour', seconds: 15, pourG: 500 },
      { id: 'steep', seconds: 225, pourG: null },
      { id: 'crust', seconds: 30, pourG: null },
      { id: 'press', seconds: 20, pourG: null },
      { id: 'pour_out', seconds: 15, pourG: null },
    ],
  },
  {
    edbSlug: 'filterkaffe',
    waterTempC: null,
    steps: [
      { id: 'grind', seconds: 30, pourG: null },
      { id: 'water', seconds: 15, pourG: null },
      { id: 'filter', seconds: 10, pourG: null },
      { id: 'brew', seconds: 5, pourG: null },
      { id: 'serve', seconds: 5, pourG: null },
    ],
  },
];
