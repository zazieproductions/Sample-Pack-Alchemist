# Changelog

All notable changes are documented here. The project follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) loosely and
[Semantic Versioning](https://semver.org/) where a release happens.

## [Unreleased]

### Platform / archive treatment

- Recovered the app from a DesignArena export (the original `index.html` was
  one giant HTML block inside Markdown fences).
- Rebuilt it as a buildable, documented static project:
  - `index.html` shell + `assets/css/styles.css` + modular `src/` ES modules.
  - `vendor/` copies of JSZip 3.10.1 and FileSaver 2.0.5 for offline/reproducible runs.
  - `scripts/serve.mjs` and `scripts/build.mjs` (dependency-free Node).
  - `scripts/generate-fixtures.mjs` and `scripts/capture-screenshots.mjs`.
  - `scripts/build-social-preview.mjs`.
  - Unit tests for audio inference, rename, copy generation, and ZIP export.
  - ESLint + `tsc --checkJs` type-checking.
  - GitHub Actions CI and a `gh-pages` deploy workflow.
- Replaced emoji glyph icons with inline stroke SVG icons so the interface is
  glyph-stable across platforms and headless capture environments.
- Added `README.md`, `ARCHITECTURE.md`, `docs/technical/`, `CONTRIBUTING.md`,
  `SECURITY.md`, `ROADMAP.md`, `.env.example`, and issue/PR templates.
- Captured real screenshots of the clean, active, and detail states.

### Behavior

- Corrected the delimited-BPM filename heuristic (`beat-140.wav` now reads 140).
- Tightened JSDoc types and `@ts-check` so the browser modules pass strict
  `checkJs` type-checking.
- Vendored runtime libraries instead of loading JSZip/FileSaver from a CDN.

## [1.0.0] - DesignArena export

- Original single-page app: drag/drop, Web Audio analysis, batch rename,
  product-copy generation, ZIP preview and export.
- Curated product presets and a random-concept bank.
