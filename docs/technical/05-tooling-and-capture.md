# Tooling & capture

**Domain:** `scripts/`, `.github/`

The project treats the *repository itself* as the creative archive. That means
the tooling must be reproducible: same command → same screenshots → same build.

## Scripts

| Script | What it does |
| --- | --- |
| `serve.mjs` | Dependency-free static server for local dev |
| `build.mjs` | Copies the page to `dist/`, validates local asset references, writes `.nojekyll` |
| `generate-fixtures.mjs` | Writes reproducible WAV tones to `test-fixtures/` (sine/noise, realistic durations) |
| `capture-screenshots.mjs` | Uses Playwright + bundled Chromium to capture clean / active / detail states |
| `build-social-preview.mjs` | Composites the real active capture into a 1280×640 GitHub social card |

## Browser strategy

The sandbox has no system browser and blocked Playwright's own Chromium
download. The scripts therefore use **`@sparticuz/chromium`** — a Chromium
snapshot shipped in an npm tarball — and populate its missing AWS Lambda libs
from the bundled `al2023.tar.br` into `/tmp/al2023/lib`, setting
`LD_LIBRARY_PATH`. This keeps captures reliable on any Linux runner.

On a machine with Playwright's browser already installed, `capture-screenshots.mjs`
would need a small switch; currently it always boots the bundled Chromium.

## Captures are not mockups

`project-preview.png`, `project-active.png`, and `project-detail.png` come from
the real page: a browser navigates `/`, uploads the generated WAV fixtures,
waits for analysis, selects a preset, renames, and screenshots. The active image
therefore shows real measured `-11 dB`, `4.00s`, etc.

## CI

`.github/workflows/ci.yml` runs `npm ci`, lint, typecheck, tests, and build on
every push/PR to `main`. `.github/workflows/pages.yml` builds the same way and
publishes `dist/` to the `gh-pages` branch using `peaceiris/actions-gh-pages`.

## Enabling Pages

The Pages API is not available to the automated token, so the repository owner
must do one manual step once:

1. Repo → Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: **gh-pages**, **/ (root)**

From then on, every `main` push deploys automatically. See `README.md` for the
expected URL; `package.json`'s `homepage` already points there.

## Offline

The runtime app vendors JSZip and FileSaver and encodes its layout subset in
`styles.css`; it no longer calls a CDN at all. `dist/` is self-contained.
