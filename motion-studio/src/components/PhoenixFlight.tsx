// PhoenixFlight — scroll-driven "phoenix takes flight" hero
// animation (React + Vite, no animation libraries — plain
// requestAnimationFrame + transforms).
//
// Scene: a tall <section> ("phoenix stage"), 180vh (160vh on
// mobile), white background. Inside it a sticky container
// (position: sticky; top: 0; height: 100vh; overflow: hidden).
// Scroll progress each frame:
//   p = clamp(-rect.top / (rect.height - window.innerHeight), 0, 1)
// where rect is the tall section's bounding rect. A continuous
// rAF loop reads it (not scroll events).
//
// Visual layers (absolutely stacked, centred, object-fit:
// contain, inset: 0):
//  1. Radial glow — centred circle, min(90vh, 90vw).
//  2. Marble pedestal (z-index 0) — starts opacity 0.
//  3. Left wing (z-index 1) — transform-origin 38% 45%.
//  4. Right wing (z-index 1) — transform-origin 62% 45%.
//     (Wing images are SEPARATE transparent WebPs so they can
//     rotate independently.)
//  5. Phoenix body (z-index 2).
//  6. 22 golden dust particles — seeded-random positions
//     (x 4-96%, y 12-88%), size 3-8px, radial-gradient orange
//     dots with a soft box-shadow glow.
//
// Scroll timeline (smoothstep t*t*(3-2t) easing):
//  Phase A — 0% to 20%: wings + body rise from
//    translateY(40px) to 0 (drop-in).
//  Phase B — 20% to 80%: WINGS FOLD by ROTATION ONLY — no
//    horizontal squashing. Each wing rotates around its
//    shoulder pivot (left -55deg, right +55deg) and drops a
//    small 15px, so the wingtips swing down and end near the
//    body. The wing artwork is never horizontally squashed.
//    Body sinks slightly (+8px).
//  Phase C — 80% to 92%: marble pedestal fades in (opacity
//    0 -> 1), and the bird + base drop an extra 30px TOGETHER
//    (same translateY, no relative drift) as if landing —
//    so the phoenix's feet/tail stay resting on the base's
//    upper surface at every progress value.
//  Phase D — 92% to 100%: scene gently settles (dim particles).
//  Glow opacity = 0.3 + 0.25*phaseA + 0.35*phaseC — it peaks
//  when the base lands.
//  Only transform and opacity are animated, with
//  will-change: transform, opacity.
//
// Particles: each rises with scroll, translateY = -(rise
// 40-160px) * p * (sectionHeight/1000), sways sideways with
// sin(p*2pi + phase) * (+/-12px), and pulses opacity between
// 0.35 and 0.8 using sin(p*4pi + phase).
//
// Story overlay (bottom-left): four text chapters that swap
// based on progress. Each has a title (clamp(40px, 6vw, 84px),
// bold uppercase, line-height 0.95) with the LAST word in
// gold/orange, plus a 48x3px gold underline, and a smaller gray
// subtitle (clamp(14px, 1.6vw, 18px)). A small uppercase
// tracking-wide label at top-left, and a 2px gold progress bar
// at the top of the sticky viewport: scaleX = p. The chapter
// block sits at z-index 3 (above all image layers). The phoenix
// is shifted slightly right on desktop so the bottom-left text
// column stays clearer of the artwork. (A white scrim behind
// the text was tried and REMOVED — it whitened the wings, put
// a visible horizontal cut across them, and washed out the
// flames. The user asked for it to go.) On mobile the phoenix
// sits above the text block — no overlap.
//
// Accessibility & performance: prefers-reduced-motion renders
// the final pose statically (no rAF loop). The rAF loop is
// cleaned up on unmount. No layout thrash — the rect is read
// once per frame, styles are written via refs only.
//
// WHY ROTATION (not scaleX): scaling X squashed the wing
// artwork into narrow deformed blobs — the end state looked
// like a broken flame-bird. Rotation around the shoulder pivot
// folds the wing down against the body without deforming the
// artwork. The rotation signs tilt the wingtips DOWN (left
// wing counter-clockwise, right wing clockwise — a point on
// the left side of the pivot moves down when rotated
// counter-clockwise, and a point on the right side moves
// down when rotated clockwise). The bird is always the SAME
// three transparent layers (left wing, body, right wing) of
// the one wide flaming phoenix — no image swap, so there is
// nothing to ghost. The marble base is the brand's real
// trophy base, cropped from the hero's Golden Phoenix,
// fading in UNDER the folded bird. The wide phoenix was
// generated on pure white in 16:9 (2048x1152), the white cut
// out by hand (border-connected flood fill on near-white
// pixels, feathered). The layers and the base ship as base64,
// decoded at build time to
// /trophies/phoenix-wide-layer-*.webp and
// /trophies/phoenix-marble-base.webp (see
// scripts/generate-assets.mjs). The body strip is wide
// (36-64%) so the head is FULLY inside the body (no duplicate
// head), and every strip boundary is FEATHERED (alpha fades
// over a ~4% band) so there is no sharp vertical seam.

