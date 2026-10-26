# Best trophy + shattered scroll (trophy-shatter-best)

New trophy: a gold championship cup, ornate handles, lid figure, black
marble base, dark studio — generated for this branch, NOT a Shreeji
product photo and NOT the old silver/gold trophy or the blue Webb Ellis Cup.

Shatter: 60 frames, 1600x900, in `frontend/public/shatter-frames-best/`
(frame 001 intact with cracks starting, 010+ shards flying, 048+ full
explosion, base stays). This push contains CODE ONLY — JPG frames are
binaries and cannot be pushed by the text-only push tool.

To run locally:
1. Copy the frames from `shatter-best-frames.zip` (frames/ folder) into
   `frontend/public/shatter-frames-best/` on this branch.
2. Push via normal git, then:
   git checkout trophy-shatter-best
   git pull
   cd frontend && npm run dev
3. Scroll: hero first (new trophy), then full-screen shatter, then trophies.

Generator: `make_shatter_v3.py` in the zip (many masked Voronoi shards,
solid cup mask, synthetic dark background, base static).
