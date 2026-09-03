# Inference & analysis

**Domain:** `src/audio.js`, `src/config.js`

The tool deliberately distinguishes two kinds of knowledge:

1. **Measurable facts** — duration, RMS loudness, peak.
2. **Probabilistic guesses** — category, BPM, key, loop/one-shot.

Why this matters creatively: an archive that *claims* to know its contents is
less trustworthy than one that labels its guesses. The UI exposes both; the
user can override any guess.

## Heuristics

| Signal | Rule | Rationale |
| --- | --- | --- |
| Category | First matching filename keyword | Cheap, auditable, easy to extend |
| BPM | `NNbpm`, `_NN_`, `-NN-` at end-of-stem | Matches common producer naming |
| Key | `\b[A-G][#b]?m?\b` | Matches `Am`, `F#`, `C`; avoids 'D' in ordinary words via the pattern around it |
| Loop | `<2s` one-shot, `2–8s` loop, `>8s` texture | Musically coarse but useful first pass |
| Loudness | First-channel RMS → dBFS | Production quick-glance number |

## filename guess code path

```js
named = guessCategory(file.name, KEYWORD_MAP)      // 'Misc' fallback
loop, category = classifyByDuration(duration, named)
bpm = guessBpm(file.name, settings.defaultBpm)
key = guessKey(file.name, settings.defaultKey)
```

Only the **category** heuristic can be overridden by duration (on `Misc` files).
BPM/key remain whatever the filename says, otherwise the user default.

## Why first-channel only

`getChannelData(0)` is the one-channel pass that every browser supports without
extra decoding work. For a pack archive, the wall-clock difference is
negligible for a few hundred files; the accuracy trade-off is explicitly
documented in [ARCHITECTURE.md §9](../ARCHITECTURE.md#9-limitations-and-technical-compromises).

## Extension / failure behavior

If `decodeAudioData` rejects (corrupt, unsupported, too large), the record is
still added with `duration`, `loudness`, `peak`, and `isLoop` set to `null` and
`analysisDone = true`. The user can still rename and export the original bytes;
only the derived measurements are missing.
