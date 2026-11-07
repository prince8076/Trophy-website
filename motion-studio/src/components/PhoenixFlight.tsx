import { useEffect, useRef, useState } from 'react';
import { PHOENIX_TROPHY_DATA_URI } from '../lib/phoenixTrophy';
import { PHOENIX_WINGS_UP_DATA_URI } from '../lib/phoenixWingsUp';
import { PHOENIX_WINGS_DOWN_DATA_URI } from '../lib/phoenixWingsDown';
import { PHOENIX_BASE_DATA_URI } from '../lib/phoenixBase';

// PhoenixFlight — the living portrait (2026-11-07, user picked this over
// the flight story), now with feather shatter (user idea 2026-11-07:
// "while it is spreading its wing it is shattering"). One big golden
// phoenix, wings spread, centred on pure black — no branch, no podium,
// no scene photo. The bird IS the trophy on display. As you scroll it
// breathes gently (wings beating slowly, body floating, a warm glow
// pulsing behind it) — and as the wings spread, golden feather shards
// break off the wingtips and tail and drift away, fading as they fly.
// The story is told by the captions changing as you scroll, while the
// bird stays centred and alive. At the end it settles, wings spread.
// Why this instead of the flight story: the flight stacked three
// photos (scene + perched bird + spread bird) and lined them up by
// fractions, and every photo's edge kept showing as a seam — a floating
// shelf, a grey band, a base travelling with the bird. Three fixes in,
// new seams kept appearing. One image cannot misalign with itself.
// (The flight story is preserved in git history — commit ec52d581 —
// and TrophyShatter.tsx is still in the repo, unused.)
// The bird photo itself is cropped (bottom 12.5% cut off in the lib
// files, 2026-11-07): the marble base and the grey reflective floor are
// gone, so the bird floats on pure black and the grey shelf/band the
// checks kept seeing cannot come back — it was IN the photo.
// Motion — ALL of it driven by the scroll position, deliberately. Two
// beat mechanisms were tried and both failed to show in checks: a CSS
// keyframe cycle (a 1s cycle sampled 2s apart shows the same phase)
// and a JS timer (throttled in a background tab). The scroll position
// is the one mechanism that provably drives this section (the bird
// moves, the captions change, the veil faded). So the wing pose, the
// float, the glow, the feather shards and the entrance are all pure
// functions of how far you have scrolled. When the page is held still
// the bird holds a pose — the whole scene is scroll-driven — and it
// comes alive again as you scroll. Reduced motion: the static bird,
// wings spread (the initial styles below), no float, no flap, no glow
// pulse, no shards.

const CHAPTERS = [
  { start: 0.0, end: 0.12, title: 'Crafted to perfection.', sub: 'One trophy, made to celebrate one achievement — with 20+ years of expertise behind it.' },
  { start: 0.12, end: 0.3, title: 'It begins with effort.', sub: 'Effort, discipline and belief — the moments Shreeji Corporates was built to honour.' },
  { start: 0.3, end: 0.55, title: 'And then it takes flight.', sub: 'A win, finally recognised — in crystal, metal, acrylic or wood, made to your vision.' },
  { start: 0.55, end: 0.75, title: 'To its place of honour.', sub: 'For schools, sports associations, corporates, government and social bodies — every sector, every occasion.' },
  { start: 0.75, end: 0.92, title: 'Shared by many, owned by one.', sub: 'From consultation and design to production and delivery — end-to-end, under one roof.' },
  { start: 0.92, end: 1.01, title: 'We craft meaningful recognition.', sub: 'We don\u2019t just supply awards — we celebrate your success. Shreeji Corporates, New Delhi.' },
];

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const smooth = (t: number) => t * t * (3 - 2 * t);

// Feather shards — golden fragments that break off as the wings spread.
// A fixed seed so the layout is identical on every load. Origins are
// % of the portrait box, clustered on the two wingtips and the tail;
// angle is the flight direction in degrees (0 = right, 90 = down,
// 180 = left, -90 = up); dist is px at a 1100px-wide box and is scaled
// by the box width, so it works on mobile too.
type Shard = { x: number; y: number; angle: number; dist: number; size: number; delay: number; rot: number; spin: number };
const mulberry32 = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const buildShards = (): Shard[] => {
  const rand = mulberry32(20261107);
  const shards: Shard[] = [];
  const cluster = (count: number, x0: number, x1: number, y0: number, y1: number, a0: number, a1: number) => {
    for (let i = 0; i < count; i++) {
      shards.push({
        x: x0 + rand() * (x1 - x0),
        y: y0 + rand() * (y1 - y0),
        angle: a0 + rand() * (a1 - a0),
        dist: 50 + rand() * 110,
        size: 5 + rand() * 11,
        delay: rand() * 0.45,
        rot: rand() * 360,
        spin: (rand() - 0.5) * 240,
      });
    }
  };
  // Left wingtip — fly left / up-left / down-left.
  cluster(10, 2, 12, 6, 38, 110, 250);
  // Right wingtip — fly right.
  cluster(10, 88, 98, 6, 38, -70, 70);
  // Tail — drift down and out.
  cluster(8, 42, 58, 82, 95, 30, 150);
  return shards;
};
const SHARDS = buildShards();

