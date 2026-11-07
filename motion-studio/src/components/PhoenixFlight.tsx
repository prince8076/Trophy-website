// PhoenixFlight — the SAME phoenix closes its wings and BECOMES
// the trophy (redesigned 2026-11-08).
// The user was clear: the transition showed a DIFFERENT bird (the
// statue) replacing the flaming phoenix, and they want the SAME
// phoenix — the flaming one — closing its wings and becoming a
// trophy. So there is NO image swap here at all. The bird is
// always the SAME three transparent layers (left wing, body, right
// wing) of the one wide flaming phoenix. As you scroll, the wings
// close (foeshortening: they compress toward the shoulders and tilt
// down, folding back and tucking against the body's sides). Then a
// polished black marble base — the brand's real trophy base,
// cropped from the hero's Golden Phoenix — fades in beneath the
// folded bird, and the bird settles down onto it. The bird + base
// IS the trophy: the same phoenix, wings closed, standing on its
// marble base. No second bird is ever shown, so there is nothing
// to ghost.
// WHY foreshortening (not rotation): rotation was tried and failed
// — it swung the wingtips down-and-OUT into an inverted-V and
// split the bird into panels (a duplicate head, a sharp seam,
// white gaps). A rigid rotation cannot tuck the wings; it can only
// swing them. Foreshortening has no big arc and no diagonal cut
// edge — the wing compresses toward the shoulder and slides behind
// the body (which renders on top), so it reads as folding back.
// Two bugs from the rotation attempt are fixed: the body strip is
// wide (36-64%) so the head is FULLY inside the body (no duplicate
// head), and every strip boundary is FEATHERED (alpha fades over a
// ~4% band) so there is no sharp vertical seam. A true smooth
// wing-fold would need a video or a 3D model, which this stack
// cannot generate — this is the closest a static image can get.
// THE FOLD MUST BE GRADUAL: it spans a LONG scroll range
// (p 0.2-0.8, 60% of the scroll), uses LINEAR easing (a constant
// rate, no rapid middle), and draw() runs on a CONTINUOUS rAF loop
// (every frame, not just on scroll events) so the transform updates
// smoothly even while the smooth-scroll library is animating. The
// wings tilt down 25deg and drop 40px as they compress, so they
// visibly fold DOWN and IN — not just narrow.
// THE BASE MUST NOT GHOST: earlier versions crossfaded to a
// different statue image and ghosted (two birds at once, no flash
// seen). Here the base is a SEPARATE layer that fades in UNDER the
// bird (z-index 0, below the bird layers) while the bird is already
// folded — the bird never disappears, never gets replaced, and no
// two birds are ever visible at once.
// The wide phoenix was generated on pure white in 16:9 (2048x1152),
// the white cut out by hand (border-connected flood fill on
// near-white pixels, feathered). The layers and the base ship as
// base64, decoded at build time to
// /trophies/phoenix-wide-layer-*.webp and
// /trophies/phoenix-marble-base.webp (see
// scripts/generate-assets.mjs). Four chapters over 180vh. Reduced
// motion: the trophy at rest, static.

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
// is px; phase is the offset for its opacity pulse.
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

  useEffect(() => {
    if (reducedMotion) return undefined;
    const section = sectionRef.current;
    if (!section) return undefined;
    let raf = 0;

    const draw = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp01(-rect.top / (rect.height - vh));
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
      if (chapterRef.current) {
        const c = CHAPTERS.find((ch) => p >= ch.start && p < ch.end) || CHAPTERS[CHAPTERS.length - 1];
        chapterRef.current.innerHTML = titleHtml(c.title);
        if (chapterSubRef.current) chapterSubRef.current.textContent = c.sub;
      }
      // THE SAME PHOENIX CLOSES ITS WINGS AND BECOMES THE TROPHY,
      // in three beats. The bird is always the same three layers —
      // it is never swapped, never replaced, so it cannot ghost.
      // 1) RISE (p 0-0.2): the wide phoenix rises into place, wings
      //    spanning the full screen, catching the light.
      // 2) WINGS CLOSE (p 0.2-0.8): the wings FORESHORTEN — each
      //    wing compresses horizontally toward its shoulder (scaleX
      //    1 -> 0.22, anchored at the shoulder) AND tilts DOWN
      //    (25deg) AND drops (translateY +40px), so they fold down
      //    and tuck against the body's sides. The fold is LINEAR
      //    (a constant rate) over a LONG range (60% of the scroll),
      //    so it is gradual and clearly visible at every step — not
      //    an abrupt shrink. The body settles slightly.
      // 3) BECOMES THE TROPHY (p 0.8-0.92): the polished black
      //    marble base fades in BENEATH the folded bird (it renders
      //    under the bird, z-index 0), and the bird settles down
      //    onto it (translateY +30px). The bird + base IS the
      //    trophy: the same phoenix, wings closed, standing on its
      //    marble base. After p 0.92 the trophy stands still,
      //    glowing, the finale.
      const rise = smooth(clamp01(p / 0.2));
      const fold = clamp01((p - 0.2) / 0.6);
      const baseIn = smooth(clamp01((p - 0.8) / 0.12));
      const settle = 1 - smooth(clamp01((p - 0.92) / 0.08));
      const scaleX = 1 - 0.78 * fold;
      const tilt = 25 * fold;
      const drop = 40 * fold + 30 * baseIn;
      if (wingLeftRef.current) {
        wingLeftRef.current.style.transform = `translateY(${((1 - rise) * 40 + drop).toFixed(1)}px) scaleX(${scaleX.toFixed(3)}) rotate(${(-tilt).toFixed(1)}deg)`;
      }
      if (wingRightRef.current) {
        wingRightRef.current.style.transform = `translateY(${((1 - rise) * 40 + drop).toFixed(1)}px) scaleX(${scaleX.toFixed(3)}) rotate(${tilt.toFixed(1)}deg)`;
      }
      if (bodyRef.current) {
        bodyRef.current.style.transform = `translateY(${((1 - rise) * 40 + fold * 8 + 30 * baseIn).toFixed(1)}px) scale(${(0.97 + 0.03 * rise - 0.01 * fold).toFixed(4)})`;
      }
      if (baseRef.current) {
        baseRef.current.style.opacity = String(baseIn);
      }
      if (glowRef.current) {
        glowRef.current.style.opacity = String(0.3 + 0.25 * rise + 0.2 * baseIn);
      }
      // Embers: they drift around the living phoenix and thin out as
      // it becomes the trophy (the fire is now solid gold).
      const stageH = section.clientHeight;
      const riseScale = stageH / 1000;
      const emberFade = 1 - 0.5 * baseIn;
      dustRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = DUST[i];
        const dy = -d.rise * p * riseScale;
        const dx = Math.sin(p * Math.PI * 2 + d.phase) * d.sway * 0.5;
        const twinkle = 0.55 + 0.45 * Math.sin(p * Math.PI * 4 + d.phase);
        const fade = (1 - 0.25 * (1 - settle)) * emberFade;
        el.style.opacity = String((0.35 + 0.45 * twinkle) * fade);
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
