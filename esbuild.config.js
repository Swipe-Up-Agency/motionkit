import { build, context } from 'esbuild';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssContents = readFileSync(`${__dirname}/src/styles/anti-fouc.css`, 'utf8');
mkdirSync(`${__dirname}/dist`, { recursive: true });

const options = {
  entryPoints: [`${__dirname}/src/index.js`],
  outfile: `${__dirname}/dist/motion-kit.min.js`,
  bundle: true,
  minify: true,
  sourcemap: true,
  format: 'iife',
  target: ['es2020'],
  define: { __ANTI_FOUC_CSS__: JSON.stringify(cssContents) },
  logLevel: 'info',
};

const watch = process.argv.includes('--watch');
if (watch) {
  const ctx = await context(options);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await build(options);
  console.log('Build complete.');
}
