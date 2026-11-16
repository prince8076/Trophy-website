import { Reveal } from './Reveal';

// Gallery — workshop, engraving and past-project photos (2026-11-16).
// The 4 workshop/engraving photos are REAL (generated 2026-11-17 to
// replace the black "Photo coming soon" placeholders the user
// flagged): they ship as base64 and are decoded at build time to
// /images/gallery-*.webp (see scripts/generate-assets.mjs
// buildGalleryPhotos). The 2 "Past project" items reuse catalogue
// trophy photos (finished pieces). To swap in a real photo of the
// actual studio, replace the file in public/images/ via git — no
// code change needed (the generator never overwrites an existing
// file). All images are lazy-loaded.
const PHOTOS: { src: string; alt: string; caption: string }[] = [
  { src: '/images/gallery-workshop-1.webp', alt: 'Workshop photo, a craftsman polishing a golden trophy in the Shreeji Corporates studio', caption: 'In the workshop' },
  { src: '/images/gallery-workshop-2.webp', alt: 'Workshop photo, trophy parts, tools and materials on the workbench', caption: 'In the workshop' },
  { src: '/images/gallery-engraving-1.webp', alt: 'Engraving photo, laser engraving a name onto a crystal trophy', caption: 'Engraving' },
  { src: '/images/gallery-engraving-2.webp', alt: 'Engraving photo, engraving a logo onto a silver trophy base', caption: 'Engraving' },
  { src: '/trophies/championship-cup-prince.jpg', alt: 'Past project, Championship Cup trophy', caption: 'Past project' },
  { src: '/trophies/crystal-tower-prince.jpg', alt: 'Past project, Crystal Tower trophy', caption: 'Past project' },
];

export default function Gallery() {
  return (
    <section className="section" id="gallery">
      <div className="wrap">
        <Reveal><p className="label">Gallery, From the studio</p></Reveal>
        <Reveal>
          <h2 className="display" style={{ fontSize: 'clamp(36px, 5vw, 64px)', margin: '16px 0 12px' }}>
            Made <span style={{ color: 'var(--gold)' }}>by hand.</span>
          </h2>
          <p className="lead">
            The workshop, the engraving, and the finished pieces.
            Before they leave for the moment they were made for.
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
