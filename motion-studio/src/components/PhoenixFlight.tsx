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
//   2. takeoff — it lifts off the branch and vanishes, then the
//      spread-wings phoenix appears at the same spot, wings open.
//   3. flight — it arcs up and across to the podium, wings beating
//      (three frames of the same bird: up / spread / down, 3 beats
//      across the flight, driven by the scroll itself so the wings
//      change with every scroll step — see the note in draw()).
//   4. landing + becomes a trophy — it settles onto the podium, the
//      beating stops, its marble base appears, and the podium itself
//      is revealed — a flying bird turned into a trophy on its stand.
// How it is built: three photos, all 1920x1280, sharing one box, so
// every position is a fraction of that box. The scene (branch + podium)
// is the background layer. The two phoenix photos have pure black
// backgrounds, so they sit on top with mix-blend-mode: screen — the
// black turns transparent and only the gold bird shows. Nothing here
// breaks or shatters; the old tile shatter is gone (TrophyShatter.tsx
// stays in the repo, unused, in case it is ever wanted back).
// Geometry — MEASURED, not estimated (visual grounding, 2026-11-07):
// scene branch top at the bird's x (0.333, 0.365); podium slab top
// face at (0.777, 0.496) back edge to (0.778, 0.564) front edge, slab
// spanning x 0.633–0.923 — the bird's base sits on the top face at
// y 0.53 (mid-face, not the back edge: the earlier 0.50 put it 30px
// above the face and it floated); perched bird's feet (0.488, 0.913),
// crest (0.512, 0.049); spread bird's base bottom (0.494, 0.991),
// base top (0.494, 0.897), crest (0.484, 0.031). The layers pivot on
// those foot/base points (see CSS), and the translates below put them
// on the branch / podium top exactly.
// Two things the photos force, fixed here rather than fought:
//   - The stand (podium) is part of the scene photo, so it would sit
//     there empty while the bird flies. The user wants it to show
//     only once the phoenix is sitting on it. So a black veil covers
//     the podium region until the landing (p 0.55), then fades out
//     over p 0.55–0.70 — the stand appears as the bird settles on it.
//     (The veil is pure black on a pure black background, so its edges
//     are invisible; it sits between the scene and the bird layers, so
//     the bird is never hidden by it.)
//   - The spread bird's photo includes its black marble base, so in
//     flight it looked like it was standing on a slab sliding along a
//     shelf. So while it flies the base is clipped off the bottom of
//     the layer (11% — the base spans y 0.897–0.991, the tail ends at
//     ~0.85, so the clip takes the base and keeps the tail), and the
//     clip opens again as it lands (p 0.55–0.65) — the base appearing
//     is part of it becoming a trophy.
// Takeoff is sequential, not a cross-fade: the perched bird lifts and
// fades out (p 0.20–0.25) BEFORE the spread bird fades in (p 0.26–
// 0.32), so the two birds are never visible at the same spot at the
// same time (the earlier overlap put a second head inside the spread
// bird's chest).
// Scales are chosen so the head stays in frame at every beat (perched
// 0.38, flight start 0.35, mid-flight dip 0.30, landed 0.46, finale
// 0.48). The flight ends at p 0.55, exactly when "To its place of
// honour." appears, so the bird is ON the podium for that caption.
// Reduced motion: the static perched bird on the branch (the initial
// styles below), no flight, no sway, no flap.

