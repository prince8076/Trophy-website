# Free resources used — Scroll 3D Trophy (v2, free stack)

Total cost to run the demo: **$0**. No API key, no paid video tool, no subscription.
The demo still works offline from the procedural trophy alone if a CDN/HDRI is blocked —
it just falls back to built-in Three.js lighting.

## Used in the demo, no account needed

| Resource | What for | Licence / cost | Link |
|---|---|---|---|
| Three.js 0.160.0 via jsDelivr | 3D engine, scroll animation, GLTF + HDRI loaders | MIT, free CDN, no account | https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/ |
| Poly Haven — Studio Small 09 HDRI (1K) | Real studio reflections on the gold metal | CC0, free, no account, no attribution required | https://polyhaven.com/hdris/studio/natural%20light/artificial%20light |
| Three.js RoomEnvironment | Fallback lighting if the HDRI cannot load | MIT, built into Three.js | (part of Three.js examples) |
| Google Fonts — Cinzel + Inter | Headings / body text | OFL, free | https://fonts.google.com/ |
| Procedural trophy (this code) | Cup, handles, stem, base, star, engraved plate — built with Lathe / Tube / Extrude geometry | Your own code, $0, no model file needed | frontend/src/components/TrophyScroll3D.jsx (this integration) |

Poly Haven verification (checked 2026-10-25 via its public API):
Studio Small 09 is listed in the Poly Haven studio HDRI catalogue, with
710,509 downloads at the time of checking. Its 1K HDR file is loaded in the
demo as `studio_small_09_1k.hdr` from Poly Haven's file CDN. If that file
ever moves, the demo shows "Lighting: Three.js Room (free fallback)" and
keeps working — it does not break.

## Optional, also free — only if you want a real scanned-style model

| Resource | What for | Licence / cost | Link |
|---|---|---|---|
| Sketchfab — "Simple Trophy" by Syed Inzamam Haseen | Drop-in replacement model | CC Attribution, free download — **credit the author** if you use it | https://sketchfab.com/3d-models/simple-trophy-35d82c8c01504481b492685d6db39f61 |

Steps, if you want it:
1. Open the Sketchfab link above (a free Sketchfab account is needed to download).
2. Download the model, save the `.glb` as `assets/simple-trophy.glb`
   next to `frontend/src/components/TrophyScroll3D.jsx (this integration)`.
3. Reload the page — the component swaps it in automatically. No code change needed.
4. Keep the credit line for Syed Inzamam Haseen in your site footer / credits.

If you do NOT do this step, nothing breaks: the procedural trophy is used.

## What was deliberately NOT used (paid / from the reel)

- Lovart.ai video generation — paid, and a video cannot be recoloured or dragged.
- Framer scroll-controlled video — paid plan features, and again a video, not a model.
- Any paid stock 3D model, paid HDRI, or paid texture pack.

## Free hosting, if you want to publish it

- GitHub Pages (free for a public repo like Trophy-website): put
  `frontend/src/components/TrophyScroll3D.jsx (this integration)` in the repo and enable Pages, or
- Any static host's free tier. The demo is one HTML file, no backend.

## For the React site

The same free stack applies: `npm install three` (MIT, free) in
`frontend/`, then use the same pattern — RGBELoader for the Poly Haven
HDRI with RoomEnvironment fallback, GLTFLoader with the optional
`assets/simple-trophy.glb` slot. No paid dependency is added.

## SMOOTH version (v3) — image-sequence scrub, like the reel

The reel scrubs a video. This component scrubs IMAGES instead of live
WebGL while scrolling:

- 48 frames on desktop / 36 on small screens, each frame = one scroll
  position (rotation + camera zoom baked in).
- Frames come from /scroll-trophy/frame-000.webp … if you generated
  them, otherwise the component pre-renders them once in the
  visitor's browser (Three.js, WebP blobs, ~1.5 MB total) and then
  scrolling only does drawImage() — no shader cost, no React
  re-render per frame, DPR capped at 1.5, loop paused off-screen.
- Finish switcher re-renders the frame set once.
- If pre-rendering fails, a live-WebGL fallback (optimised) is used.

Why no frame PNG/WebP files are in this push: the Muse GitHub
connector only pushes text files — binary images are rejected by
push-files. Runtime pre-rendering is therefore the default, and
server frames are optional (generate them on your own machine with
a normal git push if you want zero first-load wait).

