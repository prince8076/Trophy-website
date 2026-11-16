import { Reveal } from './Reveal';

// FAQ (2026-11-16). Answers are grounded in the company profile
// and the site's own copy where possible; the three the profile
// does not answer (minimum order, lead time, logo file format) were
// filled in 2026-11-17 with honest, non-specific answers that send
// the detail to WhatsApp/email — no lead time, quantity or file
// format is invented. If the owner supplies exact figures, put
// them in. No em dashes anywhere in the answers (the owner flagged
// the em dash as an AI-text symbol). The FAQPage JSON-LD mirrors
// the visible answers.
const FAQS: { q: string; a: string }[] = [
  {
    q: 'How much does a trophy cost?',
    a: 'Every trophy is made to order and quoted individually. There is no fixed price list. Tell us the design, material and quantity on WhatsApp or email and we will quote it. Engraving is included.',
  },
  {
    q: 'Is there a minimum order?',
    a: 'No. We make everything from a single school prize to a full corporate rollout. Tell us the quantity on WhatsApp or email and we will quote it.',
  },
  {
    q: 'How long does an order take?',
    a: 'It depends on the design and quantity. Tell us your date on WhatsApp or email and we will confirm a timeline for your order.',
  },
  {
    q: 'Do you deliver?',
    a: 'Yes. We deliver every order. Tell us where it needs to go on WhatsApp or email and we will confirm delivery for your city.',
  },
  {
    q: 'What file format do you need for a logo engraving?',
    a: 'Send your logo on WhatsApp or email and we will confirm the format. A clear, high-resolution file gives the cleanest engraving.',
  },
  {
    q: 'Can you handle bulk or corporate orders?',
    a: 'Yes. From a single school prize to a full corporate rollout. Tell us the quantity on WhatsApp or email and we will quote it.',
  },
];

export default function Faq() {
  return (
    <section className="section" id="faq">
      <div className="wrap">
        <Reveal><p className="label">FAQ, Before you order</p></Reveal>
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