import { useEffect, useRef, useState } from 'react';

const CHAPTERS = [
  { start: 0.0, end: 0.25, title: 'Crafted to perfection.', sub: 'One trophy, made to celebrate one achievement — with 20+ years of expertise behind it.' },
  { start: 0.25, end: 0.5, title: 'It begins with effort.', sub: 'Effort, discipline and belief — the moments Shreeji Corporates was built to honour.' },
  { start: 0.5, end: 0.75, title: 'And then it takes flight.', sub: 'A win, finally recognised — in crystal, metal, acrylic or wood, made to your vision.' },
  { start: 0.75, end: 1.01, title: 'We craft meaningful recognition.', sub: 'We don\u2019t just supply awards — we celebrate your success. Shreeji Corporates, New Delhi.' },
];

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const smooth = (t: number) => t * t * (3 - 2 * t);

// Render a chapter title with its final word in orange, matching
// the hero headline ("WE CRAFT MEANINGFUL RECOGNITION." — the last
// word is orange). The title is set as HTML in draw(), so the
// accent span survives the chapter change.
const titleHtml = (title: string) => {
  const i = title.lastIndexOf(' ');
  if (i < 0) return title;
  return `${title.slice(0, i)} <span class="shatter-title-accent">${title.slice(i + 1)}</span>`;
};

// Embers — fine round orange motes that drift upward around the
// phoenix. A fixed seed so the layout is identical on every load.
// x/y are % of the stage; rise is how far the mote floats up; size
// is px; phase is the offset for its opacity pulse; sway is the
// sideways amplitude in px (+/-12).
type Dust = { x: number; y: number; rise: number; size: number; phase: number; sway: number };
const mulberry32 = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const buildDust = (): Dust[] => {
  const rand = mulberry32(20261107);
  const dots: Dust[] = [];
  for (let i = 0; i < 22; i++) {
    dots.push({
      x: 4 + rand() * 92,
      y: 12 + rand() * 76,
      rise: 40 + rand() * 120,
      size: 3 + rand() * 5,
      phase: rand() * Math.PI * 2,
      sway: (rand() - 0.5) * 24,
    });
  }
  return dots;
};
const DUST = buildDust();

// Wing fold angle at full fold (degrees). The wings rotate from
// 0deg (full spread) to ∓55deg (folded down against the body) —
// rotation only, never a horizontal squash.
const FOLD_ANGLE = 55;
// Small downward drop for the wings as they fold, so the wingtips
// end near the body.
const FOLD_DROP = 15;
// Landing drop in Phase C — the bird AND the base drop by this
// same amount, so the feet stay on the base (no relative drift).
const LANDING_DROP = 30;

