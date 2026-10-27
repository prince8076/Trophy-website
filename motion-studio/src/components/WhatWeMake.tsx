import { Reveal } from './Reveal';

// What we make — replaces the old ALIVE "Motion experiments" demo
// section, which had nothing to do with a trophy company. All six
// cards come from the Shreeji Corporates company profile only:
// portfolio, materials, and end-to-end service. No prices, no
// invented products — the catalogue section still holds the
// (sample) product cards.
const ITEMS = [
  { n: '01', title: 'Trophies & Awards', text: 'Premium designs for every win, from school prizes to championship cups.' },
  { n: '02', title: 'Mementos & Medals', text: 'Timeless pieces for occasions that deserve to be remembered.' },
  { n: '03', title: 'Corporate Gifts', text: 'Branded gifts that leave a lasting impression.' },
  { n: '04', title: 'Customised Recognition', text: 'Tailored shapes, themes and styles, made to your vision.' },
  { n: '05', title: 'Materials', text: 'Crystal, metal, acrylic, wood and more — sized and coloured to order.' },
  { n: '06', title: 'End-to-end service', text: 'Consultation, design, production and delivery under one roof.' },
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
          {ITEMS.map((item) => (
            <Reveal key={item.n} className="exp-card">
              <h3 style={{ margin: 0 }}>{item.n} · {item.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>{item.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