## v4 fix (2026-10-25, after user screenshot on localhost:5173)

Screenshot showed the trophy cropped (rim + base cut off) and the cup
dark brown while the handles looked gold, with the label
"Lighting: Three.js Room (free fallback)".

Causes, all fixed in TrophyScroll3D.jsx v4:
- Cover-fit drew square frames cropped to a wide screen. Changed to
  contain-fit: whole trophy always visible, never cropped.
- The Poly Haven HDRI failed to load in the user's browser, so it
  fell back to RoomEnvironment. The cup's front face then reflected
  only black, while curved handles reflected side windows.
  v4 drops the external HDRI and builds a bright studio environment
  in code instead (front + top + warm-left + right softboxes,
  envMapIntensity 1.8, front light intensity 3.0) — no CORS, no
  external file, same look every time. The debug lighting label
  was also removed from the live page.
- Camera pulled back (8.5 -> 6.5 -> 8.0) and chapter fade widened
  (0.06 -> 0.12) with text on top, so text no longer vanishes
  between chapters.

## v5 box closing + gold accents (2026-10-25, after second screenshot)

Second screenshot (localhost:5173, 20:52): trophy fully visible, but
black cup + white star + silver handles — a black finish had made
everything black, and the star/handles blew out white/silver from
the front light, so it read as a plain black mug, not a luxury trophy.
User request: "when i scroll it will close in a box".

Fixes in TrophyScroll3D.jsx v5:
- Box closing, baked into scroll frames (the reel's packaging beat):
  sides start flat on the ground, fold up to vertical walls from
  scroll 0.55 -> 0.85, then the lid (black, gold ribbon cross + bow)
  swings down from behind at 0.78 -> 0.97. Final frame is a closed
  black box with gold ribbon. New chapter "03 · Closing in a box"
  (0.60-0.88) and final chapter "Boxed & ready to gift"
  (0.88-1.01, Add to Bag + Engraving Studio).
- Gold accents always gold: only the cup body changes with the
  finish switcher; handles, rim, star, stem, base trim and box
  ribbon stay gold, so a black cup is black + gold, not all black.
- Cup material DoubleSide, warm front softbox (0xfff2cc), gold
  trim rings on each base tier, and a "CHAMPION / 2026 • AURA
  TROPHY" engraved plate on the base front.
- Box is 3.6 x 3.6 x 3.2, so it fits the trophy including handles;
  it does not rotate with the trophy, only its flaps/lid animate.

## v6 photo-style trophy + Alok-style homepage (2026-10-25)

User sent two photos of a silver cup with gold ornate band, scroll
handles and black marble base, and tapped "Yes, rebuild the whole
homepage in this style" (Alok style).

- TrophyScroll3D v6: cup is now silver by default (finish switcher
  default changed gold -> silver), gold band under the rim, lower
  gold trim, engraved medallion frame on the cup front (no star),
  curling scroll handles (silver on silver finish, gold otherwise),
  silver stem with gold foot trim, round black marble base +
  plinth with gold top trim, blank silver plate with gold frame
  (exactly as in the photos). Box closing from v5 is unchanged.
- HomePage rebuilt (frontend/src/pages/HomePage.jsx): black
  rounded hero with huge bold sans headline, photo hero image,
  scroll trophy, white trust marquee with dividers, six large
  rounded showcase blocks (photo cup first, then the five previous
  bespoke creations, same links/images), light Who We Serve /
  categories / featured cards, light leadership block, inverted
  black engraving studio, three stacked collection tiers
  (Single / Corporate Bulk / Bespoke Signature, price on request,
  last tier inverted black), reviews, why-choose + values.
  Same data, routes, quote modal and engraving customizer as
  before. Site-wide Navbar deliberately NOT changed (it carries
  search, cart, command palette, admin) — a floating pill header
  would be a separate, site-wide change.
- Photos: the two user photos are NOT in this push (push-files is
  text-only, it rejects JPGs). HomePage references
  /images/trophy-silver-gold-side.jpg (hero) and
  /images/trophy-silver-gold-front.jpg (showcase), each with a
  fallback to an existing /uploads image, so the page never shows
  a broken image. To show the photos: save them as those two
  filenames under frontend/public/images/, then git add/commit/
  push from your own machine with normal git.
