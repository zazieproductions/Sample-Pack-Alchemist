// @ts-check
/**
 * build-social-preview.mjs
 * ----------------------------------------------------------------------------
 * Composes the GitHub/OG social card at 1280×640 from real project screenshots
 * plus restrained Zazie Productions branding. The output is a browser render,
 * not an AI mock-up: the panel is an actual capture of the app.
 *
 * Output: docs/images/github-social-preview.png
 * Run:    npm run social
 */

import { mkdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium as playwrightChromium } from 'playwright';
import sparticuzChromium from '@sparticuz/chromium';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = join(root, 'docs', 'images');
/** @type {ReturnType<typeof createServer>} */
let server;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

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
  if (typeof address === 'object' && address) return address.port;
  throw new Error('Could not bind social-preview server.');
}

async function resolveBrowser() {
  const mod = sparticuzChromium.default || sparticuzChromium;
  if (!process.env.LD_LIBRARY_PATH) process.env.LD_LIBRARY_PATH = '';
  const libDir = '/tmp/al2023/lib';
  if (!existsSync(join(libDir, 'libnss3.so'))) {
    // Extract the bundled AL2023 libs once, mirroring capture-screenshots.mjs.
    const data = await readFile(join(root, 'node_modules', '@sparticuz', 'chromium', 'bin', 'al2023.tar.br'));
    const { brotliDecompressSync } = await import('node:zlib');
    const { writeFileSync, mkdirSync } = await import('node:fs');
    writeFileSync('/tmp/al2023.tar', brotliDecompressSync(data));
    mkdirSync('/tmp/al2023', { recursive: true });
    const r = spawnSync('tar', ['-xf', '/tmp/al2023.tar', '-C', '/tmp/al2023'], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error(r.stderr || 'Could not extract Chromium.');
  }
  const existing = process.env.LD_LIBRARY_PATH.split(':').filter(Boolean);
  if (!existing.includes(libDir)) process.env.LD_LIBRARY_PATH = [libDir, ...existing].join(':');
  return { executablePath: await mod.executablePath(), args: [...mod.args, '--no-sandbox'] };
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const port = await startServer();
  const launch = await resolveBrowser();
  const browser = await playwrightChromium.launch({
    executablePath: launch.executablePath,
    args: launch.args,
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 640 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html>
<html><head><style>
  * { margin:0; box-sizing:border-box; }
  body { width:1280px; height:640px; overflow:hidden; background:#0d0d0f; color:#eaeaea; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; display:flex; }
  .left { width:47%; padding:54px 44px 48px; display:flex; flex-direction:column; justify-content:space-between; }
  .eyebrow { color:#9a9aa6; font-size:13px; letter-spacing:.18em; text-transform:uppercase; }
  .name { color:#fff; font-size:44px; line-height:1.06; font-weight:650; letter-spacing:-.02em; margin-top:14px; }
  .tagline { color:#9a9aa6; font-size:17px; line-height:1.45; margin-top:14px; max-width:410px; }
  .zazie { font-size:15px; color:#d4a853; font-weight:600; margin-top:18px; letter-spacing:.06em; }
  .cta { margin-top:26px; display:inline-flex; align-items:center; gap:10px; background:#d4a853; color:#0d0d0f; font-size:14px; font-weight:600; padding:12px 20px; border-radius:10px; width:max-content; }
  .right { width:53%; padding:34px 38px 34px 0; display:flex; align-items:center; }
  .frame { width:100%; border:1px solid #32323b; border-radius:16px; overflow:hidden; box-shadow:0 30px 60px rgba(0,0,0,.55); background:#141418; }
  /* Crop the tall full-page capture so the widest, most technical region
   * (files table + product generator + export) fills the frame without
   * horizontal cropping. */
  .frame img { display:block; width:100%; height:500px; object-fit:cover; object-position:50% 12%; }
  .bar { background:#1c1c22; border-bottom:1px solid #26262e; padding:10px 16px; font-size:12px; color:#9a9aa6; display:flex; justify-content:space-between; }
  .dot { color:#d4a853; }
</style></head><body>
  <section class="left">
    <div>
      <div class="eyebrow">Creative Technology · Audio Archive</div>
      <h1 class="name">Sample Pack<br/>Alchemist</h1>
      <p class="tagline">Turn loose audio into catalogued, renamed, market-ready sample packs — entirely in the browser.</p>
    </div>
    <div>
      <div class="zazie">CREATED BY ZAZIE PRODUCTIONS</div>
      <div class="cta">Launch Live Project <span>→</span></div>
    </div>
  </section>
  <section class="right">
    <div class="frame">
      <div class="bar"><span><span class="dot">●</span> project-active.png</span><span>local · offline</span></div>
      <img src="http://127.0.0.1:${port}/docs/images/project-active.png" alt="Sample Pack Alchemist active analysis and export state" />
    </div>
  </section>
</body></html>`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(outputDir, 'github-social-preview.png') });
  await browser.close();
  if (server) server.close();
  console.log('Written docs/images/github-social-preview.png');
}

main().catch((err) => {
  console.error(err);
  if (server) server.close();
  process.exit(1);
});
