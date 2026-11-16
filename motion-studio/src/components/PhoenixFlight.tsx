import { useEffect, useRef, useState } from 'react';

// Phoenix fold — the wings swing and the bird becomes a trophy.
// (2026-11-16: rebuilt after the user said the lightweight single-
// image showcase "is not swinging".)
//
// The SAME wide flaming phoenix, split into 3 transparent layers
// (wing-left, body, wing-right, each 1920x1080) + a marble-base
// layer, all generated at build time from base64. As you scroll
// through the 180vh section:
//   Phase A (p 0-0.3): wings spread, bird in flight.
//   Phase B (p 0.3-0.7): wings fold 0 -> +/-55 deg (LINEAR, the
//     easing the old version settled on after smoothstep was
//     rejected 3x), bird drops 15px. Left wing rotates NEGATIVE,
//     right wing POSITIVE — that is the tips-down direction
//     (the segmented-fold failure had the signs inverted).
//   Phase C (p 0.7-1): the marble base fades in BENEATH the folded
//     bird and settles +30px with it; the caption fades in.
// The pivots are the shoulders: left 38% 45%, right 62% 45%.
//
// Performance (the audit's complaints about the OLD fold, fixed):
//   - rAF loop runs ONLY while the section is on screen
//     (IntersectionObserver gates it; will-change added only while
//     visible, released when the section leaves).
//   - NO layout reads in the loop: the section's document offset
//     and height are measured ONCE at mount and on resize, and
//     progress is computed from window.scrollY (a cheap read).
//   - transform + opacity ONLY. No dust dots, no chapter
//     innerHTML rewrites, no progress bar, no per-frame setState.
//   - Desktop only. Under 768px or prefers-reduced-motion the
//     static single phoenix image shows instead (no fold).
// The section keeps id="shatter" so the page structure is unchanged.

const WING_MAX = 55; // degrees, tips-down at full fold
const BIRD_DROP = 15; // px the bird drops during the fold
const BASE_EXTRA = 15; // px the base settles beyond the bird (+30 total)

export default function PhoenixFlight() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const foldRef = useRef<HTMLDivElement | null>(null);
  const wingLRef = useRef<HTMLImageElement | null>(null);
  const wingRRef = useRef<HTMLImageElement | null>(null);
  const baseRef = useRef<HTMLImageElement | null>(null);
  const capRef = useRef<HTMLDivElement | null>(null);
  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [isMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  );
  // Fold only on desktop without reduced motion. Otherwise the
  // single phoenix image renders statically at full opacity.
  const animated = !reducedMotion && !isMobile;

  useEffect(() => {
    if (!animated) return undefined;
    const section = sectionRef.current;
    const fold = foldRef.current;
    const wingL = wingLRef.current;
    const wingR = wingRRef.current;
    const base = baseRef.current;
    const cap = capRef.current;
    if (!section || !fold || !wingL || !wingR || !base || !cap) return undefined;
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

    let raf = 0;
    let visible = false;

    const draw = () => {
      const p = clamp01((window.scrollY - secTop) / secSpan);
      // Phase B: wings fold, LINEAR. Phase C: base + caption in.
      const f = clamp01((p - 0.3) / 0.4);
      const c = clamp01((p - 0.7) / 0.3);
      // Bird drops as the wings fold.
      fold.style.transform = `translateY(${(BIRD_DROP * f).toFixed(1)}px)`;
      // Wings rotate around the shoulders, tips down.
      wingL.style.transform = `rotate(${(-WING_MAX * f).toFixed(2)}deg)`;
      wingR.style.transform = `rotate(${(WING_MAX * f).toFixed(2)}deg)`;
      // Base fades in beneath and settles a further 15px (+30 total).
      base.style.opacity = c.toFixed(3);
      base.style.transform = `translateY(${(BASE_EXTRA * c).toFixed(1)}px)`;
      // Caption rises and fades in with the trophy.
      cap.style.opacity = c.toFixed(3);
      cap.style.transform = `translateY(${((1 - c) * 24).toFixed(1)}px)`;
    };

    // rAF loop that only draws while the section is on screen.
    const loop = () => {
      if (visible) draw();
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        // will-change only while actively animating; released
        // when the section leaves the viewport.
        const wc = visible ? 'transform, opacity' : 'auto';
        for (const el of [fold, wingL, wingR, base, cap]) el.style.willChange = wc;
        if (visible) draw();
      },
      { threshold: 0 },
    );
    io.observe(section);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', measure);
      for (const el of [fold, wingL, wingR, base, cap]) el.style.willChange = 'auto';
    };
  }, [animated]);

  return (
    <section className="shatter" id="shatter" ref={sectionRef}>
      <div className="shatter-sticky">
        <div className="shatter-canvas-wrap">
          <div className="flight-stage">
            {animated ? (
              <div className="phoenix-fold" ref={foldRef}>
                <img
                  ref={baseRef}
                  className="phoenix-layer phoenix-base"
                  src="/trophies/phoenix-marble-base.webp"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  width={1920}
                  height={1080}
                  style={{ opacity: 0 }}
                />
                <img
                  className="phoenix-layer phoenix-body"
                  src="/trophies/phoenix-wide-layer-body.webp"
                  alt="Golden phoenix on fire, wings spread"
                  loading="lazy"
                  decoding="async"
                  width={1920}
                  height={1080}
                />
                <img
                  ref={wingLRef}
                  className="phoenix-layer phoenix-wing-left"
                  src="/trophies/phoenix-wide-layer-wing-left.webp"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  width={1920}
                  height={1080}
                />
                <img
                  ref={wingRRef}
                  className="phoenix-layer phoenix-wing-right"
                  src="/trophies/phoenix-wide-layer-wing-right.webp"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  width={1920}
                  height={1080}
                />
              </div>
            ) : (
              <img
                className="phoenix-showcase-img"
                src="/trophies/phoenix-flame-wide.webp"
                alt="Golden phoenix on fire, wings spread"
                loading="lazy"
                decoding="async"
                width={1920}
                height={1080}
              />
            )}
          </div>
          <div className="shatter-overlay-label">Shreeji Corporates — Trophies, Awards &amp; Mementos</div>
          <div
            className="shatter-overlay-chapter-block"
            ref={capRef}
            style={animated ? { opacity: 0, transform: 'translateY(24px)' } : undefined}
          >
            <div className="shatter-overlay-chapter">We craft <span className="shatter-title-accent">meaningful recognition.</span></div>
            <div className="shatter-overlay-sub">We don&rsquo;t just supply awards — we celebrate your success. Shreeji Corporates, New Delhi.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
