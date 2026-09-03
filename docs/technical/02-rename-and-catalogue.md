# Rename & catalogue

**Domain:** `src/files.js`, renamed in `src/app.js`

The batch-rename engine is deliberately template-based. It translates the
"packaging language" of a producer into a deterministic string.

## Template vocabulary

| Token | Source |
| --- | --- |
| `{Artist}` | `settings.artistName` |
| `{PackName}` | `settings.packName` |
| `{Category}` | `record.category` |
| `{Key}` | `record.key` or default |
| `{Mood}` | `record.mood` or default |
| `{BPM}` | `record.bpm` or default |
| `{Num}` | zero-padded counter |

## Algorithm

`buildRenamedName`:

1. interpolate tokens (regex replace, escaped),
2. collapse repeated underscores/spaces (`[_\s]+` → `_`),
3. strip leading/trailing underscore,
4. prevent double dots.

The result is always a single extension from `record.ext`.

## Why no parser

The vocabulary is closed and user-controlled. A regex-based replace is the
clearest implementation; if the vocab grew to user-defined operators, it should
move to an AST/tokenizer.

## Grouping

`groupByCategory` is the single grouping primitive used by both the ZIP preview
tree and the ZIP writer. It returns `Record<category, records>`, defaulting to
`Misc`. Keeping it in `files.js` prevents the controller from drifting into its
own grouping logic.

## Settings snapshot

`readSettings()` reads the DOM into a single immutable plain object. The
persistence side is deliberately dumb: `localStorage.setItem('spa_settings', ...)`.
If a future change needs migration, that is the only place to version it.
