// Reads the still-static src/data/{beans,menu,products}.ts files and prints
// them as a single JSON blob on stdout. Used once by the Rails app's
// `bin/rails mors:import` rake task to seed the catalog database.
//
// Run with: node --experimental-strip-types scripts/dump-catalog-data.mts
// (requires Node 22.6+; type-stripping is stable on 23+.)

import { beans } from '../src/data/beans.ts';
import { menuCategories } from '../src/data/menu.ts';
import { productCategories } from '../src/data/products.ts';

const out = {
  beans,
  menuCategories,
  productCategories,
};

process.stdout.write(JSON.stringify(out));
