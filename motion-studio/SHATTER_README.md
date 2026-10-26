# Trophy shatter in motion-studio (ALIVE design)

New section only — no old trophy-site code was touched.
Files changed in this push:
  src/components/TrophyShatter.tsx (new, pinned 400vh scroll stage, 120 frames)
  src/App.tsx (imports it after Hero, adds #shatter to active-section list)
  src/components/Navbar.tsx (adds a Shatter link)
  src/index.css (shatter styles in ALIVE tokens: black / warm white / lime)

Frames are binaries, NOT in this push. Copy the 120 video frames on black
(from shatter-webb-video-frames.zip, video-black/ folder) into:
  motion-studio/public/shatter-frames-webb/
    shatter-frame-001.jpg … shatter-frame-120.jpg
then push via normal git. Until then the section shows "Shatter frames
not found" with that path — that is expected, not a code bug.

Run:
  git checkout motion-studio-shatter
  git pull
  cd motion-studio && npm install && npm run dev
