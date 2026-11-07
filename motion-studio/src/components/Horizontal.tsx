import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Briefcase, GraduationCap, Landmark, Trophy, type LucideIcon } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const CARDS: { n: string; title: string; text: string; icon: LucideIcon }[] = [
  { n: '01', title: 'Educational Institutions', text: 'Awards, medals and mementos for academic excellence and convocations.', icon: GraduationCap },
  { n: '02', title: 'Sports Associations', text: 'Trophies and medals for tournaments, leagues and sporting events.', icon: Trophy },
  { n: '03', title: 'Corporate Organisations', text: 'Customised corporate gifts and employee recognition programmes.', icon: Briefcase },
  { n: '04', title: 'Government & Social Bodies', text: 'Formal mementos and medals for public service, official events and community programmes.', icon: Landmark },
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
    // NO GSAP pin here (2026-11-07 fix). The old code pinned this section
    // with GSAP (pin: true) while .horiz-stage is ALSO position: sticky
    // in CSS — two pinning mechanisms on the same section. At the
    // StickyStory -> Horizontal boundary they fought: the previous
    // section's sticky stage was still on screen while this pinned
    // stage started, so "Made and delivered" and "Recognition for
    // every occasion." overlapped (user screenshot 2026-11-07 01:24).
    // Now the pin is pure CSS sticky, exactly like StickyStory: the
    // wrap is 100vh + the horizontal overflow tall, the stage sticks
    // for that scroll length, and ScrollTrigger only maps scroll
    // progress -> track x (no pin, no pin-spacer, nothing to desync).
    mm.add('(min-width: 769px)', () => {
      if (reduced) return;
      const track = trackRef.current!;
      const wrap = wrapRef.current!;
      const setHeight = () => {
        const overflow = Math.max(0, track.scrollWidth - window.innerWidth + 64);
        // Scroll length = the full track width, as the old GSAP pin had
        // (end += track.scrollWidth). Using only the overflow here made
        // the slide and the 01/04 counter jump in ~284px of scroll.
        wrap.style.height = `${window.innerHeight + track.scrollWidth}px`;
        return overflow;
      };
      let overflow = setHeight();
      const st = ScrollTrigger.create({
        trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: (self) => {
          gsap.set(track, { x: -overflow * self.progress });
          if (barRef.current) barRef.current.style.width = `${self.progress * 100}%`;
          if (countRef.current) countRef.current.textContent = String(Math.min(CARDS.length, Math.floor(self.progress * CARDS.length) + 1)).padStart(2, '0');
        },
      });
      const onResize = () => { overflow = setHeight(); ScrollTrigger.refresh(); };
      window.addEventListener('resize', onResize);
      // Card widths depend on fonts; re-measure once they arrive, or
      // the wrap can be a few px short and the last card never fully enters.
      if (typeof document !== 'undefined' && document.fonts) {
        document.fonts.ready.then(() => { overflow = setHeight(); ScrollTrigger.refresh(); }).catch(() => {});
      }
      return () => {
        window.removeEventListener('resize', onResize);
        st.kill();
        wrap.style.height = '';
        gsap.set(track, { x: 0 });
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <section style={{ borderTop: '1px solid var(--line)' }} aria-label="Horizontal scrolling section">
      <div ref={wrapRef}>
        <div className="horiz-stage">
          <div className="wrap" style={{ width: '100%' }}>
            <p className="label">Who we serve<span className="horiz-count"> · <span ref={countRef}>01</span> / {String(CARDS.length).padStart(2, '0')}</span></p>
            <h2 className="display" style={{ fontSize: 'clamp(36px, 5vw, 64px)', margin: '16px 0 28px' }}>
              Recognition for <span style={{ color: 'var(--gold)' }}>every occasion.</span>
            </h2>
          </div>
          <div ref={trackRef} className="horiz-track">
            {CARDS.map((c) => {
              const Icon = c.icon;
              return (
              <article key={c.n} className="horiz-card">
                <div>
                  <span className="horiz-icon" aria-hidden="true"><Icon size={26} strokeWidth={1.75} /></span>
                  <p className="label">{c.n}</p>
                  <h3>{c.title}</h3>
                  <p style={{ color: 'var(--muted)' }}>{c.text}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
                  <span className="label">Sector</span>
                  <ArrowRight size={18} style={{ color: 'var(--gold)' }} />
                </div>
              </article>
              );
            })}
          </div>
          <div className="horiz-progress" aria-hidden="true"><i ref={barRef} /></div>
          <p className="label horiz-cue" style={{ textAlign: 'center', marginTop: 14 }}>Scroll to explore the sectors →</p>
        </div>
      </div>
    </section>
  );
}
