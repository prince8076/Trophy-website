# Redesign — branch redesign-motion-threeui — v2 (new trophy + new frames)

## What changed in v2 (2026-10-26, after user feedback)

User said, correctly: v1 only took the palette, not a template, and
the old frames looked bad — quality, and the image side (portrait
blue Webb Ellis Cup, narrow strip on desktop).

### New trophy, new frames — from scratch
- New intact trophy image, AI-generated: silver cup, gold ornate
  band and handles, gold lid with figure, black marble base with
  blank gold plate, dark charcoal studio background. 2048x1152,
  landscape 16:9. This is NOT a Shreeji product photo and NOT the
  old Webb Ellis Cup — it is a showcase image for the scroll story
  and hero. Source in shatter-frames.zip, also as
  shatter-frame-001.jpg.
- New shatter sequence: 48 frames, 1600x900, ~4.7 MB total
  (vs old 300 frames, ~140 MB, portrait, blue).
  Made from that ONE image with make_shatter_frames_v2.py, so the
  trophy, camera, framing and lighting stay identical in every
  frame. AI per-frame images would change the trophy shape every
  frame and look jittery — that is why this route was chosen.
  Sequence: intact -> cracks -> lid, left handle+cup, right
  handle+cup, lower cup+stem separate -> base stays -> large
  pieces at the edges, gold/silver particles between them.
  Honest limit: this is a large-piece break, not a true 3D glass
  shatter with hundreds of shards. A true 3D/AI-video shatter
  would need a video tool, which is blocked for this account.
- Frames CANNOT be pushed by the text-only push tool. They are
  in shatter-frames.zip (attached with the v2 update). To use them:
    unzip shatter-frames.zip
    copy frames/ -> frontend/public/shatter-frames/
    (rename: shatter-frame-001.jpg … 048.jpg, already named)
    git add frontend/public/shatter-frames && git commit && git push
  on branch redesign-motion-threeui. The code in this push already
  expects that folder. Until you do that step, the shatter section
  will show its "frames not found" message — that is expected,
  not a code bug.

### Template structure in v2
Layout pattern only (no template text, images, logos or code
copied), from the product-showcase templates on the listing
sites the user named:
  1. Split hero: text left, large trophy image right
  2. Scroll story: contained 16:9 shatter card
  3. Featured collection: uniform grid, pill filters, sort
  4. Engraving studio, guarantees, reviews, final quote CTA
This replaces v1's centred poster hero. If the user names a
specific template from the threeui/motionsites lists, the hero
and grid can be swapped to that template's structure next.

## Files in this push
- frontend/src/pages/HomePage.jsx — v2 split-hero version
- frontend/src/components/ShatterStage.jsx — v6, 48 frames,
  16:9 card, path /shatter-frames/shatter-frame-XXX.jpg
- frontend/REDESIGN_README.md — this file

## Test
```bash
git checkout redesign-motion-threeui
git pull
# first: copy shatter-frames/ as above, if not already in repo
cd frontend && npm run dev
```
Hero image should be the new silver/gold trophy, landscape,
filling its card. Scroll: card pins, cracks, then large pieces
separate, then collection appears. Scroll back up: it restores.
