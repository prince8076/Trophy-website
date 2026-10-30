import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  { n: '01', title: 'Educational Institutions', text: 'Awards, medals and mementos for academic excellence and convocations.' },
  { n: '02', title: 'Sports Associations', text: 'Trophies and medals for tournaments, leagues and sporting events.' },
  { n: '03', title: 'Corporate Organisations', text: 'Customised corporate gifts and employee recognition programmes.' },
  { n: '04', title: 'Government & Social Bodies', text: 'Formal mementos and medals for public service, official events and community programmes.' },
];

/** Horizontal sequence controlled by vertical scroll.
 *  Pinned on desktop (GSAP scrub), native horizontal swipe /
 *  stacked scroll on mobile via CSS. Progress bar + counter. */
export default function Horizontal() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 769px)', () => {
      if (reduced) return;
      const track = trackRef.current!;
      const getX = () => -(track.scrollWidth - window.innerWidth + 64);
      const tween = gsap.to(track, {
        x: getX, ease: 'none',
        scrollTrigger: {
          trigger: wrapRef.current, start: 'top top', end: () => `+=${track.scrollWidth}`,
          scrub: 1, pin: true, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (self) => {
            if (barRef.current) barRef.current.style.width = `${self.progress * 100}%`;
            if (countRef.current) countRef.current.textContent = String(Math.min(CARDS.length, Math.floor(self.progress * CARDS.length) + 1)).padStart(2, '0');
          },
        },
      });
      return () => { tween.scrollTrigger?.kill(); tween.kill(); };
    });
    return () => mm.revert();
  }, []);

  return (
    <section style={{ borderTop: '1px solid var(--line)' }} aria-label="Horizontal scrolling section">
      <div ref={wrapRef}>
        <div className="horiz-stage">
          <div className="wrap" style={{ width: '100%' }}>
            <p className="label">Who we serve · <span ref={countRef}>01</span> / {String(CARDS.length).padStart(2, '0')}</p>
            <h2 className="display" style={{ fontSize: 'clamp(36px, 5vw, 64px)', margin: '16px 0 28px' }}>
              Recognition for <span style={{ color: 'var(--gold)' }}>every occasion.</span>
            </h2>
          </div>
          <div ref={trackRef} className="horiz-track">
            {CARDS.map((c) => (
              <article key={c.n} className="horiz-card" data-cursor-label="View">
                <div>
                  <p className="label">{c.n}</p>
                  <h3>{c.title}</h3>
                  <p style={{ color: 'var(--muted)' }}>{c.text}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
                  <span className="label">Sector</span>
                  <ArrowRight size={18} style={{ color: 'var(--gold)' }} />
                </div>
              </article>
            ))}
          </div>
          <div className="horiz-progress" aria-hidden="true"><i ref={barRef} /></div>
        </div>
      </div>
    </section>
  );
}
