// Responsive images — WebP srcset helper (2026-11-16).
// The variants are generated at build time by
// scripts/generate-assets.mjs (buildWebpVariants): for every
// /trophies/*.jpg it writes -400.webp, -800.webp and -1200.webp
// (quality 82). The source JPGs are 1200x900 max, so 1200 is the
// full-size WebP — there is no 1600px variant (that would upscale).
//
// Why srcset is safe again: the 2026-11-07 incident broke the
// catalogue because the browser had cached a 404 for the WebP
// variants (the deploy went live before the variants existed) and
// vercel.json then set a 1-year `immutable` cache on /trophies/*,
// so the 404 never revalidated — and a failed srcset candidate
// does NOT fall back to the <img> src. Both causes are fixed:
// /trophies/* is now `public, max-age=86400` (1 day), and the
// variants are generated in the SAME build (prebuild) as the HTML
// that references them, so there is no window where the HTML
// references a variant that does not exist yet. The variants were
// confirmed 200 live before srcset was re-enabled.
//
// Usage: webpSrcSet('/trophies/championship-cup-prince.jpg') returns
// { src, srcSet, sizes } for the <img>. If the URL is not a local
// /trophies/*.jpg (e.g. a data URI or an external URL), it returns
// the URL unchanged with no srcSet.
export function webpSrcSet(jpgUrl: string): { src: string; srcSet?: string; sizes?: string } {
  const m = jpgUrl.match(/^(\/trophies\/.+)\.(jpe?g)$/i);
  if (!m) return { src: jpgUrl };
  const stem = m[1];
  return {
    src: jpgUrl,
    srcSet: `${stem}-400.webp 400w, ${stem}-800.webp 800w, ${stem}-1200.webp 1200w`,
    sizes: '(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px',
  };
}
