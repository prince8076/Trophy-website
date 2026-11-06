import { useEffect, useRef, useState } from 'react';
import { PHOENIX_TROPHY_DATA_URI } from '../lib/phoenixTrophy';
import { PHOENIX_SCENE_DATA_URI } from '../lib/phoenixScene';
import { PHOENIX_PERCHED_DATA_URI } from '../lib/phoenixPerched';

// PhoenixFlight — the phoenix story, scroll-driven (2026-11-07).
// The user asked: the phoenix sits on a tree branch, then flies, then
// sits on a trophy podium and spreads its wings. So this section is a
// little scene in four beats, all on the same black pinned stage:
//   1. perched — the folded-wings phoenix sits on the branch, bobbing
//      gently, wings tucked.
//   2. takeoff — it cross-fades into the spread-wings phoenix (the
//      wings opening) as it leaves the branch.
//   3. flight — it arcs up and across to the podium, banking slightly.
//   4. landing + wings spread — it settles on the podium and grows a
//      touch, wings wide, for the finale.
// How it is built: three photos, all 1920x1280, sharing one box, so
// every position is a fraction of that box. The scene (branch + podium)
// is the background layer. The two phoenix photos have pure black
// backgrounds, so they sit on top with mix-blend-mode: screen — the
// black turns transparent and only the gold bird shows. Nothing here
// breaks or shatters; the old tile shatter is gone (TrophyShatter.tsx
// stays in the repo, unused, in case it is ever wanted back).
// Geometry, measured from the scene photo: the branch perch is at
// (0.33, 0.35) and the podium top at (0.76, 0.475). Both phoenix
// photos have their foot/base point at (0.50, 0.92), so the layers use
// transform-origin 50% 92% and translate in % of the box to put that
// point where it belongs. Scales are chosen so the bird's head stays
// in frame at every beat (perched 0.38, landed 0.45, finale 0.50).
// Reduced motion: the static perched bird on the branch (the initial
// styles below), no flight, no bob.

const PERCH = { x: -17, y: -57 }; // translate %: foot point -> branch perch
const PODIUM = { x: 26, y: -44.5 }; // translate %: base point -> podium top
const PERCHED_SCALE = 0.38;
const LANDED_SCALE = 0.45;
const FINALE_SCALE = 0.5;

// Chapter text, from the Shreeji Corporates company profile the user
// supplied (NOT invented): 20+ years, led by Ms. Madhu Sharma, trophies
// / awards / medals / mementos / corporate gifts, materials crystal /
// metal / acrylic / wood, end-to-end consultation / design / production /
// delivery, serving schools, sports, corporates, government and social
// bodies, based in New Delhi.
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
  const perchedRef = useRef<HTMLDivElement | null>(null);
  const spreadRef = useRef<HTMLDivElement | null>(null);
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
      // Takeoff cross-fade: folded wings out, spread wings in, p 0.22–0.32.
      const fade = clamp01((p - 0.22) / 0.1);
      if (perchedRef.current) perchedRef.current.style.opacity = String(1 - fade);
      // Flight: branch -> podium over p 0.32–0.68, arcing up mid-way.
      const t = smooth(clamp01((p - 0.32) / 0.36));
      const x = PERCH.x + (PODIUM.x - PERCH.x) * t;
      let y = PERCH.y + (PODIUM.y - PERCH.y) * t - Math.sin(Math.PI * t) * 8;
      let scale = PERCHED_SCALE + (LANDED_SCALE - PERCHED_SCALE) * t - 0.04 * Math.sin(Math.PI * t);
      let rot = -4 + 6 * t;
      // Finale: p 0.78–1 — wings spread: grow a touch and rear up.
      const f = smooth(clamp01((p - 0.78) / 0.22));
      scale += (FINALE_SCALE - LANDED_SCALE) * f;
      y -= 2 * f;
      rot *= 1 - f;
      if (spreadRef.current) {
        spreadRef.current.style.opacity = String(fade);
        spreadRef.current.style.transform = `translate(${x}%, ${y}%) rotate(${rot}deg) scale(${scale})`;
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
            <div className="flight-scene-box">
              <img src={PHOENIX_SCENE_DATA_URI} alt="" aria-hidden="true" className="flight-scene" />
              <div
                className="flight-perched"
                ref={perchedRef}
                style={{ transform: `translate(${PERCH.x}%, ${PERCH.y}%) scale(${PERCHED_SCALE})` }}
              >
                <img src={PHOENIX_PERCHED_DATA_URI} alt="Golden Phoenix sitting on a tree branch" className="flight-bob-img" />
              </div>
              <div
                className="flight-spread"
                ref={spreadRef}
                style={{ opacity: 0, transform: `translate(${PERCH.x}%, ${PERCH.y}%) scale(${PERCHED_SCALE})` }}
              >
                <img src={PHOENIX_TROPHY_DATA_URI} alt="Golden Phoenix with wings spread" />
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
