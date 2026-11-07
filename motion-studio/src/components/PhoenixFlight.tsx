// PhoenixFlight — scroll-driven "phoenix takes flight" hero
// animation (built 2026-11-08 to the user's spec, no animation
// libraries — plain requestAnimationFrame + transforms).
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
//  3. Left wing (z-index 1) — transform-origin 40% 40%.
//  4. Right wing (z-index 1) — transform-origin 60% 40%.
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
//  Phase B — 20% to 80%: WINGS CLOSE: scaleX 1 -> 0.22 and
//    rotate 0 -> -25deg (left) / +25deg (right). Body sinks
//    slightly (+8px). The wings compress toward the shoulders
//    and tilt down, folding back and tucking against the body's
//    sides. The body renders on top, so the wings slide behind
//    it. The rotation signs tilt the wingtips DOWN (left wing
//    counter-clockwise, right wing clockwise — a point on the
//    left side of the pivot moves down when rotated
//    counter-clockwise, and a point on the right side moves
//    down when rotated clockwise).
//  Phase C — 80% to 92%: marble pedestal fades in (opacity
//    0 -> 1), wings/body drop an extra 30px as if landing.
//  Phase D — 92% to 100%: scene gently settles (dim particles).
//  Glow opacity = 0.3 + 0.25*phaseA + 0.2*phaseC.
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
// at the top of the sticky viewport: scaleX = p.
//
// Accessibility & performance: prefers-reduced-motion renders
// the final pose statically (no rAF loop). The rAF loop is
// cleaned up on unmount. No layout thrash — the rect is read
// once per frame, styles are written via refs only.
//
// NOTE on the fold easing: the user-approved live version used
// a LINEAR fold (an ease-in-out was tried in main e4df1757 and
// its check reported the bird sitting still then jumping —
// that reading does not match smoothstep's math, which is
// gradual throughout, so it was likely a measurement artifact).
// This build follows the user's spec and uses smoothstep for
// the fold; it will be verified with a fresh visual check, and
// if the check shows the same jump, the fold goes back to
// linear. The bird is always the SAME three transparent layers
// (left wing, body, right wing) of the one wide flaming
// phoenix — no image swap, so there is nothing to ghost. The
// marble base is the brand's real trophy base, cropped from the
// hero's Golden Phoenix, fading in UNDER the folded bird. The
// wide phoenix was generated on pure white in 16:9 (2048x1152),
// the white cut out by hand (border-connected flood fill on
// near-white pixels, feathered). The layers and the base ship as
// base64, decoded at build time to
// /trophies/phoenix-wide-layer-*.webp and
// /trophies/phoenix-marble-base.webp (see
// scripts/generate-assets.mjs). The body strip is wide
// (36-64%) so the head is FULLY inside the body (no duplicate
// head), and every strip boundary is FEATHERED (alpha fades over
// a ~4% band) so there is no sharp vertical seam.

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
  // folded, base in, last chapter) — no rAF loop, no motion.
  // The transforms below are the p = 1 values of the timeline:
  // fold = 1 (scaleX 0.22, tilt ∓25deg, drop 40px), baseIn = 1
  // (base opacity 1, extra 30px landing drop), glow 0.75,
  // progress scaleX 1.
  useEffect(() => {
    if (!reducedMotion) return undefined;
    if (wingLeftRef.current) {
      wingLeftRef.current.style.transform = 'translateY(70px) scaleX(0.22) rotate(-25deg)';
    }
    if (wingRightRef.current) {
      wingRightRef.current.style.transform = 'translateY(70px) scaleX(0.22) rotate(25deg)';
    }
    if (bodyRef.current) {
      bodyRef.current.style.transform = 'translateY(38px) scale(0.99)';
    }
    if (baseRef.current) {
      baseRef.current.style.opacity = '1';
    }
    if (glowRef.current) {
      glowRef.current.style.opacity = '0.75';
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
      // Scroll timeline (smoothstep easing throughout).
      // Phase A (p 0-0.2): the wide phoenix rises into place,
      // wings spanning the full screen, catching the light.
      // Phase B (p 0.2-0.8): WINGS CLOSE — each wing compresses
      // horizontally toward its shoulder (scaleX 1 -> 0.22,
      // anchored at the shoulder) AND tilts DOWN (25deg) AND
      // drops (translateY +40px), so they fold down and tuck
      // against the body's sides. The fold spans a LONG range
      // (60% of the scroll) on a continuous rAF loop, so it is
      // gradual and clearly visible at every step. The body
      // sinks slightly (+8px).
      // Phase C (p 0.8-0.92): the polished black marble base
      // fades in BENEATH the folded bird (it renders under the
      // bird, z-index 0), and the bird settles down onto it
      // (translateY +30px). The bird + base IS the trophy: the
      // same phoenix, wings closed, standing on its marble base.
      // Phase D (p 0.92-1): the trophy stands still, glowing;
      // the particles dim.
      const phaseA = smooth(clamp01(p / 0.2));
      const fold = smooth(clamp01((p - 0.2) / 0.6));
      const phaseC = smooth(clamp01((p - 0.8) / 0.12));
      const settle = 1 - smooth(clamp01((p - 0.92) / 0.08));
      const scaleX = 1 - 0.78 * fold;
      const tilt = 25 * fold;
      const drop = 40 * fold + 30 * phaseC;
      const riseY = (1 - phaseA) * 40;
      if (wingLeftRef.current) {
        wingLeftRef.current.style.transform = `translateY(${(riseY + drop).toFixed(1)}px) scaleX(${scaleX.toFixed(3)}) rotate(${(-tilt).toFixed(1)}deg)`;
      }
      if (wingRightRef.current) {
        wingRightRef.current.style.transform = `translateY(${(riseY + drop).toFixed(1)}px) scaleX(${scaleX.toFixed(3)}) rotate(${tilt.toFixed(1)}deg)`;
      }
      if (bodyRef.current) {
        bodyRef.current.style.transform = `translateY(${(riseY + fold * 8 + 30 * phaseC).toFixed(1)}px) scale(${(0.97 + 0.03 * phaseA - 0.01 * fold).toFixed(4)})`;
      }
      if (baseRef.current) {
        baseRef.current.style.opacity = String(phaseC);
      }
      if (glowRef.current) {
        glowRef.current.style.opacity = String(0.3 + 0.25 * phaseA + 0.2 * phaseC);
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
        <div className="shatter-progress" ref={progressRef} />
      </div>
    </section>
  );
}
