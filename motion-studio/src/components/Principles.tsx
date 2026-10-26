import { Reveal } from './Reveal';

const ITEMS = [
  { n: '01', title: 'Motion with purpose', text: 'Every movement should communicate something.' },
  { n: '02', title: 'Performance first', text: 'Beautiful interactions should never make the experience feel slow.' },
  { n: '03', title: 'Designed for discovery', text: 'Let people discover details through natural exploration.' },
  { n: '04', title: 'Built with precision', text: 'Small details create unforgettable experiences.' },
];

export default function Principles() {
  return (
    <section className="section" id="principles">
      <div className="wrap">
        <Reveal><p className="label">05 — Principles</p></Reveal>
        <div>
          {ITEMS.map((p) => (
            <Reveal key={p.n}>
              <article className="principle">
                <div className="principle-num" aria-hidden="true">{p.n}</div>
                <div>
                  <h3>{p.title}</h3>
                  <p className="lead" style={{ margin: 0 }}>“{p.text}”</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
