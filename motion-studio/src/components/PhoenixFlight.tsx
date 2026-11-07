// PhoenixFlight — the phoenix BECOMES the trophy (redesigned
// 2026-11-07).
// The user asked for: full wings on a full screen, the wings
// closing as you scroll, and the phoenix BECOMING a trophy — using
// a good image from the catalogue. So this is the transformation:
// a golden phoenix on fire, its wings spanning the ENTIRE screen
// edge to edge, rises into place; as you scroll the wings draw in
// and the bird closes toward its body; then, in a warm flash of
// firelight, the living bird becomes the Golden Phoenix TROPHY —
// the brand's signature design (the golden phoenix statue on its
// black marble base, the same image as the hero) — which stands
// still and glowing at the finale. The living phoenix becomes the
// trophy you can order.
// WHY a transformation (not a wing-fold): the wing-fold was tried
// two ways and both looked broken. Crossfading three poses ghosted
// (two birds at once). Splitting one image into wing/body layers
// and rotating the wings split the bird into visible panels (a
// duplicate head, a sharp seam, white gaps, and the wings tilting
// out into an inverted-V). A rigid rotation swings the wingtips
// down-and-OUT, not in to the body. So instead the wings draw in
// (the whole bird narrows and settles) and the bird transforms
// into the trophy in a fast flash — the crossfade is deliberately
// FAST (over 8% of the scroll) and masked by a warm glow burst, so
// it reads as a transformation, not a ghost. A true smooth
// wing-fold needs a video or a 3D model, which this stack cannot
// generate.
// The wide phoenix was generated on pure white in 16:9 (2048x1152),
// the white cut out by hand (border-connected flood fill on
// near-white pixels, feathered), and it ships as base64, decoded at
// build time to /trophies/phoenix-flame-wide.webp (see
// scripts/generate-assets.mjs). The trophy reuses the hero's
// transparent Golden Phoenix WebP
// (/trophies/hero-golden-phoenix-transparent.webp), so no new asset
// is needed for it. Four chapters over 180vh. Reduced motion: the
// trophy at rest, static.

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
  const wideRef = useRef<HTMLImageElement | null>(null);
  const trophyRef = useRef<HTMLImageElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);
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
      // THE TRANSFORMATION, in three beats:
      // 1) RISE (p 0-0.35): the wide phoenix rises into place, wings
      //    spanning the full screen, catching the light.
      // 2) WINGS DRAW IN (p 0.35-0.55): the bird narrows and settles
      //    (scale 1 -> 0.92, scaleX 1 -> 0.93) — the wings close
      //    toward the body — and the firelight glow builds.
      // 3) BECOMES THE TROPHY (p 0.6-0.68): a warm flash flares and
      //    the living bird gives way to the Golden Phoenix trophy
      //    (on its black marble base), which scales up into place.
      //    The swap is FAST (8% of the scroll) and masked by the
      //    flash, so it reads as a transformation, not a ghost.
      //    After p 0.7 the trophy stands still, glowing, the finale.
      const rise = smooth(clamp01(p / 0.35));
      const drawIn = smooth(clamp01((p - 0.35) / 0.2));
      const swap = smooth(clamp01((p - 0.6) / 0.08));
      const settle = 1 - smooth(clamp01((p - 0.85) / 0.15));
      if (wideRef.current) {
        const scale = (0.97 + 0.03 * rise) * (1 - 0.08 * drawIn);
        const scaleX = 1 - 0.07 * drawIn;
        const y = (1 - rise) * 40 + drawIn * 12;
        const bright = 1 + 0.05 * rise;
        wideRef.current.style.transform = `translateY(${y.toFixed(1)}px) scale(${scale.toFixed(4)}, ${(scale * scaleX).toFixed(4)})`;
        wideRef.current.style.filter = `brightness(${bright.toFixed(3)})`;
        wideRef.current.style.opacity = String(1 - swap);
      }
      if (trophyRef.current) {
        const tScale = 0.92 + 0.08 * swap;
        const tBright = 1 + 0.06 * swap;
        trophyRef.current.style.transform = `translateY(${((1 - swap) * 24).toFixed(1)}px) scale(${tScale.toFixed(4)})`;
        trophyRef.current.style.filter = `brightness(${tBright.toFixed(3)})`;
        trophyRef.current.style.opacity = String(swap);
      }
      // The flash: a warm firelight wash that peaks exactly while
      // the bird becomes the trophy (p ~0.6-0.68), masking the swap,
      // then settles to a steady warm glow behind the trophy.
      if (flashRef.current) {
        const flash = Math.sin(clamp01((p - 0.55) / 0.15) * Math.PI);
        flashRef.current.style.opacity = String((0.25 + 0.55 * flash + 0.2 * swap).toFixed(3));
      }
      if (glowRef.current) {
        glowRef.current.style.opacity = String(0.3 + 0.25 * rise + 0.15 * swap);
      }
      // Embers: they drift around the living phoenix and thin out as
      // it becomes the trophy (the fire is now solid gold).
      const stageH = section.clientHeight;
      const riseScale = stageH / 1000;
      const emberFade = 1 - swap;
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
            <div className="phoenix-wide-box">
              <div className="portrait-glow" ref={glowRef} aria-hidden="true" />
              <img ref={wideRef} className="phoenix-wide" src="/trophies/phoenix-flame-wide.webp" alt="Golden phoenix on fire, wings spread across the full screen" />
              <img ref={trophyRef} className="phoenix-trophy" src="/trophies/hero-golden-phoenix-transparent.webp" alt="Golden Phoenix trophy — our signature design" style={{ opacity: 0 }} />
              <div className="transform-flash" ref={flashRef} aria-hidden="true" />
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
