# Fresh design v3 — branch fresh-design-v3

Replaces the charcoal/gold designs (v1 poster, v2 split hero).
The user said the old site was boring and asked for a fresh
design using the resources they linked, with Framer-style motion.

## What is new
- Palette (tokens in frontend/src/index.css, :root):
  paper #FAF6EE, cream #FFFDF8, ink #1A1712, pine #14342B,
  vermilion #E4572E, gold #B9975B (metal accent only),
  line #E6DDCC. No charcoal page, no gold theme.
- Fonts that actually load (index.css, Google Fonts @import
  before Tailwind): Fraunces for display headlines, Manrope
  for body. Previous index.css named Playfair/Cormorant/etc.
  without loading them, so browsers fell back — that is part
  of why the old type looked boring.
- Layout, from scratch, in our own code (no template/library
  code, text or images copied):
  headline-first hero with the trophy image as the signature
  below it, mouse spotlight on the hero image (spring-smoothed),
  scrolling word strip, dark shatter card on a light page,
  uniform catalogue with a bento first item, three-step
  "How it works" list, pine engraving panel, guarantees as a
  list, reviews, final quote call to action.
- Motion: framer-motion springs (stiffness 120, damping 20),
  staggered entrance, whileHover/whileTap on actions,
  scroll-linked shatter (48 frames, already on this branch).
  Reduced motion: entrance animation off, shatter static.
- No invented numbers. No tracked-capital eyebrow. No
  purple-blue gradient. No card inside a card. Grids use
  minmax(0, 1fr). Hero headline, sentence and actions fit
  the first screen at 1280x800.

## Files in this push
- frontend/src/pages/HomePage.jsx — fresh v3
- frontend/src/components/ShatterStage.jsx — v7, paper
  section, dark card, vermilion progress/accent
- frontend/src/index.css — fonts + fresh tokens + bento class
  (all previous classes kept, other pages unchanged)
- frontend/FRESH_DESIGN_README.md — this file

## Frames
The 48-frame shatter sequence is ALREADY on this branch
(user pushed it to redesign-motion-threeui, commit ff15cd04,
and this branch was created from it). No zip copy needed.
Hero and shatter both use /shatter-frames/shatter-frame-001.jpg
and the 48-frame sequence.

## Test
```bash
git checkout fresh-design-v3
git pull
cd frontend && npm run dev
```
Open http://localhost:5173/ (or 5174 if 5173 is in use —
kill old Vite servers first). Catalogue needs the Django
backend for live products; without it you will see the
empty state, which is expected.
