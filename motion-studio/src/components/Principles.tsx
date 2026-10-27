import { Reveal } from './Reveal';

// Core Values from the Shreeji Corporates company profile —
// Integrity, Quality, Reliability, Excellence, Customer Focus.
// The one-line texts are plain-language readings of those values,
// not invented client claims.
const ITEMS = [
  { n: '01', title: 'Integrity', text: 'Honest work, in every order.' },
  { n: '02', title: 'Quality', text: 'Crafted to celebrate, made to last.' },
  { n: '03', title: 'Reliability', text: 'On time, as promised.' },
  { n: '04', title: 'Excellence', text: 'The standard in every finish.' },
  { n: '05', title: 'Customer Focus', text: 'Your occasion, your design, your recognition.' },
];

export default function Principles() {
  return (
    <section className="section" id="principles">
      <div className="wrap">
        <Reveal><p className="label">Our values — Shreeji Corporates</p></Reveal>
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
