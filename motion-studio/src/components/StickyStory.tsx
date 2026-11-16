import { MessageCircle } from 'lucide-react';
import { SCULPTURAL_TROPHY_DATA_URI } from '../lib/sculpturalTrophy';
import { whatsappUrl, GENERAL_ORDER_MESSAGE } from '../lib/whatsapp';
import { webpSrcSet } from '../lib/images';

// Real product photos, not abstract shapes: the empty orb/bars/grid panel
// was what looked like blank space. Stages 2 and 3 are Prince photos
// already in the repo at motion-studio/public/trophies/ (user push
// 473860f), so they load live. Stage 1 uses the Modern sculptural gold
// trophy (2026-11-07 fix): the old silver lidded cup there was the
// trophy the user already rejected, and it was also cropped by the
// wide frame — the sculptural is the trophy they picked for the
// shatter, embedded as base64 like the shatter photo.
const STAGES = [
  { title: 'Tell us on WhatsApp', line: 'Share the occasion, the person, the feeling you want it to carry.', text: 'Send your occasion, design idea and quantity on WhatsApp or email — no checkout, no forms, just a message.', image: SCULPTURAL_TROPHY_DATA_URI, alt: 'Modern sculptural gold trophy' },
  { title: 'We design it with you', line: 'You approve the design before we make anything.', text: 'Custom shapes, themes and styles, in crystal, metal, acrylic or wood, with your text, logo or motif engraved precisely.', image: '/trophies/crystal-tower-prince.jpg', alt: 'Crystal tower trophy with custom laser engraving' },
  { title: 'Made and delivered', line: 'Crafted, engraved, and delivered in time for the moment.', text: 'Consultation, design, production and delivery under one roof — checked before it leaves, packed to arrive unbroken.', image: '/trophies/crystal-globe-prince.jpg', alt: 'Crystal globe trophy with custom laser engraving' },
];

// How it works — three stacked cards (2026-11-16). The old version
// pinned the stage and drove it with a scrubbed ScrollTrigger, and
// rendered the whole section TWICE in the DOM (a mobile list + a
// desktop pinned wrap, hidden by CSS — display: none does not stop
// image downloads, so the page carried 4 stage images for 3 stages).
// Now it is one static list: three cards, image + text side by
// side on desktop, stacked on mobile. No pin, no ScrollTrigger, no
// scroll listener, no duplicated markup — and every stage is visible
// on every screen.
export default function StickyStory() {
  return (
    <section className="section" aria-label="How it works">
      <div className="wrap">
        <p className="label">How it works</p>
        <h2 className="display" style={{ fontSize: 'clamp(36px, 5vw, 64px)', margin: '16px 0 12px' }}>
          From an idea<br />to <span style={{ color: 'var(--gold)' }}>the moment.</span>
        </h2>
        <p className="lead" style={{ margin: '0 0 32px', maxWidth: '62ch' }}>
          Three steps, end to end under one roof — consultation,
          design, production and delivery.
        </p>
        <div className="how-list">
          {STAGES.map((s, i) => (
            <article key={s.title} className="how-card">
              <div className="stage-visual how-visual">
                <img src={webpSrcSet(s.image).src} srcSet={webpSrcSet(s.image).srcSet} sizes={webpSrcSet(s.image).sizes} alt={s.alt} loading="lazy" decoding="async" width={800} height={600} />
              </div>
              <div className="how-text">
                <p className="label">Stage {i + 1} / {STAGES.length}</p>
                <h3>{s.title}</h3>
                <p className="stage-line">{s.line}</p>
                <p className="lead" style={{ marginTop: 12 }}>{s.text}</p>
              </div>
            </article>
          ))}
        </div>
        <div style={{ marginTop: 32 }}>
          <a className="btn btn-primary" href={whatsappUrl(GENERAL_ORDER_MESSAGE)} target="_blank" rel="noreferrer">
            <MessageCircle size={16} /> Start on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
