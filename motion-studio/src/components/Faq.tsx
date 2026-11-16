import { Reveal } from './Reveal';

// FAQ (2026-11-16). Answers are grounded in the company profile
// where possible; the three the profile does not answer (minimum
// order, lead time, logo file format) are [PLACEHOLDER]s for the
// owner to fill in — no prices, lead times or file formats are
// invented. The FAQPage JSON-LD mirrors the visible answers,
// placeholders included, so the owner can see exactly what still
// needs their input.
const FAQS: { q: string; a: string }[] = [
  {
    q: 'How much does a trophy cost?',
    a: 'Every trophy is made to order and quoted individually — there is no fixed price list. Tell us the design, material and quantity on WhatsApp or email and we will quote it. Engraving is included.',
  },
  {
    q: 'Is there a minimum order?',
    a: '[PLACEHOLDER: owner to confirm the minimum order quantity, if any.]',
  },
  {
    q: 'How long does an order take?',
    a: '[PLACEHOLDER: owner to confirm the usual lead time from design approval to delivery.]',
  },
  {
    q: 'Do you deliver?',
    a: 'Yes — we deliver every order. Tell us where it needs to go on WhatsApp or email and we will confirm delivery for your city.',
  },
  {
    q: 'What file format do you need for a logo engraving?',
    a: '[PLACEHOLDER: owner to confirm the accepted logo file formats for engraving.]',
  },
  {
    q: 'Can you handle bulk or corporate orders?',
    a: 'Yes — from a single school prize to a full corporate rollout. Tell us the quantity on WhatsApp or email and we will quote it.',
  },
];

export default function Faq() {
  return (
    <section className="section" id="faq">
      <div className="wrap">
        <Reveal><p className="label">FAQ — Before you order</p></Reveal>
        <Reveal>
          <h2 className="display" style={{ fontSize: 'clamp(36px, 5vw, 64px)', margin: '16px 0 12px' }}>
            Good <span style={{ color: 'var(--gold)' }}>questions.</span>
          </h2>
        </Reveal>
        <div className="faq-list">
          {FAQS.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: FAQS.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            }),
          }}
        />
      </div>
    </section>
  );
}
