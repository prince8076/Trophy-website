import { Star } from 'lucide-react';
import { Reveal } from './Reveal';
import { MOCK_FEEDBACK } from '../data/feedback';

// Feedback — renders MOCK_FEEDBACK from src/data/feedback.ts for now.
// Backend-ready: the component takes no other data source, so when
// the backend is ready, swap that file's export for a fetch result
// with the same shape and this section becomes real-time with no
// layout change. See the comment at the top of feedback.ts.
export default function Feedback() {
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
          {MOCK_FEEDBACK.map((f) => (
            <article key={f.name + f.sector} className="feedback-card">
              <div className="feedback-stars" aria-label={`${f.rating} out of 5 stars`}>
                {Array.from({ length: f.rating }).map((_, i) => (
                  <Star key={i} size={16} fill="var(--lime)" color="var(--lime)" />
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
