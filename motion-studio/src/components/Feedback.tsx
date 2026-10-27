import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Reveal } from './Reveal';
import { MOCK_FEEDBACK } from '../data/feedback';
import { fetchFeedback } from '../lib/api';

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
      </div>
    </section>
  );
}
