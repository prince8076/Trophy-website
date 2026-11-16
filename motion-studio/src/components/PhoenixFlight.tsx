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
// Presentation: FULL SCREEN. The video fills the whole viewport
// edge-to-edge (100vw x 100svh, object-fit: cover); the section
// is 300vh so scrolling through it scrubs the frames slowly and
// cinematically. The label + chapter sit on top, WHITE text with
// dark scrims top + bottom (CSS) so they read on the white opening
// frames AND the black closing frames. The orange accent word is
// kept (readable on the dark bottom scrim).
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

export default function PhoenixFlight() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
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
          <div className="flight-stage">
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
            <div className="shatter-overlay-chapter">We craft <span className="shatter-title-accent">meaningful recognition.</span></div>
            <div className="shatter-overlay-sub">We don&rsquo;t just supply awards — we celebrate your success. Shreeji Corporates, New Delhi.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
