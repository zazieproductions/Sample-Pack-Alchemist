# Security

**Sample Pack Alchemist** is a fully client-side application. Audio and
generated metadata never leave the browser tab.

## Reporting a vulnerability

Please open a private advisory on GitHub
(found at **Security → Report a vulnerability**) or email the maintainers
through the repository's issue tracker. Do not publish a PoC in a public issue;
real files can contain private material.

## Scope

Covered by this policy:

- File-handling bugs in the upload/analysis/ZIP path
- Path-traversal style risk in the batch-rename and ZIP-output logic
- Any opportunity for a crafted audio file to break the UI or browser

Out of scope:

- The curated marketing text in `PRESET_DATA` (it is narrative copy, not code)
- Third-party CDNs used by external content (the runtime app avoids them)

## Practical notes for reviewers

- **Escape dynamic strings** that are rendered through innerHTML (see
  `escapeHtml` in `src/app.js`).
- Filenames are user-controlled and appear in the table and ZIP tree.
- The Web Audio `decodeAudioData` path is the largest browser-dependency
  surface; verify malformed-file handling remains non-crashing.

## Deployment notes

The static `dist/` is served by GitHub Pages. There is no runtime server, no
cookies, no tracking, and no authentication surface.
