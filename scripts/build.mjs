import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';

const input = await readFile('data/products.json', 'utf8');
const products = JSON.parse(input);
const logic = await readFile('src/product-logic.js', 'utf8');

await writeFile(
  'js/data.js',
  "'use strict';\n\n// Создаётся командой npm run build.\nconst instruments = " +
    JSON.stringify(products, null, 2) +
    ';\n\n' +
    logic,
);

await build({
  entryPoints: ['src/catalog.jsx'],
  outfile: 'js/catalog.bundle.js',
  bundle: true,
  minify: true,
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'linked',
});


const license = await readFile('node_modules/react/LICENSE', 'utf8');
await appendFile('js/catalog.bundle.js.LEGAL.txt', '\n' + license);
