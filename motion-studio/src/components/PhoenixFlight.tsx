import { useEffect, useRef, useState } from 'react';
import { PHOENIX_TROPHY_DATA_URI } from '../lib/phoenixTrophy';
import { PHOENIX_WINGS_UP_DATA_URI } from '../lib/phoenixWingsUp';
import { PHOENIX_WINGS_DOWN_DATA_URI } from '../lib/phoenixWingsDown';

// PhoenixFlight — the living portrait (2026-11-07, user picked this over
// the flight story). One big golden phoenix, wings spread, centred on
// pure black — no branch, no podium, no scene photo. The bird IS the
// trophy on display (its black marble base is part of the photo, and
// here that is a feature: a trophy on display, not a bird flying with
// a slab under it). It breathes gently as you scroll: wings beating
// slowly, body floating up and down, a warm glow pulsing behind it.
// The story is told by the captions changing as you scroll, while the
// bird stays centred and alive. At the end it settles, wings spread.
// Why this instead of the flight story: the flight stacked three
// photos (scene + perched bird + spread bird) and lined them up by
// fractions, and every photo's edge kept showing as a seam — a floating
// shelf, a grey band, a base travelling with the bird. Three fixes in,
// new seams kept appearing. One image cannot misalign with itself.
// (The flight story is preserved in git history — commit ec52d581 —
// and TrophyShatter.tsx is still in the repo, unused.)
// Motion — ALL of it driven by the scroll position, deliberately. Two
// beat mechanisms were tried and both failed to show in checks: a CSS
// keyframe cycle (a 1s cycle sampled 2s apart shows the same phase)
// and a JS timer (throttled in a background tab). The scroll position
// is the one mechanism that provably drives this section (the bird
// moves, the captions change, the veil faded). So the wing pose, the
// float, the glow and the entrance are all pure functions of how far
// you have scrolled. When the page is held still the bird holds a pose
// — the whole scene is scroll-driven — and it comes alive again as you
// scroll. Reduced motion: the static bird, wings spread (the initial
// styles below), no float, no flap, no glow pulse.

const CHAPTERS = [
  { start: 0.0, end: 0.12, title: 'Crafted to perfection.', sub: 'One trophy, made to celebrate one achievement — with 20+ years of expertise behind it.' },
  { start: 0.12, end: 0.3, title: 'Every win has a story.', sub: 'Effort, discipline and belief — the moments Shreeji Corporates was built to honour.' },
  { start: 0.3, end: 0.55, title: 'And then it takes flight.', sub: 'A win, finally recognised — in crystal, metal, acrylic or wood, made to your vision.' },
  { start: 0.55, end: 0.75, title: 'To its place of honour.', sub: 'For schools, sports associations, corporates, government and social bodies — every sector, every occasion.' },
  { start: 0.75, end: 0.92, title: 'Shared by many, owned by one.', sub: 'From consultation and design to production and delivery — end-to-end, under one roof.' },
  { start: 0.92, end: 1.01, title: 'We craft meaningful recognition.', sub: 'We don\u2019t just supply awards — we celebrate your success. Shreeji Corporates, New Delhi.' },
];

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const smooth = (t: number) => t * t * (3 - 2 * t);

export default function PhoenixFlight() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const birdRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const flapUpRef = useRef<HTMLDivElement | null>(null);
  const flapMidRef = useRef<HTMLDivElement | null>(null);
  const flapDownRef = useRef<HTMLDivElement | null>(null);
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
      // Entrance: the bird fades in from the black and settles to full
      // size over p 0–0.10.
      const enter = smooth(clamp01(p / 0.1));
      // Float + breath: two gentle up-and-down cycles across the
      // section, and a 1% scale breath in sync with them.
      const breath = Math.sin(p * Math.PI * 4);
      const floatY = breath * 10;
      const breathScale = 1 + 0.01 * breath;
      // Wingbeat: two slow beats across p 0.08–0.90 (up -> spread ->
      // down -> spread), so the wings change with every scroll step.
      // After p 0.90 the bird settles on the spread frame.
      const flapP = clamp01((p - 0.08) / 0.82);
      const flapStep = Math.floor(flapP * 2 * 4) % 4; // 0 up, 1 spread, 2 down, 3 spread
      const flapping = p >= 0.08 && p < 0.9;
      const setFrame = (el: HTMLDivElement | null, on: boolean) => {
        if (el) el.style.opacity = on ? '1' : '0';
      };
      setFrame(flapUpRef.current, flapping && flapStep === 0);
      setFrame(flapMidRef.current, !flapping || flapStep === 1 || flapStep === 3);
      setFrame(flapDownRef.current, flapping && flapStep === 2);
      if (birdRef.current) {
        birdRef.current.style.opacity = String(enter);
        birdRef.current.style.transform = `translateY(${floatY}px) scale(${breathScale * (0.94 + 0.06 * enter)})`;
      }
      // Glow: a warm halo behind the bird, pulsing gently with the
      // float — brighter as the bird rises, dimmer as it settles.
      if (glowRef.current) {
        glowRef.current.style.opacity = String((0.16 + 0.08 * breath) * enter);
      }
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
              <div className="portrait-bird" ref={birdRef} style={{ opacity: 0 }}>
                <div className="flap-frame flap-up" ref={flapUpRef}><img src={PHOENIX_WINGS_UP_DATA_URI} alt="" aria-hidden="true" /></div>
                <div className="flap-frame flap-mid" ref={flapMidRef} style={{ opacity: 1 }}><img src={PHOENIX_TROPHY_DATA_URI} alt="Golden Phoenix trophy, wings spread" /></div>
                <div className="flap-frame flap-down" ref={flapDownRef}><img src={PHOENIX_WINGS_DOWN_DATA_URI} alt="" aria-hidden="true" /></div>
              </div>
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
