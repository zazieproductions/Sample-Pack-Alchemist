// @ts-check
/**
 * build.mjs
 * ----------------------------------------------------------------------------
 * Static production build.
 *
 * This is a copy pipeline rather than a bundler. The site is intentionally
 * buildless at runtime for archive readability — `dist/` is the deployable
 * snapshot with relative asset paths (so it works on GitHub Pages under
 * /Sample-Pack-Alchemist/ or at a domain root).
 */

import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const publicFiles = ['index.html'];

/** @param {string} p */ const exists = (p) => existsSync(p);

// Clean the destination.
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const file of publicFiles) {
  await cp(join(root, file), join(dist, file));
}
await cp(join(root, 'assets'), join(dist, 'assets'), { recursive: true });
await cp(join(root, 'vendor'), join(dist, 'vendor'), { recursive: true });

// Copy only the browser modules — no .d.ts or other editor files.
await mkdir(join(dist, 'src'), { recursive: true });
for (const file of await readdir(join(root, 'src'))) {
  if (file.endsWith('.js')) {
    await cp(join(root, 'src', file), join(dist, 'src', file));
  }
}

// Prevent GitHub Pages' Jekyll pass from treating underscored content specially.
await writeFile(join(dist, '.nojekyll'), '');

// Sanity check every local reference used by the page exists in dist.
const html = await readFile(join(dist, 'index.html'), 'utf8');
const references = [...html.matchAll(/(?:src|href)="\.\/([^"#?]+)"/g)].map((m) => m[1]);
const missing = references.filter((ref) => !exists(join(dist, ref)));

if (missing.length > 0) {
  for (const ref of missing) console.error(`Missing build asset: ${ref}`);
  throw new Error(`Build failed: ${missing.length} referenced asset(s) missing from dist/.`);
}

console.log(`Built ${dist}`);
console.log(`Validated ${references.length} local asset reference(s).`);
