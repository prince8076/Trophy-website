# Redesign — branch redesign-motion-threeui

## What this is

A from-scratch homepage for Shreeji Corporates, built on branch
`redesign-motion-threeui` (from `framer-frames-scroll` at
`c5db40f1`, so the 300 shatter frames are already in
`frontend/public/framer-frames/`). Main and
`framer-frames-scroll` are untouched.

## Design sources — patterns only, nothing copied

Two sites the user named were reviewed in a browser (no sign-in,
no purchase, no text/images/logos/code copied):

- motionsites.ai — dark charcoal gallery, compact centred hero,
  huge poster sans headline, pill filters, generous rounded
  cards (about 16-20px), muted chrome so previews stand out,
  peach-to-lavender glow used sparingly on one hero word.
- threeui.com/landing-pages?sort=recent — very dark monotone
  listing, thin hairline borders, uniform aligned grid (not
  masonry), small tag pills, gold/tan premium badge, quiet
  heading, FAQ-then-footer rhythm.

What was taken from them, in our own implementation:

- Palette: background #0B0B0E, card #1E1E24, border #26262A,
  text white, muted #A1A1AA, gold accent #C9A86A, primary
  button off-white #E8EEF5, peach #F5C69A -> lavender #C4B5FD
  gradient for one hero word and the shatter glow only.
- Hero: eyebrow pill, huge extra-bold uppercase headline,
  short supporting line, pill buttons.
- Catalogue: uniform grid, pill filters, Recent/Bestsellers
  sort, tag/badge pattern, stronger hover for commerce
  (TrophyCard already lifts/tilts).
- Scroll story ends calmly: engraving, guarantees, reviews,
  final quote call to action.

## Why the shatter looks different here

The old shatter was a full-width wall: portrait blue frames
contain-fit on a blue canvas looked like a blue screen, and
the sticky section sat inside an overflow-hidden root.
Here the shatter is a contained card:

- `frontend/src/components/ShatterStage.jsx` (v5, based on
  TrophyShatterScroll v4): section 420vh, sticky card
  82vh, max-width 1100px, rounded 20px, #26262A border.
  The blue frames are a framed preview inside that card,
  with a blurred cover background image behind the sharp
  foreground — no flat blue wall.
- A peach-to-lavender glow behind the trophy peaks
  mid-shatter (40-80% scroll) and is zero at both ends.
- Chapters are a bottom pill inside the card, fully visible
  at scroll 0%, not faint text at the top.
- Scroll 0% = frame 001 intact, 100% = frame 300 shattered,
  scrolling up reverses it, no autoplay/loop, windowed
  cache (max 28 decoded frames), reduced-motion static card.
- The stage sits between two plain blocks in the new
  HomePage, not inside an overflow-hidden div.

## Files in this push

- `frontend/src/pages/HomePage.jsx` — from scratch (see its
  header comment for what was deliberately not carried over).
- `frontend/src/components/ShatterStage.jsx` — new, v5.
- `frontend/REDESIGN_README.md` — this file.

Routes, Navbar, Footer, catalog, product, cart and quote
pages are unchanged (App.jsx). The old HomePage, hero and
TrophyShatterScroll files still exist on other branches and
in this repo's history; this branch's HomePage simply does
not import them.

## Test

```bash
git checkout redesign-motion-threeui
git pull
cd frontend && npm run dev
```

Hero -> scroll: the card pins, trophy cracks, shatters,
then the catalogue appears. Scroll back up: it restores.
Check: no blue wall, chapter pill readable at the bottom,
filters/sort change the grid, engraving preview still works,
quote modal still opens.
