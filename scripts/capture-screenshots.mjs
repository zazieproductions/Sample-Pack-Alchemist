// @ts-check
/**
 * capture-screenshots.mjs
 * ----------------------------------------------------------------------------
 * Real application screenshots via Playwright.
 *
 * The script uses whichever Chromium is available:
 *   1. An installed Playwright browser (preferred in CI/local with Playwright).
 *   2. The bundled @sparticuz/chromium package, which ships a headless Chromium
 *      inside the npm tarball. This keeps screenshots reproducible on machines
 *      without a system browser or CDN access.
 *
 * Output:
 *   docs/images/project-preview.png  – clean interface
 *   docs/images/project-active.png   – active analysis/rename/product state
 *   docs/images/project-detail.png   – export/structure detail
 *
 * Run:  npm run screenshots
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium as playwrightChromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = join(root, 'docs', 'images');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
};

/* ------------------------------------------------------------- local server */

/** @type {ReturnType<typeof createServer>} */
let server;
let port = 0;

async function startServer() {
  server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://${req.headers.host}`);
      let pathname = decodeURIComponent(url.pathname);
      if (pathname === '/') pathname = '/index.html';
      const filePath = normalize(join(root, pathname));
      if (!filePath.startsWith(normalize(root))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      const body = await readFile(filePath);
      res.writeHead(200, { 'content-type': MIME[extname(filePath)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  await new Promise((resolveReady) => server.listen(0, '127.0.0.1', resolveReady));
  const address = server.address();
  if (typeof address === 'object' && address) port = address.port;
}

/* ------------------------------------------------------------- browser boot */

/**
 * Prepare the bundled Chromium libs. AWS Lambda tarballs ship only the NSS
 * layer; we extract the AL2023 snapshot and point LD_LIBRARY_PATH at it.
 */
async function prepareSparticuzChromium() {
  if (!process.env.LD_LIBRARY_PATH) process.env.LD_LIBRARY_PATH = '';
  const libDir = '/tmp/al2023/lib';
  if (!existsSync(join(libDir, 'libnss3.so'))) {
    const brPath = join(root, 'node_modules', '@sparticuz', 'chromium', 'bin', 'al2023.tar.br');
    if (!existsSync(brPath)) throw new Error('Missing @sparticuz/chromium brotli archive.');
    // Expand the brotli archive to disk using Node, then let `tar` extract it.
    const data = await readFile(brPath);
    const { brotliDecompressSync } = await import('node:zlib');
    const tarPath = '/tmp/al2023.tar';
    writeFileSync(tarPath, brotliDecompressSync(data));
    mkdirSync('/tmp/al2023', { recursive: true });
    const result = spawnSync('tar', ['-xf', tarPath, '-C', '/tmp/al2023'], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.stderr || 'Could not extract Chromium libraries.');
  }
  const existing = process.env.LD_LIBRARY_PATH.split(':').filter(Boolean);
  if (!existing.includes(libDir)) process.env.LD_LIBRARY_PATH = [libDir, ...existing].join(':');
}

/**
 * Resolve a launch config. Returns null if no browser is usable, so the script
 * fails loudly instead of producing mockups.
 */
async function resolveBrowser() {
  const sparticuz = await import('@sparticuz/chromium');
  const mod = sparticuz.default || sparticuz;
  await prepareSparticuzChromium();
  const executablePath = await mod.executablePath();
  return { executablePath, args: [...mod.args, '--no-sandbox'], headless: true };
}

/* ------------------------------------------------------------- screenshot */

async function waitForReady(page) {
  await page.waitForFunction(() => globalThis.__SPA__ && globalThis.__SPA__.ready === true, { timeout: 15000 });
  await page.waitForFunction(
    () => document.querySelector('#statusBadge')?.textContent === 'ready',
    { timeout: 15000 },
  );
}

async function waitForAnalysis(page) {
  await page.waitForFunction(
    () => globalThis.__SPA__ && globalThis.__SPA__.fileCount > 0 && globalThis.__SPA__.analyzing === false,
    { timeout: 30000 },
  );
}

const fixtureFiles = [
  'test-fixtures/drone_loop_Am_90.wav',
  'test-fixtures/bass_pulse_130bpm.wav',
  'test-fixtures/kick_impact_one-shot.wav',
];

async function main() {
  await mkdir(outputDir, { recursive: true });
  // Regenerate fixtures only if missing; the tones are part of the archive.
  const generator = join(root, 'scripts', 'generate-fixtures.mjs');
  if (!fixtureFiles.every((f) => existsSync(join(root, f)))) {
    const result = spawnSync(process.execPath, [generator], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.stderr || 'Could not generate fixtures.');
  }

  await startServer();
  const launch = await resolveBrowser();
  const browser = await playwrightChromium.launch({
    executablePath: launch.executablePath,
    args: launch.args,
    headless: launch.headless,
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  // The interface uses inline SVG icons, so no color-emoji font is needed.
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
  await waitForReady(page);

  // 1. Clean interface.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: join(outputDir, 'project-preview.png'), fullPage: true });
  console.log('✓ project-preview.png');

  // 2. Meaningful active state.
  await page.setInputFiles('#fileInput', fixtureFiles.map((f) => join(root, f)));
  await waitForAnalysis(page);
  await page.selectOption('#presetStyle', 'Psychological Horror Toolkit');
  await page.click('#batchRenameBtn');
  await page.click('#generateProductBtn');
  await page.waitForTimeout(400);
  // Return to the scroll origin so the sticky header does not bleed into
  // the middle of a full-page capture.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: join(outputDir, 'project-active.png'), fullPage: true });
  console.log('✓ project-active.png');

  // 3. Strongest technical/pipeline detail: the ZIP folder + metadata view.
  const exportSection = page.locator('section:has(#export-heading)');
  await exportSection.scrollIntoViewIfNeeded();
  await exportSection.screenshot({ path: join(outputDir, 'project-detail.png') });
  console.log('✓ project-detail.png');

  await browser.close();
  if (server) server.close();

  console.log('Screenshots written to docs/images/');
}

main().catch((err) => {
  console.error(err);
  if (server) server.close();
  process.exit(1);
});