const PERCH = { x: -15.5, y: -54.8 }; // perched layer: feet -> branch top
const SPREAD_START = { x: -16.1, y: -62.6 }; // spread layer: base -> branch top
const PODIUM = { x: 28.3, y: -46.1 }; // spread layer: base -> podium top face
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
  const veilRef = useRef<HTMLDivElement | null>(null);
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
      // Takeoff, sequential: the perched bird lifts off the branch and
      // fades out over p 0.20–0.25, and only then does the spread bird
      // fade in (p 0.26–0.32) at the same spot, wings open.
      const lift = smooth(clamp01((p - 0.2) / 0.05));
      const fadeOut = clamp01((p - 0.2) / 0.05);
      if (perchedRef.current) {
        perchedRef.current.style.opacity = String(1 - fadeOut);
        perchedRef.current.style.transform = `translate(${PERCH.x}%, ${PERCH.y - lift * 6}%) scale(${PERCHED_SCALE})`;
      }
      const fadeIn = clamp01((p - 0.26) / 0.06);
      // Flight: branch -> podium over p 0.28–0.55, arcing up mid-way so
      // the bird is clearly airborne, well above branch and podium. It
      // climbs steeply, hangs small and high mid-flight, then dives to
      // the podium — a real arc, not a level slide.
      const t = smooth(clamp01((p - 0.28) / 0.27));
      const x = SPREAD_START.x + (PODIUM.x - SPREAD_START.x) * t;
      let y = SPREAD_START.y + (PODIUM.y - SPREAD_START.y) * t - Math.sin(Math.PI * t) * 16;
      let scale = FLIGHT_START_SCALE + (LANDED_SCALE - FLIGHT_START_SCALE) * t - 0.14 * Math.sin(Math.PI * t);
      let rot = -4 + 6 * t;
      // Wingbeat, driven by the scroll itself — not by a timer and not
      // by CSS. Two beat mechanisms were tried and both failed to show
      // in checks (a 1s CSS cycle sampled 2s apart shows the same
      // phase, and a JS timer can be throttled in a background tab),
      // while the scroll position provably drives this section. So the
      // wing pose is a pure function of how far the bird has flown: 3
      // full beats across the flight (up -> spread -> down -> spread),
      // so the wings visibly change with every scroll step. The body
      // bobs and banks a touch with each beat, the way a real bird's
      // body lifts on the downstroke — that sync is what makes it read
      // as flying instead of gliding. When the page is held still the
      // whole scene holds still (it is scroll-driven), and once the
      // bird lands the wings settle on the spread frame.
      const flapping = p >= 0.28 && p < 0.58;
      const flapLinear = clamp01((p - 0.28) / 0.27);
      const flapStep = Math.floor(flapLinear * 3 * 4) % 4; // 0 up, 1 spread, 2 down, 3 spread
      const w = Math.sin(flapLinear * 3 * Math.PI * 2); // +1 wings up, -1 wings down
      if (flapping) {
        y += w * 1.2; // body lifts on the downstroke, dips on the upstroke
        rot += w * 2; // slight bank with each beat
      }
      const setFrame = (el: HTMLDivElement | null, on: boolean) => {
        if (el) el.style.opacity = on ? '1' : '0';
      };
      setFrame(flapUpRef.current, flapping && flapStep === 0);
      setFrame(flapMidRef.current, !flapping || flapStep === 1 || flapStep === 3);
      setFrame(flapDownRef.current, flapping && flapStep === 2);
      // Finale: p 0.75–0.92 — the bird becomes the trophy: still, wings
      // spread, a touch larger, reared up on the podium.
      const f = smooth(clamp01((p - 0.75) / 0.17));
      scale += (FINALE_SCALE - LANDED_SCALE) * f;
      y -= 1 * f;
      rot *= 1 - f;
      if (spreadRef.current) {
        spreadRef.current.style.opacity = String(fadeIn);
        spreadRef.current.style.transform = `translate(${x}%, ${y}%) rotate(${rot}deg) scale(${scale})`;
        // Base clip: the marble base is hidden while the bird flies
        // (it would read as a slab sliding along a shelf) and appears
        // as it lands — 0% before takeoff, 11% in flight, back to 0%
        // as it settles (p 0.55–0.65).
        const clip =
          11 *
          (smooth(clamp01((p - 0.28) / 0.07)) - smooth(clamp01((p - 0.55) / 0.1)));
        spreadRef.current.style.clipPath = `inset(0 0 ${clip}% 0)`;
      }
      // Veil: the podium (stand) stays hidden until the bird lands on
      // it, then is revealed over p 0.55–0.70.
      if (veilRef.current) {
        veilRef.current.style.opacity = String(1 - smooth(clamp01((p - 0.55) / 0.15)));
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
              <div className="flight-veil" ref={veilRef} aria-hidden="true" />
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
