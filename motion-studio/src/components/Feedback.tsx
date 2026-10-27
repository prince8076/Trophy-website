import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Reveal } from './Reveal';
import { MOCK_FEEDBACK } from '../data/feedback';
import { fetchFeedback, submitFeedback } from '../lib/api';
import { whatsappUrl, GENERAL_ORDER_MESSAGE } from '../lib/whatsapp';

const SECTORS = [
  'Educational Institution',
  'Sports Association',
  'Corporate Organisation',
  'Government Body',
  'Social Organisation',
  'Event Management',
];

// Feedback — tries GET /api/feedback first (approved rows only).
// If the FastAPI backend is not running or VITE_API_URL is not
// set, it falls back to MOCK_FEEDBACK from src/data/feedback.ts,
// so the section never goes blank. See the comment at the top of
// feedback.ts: the mock entries are placeholders, replace them
// with real approved feedback in the backend.
export default function Feedback() {
  const [items, setItems] = useState(MOCK_FEEDBACK);
  useEffect(() => {
    let live = true;
    fetchFeedback().then((api) => {
      if (!live || !api || api.length === 0) return;
      setItems(api.map((f) => ({ name: f.name, role: f.role, sector: f.sector, quote: f.quote, rating: f.rating })));
    });
    return () => { live = false; };
  }, []);

  // Review form — posts to POST /api/feedback. A successful submit
  // does NOT add the review to the list above, because new reviews
  // start unapproved and only appear after an admin approves them.
  // The form says exactly that, so nobody is misled into thinking
  // their review is live immediately. If the backend is down, the
  // form says so honestly and points to WhatsApp instead of
  // pretending the review was saved.
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [sector, setSector] = useState(SECTORS[0]);
  const [rating, setRating] = useState(5);
  const [quote, setQuote] = useState('');
  const [formState, setFormState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) return;
    setFormState('sending');
    const ok = await submitFeedback({ name: name.trim(), role: role.trim(), sector, quote: quote.trim(), rating });
    if (ok) {
      setFormState('done');
      setName(''); setRole(''); setSector(SECTORS[0]); setRating(5); setQuote('');
    } else {
      setFormState('error');
    }
  };
  return (
    <section className="section" id="feedback">
      <div className="wrap">
        <Reveal><p className="label">Feedback — From our customers</p></Reveal>
        <Reveal>
          <h2 className="display" style={{ fontSize: 'clamp(44px, 7vw, 96px)', margin: '16px 0 12px' }}>
            What people<br />say about us.
          </h2>
          <p className="lead">
            Trophies, medals and mementos, delivered across schools,
            sports, corporates, government and social programmes —
            in our customers&apos; own words.
          </p>
        </Reveal>
        <div className="feedback-grid">
          {items.map((f) => (
            <article key={f.name + f.sector} className="feedback-card">
              <div className="feedback-stars" aria-label={`${f.rating} out of 5 stars`}>
                {Array.from({ length: f.rating }).map((_, i) => (
                  <Star key={i} size={16} fill="var(--gold)" color="var(--gold)" />
                ))}
              </div>
              <p className="feedback-quote">&ldquo;{f.quote}&rdquo;</p>
              <div className="feedback-who">
                <strong>{f.name}</strong>
                <span>{f.role} · {f.sector}</span>
              </div>
            </article>
          ))}
        </div>
        <Reveal>
          <form className="review-form" onSubmit={onSubmit}>
            <h3>Share your experience</h3>
            <p className="review-form-note">
              Bought a trophy, medal or memento from us? Tell others about it.
              Your review will appear here after we approve it — it is not live immediately.
            </p>
            <div className="review-form-row">
              <label>
                Your name *
                <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} placeholder="e.g. Priya S." />
              </label>
              <label>
                Your role (optional)
                <input value={role} onChange={(e) => setRole(e.target.value)} maxLength={120} placeholder="e.g. Event Organiser" />
              </label>
            </div>
            <div className="review-form-row">
              <label>
                Who are you with?
                <select value={sector} onChange={(e) => setSector(e.target.value)}>
                  {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <fieldset className="review-stars-input">
                <legend>Rating *</legend>
                <span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setRating(n)}>
                      <Star size={24} fill={n <= rating ? 'var(--gold)' : 'transparent'} color="var(--gold)" />
                    </button>
                  ))}
                </span>
              </fieldset>
            </div>
            <label>
              Your review *
              <textarea value={quote} onChange={(e) => setQuote(e.target.value)} required maxLength={2000} rows={4} placeholder="How was the quality, engraving, delivery?" />
              <span className="review-count">{quote.length} / 2000</span>
            </label>
            <button type="submit" className="btn btn-primary" disabled={formState === 'sending'}>
              {formState === 'sending' ? 'Sending…' : 'Submit review'}
            </button>
            {formState === 'done' && (
              <p className="review-form-msg ok">Thanks — your review is saved and will appear here after approval.</p>
            )}
            {formState === 'error' && (
              <p className="review-form-msg err">
                Could not send your review right now (our review system may be down).
                Please try again, or tell us on{' '}
                <a href={whatsappUrl(GENERAL_ORDER_MESSAGE)} target="_blank" rel="noreferrer">WhatsApp</a> instead.
              </p>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
