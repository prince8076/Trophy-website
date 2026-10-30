import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Real product photos, not abstract shapes: the empty orb/bars/grid panel
// was what looked like blank space. These files are already in the repo
// at motion-studio/public/trophies/ (user push 473860f), so they load live.
const STAGES = [
  { title: 'Tell us on WhatsApp', text: 'Send your occasion, design idea and quantity on WhatsApp or email — no checkout, no forms, just a message.', image: '/trophies/championship-cup-prince.jpg' },
  { title: 'We design it with you', text: 'Custom shapes, themes and styles, in crystal, metal, acrylic or wood, with your text, logo or motif engraved precisely.', image: '/trophies/crystal-tower-prince.jpg' },
  { title: 'Made and delivered', text: 'Consultation, design, production and delivery under one roof — checked before it leaves, packed to arrive unbroken.', image: '/trophies/crystal-globe-prince.jpg' },
];

/** Pinned storytelling: the stage stays fixed while scroll drives
 *  three stages. Heading, text, and visual crossfade and transform
 *  with scrub. On mobile / reduced motion, stages stack normally
 *  with no pinning, so nothing feels trapped. */
export default function StickyStory() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 769px)', () => {
      if (reduced) return;
      const st = ScrollTrigger.create({
        trigger: wrapRef.current, start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: (self) => {
          setProgress(self.progress);
          setStage(Math.min(STAGES.length - 1, Math.floor(self.progress * STAGES.length)));
        },
      });
      return () => st.kill();
    });
    return () => mm.revert();
  }, []);

  const current = STAGES[stage];
  return (
    <section className="section" style={{ padding: 0, borderTop: '1px solid var(--line)' }} aria-label="Sticky storytelling">
      {/* Mobile: all 3 stages stacked, normal vertical scroll. The pinned
          version below only ever shows stage 1 on mobile, because its
          ScrollTrigger only runs on desktop — so mobile users never
          saw stages 2 and 3. */}
      <div className="sticky-mobile-list wrap" style={{ paddingTop: 48, paddingBottom: 48 }}>
        <p className="label">How it works</p>
        {STAGES.map((s, i) => (
          <div key={s.title} style={{ marginTop: 40 }}>
            <p className="label">Stage {i + 1} / {STAGES.length}</p>
            <h2 className="display" style={{ fontSize: 'clamp(36px, 5vw, 72px)', margin: '12px 0 0' }}>{s.title}</h2>
            <p className="lead" style={{ marginTop: 12 }}>{s.text}</p>
            <div className="stage-visual" style={{ marginTop: 16 }}>
              <img src={s.image} alt="" />
            </div>
          </div>
        ))}
      </div>
      <div ref={wrapRef} className="sticky-wrap sticky-desktop" style={{ height: '300vh', position: 'relative' }}>
        <div className="sticky-stage">
          <div className="wrap" style={{ width: '100%' }}>
            <p className="label">How it works · Stage {stage + 1} / {STAGES.length}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, marginTop: 24, alignItems: 'center' }}>
              <div key={stage} style={{ animation: 'char-up 0.5s ease both' }}>
                <h2 className="display" style={{ fontSize: 'clamp(36px, 5vw, 72px)', margin: 0 }}>{current.title}</h2>
                <p className="lead" style={{ marginTop: 16 }}>{current.text}</p>
                <div style={{ height: 3, background: 'var(--line)', marginTop: 28, overflow: 'hidden', borderRadius: 999 }}>
                  <div style={{ height: '100%', width: `${progress * 100}%`, background: 'var(--gold)' }} />
                </div>
              </div>
              <div className="stage-visual" style={{ transform: `scale(${1 + progress * 0.04}) rotate(${(progress - 0.5) * 2}deg)` }}>
                <img key={stage} src={current.image} alt="" style={{ animation: 'char-up 0.5s ease both' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
