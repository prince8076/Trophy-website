import { useEffect, useRef, useState } from 'react';

// Phoenix VIDEO — FULL SCREEN, scroll-scrubbed (2026-11-17).
//
// The user supplied a NEW 10s video (2026-11-17 00:18 IST): golden
// phoenix, wings spread on WHITE, folding down, becoming a golden
// statue on a black marble plinth on BLACK. Unlike the first video,
// the wings are NOT cut (full wingspan visible with white space).
// This replaces the white-keyed v2 entirely — no background keying
// here: the video IS full screen, so its own white -> black IS the
// section background.
//
// The video was cleaned for the site:
//   - watermark removed (the same small grey 4-point star at
//     x1136-1183, y576-623, blurred out with ffmpeg delogo —
//     verified gone: star region mean brightness 16.3/9.0 at 5s/9s,
//     was ~100-160);
//   - audio stripped (site video is muted);
//   - re-encoded H.264 720p CRF 23 + VP9 WebM, GOP 12 (keyframe
//     every 0.5s) so scroll-scrubbing seeks are fast;
//   - 5.1 MB -> 2.5 MB MP4 / 2.1 MB WebM.
// The video files are BINARY and cannot be pushed by the text-only
// push tool — the owner adds them via git to
// motion-studio/public/videos/phoenix-transform.{mp4,webm}.
// Until they land, the section falls back to the static phoenix
// image, also full screen (video error -> fallback).
//
// Presentation: FULL FRAME, never cropped. The video fits
// entirely inside the viewport (object-fit: contain), so the head,
// wings and plinth are NEVER cut off, on any screen. (The earlier
// object-fit: cover filled the screen but cropped top/bottom on
// wide viewports — that sliced the head off; the user flagged it
// 2026-11-17.) The video is still as large as the viewport allows
// (fills the height); on wider screens there are black side bars,
// which blend into the video's own black end. The video is 1080p,
// so it stays sharp at this size. The label + chapter sit on top,
// WHITE text with dark scrims top + bottom (CSS) so they read on
// the white opening frames AND the black closing frames. The
// orange accent word is kept (readable on the dark bottom scrim).
//
// Playback: SCROLL-SCRUBBED. Scrolling through the 180vh section
// drives video.currentTime (0-10s): scroll down to fold the wings
// and raise the statue, scroll up to reverse it. The rAF loop runs
// ONLY while the section is on screen (IntersectionObserver), and
// the video is lazy-loaded (preload starts when the section is
// near the viewport) so the 3 MB does not block first paint.
// fastSeek() is used where available for smooth scrubbing.
// Reduced motion / mobile: the video is paused at the final frame
// (the statue) — no scrubbing. If the video file is missing, the
// static phoenix image shows instead.