export default function PhoenixFlight() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const birdRef = useRef<HTMLDivElement | null>(null);
  const baseRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const flapUpRef = useRef<HTMLDivElement | null>(null);
  const flapMidRef = useRef<HTMLDivElement | null>(null);
  const flapDownRef = useRef<HTMLDivElement | null>(null);
  const shardRefs = useRef<(HTMLDivElement | null)[]>([]);
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
      // Entrance: the bird is visible from the moment you enter the
      // section (no fade-in — the old fade left the first viewport
      // almost empty, just a header and a tiny dot). It only settles
      // from 0.92 to full size over p 0–0.08.
      const enter = smooth(clamp01(p / 0.08));
      // Finale: over p 0.90–1.0 the living phoenix becomes the trophy
      // (user idea 2026-11-07: "after that final scroll it will become
      // trophy"). The marble base fades in and rises under the bird,
      // the float and breath ease to still, the glow steadies, the
      // shattering stops — a living bird settling into a statue.
      const baseP = smooth(clamp01((p - 0.9) / 0.1));
      const settle = 1 - baseP;
      // Float + breath: three gentle up-and-down cycles across the
      // section (was two — the shorter 240vh scroll needs a livelier
      // bird or it reads as a still image), and a 1.5% scale breath
      // in sync with them — both easing to still as the bird becomes
      // a trophy.
      const breath = Math.sin(p * Math.PI * 6);
      const floatY = breath * 18 * settle;
      const breathScale = 1 + 0.015 * breath * settle;
      // Wingbeat: three slow beats across p 0.08–0.90 (up -> spread ->
      // down -> spread), so the wings change with every scroll step.
      // After p 0.90 the bird settles on the spread frame.
      const flapP = clamp01((p - 0.08) / 0.82);
      const flapStep = Math.floor(flapP * 3 * 4) % 4; // 0 up, 1 spread, 2 down, 3 spread
      const flapping = p >= 0.08 && p < 0.9;
      const setFrame = (el: HTMLDivElement | null, on: boolean) => {
        if (el) el.style.opacity = on ? '1' : '0';
      };
      setFrame(flapUpRef.current, flapping && flapStep === 0);
      setFrame(flapMidRef.current, !flapping || flapStep === 1 || flapStep === 3);
      setFrame(flapDownRef.current, flapping && flapStep === 2);
      if (birdRef.current) {
        birdRef.current.style.transform = `translateY(${floatY}px) scale(${breathScale * (0.92 + 0.08 * enter)})`;
      }
      // Glow: a warm halo behind the bird, pulsing gently with the
      // float — brighter as the bird rises, dimmer as it settles, then
      // steady at the finale, like a trophy lit on display.
      if (glowRef.current) {
        glowRef.current.style.opacity = String(0.3 + 0.22 * breath * settle + 0.1 * baseP);
      }
      // The trophy base: fades in and rises 12px under the bird as the
      // finale runs (p 0.90–1.0). Before that it is invisible.
      if (baseRef.current) {
        baseRef.current.style.opacity = String(baseP);
        baseRef.current.style.transform = `translate(-50%, ${(1 - baseP) * 12}px)`;
      }
      // Feather shatter: how spread the wings are right now — 0 at
      // up/down, 1 at spread, smooth in between (phase 0 up, 1 spread,
      // 2 down, 3 spread; three beats, so phase runs 0–12). As the
      // wings spread, each shard flies out from its wingtip/tail
      // origin and fades; when the wings fold, the shards are hidden
      // again. Scrolling back gathers them in — the whole section is
      // a scrub, so the shatter scrubs too.
      const phase = (flapP * 12) % 4;
      const spreadness = Math.abs(Math.sin((phase * Math.PI) / 2));
      const boxW = boxRef.current ? boxRef.current.clientWidth : 1100;
      const distScale = boxW / 1100;
      shardRefs.current.forEach((el, i) => {
        if (!el) return;
        const s = SHARDS[i];
        const t = clamp01((spreadness - s.delay) / (1 - s.delay));
        const ease = 1 - (1 - t) * (1 - t);
        const rad = (s.angle * Math.PI) / 180;
        const dx = Math.cos(rad) * s.dist * ease * distScale;
        const dy = Math.sin(rad) * s.dist * ease * distScale;
        el.style.opacity = String(spreadness * (1 - t) * 1.0);
        el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${(s.rot + s.spin * t).toFixed(1)}deg) scale(${(1 - 0.3 * t).toFixed(2)})`;
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
            <div className="portrait-box" ref={boxRef}>
              <div className="portrait-glow" ref={glowRef} aria-hidden="true" />
              <div className="portrait-bird" ref={birdRef}>
                <div className="flap-frame flap-up" ref={flapUpRef}><img src={PHOENIX_WINGS_UP_DATA_URI} alt="" aria-hidden="true" /></div>
                <div className="flap-frame flap-mid" ref={flapMidRef} style={{ opacity: 1 }}><img src={PHOENIX_TROPHY_DATA_URI} alt="Golden Phoenix trophy, wings spread" /></div>
                <div className="flap-frame flap-down" ref={flapDownRef}><img src={PHOENIX_WINGS_DOWN_DATA_URI} alt="" aria-hidden="true" /></div>
                <div className="feather-shards" aria-hidden="true">
                  {SHARDS.map((s, i) => (
                    <div
                      key={i}
                      className="feather-shard"
                      ref={(el) => { shardRefs.current[i] = el; }}
                      style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: `${s.size}px`,
                        height: `${(s.size * 1.6).toFixed(1)}px`,
                        transform: `rotate(${s.rot}deg)`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="trophy-base" ref={baseRef} aria-hidden="true"><img src={PHOENIX_BASE_DATA_URI} alt="" /></div>
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
