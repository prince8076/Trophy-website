import { Reveal } from './Reveal';

// Client logos strip (2026-11-16). [PLACEHOLDER] — no client logos
// have been supplied yet, so the strip shows labelled placeholder
// slots. To add a real logo, replace a slot with an <img> pointing
// at a logo file in public/images/ (via git) — no layout change
// needed. Do not invent client names: the slots are generic until
// the owner supplies real logos.
const SLOTS = ['Client logo', 'Client logo', 'Client logo', 'Client logo', 'Client logo'];

export default function Logos() {
  return (
    <section className="section" id="clients" aria-label="Our clients">
      <div className="wrap">
        <Reveal>
          <p className="label" style={{ textAlign: 'center' }}>Trusted by schools, sports bodies, corporates and institutions</p>
        </Reveal>
        <div className="logos-strip" aria-label="[PLACEHOLDER] Client logos — to be supplied by the owner">
          {SLOTS.map((s, i) => (
            <span key={i} className="logo-slot" aria-hidden="true">{s}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
