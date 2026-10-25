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
