// PhoenixFlight — the FLAMING phoenix (redesigned 2026-11-07).
// The user asked for a real phoenix: a bird of fire, not a statue.
// So this is a living golden phoenix engulfed in golden-orange
// flames and embers, with NO black background and NO marble base —
// three transparent WebP poses (spread, half-closed, closed) that
// the section crossfades between as you scroll, so the bird
// SPREADS its wings at the top and CLOSES them as you scroll down,
// folding them to rest at the finale. The poses are three separate
// generated photos (they are not identical birds — the generator
// cannot do that — but the gold, the flames and the head-up pose
// match, so the crossfade reads as the wings folding, not a morph).
// The black background was cut out by hand (a border-connected
// flood fill on dark pixels, feathered) and the images ship as
// base64, decoded at build time to /trophies/phoenix-flame-*.webp
// (see scripts/generate-assets.mjs). The flame smoke is left in:
// on this black section it is invisible, and removing it eats the
// gold feathers. The golden dust from the previous design stays —
// around a bird of fire it reads as embers.
// Motion (all driven by scroll progress, as before): the wings
// close over the whole scroll (spread -> half -> closed), the bird
// settles down slightly as it folds (like landing), and the warm
// firelight glow behind it steadies at the finale. Four chapters
// over 180vh. Reduced motion: the spread pose, wings open, static.

import { useEffect, useRef, useState } from 'react';

const CHAPTERS = [
  { start: 0.0, end: 0.25, title: 'Crafted to perfection.', sub: 'One trophy, made to celebrate one achievement — with 20+ years of expertise behind it.' },
  { start: 0.25, end: 0.5, title: 'It begins with effort.', sub: 'Effort, discipline and belief — the moments Shreeji Corporates was built to honour.' },
  { start: 0.5, end: 0.75, title: 'And then it takes flight.', sub: 'A win, finally recognised — in crystal, metal, acrylic or wood, made to your vision.' },
  { start: 0.75, end: 1.01, title: 'We craft meaningful recognition.', sub: 'We don\u2019t just supply awards — we celebrate your success. Shreeji Corporates, New Delhi.' },
];

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const smooth = (t: number) => t * t * (3 - 2 * t);

// Golden dust / embers — fine round gold motes that drift upward
// around the phoenix. A fixed seed so the layout is identical on
// every load. x/y are % of the stage; rise is how far the mote
// floats up; size is px; phase is the offset for its opacity pulse.
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
  const spreadRef = useRef<HTMLImageElement | null>(null);
  const halfRef = useRef<HTMLImageElement | null>(null);
  const closedRef = useRef<HTMLImageElement | null>(null);
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
        chapterRef.current.textContent = c.title;
        if (chapterSubRef.current) chapterSubRef.current.textContent = c.sub;
      }
      // Wings close as you scroll. The three poses crossfade in
      // two smooth steps: spread -> half over p 0-0.5, half ->
      // closed over p 0.5-1. Each fade is eased (smoothstep) so the
      // wings fold gradually, never snapping. At p=0 the wings are
      // fully spread; at p=1 they are fully closed, folded to rest.
      const toHalf = smooth(clamp01(p / 0.5));
      const toClosed = smooth(clamp01((p - 0.5) / 0.5));
      if (spreadRef.current) spreadRef.current.style.opacity = String(1 - toHalf);
      if (halfRef.current) halfRef.current.style.opacity = String(toHalf * (1 - toClosed));
      if (closedRef.current) closedRef.current.style.opacity = String(toClosed);
      // The bird settles as it folds — it drifts down slightly and
      // eases from a touch larger to its resting size, like a bird
      // landing and folding its wings to rest. The firelight glow
      // behind it brightens a little as the wings close (the flames
      // wrap closer around the body) and steadies at the finale.
      if (stackRef.current) {
        stackRef.current.style.transform = `translateY(${(-16 * (1 - p)).toFixed(1)}px) scale(${(1 + 0.02 * (1 - p)).toFixed(4)})`;
      }
      if (glowRef.current) {
        glowRef.current.style.opacity = String(0.35 + 0.2 * p);
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
                <img ref={spreadRef} className="flame-frame" src="/trophies/phoenix-flame-spread.webp" alt="Golden phoenix on fire, wings spread wide" style={{ opacity: 1 }} />
                <img ref={halfRef} className="flame-frame" src="/trophies/phoenix-flame-half.webp" alt="Golden phoenix on fire, wings half-closed" style={{ opacity: 0 }} />
                <img ref={closedRef} className="flame-frame" src="/trophies/phoenix-flame-closed.webp" alt="Golden phoenix on fire, wings closed and folded" style={{ opacity: 0 }} />
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
            <div className="shatter-overlay-chapter" ref={chapterRef}>Crafted to perfection.</div>
            <div className="shatter-overlay-sub" ref={chapterSubRef}>One trophy, made to celebrate one achievement — with 20+ years of expertise behind it.</div>
          </div>
        </div>
        <div className="shatter-progress" ref={progressRef} />
      </div>
    </section>
  );
}
