// PhoenixFlight — the premium signature (redesigned 2026-11-07).
// The old version (living portrait + feather shatter) felt long,
// repetitive and slightly cheap: the bird flapped through two
// wingbeats while golden shards exploded off its wingtips, over
// 400vh then 300vh then 240vh of scroll. The new concept is a
// luxury trophy on display, not a visual effect:
//   - ONE golden phoenix, standing on its polished black marble
//     base (the base is part of the photo), deep black background.
//     Noble head looking slightly upward, wide layered wings,
//     detailed metallic gold feathers. The image is a single
//     generated photo (src/lib/phoenixLuxury.ts), not three flap
//     frames — there is no wingbeat and no shatter any more.
//   - The motion is a slow graceful RISE: the phoenix starts
//     slightly lower and smaller and rises into its resting pose
//     over the first third of the scroll, catching more light as
//     it rises. Then it breathes almost imperceptibly, and settles
//     into a still, prestigious trophy at the finale.
//   - Soft GOLDEN DUST drifts upward around it — fine round gold
//     motes that float and twinkle, never explode. They are DOM
//     dots (not shards), driven by the same scroll progress.
//   - A warm glow behind the bird brightens as it rises and
//     steadies at the end, like a trophy lit on display.
// Four chapters (was six) over 180vh, so each one lands and the
// section never drags. All motion is still driven by the scroll
// position, deliberately — it is the one mechanism that provably
// drives this section. Reduced motion: the static bird in its
// resting pose, no rise, no dust, no glow pulse.

import { useEffect, useRef, useState } from 'react';
import { PHOENIX_LUXURY_DATA_URI } from '../lib/phoenixLuxury';

const CHAPTERS = [
  { start: 0.0, end: 0.25, title: 'Crafted to perfection.', sub: 'One trophy, made to celebrate one achievement — with 20+ years of expertise behind it.' },
  { start: 0.25, end: 0.5, title: 'It begins with effort.', sub: 'Effort, discipline and belief — the moments Shreeji Corporates was built to honour.' },
  { start: 0.5, end: 0.75, title: 'And then it takes flight.', sub: 'A win, finally recognised — in crystal, metal, acrylic or wood, made to your vision.' },
  { start: 0.75, end: 1.01, title: 'We craft meaningful recognition.', sub: 'We don\u2019t just supply awards — we celebrate your success. Shreeji Corporates, New Delhi.' },
];

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const smooth = (t: number) => t * t * (3 - 2 * t);

// Golden dust — fine round gold motes that drift upward around the
// phoenix. A fixed seed so the layout is identical on every load.
// x/y are % of the stage; rise is how far the mote floats up (px at
// a 1000px-tall stage, scaled by stage height); size is px;
// twinkle is the phase offset for its opacity pulse.
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
  const birdRef = useRef<HTMLDivElement | null>(null);
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
      // Rise: the phoenix starts 56px lower and 4% smaller and rises
      // gracefully into its resting pose over the first 35% of the
      // scroll. This is the slow, graceful rising motion — not a
      // pop, not a flap. After the rise it breathes almost
      // imperceptibly (one slow cycle, +/-4px and 0.6% scale), and
      // at the finale (p 0.85-1.0) the breath eases to still, so the
      // bird settles into a statue — a trophy on display.
      const riseP = smooth(clamp01(p / 0.35));
      const settle = 1 - smooth(clamp01((p - 0.85) / 0.15));
      const breath = Math.sin(p * Math.PI * 2) * riseP * settle;
      const riseY = (1 - riseP) * 56;
      const floatY = breath * 4;
      const scale = (0.96 + 0.04 * riseP) * (1 + 0.006 * breath);
      if (birdRef.current) {
        birdRef.current.style.transform = `translateY(${(riseY + floatY).toFixed(1)}px) scale(${scale.toFixed(4)})`;
        // Light reflection: the gold catches more light as the bird
        // rises into it, then holds steady at the finale.
        birdRef.current.style.filter = `brightness(${(1 + 0.06 * riseP).toFixed(3)})`;
      }
      // Glow: a warm halo behind the bird, brightening as it rises
      // and steady at the finale, like a trophy lit on display.
      if (glowRef.current) {
        glowRef.current.style.opacity = String(0.28 + 0.22 * riseP);
      }
      // Golden dust: each mote floats upward as you scroll (its own
      // rise distance, so they drift at different speeds), sways
      // gently side to side, and twinkles — fading in and out
      // slowly. They never fly out or explode; they just hang in
      // the black air around the trophy, like dust in a light beam.
      const stageH = section.clientHeight;
      const riseScale = stageH / 1000;
      dustRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = DUST[i];
        const dy = -d.rise * p * riseScale;
        const dx = Math.sin(p * Math.PI * 2 + d.phase) * d.sway * 0.5;
        const twinkle = 0.55 + 0.45 * Math.sin(p * Math.PI * 4 + d.phase);
        // The dust is present from the moment you enter (it is the
        // atmosphere of the section), and it thins very slightly at
        // the finale as the bird settles.
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
              <div className="portrait-bird" ref={birdRef}>
                <img src={PHOENIX_LUXURY_DATA_URI} alt="Golden Phoenix trophy on a black marble base" />
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
