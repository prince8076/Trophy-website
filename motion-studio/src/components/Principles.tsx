import { Award, Clock, HeartHandshake, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react';
import { Reveal } from './Reveal';

// Core Values from the Shreeji Corporates company profile —
// Integrity, Quality, Reliability, Excellence, Customer Focus.
// The one-line texts are plain-language readings of those values,
// not invented client claims.
const ITEMS: { n: string; title: string; text: string; icon: LucideIcon }[] = [
  { n: '01', title: 'Integrity', text: 'Honest work, in every order.', icon: ShieldCheck },
  { n: '02', title: 'Quality', text: 'Crafted to celebrate, made to last.', icon: Award },
  { n: '03', title: 'Reliability', text: 'On time, as promised.', icon: Clock },
  { n: '04', title: 'Excellence', text: 'The standard in every finish.', icon: Sparkles },
  { n: '05', title: 'Customer Focus', text: 'Your occasion, your design, your recognition.', icon: HeartHandshake },
];

export default function Principles() {
  return (
    <section className="section" id="principles">
      <div className="wrap">
        <Reveal><p className="label">Our values — Shreeji Corporates</p></Reveal>
        <Reveal>
          <h2 className="display" style={{ fontSize: 'clamp(40px, 6vw, 84px)', margin: '16px 0 8px' }}>
            What we <span style={{ color: 'var(--gold)' }}>stand for.</span>
          </h2>
        </Reveal>
        <div>
          {ITEMS.map((p) => {
            const Icon = p.icon;
            return (
            <Reveal key={p.n}>
              <article className="principle">
                <div className="principle-num" aria-hidden="true">{p.n}</div>
                <div>
                  <h3>{p.title}</h3>
                  <p className="principle-text">“{p.text}”</p>
                </div>
                <span className="principle-icon" aria-hidden="true"><Icon size={30} strokeWidth={1.75} /></span>
              </article>
            </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
