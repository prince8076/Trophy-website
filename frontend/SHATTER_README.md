# Trophy shatter scroll — v2

## What changed, and why

The folder `frontend/public/framer-frames/` was REPLACED by the
user on branch `framer-frames-scroll` (commit `c420e058`,
"Replace scroll trophy frames with 2x upscaled frames").

The old folder was an assembling sequence (exploded -> finished,
1280x720 landscape, ~5.8 MB total). The new folder is a REAL
shatter sequence (verified frame by frame, 2026-10-26):

- `ezgif-frame-001.jpg` — intact gold Webb Ellis Cup, blue studio
- `ezgif-frame-020.jpg` — still intact
- `ezgif-frame-040.jpg` — cracks radiating across the cup
- `ezgif-frame-080.jpg` — breaking apart, lid off, handles flying
- `ezgif-frame-150.jpg` — major shatter, pieces midair
- `ezgif-frame-250.jpg` / `300.jpg` — full explosion, pieces
  suspended / fallen, base split (the end image)

New frames are portrait 1440x2560, ~400-550 KB each, ~140 MB
total. That is why the old component could not just be reused.

## Files in this push (branch only, NOT main)

- `frontend/src/components/TrophyShatterScroll.jsx` (v2, forward)
- `frontend/src/pages/HomePage.jsx` — only the import and the
  component usage changed: `FramerScrollTrophy` ->
  `TrophyShatterScroll`, in the same slot after the hero.
  The old `FramerScrollTrophy.jsx` file is left in place,
  unused, so nothing else breaks if you want to revert.

## How v2 works

- Pinned 500vh section, sticky 100vh viewport, canvas contain-fit.
- Scroll progress 0 -> 1 maps to frames 001 -> 300, forward.
  Scroll up reverses it. No autoplay, no loop.
- Chapters: Intact (0-8%) -> Cracks (8-27%) -> Breaking apart
  (27-50%) -> Major shatter (50-75%) -> Full explosion
  (75-97%) -> Shattered (97-100%).
- Reduced-motion: static intact frame 001 only, no scroll section.

## Performance — the important part

Do NOT preload all 300 frames. A decoded 1440x2560 frame is
~14 MB; all 300 would be ~4 GB decoded and crash mobile.
v2 keeps a windowed LRU cache of at most 28 decoded frames,
prefetches ~12 ahead, and evicts far frames. HTTP cache still
holds the JPG bytes, so scrolling back is fast, but decoded
memory stays bounded.

Consequences, honestly stated:

- Full scroll downloads ~140 MB of JPGs in total. That is the
  cost of 2x portrait frames. On a slow/mobile connection it
  will feel heavy. If that matters, resize the frames to
  ~720-1080px wide (or convert to WebP) and re-push them —
  the component needs no code change for that, only the files.
- A very fast scroll into unvisited frames shows the nearest
  cached frame for a beat while the exact frame downloads.
- Section background is blue (#0a2f8f), matching the frames,
  not black. The frames themselves have a blue studio
  background, a red diagonal stripe top-left, and a small
  Gemini sparkle bottom-right, as supplied.

## Test

```bash
git checkout framer-frames-scroll
git pull
cd frontend && npm run dev
```

Scroll past the hero: trophy should start intact, crack
around 10-25% of the section, break apart, then explode,
and restore exactly when you scroll back up.
