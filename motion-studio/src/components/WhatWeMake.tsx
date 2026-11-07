import { Gift, Layers, Medal, PenTool, Trophy, Truck, type LucideIcon } from 'lucide-react';
import { Reveal } from './Reveal';

// What we make — replaces the old ALIVE "Motion experiments" demo
// section, which had nothing to do with a trophy company. All six
// cards come from the Shreeji Corporates company profile only:
// portfolio, materials, and end-to-end service. No prices, no
// invented products — the catalogue section still holds the
// (sample) product cards.
const ITEMS: { n: string; title: string; text: string; icon: LucideIcon }[] = [
  { n: '01', title: 'Trophies & Awards', text: 'Premium designs for every win, from school prizes to championship cups.', icon: Trophy },
  { n: '02', title: 'Mementos & Medals', text: 'Timeless pieces for occasions that deserve to be remembered.', icon: Medal },
  { n: '03', title: 'Corporate Gifts', text: 'Branded gifts that leave a lasting impression.', icon: Gift },
  { n: '04', title: 'Customised Recognition', text: 'Tailored shapes, themes and styles, made to your vision.', icon: PenTool },
  { n: '05', title: 'Materials', text: 'Crystal, metal, acrylic, wood and more — sized and coloured to order.', icon: Layers },
  { n: '06', title: 'End-to-end service', text: 'Consultation, design, production and delivery under one roof.', icon: Truck },
];

export default function WhatWeMake() {
  return (
    <section className="section" id="what-we-make">
      <div className="wrap">
        <Reveal><p className="label">What we make — Shreeji Corporates</p></Reveal>
        <Reveal>
          <h2 className="display" style={{ fontSize: 'clamp(40px, 6vw, 84px)', margin: '16px 0 0' }}>
            Made to <span style={{ color: 'var(--gold)' }}>celebrate.</span>
          </h2>
          <p className="lead" style={{ marginTop: 12 }}>
            Every product is a reflection of your values and excellence —
            precision-crafted recognition, across every sector.
          </p>
        </Reveal>
        <div className="exp-grid">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.n} className="exp-card">
                {/* Visual first (like a product photo above the name):
                    a black stage — the same black as the hero panel and
                    the phoenix section — with a big orange icon disc and
                    a ghost number behind it. The number lives here now,
                    not in the title, so the title reads clean. */}
                <div className="exp-stage" aria-hidden="true">
                  <span className="exp-ghost">{item.n}</span>
                  <span className="exp-icon"><Icon size={44} strokeWidth={1.75} /></span>
                </div>
                <h3 style={{ margin: 0 }}>{item.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: 14 }}>{item.text}</p>
                <div className="exp-bar" aria-hidden="true"><i /></div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
