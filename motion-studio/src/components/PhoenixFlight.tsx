import { useEffect, useRef, useState } from 'react';
import { PHOENIX_TROPHY_DATA_URI } from '../lib/phoenixTrophy';
import { PHOENIX_WINGS_UP_DATA_URI } from '../lib/phoenixWingsUp';
import { PHOENIX_WINGS_DOWN_DATA_URI } from '../lib/phoenixWingsDown';
import { PHOENIX_SCENE_DATA_URI } from '../lib/phoenixScene';
import { PHOENIX_PERCHED_DATA_URI } from '../lib/phoenixPerched';

// PhoenixFlight — the phoenix story, scroll-driven (2026-11-07).
// The user asked: the phoenix sits on a tree branch, then flies in a
// smooth way, moves onto the trophy podium, and becomes a trophy. So
// this section is a little scene in four beats, all on the same black
// pinned stage:
//   1. perched — the folded-wings phoenix sits on the branch, barely
//      swaying, wings tucked.
//   2. takeoff — it lifts off the branch and fades as the spread-wings
//      phoenix fades in above it, wings opening.
//   3. flight — it arcs up and across to the podium, wings beating
//      (three frames of the same bird: up / spread / down, 1s per flap).
//   4. landing + becomes a trophy — it settles onto the podium, the
//      beating stops, and it stands still on its marble base, wings
//      spread: a flying bird turned into a trophy on display.
// How it is built: three photos, all 1920x1280, sharing one box, so
// every position is a fraction of that box. The scene (branch + podium)
// is the background layer. The two phoenix photos have pure black
// backgrounds, so they sit on top with mix-blend-mode: screen — the
// black turns transparent and only the gold bird shows. Nothing here
// breaks or shatters; the old tile shatter is gone (TrophyShatter.tsx
// stays in the repo, unused, in case it is ever wanted back).
// Geometry — MEASURED, not estimated (visual grounding, 2026-11-07):
// scene branch top at (0.26, 0.36), podium top centre at (0.777, 0.50);
// perched bird's feet at (0.488, 0.908), crest top at (0.512, 0.048);
// spread bird's base bottom at (0.494, 0.990), crest top at (0.484,
// 0.028). The layers pivot on those foot/base points (see CSS), and
// the translates below put them on the branch / podium top exactly.
// The earlier estimate put the podium top at 0.475 (25px too high —
// the bird floated on a shelf above the podium) and the perch at 0.35
// with a 12px bob (the feet left the branch half the time). Both are
// fixed here: perch feet at y 0.35 on the branch top, bob is now a 3px
// sway, and the base lands on the measured podium top (0.50).
// Scales are chosen so the head stays in frame at every beat (perched
// 0.38, flight start 0.35, mid-flight dip 0.30, landed 0.46, finale
// 0.48). The flight ends at p 0.55, exactly when "To its place of
// honour." appears, so the bird is ON the podium for that caption.
// Reduced motion: the static perched bird on the branch (the initial
// styles below), no flight, no sway, no flap.

