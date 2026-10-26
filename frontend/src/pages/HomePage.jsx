import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, PenTool, Crown, Star } from 'lucide-react';
import TrophyCard from '../components/TrophyCard';
import EngravingCustomizer from '../components/EngravingCustomizer';
import ReviewSection from '../components/ReviewSection';
import RequestQuoteModal from '../components/RequestQuoteModal';
import ShatterStage from '../components/ShatterStage';
import { fetchFeaturedOverview } from '../api';

// ------------------------------------------------------------------
// HomePage — redesign, from scratch, branch redesign-motion-threeui.
// Design patterns only, taken from the two reference sites the user
// named (no text, images, logos or code copied from them):
//  - Dark charcoal stage, #0B0B0E background, #1E1E24 cards,
//    hairline #26262A borders, white primary text, muted #A1A1AA
//    secondary text — the neutral chrome both sites use, so the
//    product colour does the work.
//  - Gold #C9A86A as the single trophy accent (metal, engraving,
//    bestseller badge), not a rainbow theme.
//  - Peach #F5C69A -> lavender #C4B5FD gradient used for ONE
//    word in the hero and for the shatter glow only.
//  - Poster hero: centred, eyebrow pill, huge extra-bold sans
//    headline over two lines, one short supporting line, pill
//    buttons (off-white #E8EEF5 primary, gold outline secondary).
//  - Catalogue: uniform aligned grid (not masonry, so a shop is
//    easy to compare), pill filters, Recent/Bestsellers sort,
//    small tag pills, gold badge on the title line — the
//    listing pattern from the second site, with the stronger
//    hover a shop needs (TrophyCard already lifts/tilts).
//  - Scroll story ends calmly: engraving, guarantees, reviews,
//    final quote call to action — drama resolves into a next step.
// What was deliberately NOT carried over from the old HomePage:
//  the old hero with Trophy3DViewer, Haikei waves/blobs, the
//  old full-width shatter wall, and the long stacked sections.
//  Those files still exist in the repo and on other branches;
//  this page simply does not use them. Routes, cart, quote
//  modal, catalog and product pages are unchanged (App.jsx).
// ------------------------------------------------------------------

const PALETTE = {
  bg: '#0B0B0E',
  card: '#1E1E24',
  border: '#26262A',
  text: '#FFFFFF',
  muted: '#A1A1AA',
  gold: '#C9A86A',
  buttonLight: '#E8EEF5',
};

