import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STAGES = [
  { title: 'Tell us on WhatsApp', text: 'Send your occasion, design idea and quantity on WhatsApp or email — no checkout, no forms, just a message.', visual: 'orb' },
  { title: 'We design it with you', text: 'Custom shapes, themes and styles, in crystal, metal, acrylic or wood, with your text, logo or motif engraved precisely.', visual: 'bars' },
  { title: 'Made and delivered', text: 'Consultation, design, production and delivery under one roof — checked before it leaves, packed to arrive unbroken.', visual: 'grid' },
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
      <div ref={wrapRef} style={{ height: '300vh', position: 'relative' }}>
        <div className="sticky-stage">
          <div className="wrap" style={{ width: '100%' }}>
            <p className="label">How it works · Stage {stage + 1} / {STAGES.length}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, marginTop: 24, alignItems: 'center' }}>
              <div key={stage} style={{ animation: 'char-up 0.5s ease both' }}>
                <h2 className="display" style={{ fontSize: 'clamp(36px, 5vw, 72px)', margin: 0 }}>{current.title}</h2>
                <p className="lead" style={{ marginTop: 16 }}>{current.text}</p>
                <div style={{ height: 3, background: 'rgba(244,242,234,0.12)', marginTop: 28, overflow: 'hidden', borderRadius: 999 }}>
                  <div style={{ height: '100%', width: `${progress * 100}%`, background: 'var(--gold)' }} />
                </div>
              </div>
              <div className="stage-visual" style={{ transform: `scale(${1 + progress * 0.04}) rotate(${(progress - 0.5) * 2}deg)` }}>
                {current.visual === 'orb' && <div className="orb" aria-hidden="true" />}
                {current.visual === 'bars' && (
                  <div className="bars" aria-hidden="true">
                    {[90, 140, 70, 160, 110].map((h, i) => <i key={i} style={{ height: h }} />)}
                  </div>
                )}
                {current.visual === 'grid' && (
                  <div className="grid" aria-hidden="true">{Array.from({ length: 8 }).map((_, i) => <i key={i} style={{ background: i === 3 ? 'var(--gold)' : undefined }} />)}</div>
                )}
              </div>
            </div>
            {/* Mobile fallback: all stages listed, so the story is readable without pinning. */}
            <div style={{ display: 'none' }} className="sticky-fallback" />
          </div>
        </div>
      </div>
      <div className="wrap" style={{ paddingBottom: 40 }}>
        <p className="label">On small screens this section stacks — scroll normally, no pinning.</p>
      </div>
    </section>
  );
}
