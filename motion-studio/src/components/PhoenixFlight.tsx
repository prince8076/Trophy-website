import { useEffect, useRef, useState } from 'react';
import { PHOENIX_TROPHY_DATA_URI } from '../lib/phoenixTrophy';

// PhoenixFlight — the flying phoenix, NOT the shatter (2026-11-07).
// The user loved the phoenix ("Phoenix is flying") but the tile shatter
// did not look good — big rectangular tiles, faint seams on the bird at
// rest — so the shatter is gone from this section. Same black pinned
// stage, same overlay label / chapter block / orange progress line, same
// 400vh scroll length: only the motion changes. The whole phoenix glides
// up and across as you scroll (a flight path, not a break), with a gentle
// idle bob so it feels alive even when you are not scrolling. The photo
// is the same embedded base64 phoenix — nothing new downloads.
// TrophyShatter.tsx is kept in the repo untouched, in case the shatter
// is ever wanted back. Reduced motion: static phoenix, no flight, no bob.
const PHOENIX_URL = PHOENIX_TROPHY_DATA_URI;

// Chapter text, from the Shreeji Corporates company profile the user
// supplied (NOT invented): 20+ years, led by Ms. Madhu Sharma, trophies
// / awards / medals / mementos / corporate gifts, materials crystal /
// metal / acrylic / wood, end-to-end consultation / design / production /
// delivery, serving schools, sports, corporates, government and social
// bodies, based in New Delhi. Only the shatter-specific line changed:
// "The moment breaks open." is now "And then it takes flight."
const CHAPTERS = [
  { start: 0.0, end: 0.08, title: 'Crafted to perfection.', sub: 'One trophy, made to celebrate one achievement — with 20+ years of expertise behind it.' },
  { start: 0.08, end: 0.25, title: 'Every win has a story.', sub: 'Effort, discipline and belief — the moments Shreeji Corporates was built to honour.' },
  { start: 0.25, end: 0.5, title: 'And then it takes flight.', sub: 'A win, finally recognised — in crystal, metal, acrylic or wood, made to your vision.' },
  { start: 0.5, end: 0.75, title: 'Shared by many, owned by one.', sub: 'For schools, sports associations, corporates, government and social bodies — every sector, every occasion.' },
  { start: 0.75, end: 0.97, title: 'Recognition that reaches everyone.', sub: 'From consultation and design to production and delivery — end-to-end, under one roof.' },
  { start: 0.97, end: 1.01, title: 'We craft meaningful recognition.', sub: 'We don\u2019t just supply awards — we celebrate your success. Shreeji Corporates, New Delhi.' },
];

export default function PhoenixFlight() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const flightRef = useRef<HTMLDivElement | null>(null);
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
      const p = Math.min(Math.max(-rect.top / (rect.height - vh), 0), 1);
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
      if (chapterRef.current) {
        const c = CHAPTERS.find((ch) => p >= ch.start && p < ch.end) || CHAPTERS[CHAPTERS.length - 1];
        chapterRef.current.textContent = c.title;
        if (chapterSubRef.current) chapterSubRef.current.textContent = c.sub;
      }
      // Flight path: starts low-left, rises to high-right, slight bank.
      // eased so it moves gently, never jumps.
      const e = p * p * (3 - 2 * p); // smoothstep
      if (flightRef.current) {
        const x = -4 + e * 8; // vw
        const y = 8 - e * 14; // vh
        const rot = -2 + e * 4; // deg
        const scale = 0.96 + e * 0.08;
        flightRef.current.style.transform = `translate(${x}vw, ${y}vh) rotate(${rot}deg) scale(${scale})`;
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
            <div className="flight-img-wrap" ref={flightRef}>
              <img
                src={PHOENIX_URL}
                alt="Golden Phoenix trophy"
                className="flight-img"
                loading="lazy"
              />
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