const PERCH = { x: -16.3, y: -55.8 }; // perched layer: feet -> branch top
const SPREAD_START = { x: -16.9, y: -64 }; // spread layer: base -> branch top
const PODIUM = { x: 28.3, y: -49 }; // spread layer: base -> podium top
const PERCHED_SCALE = 0.38;
const FLIGHT_START_SCALE = 0.35;
const LANDED_SCALE = 0.46;
const FINALE_SCALE = 0.48;

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
  const flapUpRef = useRef<HTMLDivElement | null>(null);
  const flapMidRef = useRef<HTMLDivElement | null>(null);
  const flapDownRef = useRef<HTMLDivElement | null>(null);
  const flapActiveRef = useRef(false);
  const flapPhaseRef = useRef(1); // 0 up, 1 spread, 2 down, 3 spread
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
      // Takeoff: the perched bird lifts off the branch and fades out
      // over p 0.20–0.26 (short, so the two birds never double-expose),
      // while the spread bird fades in over p 0.24–0.30, already rising.
      const lift = smooth(clamp01((p - 0.2) / 0.06));
      const fadeOut = clamp01((p - 0.2) / 0.06);
      if (perchedRef.current) {
        perchedRef.current.style.opacity = String(1 - fadeOut);
        perchedRef.current.style.transform = `translate(${PERCH.x}%, ${PERCH.y - lift * 4}%) scale(${PERCHED_SCALE})`;
      }
      const fadeIn = clamp01((p - 0.24) / 0.06);
      // Flight: branch -> podium over p 0.28–0.55, arcing up mid-way so
      // the bird is clearly airborne, well above branch and podium.
      const t = smooth(clamp01((p - 0.28) / 0.27));
      const x = SPREAD_START.x + (PODIUM.x - SPREAD_START.x) * t;
      let y = SPREAD_START.y + (PODIUM.y - SPREAD_START.y) * t - Math.sin(Math.PI * t) * 12;
      let scale = FLIGHT_START_SCALE + (LANDED_SCALE - FLIGHT_START_SCALE) * t - 0.1 * Math.sin(Math.PI * t);
      let rot = -4 + 6 * t;
      // Finale: p 0.75–0.92 — the bird becomes the trophy: still, wings
      // spread, a touch larger, reared up on the podium.
      const f = smooth(clamp01((p - 0.75) / 0.17));
      scale += (FINALE_SCALE - LANDED_SCALE) * f;
      y -= 1 * f;
      rot *= 1 - f;
      if (spreadRef.current) {
        spreadRef.current.style.opacity = String(fadeIn);
        spreadRef.current.style.transform = `translate(${x}%, ${y}%) rotate(${rot}deg) scale(${scale})`;
      }
      // Wings beat while it flies (takeoff through landing); settled on
      // the spread frame once it lands and becomes the trophy. The beat
      // is driven by a timer below, not by CSS — see the note there.
      flapActiveRef.current = p >= 0.28 && p < 0.58;
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

  // Wingbeat driver — a timer, deliberately NOT a CSS animation. The
  // CSS version (1s keyframe cycle) was verified live in the bundle but
  // a browser check held the page still for 2s at a time and saw no
  // wing movement: a 1s cycle sampled 2s apart shows the same phase,
  // and CSS animations can also be frozen by a reduced-motion setting.
  // This timer sets the frame opacities directly every 225ms (0.9s per
  // flap: up -> spread -> down -> spread), so the beat is visible at any
  // sampling interval and runs independently of scrolling. It only
  // advances while the bird is flying (flapActiveRef, set by draw());
  // otherwise the spread frame shows.
  useEffect(() => {
    if (reducedMotion) return undefined;
    const setFrame = (el: HTMLDivElement | null, on: boolean) => {
      if (el) el.style.opacity = on ? '1' : '0';
    };
    const id = window.setInterval(() => {
      if (flapActiveRef.current) {
        flapPhaseRef.current = (flapPhaseRef.current + 1) % 4;
      }
      const phase = flapActiveRef.current ? flapPhaseRef.current : 1;
      setFrame(flapUpRef.current, phase === 0);
      setFrame(flapMidRef.current, phase === 1 || phase === 3);
      setFrame(flapDownRef.current, phase === 2);
    }, 225);
    return () => window.clearInterval(id);
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
                <img src={PHOENIX_PERCHED_DATA_URI} alt="Golden Phoenix sitting on a tree branch" className="perch-sway-img" />
              </div>
              <div
                className="flight-spread"
                ref={spreadRef}
                style={{ opacity: 0, transform: `translate(${SPREAD_START.x}%, ${SPREAD_START.y}%) scale(${FLIGHT_START_SCALE})` }}
              >
                <div className="flap-frame flap-up" ref={flapUpRef}><img src={PHOENIX_WINGS_UP_DATA_URI} alt="" aria-hidden="true" /></div>
                <div className="flap-frame flap-mid" ref={flapMidRef} style={{ opacity: 1 }}><img src={PHOENIX_TROPHY_DATA_URI} alt="Golden Phoenix with wings spread" /></div>
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
