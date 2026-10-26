# Framer scroll trophy — frame files

This component (`frontend/src/components/FramerScrollTrophy.jsx`)
scrubs the user's own 300 frames on scroll, Framer-style:
scroll progress 0 -> exploded trophy, 1 -> finished trophy.

## The frames

- Source: user upload 2026-10-26, `ezgif-77b2ecdf092f45f3-jpg.zip`
- 300 JPGs, 1280x720, ~5.8 MB total
- `ezgif-frame-001.jpg` — trophy exploded, parts apart
- `ezgif-frame-050.jpg` — parts moving in
- `ezgif-frame-150.jpg` — gold cup almost closed
- `ezgif-frame-200.jpg` — close-up, gears assembling
- `ezgif-frame-250.jpg` / `ezgif-frame-300.jpg` — finished silver/gold
  trophy on a black marble base, on black
- Note: the small sparkle mark in the bottom-right corner is
  part of the supplied frames, as supplied. It is not removed
  here; replace the frames with clean exports if you want it gone.

## How to install them (required — they are not in this push)

Muse's GitHub push is text-only and rejects JPGs, so the frames
themselves cannot be pushed by Muse. Do this once, on your own
machine, with normal git:

1. Unzip the supplied zip (it already contains
   `ezgif-frame-001.jpg` … `ezgif-frame-300.jpg`).
2. Copy all 300 files to:
   `frontend/public/framer-frames/`
   so the paths are, for example:
   `frontend/public/framer-frames/ezgif-frame-001.jpg`
3. From the repo root:
   ```
   git add frontend/public/framer-frames/
   git commit -m "Add framer scroll trophy frames (300 JPGs)"
   git push
   ```
4. Run the site (`cd frontend && npm run dev`). The scroll
   section shows "Loading trophy frames… %" while preloading,
   then scrubs frame-by-frame as you scroll. If the files are
   missing, it shows "Trophy frames not found" with these
   instructions instead of a blank black box.

## Where it is used

`frontend/src/pages/HomePage.jsx` inserts, right after the hero
and before the trust marquee:

```jsx
<FramerScrollTrophy
  onAddToBag={() => navigate('/catalog')}
  onEngrave={() => document.getElementById('engraving-studio')?.scrollIntoView({ behavior: 'smooth' })}
/>
```

No new dependency is needed — no Three.js, no video library.
The section is 500vh tall, sticky, canvas-drawn with contain-fit
(whole frame visible, never cropped), DPR capped at 1.5, and
pauses off-screen via IntersectionObserver.