export default function HomePage() {
  const navigate = useNavigate();
  const [data, setData] = useState({ categories: [], featured_products: [], guarantees: [] });
  const [loading, setLoading] = useState(true);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const [demoCustomization, setDemoCustomization] = useState({
    engraving_line1: 'ANNUAL LEADERSHIP EXCELLENCE',
    engraving_line2: 'MS. MADHU SHARMA & TEAM',
    engraving_line3: 'SHREEJI CORPORATES 2026',
    engraving_font: 'Classic Serif',
    plate_color: 'Gold',
  });

  useEffect(() => {
    fetchFeaturedOverview()
      .then(res => { setData(res); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const names = (data.categories || []).map(c => c.name || c.title).filter(Boolean);
    return ['all', ...names];
  }, [data.categories]);

  const products = useMemo(() => {
    let list = [...(data.featured_products || [])];
    if (filter !== 'all') {
      list = list.filter(p => (p.category_name || p.material || '') === filter);
    }
    if (sort === 'bestsellers') {
      list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    }
    return list;
  }, [data.featured_products, filter, sort]);

  const guarantees = data.guarantees && data.guarantees.length > 0
    ? data.guarantees
    : [
      { title: 'Free laser engraving', desc: 'Every trophy, every plate, included at no extra charge.' },
      { title: 'Pan-India dispatch', desc: 'Carefully packed and shipped across India.' },
      { title: 'Bulk tiered pricing', desc: 'Better rates for teams, schools and corporate orders.' },
    ];

  return (
    <div style={{ background: PALETTE.bg, color: PALETTE.text, minHeight: '100vh' }}>
      {/* ---------- Hero: poster, centred, text-first ---------- */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 20px 40px', textAlign: 'center' }}>
        <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: PALETTE.gold, border: '1px solid #26262A', padding: '8px 14px', borderRadius: 999 }}>
          Shreeji Corporates • 20+ years of craftsmanship
        </span>
        <h1 style={{ fontSize: 'clamp(44px, 8vw, 72px)', lineHeight: 0.95, fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase', margin: '28px 0 0' }}>
          Every milestone
          <br />
          deserves an{' '}
          <span style={{ background: 'linear-gradient(135deg, #F5C69A 0%, #C4B5FD 55%, #C9A86A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontStyle: 'italic', textTransform: 'none' }}>
            immortal
          </span>{' '}
          honour.
        </h1>
        <p style={{ color: PALETTE.muted, fontSize: 17, maxWidth: 620, margin: '20px auto 0', lineHeight: 1.6 }}>
          India&apos;s premier artisan trophy house. Crystal, metal, wood and acrylic —
          customised with free laser engraving, made for the moment it celebrates.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}>
          <Link to="/catalog" style={{ background: PALETTE.buttonLight, color: '#0B0B0E', padding: '14px 24px', borderRadius: 999, fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Explore trophies <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            onClick={() => document.getElementById('engraving-studio')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: 'transparent', border: `1px solid ${PALETTE.gold}`, color: PALETTE.gold, padding: '14px 24px', borderRadius: 999, fontWeight: 800, cursor: 'pointer' }}
          >
            Engraving Studio →
          </button>
        </div>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginTop: 36, color: PALETTE.muted, fontSize: 14 }}>
          <span><strong style={{ color: PALETTE.text }}>20+</strong> years</span>
          <span><strong style={{ color: PALETTE.text }}>50,000+</strong> awards delivered</span>
          <span><strong style={{ color: PALETTE.text }}>Free</strong> engraving, always</span>
        </div>
      </section>

      {/* ---------- Shatter: pinned card, not a full-screen wall ---------- */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 20px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: PALETTE.gold, margin: 0 }}>
          Scroll story
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, margin: '10px 0 6px' }}>
          Watch it break. Then choose yours.
        </h2>
        <p style={{ color: PALETTE.muted, margin: 0 }}>
          Scroll down to shatter the trophy. Scroll back up to put it back together.
        </p>
      </section>
      <ShatterStage
        onAddToBag={() => navigate('/catalog')}
        onEngrave={() => document.getElementById('engraving-studio')?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* ---------- Catalogue: uniform grid, pill filters, sort ---------- */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, margin: 0 }}>Featured trophies</h2>
            <p style={{ color: PALETTE.muted, margin: '8px 0 0' }}>Uniform previews, clear materials, no clutter — pick by occasion, not by guessing.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['recent', 'bestsellers'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                style={{
                  padding: '10px 16px', borderRadius: 999, cursor: 'pointer', fontWeight: 700, fontSize: 13,
                  background: sort === s ? PALETTE.buttonLight : 'transparent',
                  color: sort === s ? '#0B0B0E' : PALETTE.muted,
                  border: `1px solid ${PALETTE.border}`,
                }}
              >
                {s === 'recent' ? 'Recent' : 'Bestsellers'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
          {categories.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              style={{
                padding: '10px 16px', borderRadius: 999, cursor: 'pointer', fontWeight: 700, fontSize: 13,
                background: filter === c ? PALETTE.buttonLight : 'transparent',
                color: filter === c ? '#0B0B0E' : PALETTE.muted,
                border: `1px solid ${PALETTE.border}`,
              }}
            >
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: PALETTE.muted, padding: '40px 0' }}>Loading featured trophies…</p>
        ) : products.length === 0 ? (
          <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 20, padding: 32, marginTop: 24, textAlign: 'center' }}>
            <p style={{ color: PALETTE.muted, margin: 0 }}>No featured trophies loaded here — the catalogue may need the backend running, or this filter has no matches.</p>
            <Link to="/catalog" style={{ color: PALETTE.gold, fontWeight: 800, display: 'inline-block', marginTop: 12 }}>Browse the full catalogue →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, marginTop: 24 }}>
            {products.map(product => (
              <TrophyCard key={product.id || product.slug} product={product} />
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link to="/catalog" style={{ color: PALETTE.gold, fontWeight: 800 }}>View all categories →</Link>
        </div>
      </section>

      {/* ---------- Engraving: calm, after the drama ---------- */}
      <section id="engraving-studio" style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 20px 20px' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, margin: 0 }}>Make it personal, free.</h2>
        <p style={{ color: PALETTE.muted, margin: '8px 0 20px', maxWidth: 640, lineHeight: 1.6 }}>
          Three lines, your choice of font and plate. The preview below is live — what you type is what gets engraved.
        </p>
        <EngravingCustomizer customization={demoCustomization} onChange={setDemoCustomization} />
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 20, color: PALETTE.muted, fontSize: 14 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><PenTool size={16} color={PALETTE.gold} /> Live plate preview</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={16} color={PALETTE.gold} /> Zero extra charge</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Truck size={16} color={PALETTE.gold} /> Pan-India dispatch</span>
        </div>
      </section>

      {/* ---------- Guarantees: uniform cards ---------- */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {guarantees.slice(0, 3).map((g, i) => (
            <div key={i} style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 20, padding: 24 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                {i === 0 ? <Sparkles size={18} color={PALETTE.gold} /> : i === 1 ? <Truck size={18} color={PALETTE.gold} /> : <Crown size={18} color={PALETTE.gold} />}
                <h3 style={{ margin: 0, fontSize: 16 }}>{g.title || g.name || 'Shreeji standard'}</h3>
              </div>
              <p style={{ color: PALETTE.muted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{g.desc || g.description || ''}</p>
            </div>
          ))}
        </div>
      </section>

      <ReviewSection />

      {/* ---------- Final call to action ---------- */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 64px', textAlign: 'center' }}>
        <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 20, padding: '40px 24px' }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 800, margin: 0 }}>Ready to honour someone?</h2>
          <p style={{ color: PALETTE.muted, margin: '10px 0 20px' }}>Choose a trophy, personalise it, and request a quote — no payment needed to start.</p>
          <button
            type="button"
            onClick={() => setIsQuoteModalOpen(true)}
            style={{ background: PALETTE.buttonLight, color: '#0B0B0E', padding: '14px 24px', borderRadius: 999, fontWeight: 800, cursor: 'pointer', border: 'none' }}
          >
            Request a quote
          </button>
        </div>
      </section>

      <RequestQuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
    </div>
  );
}
