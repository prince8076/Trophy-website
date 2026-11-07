// PhoenixFlight — the FLAMING phoenix, ONE image, wings that
// really fold (redesigned 2026-11-07).
// The user asked for three things: a background that MATCHES the
// hero (white, not black), text in black and orange (like the hero
// headline), and a GOOD animation that does NOT use three images.
// So this is one single phoenix — a golden bird of fire on a pure
// white background, wings spread — split into three transparent
// layers (left wing, body, right wing) that the section ROTATES as
// you scroll. The wings are not swapped between three photos; they
// are the same bird, and they fold down around their shoulders
// (transform-origin at the shoulder) until they rest along the
// body at the finale. The body strip overlaps both wing strips and
// renders on top, so the wings' cut edges hide behind the body and
// the fold reads as one bird moving, not three pieces.
// The phoenix was generated on pure white (so there is no dark
// smoke to fight — the white background was cut out by hand with a
// border-connected flood fill on near-white pixels, feathered) and
// the three layers ship as base64, decoded at build time to
// /trophies/phoenix-layer-*.webp (see scripts/generate-assets.mjs).
// The section is white like the hero, the chapter titles are black
// with the final word in orange (the hero's "RECOGNITION." trick),
// and the golden dust reads as orange embers on white. Four
// chapters over 180vh. Reduced motion: wings spread, static.

import { useEffect, useRef, useState } from 'react';

const CHAPTERS = [
  { start: 0.0, end: 0.25, title: 'Crafted to perfection.', sub: 'One trophy, made to celebrate one achievement — with 20+ years of expertise behind it.' },
  { start: 0.25, end: 0.5, title: 'It begins with effort.', sub: 'Effort, discipline and belief — the moments Shreeji Corporates was built to honour.' },
  { start: 0.5, end: 0.75, title: 'And then it takes flight.', sub: 'A win, finally recognised — in crystal, metal, acrylic or wood, made to your vision.' },
  { start: 0.75, end: 1.01, title: 'We craft meaningful recognition.', sub: 'We don\u2019t just supply awards — we celebrate your success. Shreeji Corporates, New Delhi.' },
];

// The wing fold: how far each wing rotates from spread (0deg) to
// fully folded at the finale. 75deg swings the wingtips from the
// top corners down to the body's sides, so the bird ends with its
// wings folded and resting — a real fold, not a fade.
const FOLD_DEG = 75;

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
  const stackRef = useRef<HTMLDivElement | null>(null);
  const wingLeftRef = useRef<HTMLImageElement | null>(null);
  const bodyRef = useRef<HTMLImageElement | null>(null);
  const wingRightRef = useRef<HTMLImageElement | null>(null);
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
      // The wings FOLD as you scroll. Each wing rotates around its
      // shoulder (transform-origin is set in CSS) from 0deg (spread)
      // to FOLD_DEG at the finale. The left wing turns
      // counter-clockwise, the right clockwise, so both wingtips
      // swing down to the body's sides. The fold is eased
      // (smoothstep) so the wings close gradually, never snapping —
      // and because it is one bird rotating, not three photos
      // crossfading, the motion is continuous. The whole bird
      // settles slightly as the wings close, and the firelight glow
      // behind it steadies.
      const fold = smooth(p) * FOLD_DEG;
      if (wingLeftRef.current) wingLeftRef.current.style.transform = `rotate(${-fold.toFixed(1)}deg)`;
      if (wingRightRef.current) wingRightRef.current.style.transform = `rotate(${fold.toFixed(1)}deg)`;
      if (stackRef.current) {
        stackRef.current.style.transform = `translateY(${(8 * p).toFixed(1)}px) scale(${(1 - 0.01 * p).toFixed(4)})`;
      }
      if (glowRef.current) {
        glowRef.current.style.opacity = String(0.5 + 0.25 * p);
      }
      // Embers: each mote floats upward as you scroll, sways gently
      // and twinkles — like embers rising off a fire. They thin very
      // slightly at the finale as the bird settles.
      const settle = 1 - smooth(clamp01((p - 0.85) / 0.15));
      const stageH = section.clientHeight;
      const riseScale = stageH / 1000;
      dustRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = DUST[i];
        const dy = -d.rise * p * riseScale;
        const dx = Math.sin(p * Math.PI * 2 + d.phase) * d.sway * 0.5;
        const twinkle = 0.55 + 0.45 * Math.sin(p * Math.PI * 4 + d.phase);
        const fade = 1 - 0.25 * (1 - settle);
        el.style.opacity = String((0.35 + 0.45 * twinkle) * fade);
        el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
      });
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    draw();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <section className="shatter" id="shatter" ref={sectionRef}>
      <div className="shatter-sticky">
        <div className="shatter-canvas-wrap">
          <div className="flight-stage">
            <div className="portrait-box">
              <div className="portrait-glow" ref={glowRef} aria-hidden="true" />
              <div className="flame-stack" ref={stackRef}>
                <img ref={wingLeftRef} className="phoenix-layer phoenix-layer-wing-left" src="/trophies/phoenix-layer-wing-left.webp" alt="" aria-hidden="true" />
                <img ref={wingRightRef} className="phoenix-layer phoenix-layer-wing-right" src="/trophies/phoenix-layer-wing-right.webp" alt="" aria-hidden="true" />
                <img ref={bodyRef} className="phoenix-layer phoenix-layer-body" src="/trophies/phoenix-layer-body.webp" alt="Golden phoenix on fire, wings spread wide" />
              </div>
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
