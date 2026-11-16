import { Reveal } from './Reveal';
import { webpSrcSet } from '../lib/images';

// What we make — "The Trophy Room" (redesigned 2026-11-16).
// A dim showroom, not a dashboard: midnight-blue section, metallic
// gold accent, real product photography (the catalogue photos, all
// live), a bento hero card, outlined gold serial numbers, and a
// shine sweep on hover. All six cards come from the Shreeji
// Corporates company profile only: portfolio, materials, and
// end-to-end service. No prices, no invented products — the
// catalogue section still holds the (sample) product cards.
//
// Images (2026-11-16): cards 01, 02 and 04 use real trophy photos.
// Cards 03 (Corporate Gifts), 05 (Materials) and 06 (End-to-end
// service) use PLACEHOLDER images at /images/{gifts,materials,
// workshop}.webp — the brief asked not to reuse trophy photos
// there. The placeholders are generated at build time (see
// scripts/generate-assets.mjs); drop a real photo into
// public/images/ with the same name and it replaces the placeholder.
const ITEMS: { n: string; title: string; text: string; image: string; hero?: boolean }[] = [
  { n: '01', title: 'Trophies & Awards', text: 'Crafted for Glory. From the little league to the grand stage, we forge awards that immortalize the win.', image: '/trophies/championship-cup-prince.jpg', hero: true },
  { n: '02', title: 'Mementos & Medals', text: 'Keepsakes that outlast the moment — medals and mementos made to be treasured for years.', image: '/trophies/crystal-globe-prince.jpg' },
  { n: '03', title: 'Corporate Gifts', text: 'Gifts that carry your name with pride — branded, thoughtful, and made to be remembered.', image: '/images/gifts.webp' },
  { n: '04', title: 'Customised Recognition', text: 'Every shape, theme and style, tailored to your vision — made one of a kind.', image: '/trophies/crystal-tower-prince.jpg' },
  { n: '05', title: 'Materials', text: 'Crystal, metal, acrylic and wood — chosen, cut and finished to order.', image: '/images/materials.webp' },
  { n: '06', title: 'End-to-end service', text: 'Consultation, design, production and delivery — everything under one roof.', image: '/images/workshop.webp' },
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
            From a single school prize to a full corporate rollout — here&rsquo;s what we craft.
          </p>
        </Reveal>
        <div className="exp-grid">
          {ITEMS.map((item) => (
            <Reveal key={item.n} className={item.hero ? 'exp-card exp-hero' : 'exp-card'}>
              {/* Real product photography, full-bleed, with a warm
                  spotlight wash and an outlined gold serial number
                  stamped on the photo — like an engraving on a
                  trophy base. No flat icon, no orange disc. */}
              <div className="exp-stage">
                <img src={webpSrcSet(item.image).src} srcSet={webpSrcSet(item.image).srcSet} sizes={webpSrcSet(item.image).sizes} alt={`${item.title} — Shreeji Corporates`} loading="lazy" decoding="async" />
                <span className="exp-ghost" aria-hidden="true">{item.n}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <div className="exp-bar" aria-hidden="true"><i /></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
