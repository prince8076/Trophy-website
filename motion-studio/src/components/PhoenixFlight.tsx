// PhoenixFlight — the phoenix folds its wings like a real bird,
// then BECOMES the trophy (redesigned 2026-11-08, built from the
// user's own animation prompt).
// The user asked for a smooth, realistic, cinematic wing fold:
// both wings fully spread, then slowly folding inward following
// the natural anatomy of a real bird, flowing slightly towards the
// RIGHT, the feathers following the movement, until both wings are
// completely folded against the body, the phoenix facing slightly
// towards the right — and the actual wings folding, NOT simply
// shrinking, disappearing, or rotating as flat images.
// So this is a SEGMENTED fold. A real bird's wing folds at THREE
// joints (shoulder, elbow, wrist), like a folding fan — not as one
// rigid piece and not by shrinking. The wide phoenix (wings
// spanning the full screen) is split into SEVEN transparent
// layers — three wing segments per side plus the body — and each
// segment rotates around its INNER edge (its joint) by a
// progressively larger angle, so the wing bends in a zigzag and the
// wingtip tucks against the body. The body turns slightly right
// (rotate + translate) as the wings close, so the phoenix ends
// facing slightly towards the right, as the prompt asks. Then a
// polished black marble base — the brand's real trophy base —
// fades in beneath the folded bird, and the bird settles onto it.
// The bird + base IS the trophy: the same phoenix, wings folded,
// standing on its marble base. No second bird is ever shown, so
// there is nothing to ghost.
// WHY this is different from the failed rigid rotation: that
// attempt rotated the WHOLE wing by one angle — and, critically,
// it rotated the wings the WRONG WAY (left counter-clockwise,
// right clockwise), so both wingtips swung UP and OUT into an
// inverted-V and the bird split into panels. Here each segment
// rotates by a DIFFERENT angle around its OWN joint, and in the
// CORRECT direction (left wing clockwise, right wing
// counter-clockwise), so the wingtips swing DOWN and IN, folding
// against the body. The segments also compress slightly and drop
// as they fold, so they tuck. Two bugs from the rotation attempt
// are fixed: the body strip is wide (36-64%) so the head is FULLY
// inside the body (no duplicate head), and every strip boundary is
// FEATHERED (alpha fades over a ~3% band) so there is no sharp
// vertical seam. A true feather-by-feather fold would need a video
// or a 3D model, which this stack cannot generate — this is the
// closest a static image can get, and it follows the wing's real
// anatomy.
// THE FOLD IS SMOOTH: it spans a LONG scroll range (p 0.2-0.8,
// 60% of the scroll), uses a gentle ease-in-out, and draw() runs
// on a CONTINUOUS rAF loop (every frame, not just on scroll
// events) so the transform updates smoothly even while the
// smooth-scroll library is animating.
// The wide phoenix was generated on pure white in 16:9 (2048x1152),
// the white cut out by hand (border-connected flood fill on
// near-white pixels, feathered). The segments and the base ship as
// base64, decoded at build time to
// /trophies/phoenix-wide-seg-*.webp and
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

// One wing segment: its element ref, the angle it rotates to at
// full fold (degrees, around its inner edge / joint), and how much
// it compresses (scaleX) and drops (translateY px) as it folds.
// The angle grows outward (inner < middle < outer) so the wing
// bends in a zigzag like a folding fan. The direction is what
// makes the wings fold DOWN and IN (not up and out): the LEFT wing
// rotates CLOCKWISE (+) and the RIGHT wing rotates
// COUNTER-CLOCKWISE (-), so each wingtip swings down toward the
// body. (The earlier rigid rotation had these backwards, which is
// why it made an inverted-V.)
type Segment = {
  ref: React.RefObject<HTMLImageElement | null>;
  angle: number;
  scaleX: number;
  drop: number;
};

