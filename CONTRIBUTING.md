# Contributing

**Sample Pack Alchemist** is a creative-technology project by Zazie Productions.
Contributions that respect its purpose—turn loose audio into a market-ready
catalogue **in the browser, without a server**—are welcome.

## Ground rules

- **No backend.** The core value is that audio never leaves the tab. Don't add
  an upload/server path without a very strong reason.
- **No invented functionality.** If a feature is speculative, put it in
  `ROADMAP.md`, not in the shipped bundle.
- **Keep the aesthetic.** It is a dark, "cybernetic-archive" instrument: gold
  pigment on near-black, hard panels, diagnostic typography. Feel free to refine
  it, not genericise it.

## Setup

```bash
npm ci
npm run check      # lint + typecheck + unit tests
npm run build      # builds dist/
npm run screenshots
npm run social
```

`npm run start` serves the repo root locally on port `8080`.

## Where things live

| Path | Purpose |
| --- | --- |
| `index.html` | Static markup and DOM shell |
| `assets/css/styles.css` | Custom visual language + layout utility subset |
| `vendor/` | Locally vendored JSZip / FileSaver (keep in sync with `package.json`) |
| `src/config.js` | Domain vocabulary, presets, constants |
| `src/audio.js` | FILENAME inference + Web Audio measurement |
| `src/files.js` | Grouping and rename-template engine |
| `src/product.js` | Copy generation |
| `src/export.js` | ZIP assembly and metadata serialisation |
| `src/app.js` | Controller/state/render boundary |
| `scripts/` | Dev server, build, fixtures, screenshots, social card |
| `test/` | Pure-module unit tests |

## Reading the architecture

Open `ARCHITECTURE.md`. The docs hierarchy is intentional:

- `README.md` = orientation / portfolio presentation
- `ARCHITECTURE.md` = system design
- `docs/technical/` = subsystem detail
- inline comments = non-obvious reasoning

## Pull requests

Small, focused, documented. `npm run check` must pass. If you change the
interface, rerun `npm run screenshots` and include the new images.

## Code of conduct

Be respectful. This is an artistic instrument; critique the work, not the
person.
