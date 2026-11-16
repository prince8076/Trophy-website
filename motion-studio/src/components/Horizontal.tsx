import { ArrowRight, Briefcase, GraduationCap, Landmark, Trophy, type LucideIcon } from 'lucide-react';

const CARDS: { n: string; title: string; text: string; line: string; icon: LucideIcon }[] = [
  { n: '01', title: 'Educational Institutions', text: 'Awards, medals and mementos for academic excellence and convocations.', line: 'For the toppers, the teams, and the teachers who shaped them.', icon: GraduationCap },
  { n: '02', title: 'Sports Associations', text: 'Trophies and medals for tournaments, leagues and sporting events.', line: 'For the finals won and the seasons that built them.', icon: Trophy },
  { n: '03', title: 'Corporate Organisations', text: 'Customised corporate gifts and employee recognition programmes.', line: 'For the people who move the business forward.', icon: Briefcase },
  { n: '04', title: 'Government & Social Bodies', text: 'Formal mementos and medals for public service, official events and community programmes.', line: 'For service that deserves to be seen.', icon: Landmark },
];

// Who we serve — a plain responsive grid (2026-11-16). The old
// version converted vertical scroll into horizontal motion (CSS
// sticky stage + a ScrollTrigger scrub mapping scroll progress to
// the track's x), which hijacked scrolling on desktop. Now the four
// sectors sit in a normal grid — 4 columns on desktop, 2 on
// tablet, 1 on mobile — with no scroll listener, no ScrollTrigger
// and no sticky stage. Nothing moves on scroll.
export default function Horizontal() {
  return (
    <section className="section" id="who-we-serve" aria-label="Who we serve">
      <div className="wrap">
        <p className="label">Who we serve</p>
        <h2 className="display" style={{ fontSize: 'clamp(36px, 5vw, 64px)', margin: '16px 0 12px' }}>
          Recognition for <span style={{ color: 'var(--gold)' }}>every occasion.</span>
        </h2>
        <p className="lead" style={{ margin: '0 0 28px', maxWidth: '62ch' }}>
          A trophy is never just a trophy. It is the moment someone
          felt seen, and the story they will tell about it.
        </p>
        <div className="horiz-grid">
          {CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <article key={c.n} className="horiz-card">
                <div>
                  <span className="horiz-icon" aria-hidden="true"><Icon size={26} strokeWidth={1.75} /></span>
                  <p className="label">{c.n}</p>
                  <h3>{c.title}</h3>
                  <p className="horiz-line">{c.line}</p>
                  <p style={{ color: 'var(--muted)' }}>{c.text}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
                  <span className="label">Sector</span>
                  <ArrowRight size={18} style={{ color: 'var(--gold)' }} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