export default function PhoenixFlight() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const segLInnerRef = useRef<HTMLImageElement | null>(null);
  const segLMidRef = useRef<HTMLImageElement | null>(null);
  const segLOuterRef = useRef<HTMLImageElement | null>(null);
  const segRInnerRef = useRef<HTMLImageElement | null>(null);
  const segRMidRef = useRef<HTMLImageElement | null>(null);
  const segROuterRef = useRef<HTMLImageElement | null>(null);
  const bodyRef = useRef<HTMLImageElement | null>(null);
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

  // The six wing segments, in the order they are drawn (outer
  // segments first so the inner ones paint over their joints).
  const segments: Segment[] = [
    { ref: segLOuterRef, angle: 50, scaleX: 0.7, drop: 35 },
    { ref: segLMidRef, angle: 28, scaleX: 0.8, drop: 20 },
    { ref: segLInnerRef, angle: 12, scaleX: 0.9, drop: 10 },
    { ref: segRInnerRef, angle: -12, scaleX: 0.9, drop: 10 },
    { ref: segRMidRef, angle: -28, scaleX: 0.8, drop: 20 },
    { ref: segROuterRef, angle: -50, scaleX: 0.7, drop: 35 },
  ];

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
      // THE SEGMENTED WING FOLD + BECOMING THE TROPHY, in three
      // beats. The bird is always the same seven layers — it is
      // never swapped, never replaced, so it cannot ghost.
      // 1) RISE (p 0-0.2): the wide phoenix rises into place, wings
      //    spanning the full screen, catching the light.
      // 2) WINGS FOLD (p 0.2-0.8): each wing segment rotates around
      //    its inner edge (its joint) by its own angle, so the wing
      //    bends in a zigzag like a folding fan and the wingtip
      //    tucks against the body. The fold is SMOOTH (a gentle
      //    ease-in-out over a LONG range, 60% of the scroll, on a
      //    continuous rAF loop). The body turns slightly RIGHT
      //    (rotate +4deg, translateX +12px) as the wings close, so
      //    the phoenix ends facing slightly towards the right, as
      //    the prompt asks — the whole closing movement flows
      //    rightward. The body settles slightly.
      // 3) BECOMES THE TROPHY (p 0.8-0.92): the polished black
      //    marble base fades in BENEATH the folded bird (it renders
      //    under the bird, z-index 0), and the bird settles down
      //    onto it (translateY +30px). The bird + base IS the
      //    trophy: the same phoenix, wings folded, standing on its
      //    marble base. After p 0.92 the trophy stands still,
      //    glowing, the finale.
      const rise = smooth(clamp01(p / 0.2));
      const fold = smooth(clamp01((p - 0.2) / 0.6));
      const baseIn = smooth(clamp01((p - 0.8) / 0.12));
      const settle = 1 - smooth(clamp01((p - 0.92) / 0.08));
      const riseY = (1 - rise) * 40;
      const settleY = 30 * baseIn;
      for (const seg of segments) {
        const el = seg.ref.current;
        if (!el) continue;
        const angle = seg.angle * fold;
        const sx = 1 - (1 - seg.scaleX) * fold;
        const dy = riseY + seg.drop * fold + settleY;
        el.style.transform = `translateY(${dy.toFixed(1)}px) scaleX(${sx.toFixed(3)}) rotate(${angle.toFixed(1)}deg)`;
      }
      if (bodyRef.current) {
        // The body turns slightly right as the wings close (rotate
        // +4deg, translateX +12px), so the phoenix ends facing
        // slightly towards the right, and the whole closing
        // movement flows rightward.
        const turn = 4 * fold;
        const shiftX = 12 * fold;
        bodyRef.current.style.transform = `translate(${shiftX.toFixed(1)}px, ${(riseY + fold * 8 + settleY).toFixed(1)}px) scale(${(0.97 + 0.03 * rise - 0.01 * fold).toFixed(4)}) rotate(${turn.toFixed(1)}deg)`;
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
    // The segments array is rebuilt each render, but the refs are
    // stable; include it so the effect sees the current refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return (
    <section className="shatter" id="shatter" ref={sectionRef}>
      <div className="shatter-sticky">
        <div className="shatter-canvas-wrap">
          <div className="flight-stage">
            <div className="phoenix-wide-box">
              <div className="portrait-glow" ref={glowRef} aria-hidden="true" />
              <img ref={baseRef} className="phoenix-marble-base" src="/trophies/phoenix-marble-base.webp" alt="" aria-hidden="true" style={{ opacity: 0 }} />
              <img ref={segLOuterRef} className="phoenix-wide-seg phoenix-wide-seg-wing-left-outer" src="/trophies/phoenix-wide-seg-wing-left-outer.webp" alt="" aria-hidden="true" />
              <img ref={segLMidRef} className="phoenix-wide-seg phoenix-wide-seg-wing-left-middle" src="/trophies/phoenix-wide-seg-wing-left-middle.webp" alt="" aria-hidden="true" />
              <img ref={segLInnerRef} className="phoenix-wide-seg phoenix-wide-seg-wing-left-inner" src="/trophies/phoenix-wide-seg-wing-left-inner.webp" alt="" aria-hidden="true" />
              <img ref={segRInnerRef} className="phoenix-wide-seg phoenix-wide-seg-wing-right-inner" src="/trophies/phoenix-wide-seg-wing-right-inner.webp" alt="" aria-hidden="true" />
              <img ref={segRMidRef} className="phoenix-wide-seg phoenix-wide-seg-wing-right-middle" src="/trophies/phoenix-wide-seg-wing-right-middle.webp" alt="" aria-hidden="true" />
              <img ref={segROuterRef} className="phoenix-wide-seg phoenix-wide-seg-wing-right-outer" src="/trophies/phoenix-wide-seg-wing-right-outer.webp" alt="" aria-hidden="true" />
              <img ref={bodyRef} className="phoenix-wide-seg phoenix-wide-seg-body" src="/trophies/phoenix-wide-seg-body.webp" alt="Golden phoenix on fire, wings spread across the full screen" />
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
