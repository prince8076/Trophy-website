import { useEffect, useRef, useState } from 'react';

// Phoenix showcase — LIGHTWEIGHT replacement (2026-11-16) for the
// heavy rotation-fold PhoenixFlight. One image, one caption.
//
// The old version ran a continuous requestAnimationFrame loop for
// the whole page lifetime (reading layout every frame, writing to
// 4 full-size 1920x1080 layer images + 22 dust dots + rewriting the
// chapter title's innerHTML every frame), never paused off-screen,
// and ran on mobile too. This version:
//   - uses ONE image (phoenix-flame-wide.webp, the same wide flaming
//     phoenix as a single transparent WebP) that scales (1.12 -> 1)
//     and fades (0.55 -> 1) as you scroll through the section,
//     plus a caption that fades and rises in the second half;
//   - animates ONLY transform and opacity (never filter, top/left,
//     width/height, or margin);
//   - runs its rAF loop ONLY while the section is on screen
//     (IntersectionObserver gates it; will-change is added only
//     while visible and removed when the section leaves);
//   - is DISABLED on screens under 768px and under
//     prefers-reduced-motion, where a static image + caption show
//     instead (no scroll animation at all).
// The section keeps id="shatter" so the page structure is unchanged.

export default function PhoenixFlight() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const capRef = useRef<HTMLDivElement | null>(null);
  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [isMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  );
  // Animate only on desktop without reduced motion. Otherwise the
  // image and caption render statically at full opacity/scale.
  const animated = !reducedMotion && !isMobile;

  useEffect(() => {
    if (!animated) return undefined;
    const section = sectionRef.current;
    const img = imgRef.current;
    const cap = capRef.current;
    if (!section || !img || !cap) return undefined;
    const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
    let raf = 0;
    let visible = false;

    const draw = () => {
      // Read the rect once per frame; write styles via refs only.
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp01(-rect.top / Math.max(1, rect.height - vh));
      // Image: scale 1.12 -> 1, opacity 0.55 -> 1.
      img.style.transform = `scale(${(1.12 - 0.12 * p).toFixed(4)})`;
      img.style.opacity = String((0.55 + 0.45 * p).toFixed(3));
      // Caption: fades and rises slightly in the second half.
      const cp = clamp01((p - 0.35) / 0.4);
      cap.style.opacity = String(cp.toFixed(3));
      cap.style.transform = `translateY(${((1 - cp) * 24).toFixed(1)}px)`;
    };

    // rAF loop that only draws while the section is on screen.
    // (A plain scroll listener would miss the settle after a
    // smooth scroll; the loop + IO gate covers both.)
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
        img.style.willChange = wc;
        cap.style.willChange = wc;
        if (visible) draw();
      },
      { threshold: 0 },
    );
    io.observe(section);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      img.style.willChange = 'auto';
      cap.style.willChange = 'auto';
    };
  }, [animated]);

  return (
    <section className="shatter" id="shatter" ref={sectionRef}>
      <div className="shatter-sticky">
        <div className="shatter-canvas-wrap">
          <div className="flight-stage">
            <img
              ref={imgRef}
              className="phoenix-showcase-img"
              src="/trophies/phoenix-flame-wide.webp"
              alt="Golden phoenix on fire, wings spread"
              loading="lazy"
              decoding="async"
              width={1920}
              height={1080}
              style={animated ? { opacity: 0.55, transform: 'scale(1.12)' } : undefined}
            />
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
