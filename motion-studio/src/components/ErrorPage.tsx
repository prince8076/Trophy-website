import { MessageCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import { whatsappUrl, WHATSAPP_DISPLAY } from '../lib/whatsapp';

// Error page — one design for ALL errors, in the style of the
// UPCLOSE error page the user linked (404s.design/sites/upclose):
// black background, one giant error code in dark grey filling the
// screen and cropped at the edges, a small uppercase label, and
// one plain white sentence on the left. That is the layout only —
// no UPCLOSE logo, name, or copy is used here. This is Shreeji's
// own page: gold accents, Shreeji branding, and WhatsApp help,
// because orders on this landing page go through WhatsApp.
// code defaults to 500 (server / app error). 404 uses the same
// layout with a different sentence, so every error looks like
// it belongs to this site.
const COPY: Record<string, { label: string; heading: string; sub: string }> = {
  '500': {
    label: 'Oops! Something went wrong',
    heading: 'Something went wrong on our side.',
    sub: 'Please try again. If it keeps happening, message us on WhatsApp and we will help.',
  },
  '404': {
    label: 'Oops! Page not found',
    heading: 'This page doesn\u2019t exist.',
    sub: 'The link may be wrong, or the page may have moved. Head back home, or message us on WhatsApp.',
  },
};

export default function ErrorPage({ code = '500' }: { code?: string }) {
  const copy = COPY[code] || COPY['500'];
  return (
    <div className="error-page">
      <div className="error-giant" aria-hidden="true">{code}</div>
      <header className="error-top">
        <a className="error-logo" href="/">
          <span className="logo-dot" aria-hidden="true" /> SHREEJI
        </a>
        <span className="error-top-note">Trophies, Awards &amp; Mementos</span>
      </header>
      <div className="error-content">
        <p className="error-label">{copy.label}</p>
        <h1>{copy.heading}</h1>
        <p className="error-sub">{copy.sub}</p>
        <div className="error-actions">
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            <RotateCcw size={16} /> Try again
          </button>
          <a className="btn btn-ghost" href="/">
            <ArrowLeft size={16} /> Back to home
          </a>
          <a
            className="btn btn-ghost"
            href={whatsappUrl('Hi Shreeji Corporates, I saw an error on your website. Please help.')}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={16} /> WhatsApp {WHATSAPP_DISPLAY}
          </a>
        </div>
      </div>
    </div>
  );
}
