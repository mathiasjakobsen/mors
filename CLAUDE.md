# CLAUDE.md — mors.coffee

Marketing site for morˢ, Klostergade 58, Aarhus C. Astro + Tailwind, static,
deployed to GitHub Pages on every push to `master`.

## Brand vocabulary — read this before writing any customer-facing copy

**morˢ is a kaffebar first.** In Danish it is "kaffebaren", in English "the
coffee bar" (or "coffee shop"). That is the primary category in headings,
titles and UI strings — anywhere a customer might read it.

**"Café" is allowed as a secondary word**, because it is what most people
search for. Use it alongside "kaffebar", never instead of it: "kaffebar og
café", "the coffee bar (or café, if you like)", an `alternateName` in the
JSON-LD. Never make "café" the headline category of a page.

Where something happens — buying, ordering, showing a QR code — say "i kaffebaren" ("in the coffee bar"),
not "ved baren" or "i baren", and never "disken". "Bag baren" is fine when it
means working behind the counter.

morˢ is **not a bakery**: say bagværk / baked goods / pastries. It serves
everyday **breakfast (morgenmad)**, not brunch. The tagline is spelled
**"Useriøst"**.

The exceptions are technical or external, and they stay as they are:
`CafeOrCoffeeShop` (a schema.org type), the `cafe-latte` menu id and the
"Cafe latte" drink name, and the europeancoffeetrip.com/cafe/… URL.

## Gift cards are digital

A morˢ gift card is **not** a physical clip card. It is sold in the kaffebar,
and the customer receives a **digital gift certificate** (a PDF with a QR
code). Scanning it opens `edb.mors.coffee/loyalty/<CODE>`, from which the
recipient adds the card to **Apple or Google Wallet in one tap** — no app and
no account. At the bar they show the QR code and the remaining count drops by
one ("5× tilbage"). The certificate prints **"Uden udløbsdato"**, so the cards
do not expire.

Never describe them as clipped, punched, printed cards, or as something posted
to the customer.

## Content comes from the POS

Menu, beans, crafts and gift cards are fetched at build time from
`https://edb.mors.coffee/api/v1/products` by `src/lib/api.ts`, which falls back
to the static arrays in `src/data/*.ts` when the API is unreachable. Prices in
the API are **ex-VAT** (`price_kr`); every customer-facing page shows incl-VAT.

Product names and descriptions are the shop's own words from the POS — do not
rewrite them in the site. If POS copy is wrong, it gets fixed in the staff PWA,
not here.

Brew guides are the exception. `/api/v1/brew_guides` serves the bar's recipes,
written for staff, so the site takes only the recipe from it (step order,
times, grams, water temperature). Every word a visitor reads on a guide is
written in `src/data/brew-guides.ts`, and a guide whose EDB steps lack copy
there is left out of the build rather than showing EDB's text.

## Language

Code, comments, commits and docs are English. Customer-facing product copy is
Danish for `/…` and English for `/en/…`, and existing strings are not
retranslated as a side effect of another change.
