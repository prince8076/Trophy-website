import { Reveal } from './Reveal';

// Gallery — workshop, engraving and past-project photos (2026-11-16).
// The photos are PLACEHOLDERS until the user supplies real ones:
// the build generates labelled placeholder images at
// /images/gallery-*.webp (see scripts/generate-assets.mjs), and a
// real photo dropped into public/images/ with the same name replaces
// the placeholder automatically (the generator never overwrites an
// existing file). To swap in a real photo, replace the file in
// public/images/ via git — no code change needed. All images are
// lazy-loaded.
const PHOTOS: { src: string; alt: string; caption: string }[] = [
  { src: '/images/gallery-workshop-1.webp', alt: '[PLACEHOLDER] Workshop photo — Shreeji Corporates studio', caption: 'In the workshop' },
  { src: '/images/gallery-workshop-2.webp', alt: '[PLACEHOLDER] Workshop photo — Shreeji Corporates studio', caption: 'In the workshop' },
  { src: '/images/gallery-engraving-1.webp', alt: '[PLACEHOLDER] Engraving photo — laser engraving a trophy', caption: 'Engraving' },
  { src: '/images/gallery-engraving-2.webp', alt: '[PLACEHOLDER] Engraving photo — laser engraving a trophy', caption: 'Engraving' },
  { src: '/images/gallery-project-1.webp', alt: '[PLACEHOLDER] Past project photo — a finished trophy order', caption: 'Past project' },
  { src: '/images/gallery-project-2.webp', alt: '[PLACEHOLDER] Past project photo — a finished trophy order', caption: 'Past project' },
];

export default function Gallery() {
  return (
    <section className="section" id="gallery">
      <div className="wrap">
        <Reveal><p className="label">Gallery — From the studio</p></Reveal>
        <Reveal>
          <h2 className="display" style={{ fontSize: 'clamp(36px, 5vw, 64px)', margin: '16px 0 12px' }}>
            Made <span style={{ color: 'var(--gold)' }}>by hand.</span>
          </h2>
          <p className="lead">
            The workshop, the engraving, and the finished pieces —
            before they leave for the moment they were made for.
          </p>
        </Reveal>
        <div className="gallery-grid">
          {PHOTOS.map((p) => (
            <figure key={p.src} className="gallery-item">
              <img src={p.src} alt={p.alt} loading="lazy" decoding="async" width={800} height={600} />
              <figcaption>{p.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
