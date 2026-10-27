import { useState } from 'react';
import { Trophy, PenLine, ShieldCheck, Package, BadgeCheck, ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';
import { whatsappUrl, quoteMessage } from '../lib/whatsapp';

// Trophy catalogue — new for motion-studio, in the site's black-and-gold style.
// No old-site code, no backend, no prices: every trophy is "Bespoke
// quote", exactly like the old site's no-price cards. The six items
// below are a SAMPLE catalogue for design — replace names, materials
// and visuals with the user's real products and photos when they are
// ready. Nothing here claims to be a live product or a real price.
const FILTERS = ['All', 'Crystal', 'Metal', 'Wood', 'Acrylic'] as const;

const PRODUCTS = [
  { name: 'Championship Cup', material: 'Metal', category: 'Metal', badge: 'Bestseller' },
  { name: 'Crystal Tower', material: 'Crystal', category: 'Crystal', badge: '' },
  { name: 'Wooden Shield', material: 'Wood', category: 'Wood', badge: '' },
  { name: 'Acrylic Star', material: 'Acrylic', category: 'Acrylic', badge: 'New' },
  { name: 'Silver Salver', material: 'Metal', category: 'Metal', badge: '' },
  { name: 'Crystal Globe', material: 'Crystal', category: 'Crystal', badge: '' },
];

const GUARANTEES = [
  { icon: PenLine, title: 'Free laser engraving', text: 'Included with every trophy.' },
  { icon: ShieldCheck, title: 'Hand-finished', text: 'Checked before it leaves the studio.' },
  { icon: Package, title: 'Secure packaging', text: 'Packed to arrive unbroken.' },
  { icon: BadgeCheck, title: 'Bespoke quote', text: 'No hidden price — ask, and we quote.' },
];

export default function TrophyCatalogue() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const shown = filter === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);
  return (
    <section className="section" id="trophies">
      <div className="wrap">
        <Reveal><p className="label">Trophies — Featured</p></Reveal>
        <Reveal>
          <h2 className="display" style={{ fontSize: 'clamp(44px, 7vw, 96px)', margin: '16px 0 12px' }}>
            Choose<br />yours.
          </h2>
          <p className="lead">
            After the break, the choice. Pick a shape, pick a material, and
            we engrave it for the win it celebrates.
          </p>
        </Reveal>
        <div className="trophy-filters">
          {FILTERS.map((f) => (
            <button key={f} type="button" className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <div className="trophy-grid">
          {shown.map((p) => (
            <article key={p.name} className="trophy-card">
              <div className="trophy-visual">
                <Trophy size={64} strokeWidth={1} />
                {p.badge && <span className="trophy-badge">{p.badge}</span>}
              </div>
              <h3>{p.name}</h3>
              <p>{p.material} · {p.category}</p>
              <div className="trophy-foot">
                <span>Bespoke quote</span>
                <a href={whatsappUrl(quoteMessage(p.name, p.material))} target="_blank" rel="noreferrer">
                  WhatsApp to order <ArrowRight size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>
        {shown.length === 0 && <p style={{ color: 'var(--muted)' }}>Nothing in this material yet.</p>}
        <p className="trophy-sample-note">
          Sample catalogue for design — replace these with your real products and photos.
        </p>
        <div className="trophy-guarantees">
          {GUARANTEES.map((g) => (
            <div key={g.title} className="trophy-guarantee">
              <g.icon size={22} />
              <div>
                <strong>{g.title}</strong>
                <span>{g.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