export default function PhoenixFlight() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const wingLeftRef = useRef<HTMLImageElement | null>(null);
  const bodyRef = useRef<HTMLImageElement | null>(null);
  const wingRightRef = useRef<HTMLImageElement | null>(null);
  const baseRef = useRef<HTMLImageElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const dustRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const chapterRef = useRef<HTMLDivElement | null>(null);
  const chapterSubRef = useRef<HTMLDivElement | null>(null);
  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  // Reduced motion: render the FINAL pose statically (wings
  // rotated-folded, base in, last chapter) — no rAF loop, no
  // motion. The transforms below are the p = 1 values of the
  // timeline: fold = 1 (rotate ∓55deg, drop 15px), phaseC = 1
  // (base opacity 1, landing drop 30px shared by bird and base),
  // glow 0.9, progress scaleX 1.
  useEffect(() => {
    if (!reducedMotion) return undefined;
    if (wingLeftRef.current) {
      wingLeftRef.current.style.transform = `translateY(${FOLD_DROP + LANDING_DROP}px) rotate(${-FOLD_ANGLE}deg)`;
    }
    if (wingRightRef.current) {
      wingRightRef.current.style.transform = `translateY(${FOLD_DROP + LANDING_DROP}px) rotate(${FOLD_ANGLE}deg)`;
    }
    if (bodyRef.current) {
      bodyRef.current.style.transform = `translateY(${8 + LANDING_DROP}px) scale(0.99)`;
    }
    if (baseRef.current) {
      baseRef.current.style.opacity = '1';
      baseRef.current.style.transform = `translateY(${LANDING_DROP}px)`;
    }
    if (glowRef.current) {
      glowRef.current.style.opacity = '0.9';
    }
    if (progressRef.current) {
      progressRef.current.style.transform = 'scaleX(1)';
    }
    if (chapterRef.current) {
      chapterRef.current.innerHTML = titleHtml(CHAPTERS[CHAPTERS.length - 1].title);
    }
    if (chapterSubRef.current) {
      chapterSubRef.current.textContent = CHAPTERS[CHAPTERS.length - 1].sub;
    }
    return undefined;
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const section = sectionRef.current;
    if (!section) return undefined;
    let raf = 0;

    const draw = () => {
      // Read the rect ONCE per frame; write styles via refs only
      // (no layout thrash, no React state updates per frame).
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp01(-rect.top / (rect.height - vh));
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
      if (chapterRef.current) {
        const c = CHAPTERS.find((ch) => p >= ch.start && p < ch.end) || CHAPTERS[CHAPTERS.length - 1];
        chapterRef.current.innerHTML = titleHtml(c.title);
        if (chapterSubRef.current) chapterSubRef.current.textContent = c.sub;
      }
      // Scroll timeline (smoothstep easing for the rise, base
      // and settle; the FOLD itself is LINEAR — see below).
      // Phase A (p 0-0.2): the wide phoenix rises into place,
      // wings spanning the full screen, catching the light.
      // Phase B (p 0.2-0.8): WINGS FOLD by ROTATION ONLY — each
      // wing rotates around its shoulder pivot (left -55deg,
      // right +55deg) and drops a small 15px, so the wingtips
      // swing down and end near the body. NO scaleX — the wing
      // artwork is never horizontally squashed. The fold is
      // LINEAR (a constant rate over a LONG range, 60% of the
      // scroll, on a continuous rAF loop) — an ease-in-out
      // (smoothstep) was tried twice and both checks confirmed
      // it reads as flat-then-fast-then-flat, not gradual, so
      // the even rate is back. The body sinks slightly (+8px).
      // Phase C (p 0.8-0.92): the polished black marble base
      // fades in BENEATH the folded bird (it renders under the
      // bird, z-index 0), and the bird AND the base drop an
      // extra 30px TOGETHER (same translateY, no relative
      // drift) as if landing — so the phoenix's feet/tail stay
      // resting on the base's upper surface. The bird + base IS
      // the trophy: the same phoenix, wings folded, standing on
      // its marble base.
      // Phase D (p 0.92-1): the trophy stands still, glowing;
      // the particles dim. The glow peaks when the base lands.
      const phaseA = smooth(clamp01(p / 0.2));
      const fold = clamp01((p - 0.2) / 0.6);
      const phaseC = smooth(clamp01((p - 0.8) / 0.12));
      const settle = 1 - smooth(clamp01((p - 0.92) / 0.08));
      const angle = FOLD_ANGLE * fold;
      const riseY = (1 - phaseA) * 40;
      const landingY = LANDING_DROP * phaseC;
      if (wingLeftRef.current) {
        wingLeftRef.current.style.transform = `translateY(${(riseY + FOLD_DROP * fold + landingY).toFixed(1)}px) rotate(${(-angle).toFixed(1)}deg)`;
      }
      if (wingRightRef.current) {
        wingRightRef.current.style.transform = `translateY(${(riseY + FOLD_DROP * fold + landingY).toFixed(1)}px) rotate(${angle.toFixed(1)}deg)`;
      }
      if (bodyRef.current) {
        bodyRef.current.style.transform = `translateY(${(riseY + fold * 8 + landingY).toFixed(1)}px) scale(${(0.97 + 0.03 * phaseA - 0.01 * fold).toFixed(4)})`;
      }
      if (baseRef.current) {
        baseRef.current.style.opacity = String(phaseC);
        baseRef.current.style.transform = `translateY(${landingY.toFixed(1)}px)`;
      }
      if (glowRef.current) {
        glowRef.current.style.opacity = String(0.3 + 0.25 * phaseA + 0.35 * phaseC);
      }
      // Particles: each rises with scroll, sways sideways, and
      // pulses opacity. They thin out as the phoenix becomes the
      // trophy (the fire is now solid gold) and dim in Phase D.
      const stageH = section.clientHeight;
      const riseScale = stageH / 1000;
      const emberFade = 1 - 0.5 * phaseC;
      dustRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = DUST[i];
        const dy = -d.rise * p * riseScale;
        const dx = Math.sin(p * Math.PI * 2 + d.phase) * d.sway;
        const pulse = 0.5 + 0.5 * Math.sin(p * Math.PI * 4 + d.phase);
        const fade = (1 - 0.25 * (1 - settle)) * emberFade;
        el.style.opacity = String((0.35 + 0.45 * pulse) * fade);
        el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
      });
    };

    // A CONTINUOUS rAF loop (every frame, not just on scroll
    // events) so the transform updates smoothly even while the
    // smooth-scroll library is animating the scroll position.
    // draw() reads the scroll position each frame and sets the
    // transforms directly; there is no CSS transition, so the
    // motion follows the scroll exactly.
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Clean up the rAF loop on unmount.
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <section className="shatter" id="shatter" ref={sectionRef}>
      <div className="shatter-sticky">
        <div className="shatter-progress" ref={progressRef} />
        <div className="shatter-canvas-wrap">
          <div className="flight-stage">
            <div className="phoenix-wide-box">
              <div className="portrait-glow" ref={glowRef} aria-hidden="true" />
              <img ref={baseRef} className="phoenix-marble-base" src="/trophies/phoenix-marble-base.webp" alt="" aria-hidden="true" style={{ opacity: 0 }} />
              <img ref={wingLeftRef} className="phoenix-wide-layer phoenix-wide-layer-wing-left" src="/trophies/phoenix-wide-layer-wing-left.webp" alt="" aria-hidden="true" />
              <img ref={wingRightRef} className="phoenix-wide-layer phoenix-wide-layer-wing-right" src="/trophies/phoenix-wide-layer-wing-right.webp" alt="" aria-hidden="true" />
              <img ref={bodyRef} className="phoenix-wide-layer phoenix-wide-layer-body" src="/trophies/phoenix-wide-layer-body.webp" alt="Golden phoenix on fire, wings spread across the full screen" />
            </div>
            <div className="golden-dust" aria-hidden="true">
              {DUST.map((d, i) => (
                <div
                  key={i}
                  className="gold-dust-dot"
                  ref={(el) => { dustRefs.current[i] = el; }}
                  style={{
                    left: `${d.x}%`,
                    top: `${d.y}%`,
                    width: `${d.size}px`,
                    height: `${d.size}px`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="shatter-overlay-label">Shreeji Corporates — Trophies, Awards &amp; Mementos</div>
          <div className="shatter-overlay-chapter-block">
            <div className="shatter-overlay-chapter" ref={chapterRef}>Crafted to <span className="shatter-title-accent">perfection.</span></div>
            <div className="shatter-overlay-sub" ref={chapterSubRef}>One trophy, made to celebrate one achievement — with 20+ years of expertise behind it.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