// The video's own background colour at each scroll progress p,
// measured from the video's corner pixels (the background, not the
// bird): white at the start, light grey at p=0.20, mid grey at
// p=0.25, near-black from p=0.30 on. The pillarbox bars (the area
// around the video on a wider screen) are painted this colour, so
// they change WITH the video instead of staying black on a white
// frame — that black bar on white is what the user flagged
// 2026-11-17 ("black side are there while scrolling, the colour
// change then it look good").
const BG_KEYS: Array<[number, number, number, number]> = [
  [0.0, 255, 255, 255],
  [0.15, 255, 255, 255],
  [0.2, 208, 208, 208],
  [0.25, 108, 112, 112],
  [0.3, 11, 14, 13],
  [1.0, 10, 10, 10],
];
const bgFor = (p: number): string => {
  const c = Math.min(Math.max(p, 0), 1);
  for (let i = 0; i < BG_KEYS.length - 1; i++) {
    const [p0, r0, g0, b0] = BG_KEYS[i];
    const [p1, r1, g1, b1] = BG_KEYS[i + 1];
    if (c <= p1) {
      const t = p1 === p0 ? 0 : (c - p0) / (p1 - p0);
      const r = Math.round(r0 + (r1 - r0) * t);
      const g = Math.round(g0 + (g1 - g0) * t);
      const b = Math.round(b0 + (b1 - b0) * t);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  const [, r, g, b] = BG_KEYS[BG_KEYS.length - 1];
  return `rgb(${r}, ${g}, ${b})`;
};

export default function PhoenixFlight() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [videoFailed, setVideoFailed] = useState(false);
  // Scrub only on desktop without reduced motion. Otherwise the
  // video sits paused at its final frame (the statue).
  const animated = !reducedMotion;

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return undefined;
    const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

    // Section geometry, measured once (and on resize) — never in
    // the animation loop, so no layout read per frame.
    let secTop = 0;
    let secSpan = 1;
    const measure = () => {
      const rect = section.getBoundingClientRect();
      secTop = rect.top + window.scrollY;
      secSpan = Math.max(1, section.offsetHeight - window.innerHeight);
    };
    measure();
    window.addEventListener('resize', measure);

    // Start buffering when the section is near the viewport.
    let loaded = false;
    const loadVideo = () => {
      if (loaded) return;
      loaded = true;
      video.preload = 'auto';
      video.load();
    };

    let raf = 0;
    let visible = false;
    const draw = () => {
      if (video.readyState < 2 || !video.duration) return;
      const p = clamp01((window.scrollY - secTop) / secSpan);
      // Paint the pillarbox bars the video's own background colour
      // (white -> grey -> black as you scroll), so the bars match
      // the frame instead of staying black on white. Only while the
      // video is actually mounted — the static-image fallback keeps
      // its white default (the fallback image is the white spread
      // phoenix).
      if (video.isConnected) {
        const bg = bgFor(p);
        video.style.backgroundColor = bg;
        const stage = stageRef.current;
        if (stage) stage.style.backgroundColor = bg;
      }
      const target = p * video.duration;
      // Only seek when the target moved enough to matter.
      if (Math.abs(video.currentTime - target) < 0.05) return;
      if (typeof video.fastSeek === 'function') video.fastSeek(target);
      else video.currentTime = target;
    };

    const loop = () => {
      if (visible) draw();
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          loadVideo();
          if (animated) draw();
          else if (video.readyState >= 2 && video.duration) {
            // Reduced motion: hold the final frame (the statue).
            video.currentTime = video.duration;
          }
        }
      },
      { threshold: 0, rootMargin: '200px 0px' },
    );
    io.observe(section);
    if (animated) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [animated]);

  return (
    <section className="shatter" id="shatter" ref={sectionRef}>
      <div className="shatter-sticky">
        <div className="shatter-canvas-wrap">
          <div className="flight-stage" ref={stageRef}>
            {videoFailed ? (
              <img
                className="phoenix-showcase-img"
                src="/trophies/phoenix-flame-wide.webp"
                alt="Golden phoenix on fire, wings spread"
                loading="lazy"
                decoding="async"
                width={1920}
                height={1080}
              />
            ) : (
              <video
                ref={videoRef}
                className="phoenix-video"
                muted
                playsInline
                preload="metadata"
                poster="/trophies/phoenix-flame-wide.webp"
                aria-label="Golden phoenix folding its wings and becoming a trophy"
                onError={() => setVideoFailed(true)}
              >
                <source src="/videos/phoenix-transform.webm" type="video/webm" />
                <source src="/videos/phoenix-transform.mp4" type="video/mp4" />
              </video>
            )}
          </div>
          <div className="shatter-overlay-label">Shreeji Corporates — Trophies, Awards &amp; Mementos</div>
          <div className="shatter-overlay-chapter-block">
            <div className="shatter-overlay-chapter">The phoenix becomes <span className="shatter-title-accent">the trophy.</span></div>
            <div className="shatter-overlay-sub">We celebrate your success. Shreeji Corporates, New Delhi.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
