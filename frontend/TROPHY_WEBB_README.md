# Webb trophy shattered scroll v3 (trophy-webb-shatter)

120 frames, 768x1152, in frontend/public/shatter-frames-webb/
  001-010 intact
  011-030 cracks growing
  031-120 pieces flying (smoothstep easing, central cup fragment stays
  in place, outer shards fly out, lid/handles delayed, base splits last)
Code in this push: FRAME_COUNT 120, cache 60, prefetch 24 ahead / 12 behind,
preload first 20 — this is what stops frames jumping/missing on fast scroll.
Frames are binaries: copy frames3/ from shatter-webb-frames-v3.zip into
frontend/public/shatter-frames-webb/ and push via normal git.
