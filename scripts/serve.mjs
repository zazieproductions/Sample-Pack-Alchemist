// @ts-check
/**
 * serve.mjs
 * ----------------------------------------------------------------------------
 * Minimal static dev server (no dependencies beyond Node).
 *
 * Serves the repository root on the port given by --port (default 8080).
 * Intended for local development and for the screenshot script; GitHub Pages
 * serves the same static file set from dist/.
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const portArg = process.argv.find((arg) => arg.startsWith('--port='));
const port = Number(portArg ? portArg.split('=')[1] : process.env.SPA_PORT || 8080);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.md': 'text/markdown; charset=utf-8',
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/' || pathname === '') pathname = '/index.html';
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
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Sample Pack Alchemist dev server → http://localhost:${port}`);
});
