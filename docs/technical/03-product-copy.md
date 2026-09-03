# Product copy generation

**Domain:** `src/product.js`, `PRESET_DATA` in `src/config.js`

Product copy is the **marketing arm** of the alchemy pipeline. It turns the
measured catalogue into a store-ready narration. It is string-only and
deterministic apart from the concept bank iteration.

## Three generators

1. **Curated preset** — loads a handcrafted set of `title`, `short`, `long`,
   `tags`, `license`, `credits` from `PRESET_DATA`.
2. **Custom from real catalogue** — counts category frequencies and composes a
   title `"{Mood} {Pack}"`, a short line with the actual `N × Category` list,
   a long markdown body, tags, license, and credits. This is the most useful
   branch because the copy is *true* to the files present.
3. **Random concept** — picks one of 15 evocative names and fills a fixed
   description shape. It is a **prompt bank**, not AI. It can be used to seed a
   title before the curator writes their own copy.

## Why the presets are fictional

`PRESET_DATA` exists to demonstrate the generator and to keep the product
narrative honest. The numbers inside (e.g. "40+ eerie sound assets") are
marketing copy, not claims about bundled files. That distinction is called out
in the UI and in [ARCHITECTURE.md §9](../ARCHITECTURE.md#9-limitations-and-technical-compromises).

## Data, not code

Presets live in `config.js` as plain objects, not in `product.js`. This keeps
the generator logic small and lets contributors edit catalogue lanaguage without
touching control flow.

## Generality

The copy functions accept `files` and `settings` (not DOM), so they can be unit
tested in Node and could later drive a static API without changes.
