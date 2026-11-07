// PhoenixFlight — the FLAMING phoenix as a living portrait
// (redesigned 2026-11-07).
// ONE golden phoenix on fire, on a white background that matches
// the hero, with black-and-orange chapter text. The bird rises
// gracefully into its resting pose as you scroll, breathes almost
// imperceptibly, and settles still at the finale, with golden
// embers drifting around it and a warm firelight glow that
// steadies. It is ONE image — no layers, no swapping.
// WHY one image: the wing-fold was tried two ways and both looked
// broken. Crossfading three poses ghosted (two birds at once, a
// double-bird in the middle). Splitting one image into wing/body
// layers and rotating the wings split the bird into visible panels
// — a duplicate head (the head was in the wing layer), a sharp
// vertical seam, white gaps, and the wings tilting out into an
// inverted-V instead of folding in, because a rigid rotation swings
// the wingtips down-and-OUT, not in to the body's sides. A true
// smooth wing fold needs a video or a 3D model, which this stack
// cannot generate, so the phoenix is a living portrait instead: it
// rises, breathes, and feels alive, without the broken fold.
// The phoenix was generated on pure white with its wings spread,
// the white cut out by hand (border-connected flood fill on
// near-white pixels, feathered), and it ships as base64, decoded at
// build time to /trophies/phoenix-flame-white.webp (see
// scripts/generate-assets.mjs). Four chapters over 180vh. Reduced
// motion: the phoenix at rest, static.

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
  const birdRef = useRef<HTMLImageElement | null>(null);
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
      // The bird RISES gracefully into its resting pose over the
      // first 35% of the scroll (56px up, 0.96 -> 1.0 scale,
      // brightness 1 -> 1.06 as it catches the light), then breathes
      // almost imperceptibly — a gentle rise and swell that eases
      // out at the finale (settle), so the bird is still at the end.
      // The firelight glow behind it brightens as it rises and
      // steadies at the finale.
      const rise = smooth(clamp01(p / 0.35));
      const settle = 1 - smooth(clamp01((p - 0.85) / 0.15));
      const breath = Math.sin(p * Math.PI * 2) * 0.5 + 0.5;
      if (birdRef.current) {
        const riseY = (1 - rise) * 56;
        const breathY = breath * 4 * settle;
        const scale = 0.96 + 0.04 * rise + 0.006 * breath * settle;
        const bright = 1 + 0.06 * rise + 0.015 * breath * settle;
        birdRef.current.style.transform = `translateY(${(-riseY - breathY).toFixed(1)}px) scale(${scale.toFixed(4)})`;
        birdRef.current.style.filter = `brightness(${bright.toFixed(3)})`;
      }
      if (glowRef.current) {
        glowRef.current.style.opacity = String(0.35 + 0.25 * rise);
      }
      // Embers: each mote floats upward as you scroll, sways gently
      // and twinkles — like embers rising off a fire. They thin very
      // slightly at the finale as the bird settles.
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
              <img ref={birdRef} className="portrait-bird" src="/trophies/phoenix-flame-white.webp" alt="Golden phoenix on fire, wings spread wide" />
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
