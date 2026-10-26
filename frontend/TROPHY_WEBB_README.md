# Webb trophy shattered scroll (trophy-webb-shatter)

Trophy: the user's Webb Ellis Cup photos (intact / mid-shatter /
full-shatter), blue studio + red stripe removed and replaced with
pure black. This is the user's own trophy photos, NOT an AI trophy.

Frames: 60, portrait 1024x1536, in frontend/public/shatter-frames-webb/
  001-008 intact
  009-028 radial wipe intact -> mid-shatter (shatter spreads from cup)
  029-032 hold mid
  033-052 radial wipe mid -> full-shatter
  053-060 hold full
Code only in this push — JPG frames are binaries, copy them from
shatter-webb-frames.zip (frames/ folder) into
frontend/public/shatter-frames-webb/ and push via normal git.

Run:
  git checkout trophy-webb-shatter
  git pull
  cd frontend && npm run dev
