# Roadmap

This is a working list. Nothing here is shipped in the current build unless a
checkbox is marked.

## Approved / considered next

- [ ] **Real loop detection.** Replace the duration heuristic with onset-energy
  analysis so looping/one-shot flags are musical rather than time-based.
- [ ] **True tempo detection.** Current BPM is filename-derived or a fallback;
  a self-correlation or autocorrelation pass would make catalogue metadata
  credible.
- [ ] **Frequency-domain view.** Per-category spectral thumbnails in the file
  table (Web Audio `AnalyserNode` or offline `OfflineAudioContext` render).
- [ ] **Multi-channel / multichannel loudness.** First-channel RMS is
  acceptable for packaging; true LUFS would need a dedicated library.

## Medium term

- [ ] **Persistence of the working catalogue.** SessionStorage-indexedDB
  checkpoint so a reload keeps the small set of files a user is packaging.
- [ ] **Downloadable sidecar CSV / JSON tag sheet** alongside the ZIP metadata.
- [ ] **Accessibility audit** (keyboard upload, table semantics, screen-reader
  status announcements for analysis progress).
- [ ] **DRM-free optional SFX tags** (BWF broadcast wave-friendly naming).

## Already deferred / explicitly out of scope

- Server-side rendering, accounts, payments, or a hosted upload backend. The
  project deliberately stays local and offline.
- Bundling/minification. The repository is intentionally buildless at runtime;
  `dist/` is a copy snapshot, not a webpack barrel.
- PDF/static artwork generation. The social preview only assembles real
  screenshots.

## Priority for collaborators

If you touch one thing, touch **frequency-domain insight**: it is the most
curator-visible upgrade and keeps the app a genuine analytical instrument
rather than a renaming utility.
