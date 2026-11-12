// Generates the 9 SEO content pages (P2) as static HTML under
// public/<slug>/index.html, plus the sitemap listing all 10 URLs.
// Runs as part of `prebuild`, so the pages are in public/ and get
// copied to dist/ by the Vite build. Vercel serves each
// public/<slug>/index.html at /<slug>/ with HTTP 200 — real pages,
// not JS-only routes.
//
// Copy rules (from the Company Profile — do not invent numbers,
// prices, dates or clients): 20+ years, led by Ms. Madhu Sharma;
// materials crystal, metal, acrylic, wood; end-to-end consultation,
// design, production, delivery; free laser engraving of text, logos
// and motifs; custom shapes, themes, styles, size and colour;
// serves educational institutions, sports associations, corporate
// organisations, government bodies, social organisations and event
// management. Orders on WhatsApp and email only — no prices, no
// checkout. Titles/metas are the copy-paste-ready values from the
// SEO fix list.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pub = resolve(root, 'public');
const SITE = 'https://www.shreejicorporates.com';
const WA = 'https://wa.me/918796977707?text=Hi%20Shreeji%20Corporates%2C%20I%27d%20like%20a%20quote%20for%20trophies.';
const EMAIL = 'mailto:shreejicorporates@gmail.com?subject=Order%20enquiry';
const PHONE_DISPLAY = '+91 87969 77707';
const ADDRESS = 'Plot D-102, FF Back Side, Hastsal Vihar Part-III, Uttam Nagar, New Delhi – 110059';

// How ordering works — the same three steps on every page, because
// that is how the business actually works.
const PROCESS = `
<h2>How ordering works</h2>
<p>There is no checkout and no form to fill in. Ordering is a conversation, and it takes three steps.</p>
<h3>1. Tell us on WhatsApp or email</h3>
<p>Send the occasion, the design idea and the quantity — a message on WhatsApp to ${PHONE_DISPLAY}, or an email to shreejicorporates@gmail.com. A photo of a trophy you like, a logo, or a rough sketch all help. If you are not sure what you want yet, say so; that is a normal starting point.</p>
<h3>2. We design it with you</h3>
<p>We suggest shapes, materials and sizes for the occasion and the budget you have in mind, and work out the engraving — the names, the wording, a logo or a motif. You approve the design before anything is made. Nothing goes into production until you are happy with it.</p>
<h3>3. Made and delivered</h3>
<p>Consultation, design, production and delivery happen under one roof. Every piece is checked before it leaves, and packed to arrive unbroken. Engraving is included, and every order is made to order — there is no warehouse of ready-made trophies with someone else's name on them.</p>
<p>Because everything is made to order, the right time to get in touch is as soon as you know the date of the event. A clear brief and an approved design early on is what makes a smooth delivery.</p>
`;

// Who the work is for — the six sectors from the Company Profile.
const SECTORS = `
<h2>Who we make these for</h2>
<p>Shreeji Corporates has spent over 20 years making recognition for six kinds of customer, and the work is shaped around each of them:</p>
<ul>
<li><strong>Educational institutions</strong> — schools, colleges and universities, for annual days, sports days, academic prizes and farewells.</li>
<li><strong>Sports associations</strong> — tournaments, leagues and championships, from a single winner's cup to a full set of medals and trophies for every category.</li>
<li><strong>Corporate organisations</strong> — employee recognition, sales awards, service milestones and dealer meets.</li>
<li><strong>Government bodies</strong> — official functions, ceremonies and departmental recognition.</li>
<li><strong>Social organisations</strong> — community programmes, cultural events and volunteer recognition.</li>
<li><strong>Event management</strong> — agencies that need reliable, on-brief awards for a client's event, delivered in time.</li>
</ul>
<p>The same promise runs through all of them: we don't just supply awards — we craft meaningful recognition.</p>
`;

const NAV_LINKS = [
  ['/', 'Home'],
  ['/trophy-manufacturer-in-delhi/', 'Trophy Manufacturer'],
  ['/crystal-trophies/', 'Crystal Trophies'],
  ['/acrylic-trophies/', 'Acrylic Trophies'],
  ['/metal-trophies/', 'Metal Trophies'],
  ['/corporate-awards/', 'Corporate Awards'],
  ['/custom-medals/', 'Custom Medals'],
  ['/mementos/', 'Mementos'],
  ['/corporate-gifts-in-delhi/', 'Corporate Gifts'],
  ['/trophy-shop-in-uttam-nagar/', 'Trophy Shop in Uttam Nagar'],
];

function navHtml() {
  return NAV_LINKS.map(([href, label]) => `<a href="${href}">${label}</a>`).join('\n      ');
}

function faqJsonLd(faqs) {
  const items = faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  }));
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items,
  };
}

function pageHtml(p) {
  const url = `${SITE}/${p.slug}/`;
  const related = NAV_LINKS.filter(([href]) => href !== `/${p.slug}/` && href !== '/')
    .map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('\n        ');
  const photos = p.photos.map(({ src, alt, caption }) => `
      <figure>
        <img src="${src}" alt="${alt}" loading="lazy" width="1200" height="900" />
        <figcaption>${caption}</figcaption>
      </figure>`).join('');
  const faqs = p.faqs.map(({ q, a }) => `
      <div class="faq-item">
        <h3>${q}</h3>
        <p>${a}</p>
      </div>`).join('');
  const sections = p.sections.map(({ h2, html }) => `
    <h2>${h2}</h2>
    ${html}`).join('');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${p.title}</title>
  <meta name="description" content="${p.meta}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${p.title}" />
  <meta property="og:description" content="${p.meta}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${SITE}/og-image.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${p.title}" />
  <meta name="twitter:description" content="${p.meta}" />
  <meta name="twitter:image" content="${SITE}/og-image.jpg" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="stylesheet" href="/seo-pages.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "${SITE}/#business",
    "name": "Shreeji Corporates",
    "description": "Shreeji Corporates, New Delhi — trophies, awards, mementos and corporate gifts, customised in crystal, metal, acrylic and wood. Over 20 years of meaningful recognition. Order on WhatsApp and email.",
    "url": "${SITE}/",
    "image": "${SITE}/og-image.jpg",
    "telephone": "+91 87969 77707",
    "email": "shreejicorporates@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Plot D-102, FF Back Side, Hastsal Vihar Part-III, Uttam Nagar",
      "addressLocality": "New Delhi",
      "postalCode": "110059",
      "addressCountry": "IN"
    }
  }
  </script>
  <script type="application/ld+json">
  ${JSON.stringify(faqJsonLd(p.faqs), null, 2)}
  </script>
</head>
<body>
  <header class="site-header">
    <div class="wrap">
      <a class="logo" href="/">SHREEJI<b>.</b></a>
      <nav class="site-nav">
      ${navHtml()}
      </nav>
    </div>
  </header>
  <main>
    <div class="wrap">
      <p class="label">Shreeji Corporates — New Delhi</p>
      <h1>${p.h1}</h1>
      <p class="lead">${p.intro}</p>
      <div class="photo-grid">${photos}
      </div>
      ${sections}
      ${PROCESS}
      ${SECTORS}
      <section class="faq" aria-label="Frequently asked questions">
        <h2>Frequently asked questions</h2>
        ${faqs}
      </section>
      <section class="cta" aria-label="Get a quote">
        <h2>Get a quote on WhatsApp</h2>
        <p>Tell us the occasion, the design and the quantity, and we will quote it, make it, and deliver it. Every order is bespoke — no prices are listed because no two orders are the same.</p>
        <a class="btn" href="${WA}">WhatsApp ${PHONE_DISPLAY}</a>
        <a class="btn btn-ghost" href="${EMAIL}">Email us</a>
        <p style="margin-top: 18px; font-size: 14px;">${ADDRESS}</p>
      </section>
      <section class="related" aria-label="More from Shreeji Corporates">
        <h2>More from Shreeji Corporates</h2>
        <ul>
        ${related}
        </ul>
      </section>
    </div>
  </main>
  <footer class="site-footer">
    <div class="wrap">
      <div class="cols">
        <div>
          <p><strong>Shreeji Corporates</strong><br />${ADDRESS}</p>
        </div>
        <div>
          <p>WhatsApp ${PHONE_DISPLAY}<br /><a href="${EMAIL}">shreejicorporates@gmail.com</a><br /><a href="/">shreejicorporates.com</a></p>
        </div>
      </div>
      <p style="margin-top: 20px;">© Shreeji Corporates, New Delhi — Trophies, Awards &amp; Mementos. Orders on WhatsApp and email only.</p>
    </div>
  </footer>
</body>
</html>
`;
}

const PAGES = [
  {
    slug: 'trophy-manufacturer-in-delhi',
    title: 'Trophy Manufacturer in Delhi — Custom Trophies & Awards | Shreeji Corporates',
    meta: 'Shreeji Corporates is a trophy manufacturer in Delhi with 20+ years of experience. Custom trophies in crystal, metal, acrylic and wood, with free laser engraving. Get a quote on WhatsApp.',
    h1: 'Trophy Manufacturer in Delhi',
    intro: 'Shreeji Corporates is a trophy manufacturer in Delhi with over 20 years of experience making custom trophies, awards, medals and mementos. Led by Ms. Madhu Sharma, the studio designs and makes every piece end-to-end — consultation, design, production and delivery under one roof — in crystal, metal, acrylic and wood, with free laser engraving of your text, logo or motif.',
    photos: [
      { src: '/trophies/championship-cup-prince.jpg', alt: 'Championship cup trophy with custom laser engraving', caption: 'Championship Cup — the classic cup for the biggest win of the season.' },
      { src: '/trophies/crystal-tower-prince.jpg', alt: 'Crystal tower trophy with custom laser engraving', caption: 'Crystal Tower — a tall, clear statement for a standout achievement.' },
      { src: '/trophies/crystal-globe-prince.jpg', alt: 'Crystal globe trophy with custom laser engraving', caption: 'Crystal Globe — the world, recognised, for a global win.' },
    ],
    sections: [
      {
        h2: 'What a trophy manufacturer actually does',
        html: `<p>A trophy manufacturer is not a shop that sells ready-made cups off a shelf. The work starts with the occasion and the person being recognised, and ends with a piece made for that moment. At Shreeji Corporates the process is consultation first: what is being celebrated, who is receiving it, how many are needed, and when the event is. From that brief comes a design — a shape, a material, a size — and the engraving that makes it personal. Only then does production begin.</p>
<p>Because everything is made to order, there is no catalogue of fixed prices. A small acrylic star for a school sports day and a tall crystal tower for a corporate lifetime achievement award are different pieces of work, and they are quoted as such. What is the same in every order is the standard: the piece is checked before it leaves, packed to arrive unbroken, and engraved precisely.</p>
<p>The studio works in four materials — crystal, metal, acrylic and wood — and each behaves differently. Crystal is heavy, clear and formal; it suits milestones and senior recognition. Metal is the traditional cup and salver, the shape most people picture when they hear the word trophy. Acrylic is light and modern, and it takes colour and unusual shapes well. Wood is warm and understated, and it suits tributes and long-service pieces. A good manufacturer will steer you toward the material that fits the occasion, not just the one you first thought of.</p>`,
      },
      {
        h2: 'Custom trophies, not off-the-shelf',
        html: `<p>Customisation is the whole point of a manufacturer. The shape, the theme, the style, the size and the colour are all tailored to the order. A cricket tournament wants a cup; a school annual day wants a mix of cups, shields and medals; a corporate awards night wants a consistent set in one material with the company branding carried across every piece. The engraving is part of the same conversation — the recipient's name, the award title, the date, a logo or a motif, laser-engraved and included with every trophy.</p>
<p>That is why the first message matters more than a catalogue. When you write on WhatsApp, include the occasion, roughly how many pieces you need, and the date of the event. A photo of a trophy you liked, or a logo file, helps the design conversation start faster. If you are not sure what you want, say that too — suggesting shapes and materials for an occasion is part of the job.</p>`,
      },
      {
        h2: 'Why Delhi, why Uttam Nagar',
        html: `<p>Shreeji Corporates is based in Uttam Nagar, New Delhi, at Plot D-102, FF Back Side, Hastsal Vihar Part-III. Being a Delhi manufacturer matters for two practical reasons. First, the design conversation can happen in person as well as on WhatsApp — you can come and see materials and finished pieces before you commit. Second, production and delivery are in the same place, so there is no long chain between the person who designed your trophy and the person who made it.</p>
<p>Over 20 years, the studio has made trophies for schools and colleges, sports associations, corporate organisations, government bodies, social organisations and event management companies. The range is wide because the occasions are wide — an inter-school cricket final, a corporate sales award, a government ceremony, a community programme. The common thread is that the recognition has to feel like it was made for the person receiving it, not picked from a shelf.</p>`,
      },
    ],
    faqs: [
      { q: 'How do I order a custom trophy in Delhi?', a: 'Send a message on WhatsApp to +91 87969 77707 or an email to shreejicorporates@gmail.com with the occasion, the design idea and the quantity. We will suggest shapes, materials and sizes, work out the engraving with you, and quote it. You approve the design before anything is made.' },
      { q: 'Is engraving included?', a: 'Yes. Free laser engraving of text, logos and motifs is included with every trophy. Tell us the names, the award wording and any logo when you order, and it is engraved precisely.' },
      { q: 'What materials can I choose from?', a: 'Crystal, metal, acrylic and wood. Each suits different occasions — crystal for formal milestones, metal for traditional cups, acrylic for light modern designs, and wood for warm, understated tributes. We will help you pick the right one for your event.' },
      { q: 'How far in advance should I order?', a: 'As soon as you know the date of the event. Every piece is made to order, so a clear brief and an approved design early on is what makes a smooth delivery. Contact us on WhatsApp and we will work out a timeline with you.' },
      { q: 'Do you make trophies for schools and sports tournaments?', a: 'Yes. Schools, colleges, sports associations and tournament organisers are among our regular customers — from a single winner\u2019s cup to a full set of trophies and medals for every category.' },
    ],
  },
  {
    slug: 'crystal-trophies',
    title: 'Crystal Trophies in Delhi — Custom Engraved Crystal Awards | Shreeji Corporates',
    meta: 'Custom crystal trophies and awards in New Delhi, laser-engraved with your logo and text. Premium crystal designs for corporate awards, milestones and ceremonies. Order on WhatsApp.',
    h1: 'Crystal Trophies in Delhi',
    intro: 'Crystal is the most formal material a trophy can be made from — heavy, clear and unmistakable on a desk or a stage. Shreeji Corporates makes custom crystal trophies and awards in New Delhi, laser-engraved with your logo and text, for corporate awards, milestones and ceremonies. Every crystal piece is made to order, with the design approved by you before production begins.',
    photos: [
      { src: '/trophies/crystal-tower-prince.jpg', alt: 'Crystal tower trophy with custom laser engraving', caption: 'Crystal Tower — a tall, clear statement for a standout achievement.' },
      { src: '/trophies/crystal-globe-prince.jpg', alt: 'Crystal globe trophy with custom laser engraving', caption: 'Crystal Globe — the world, recognised, for a global win.' },
      { src: '/trophies/crystal-gold-prince.jpg', alt: 'Crystal gold star trophy with faceted crystal and gold star', caption: 'Crystal Gold Star — faceted crystal crowned with a gold star, for the highest honour.' },
    ],
    sections: [
      {
        h2: 'Why crystal, and when it is the right choice',
        html: `<p>Crystal suits the occasions that need weight — literally and figuratively. A lifetime achievement award, a retirement, a company's highest honour, a milestone anniversary: these are the moments where a crystal trophy says what a lighter material cannot. It is the material people keep on their desk for years, and it is the one that photographs best on a stage.</p>
<p>That does not make it right for everything. For a school sports day with dozens of winners, crystal would be heavy and costly; acrylic or metal usually fits better. For a single senior recognition, or a small set of top awards at a corporate night, crystal is the natural choice. Part of the design conversation is exactly this judgement — matching the material to the moment, not just to a budget.</p>`,
      },
      {
        h2: 'The crystal range',
        html: `<p>Crystal trophies come in several forms, and the shape should follow the award. A tall tower is a clear, upright statement — it reads well from a distance and stands out in a photograph. A globe carries a different meaning: it suits global achievement, international programmes and anything where the world is the point. A faceted column crowned with a gold star is the most ceremonial of the three, and it is the piece we recommend when the award is the single highest honour of the evening.</p>
<p>Within those forms, the customisation is in the engraving and the proportions. The height, the base, the wording and the logo are all tailored. Crystal takes laser engraving beautifully — the text sits in the surface with a clean, frosted edge, and a logo engraves with the same precision. The engraving is included with every piece, and you approve the layout before it is cut.</p>`,
      },
      {
        h2: 'Engraving crystal: what to send us',
        html: `<p>For the best result, send the exact wording as you want it to appear — the recipient's name, the award title, the date — and the logo as a clear file if you want it engraved. If you have a previous trophy whose wording you liked, a photo of it helps. We will set out the engraving, show you the layout, and only proceed once you have approved it.</p>
<p>Crystal is unforgiving of mistakes, which is why the approval step matters. Once the laser has cut, the engraving cannot be undone. That is also why every piece is checked before it leaves the studio, and packed to arrive unbroken — crystal is heavy and it needs proper packing, not a thin box.</p>`,
      },
    ],
    faqs: [
      { q: 'Can you engrave our company logo on a crystal trophy?', a: 'Yes. Laser engraving of text, logos and motifs is included with every crystal trophy. Send the logo as a clear file along with the wording, and we will set out the layout for your approval before engraving.' },
      { q: 'What is the difference between a crystal tower and a crystal globe?', a: 'A tower is a tall, upright piece that reads well from a distance and suits a standout individual achievement. A globe carries a global meaning and suits international programmes or worldwide recognition. Both are engraved to order in crystal.' },
      { q: 'How do I order crystal trophies?', a: 'Message us on WhatsApp at +91 87969 77707 or email shreejicorporates@gmail.com with the occasion, the number of pieces and the date. We will suggest shapes and sizes, work out the engraving, and quote it. You approve the design before production.' },
      { q: 'Are crystal trophies suitable for corporate awards?', a: 'Yes — crystal is the most formal trophy material and is the usual choice for senior corporate recognition, lifetime achievement awards and milestone ceremonies.' },
      { q: 'How are crystal trophies packed and delivered?', a: 'Every piece is checked before it leaves and packed to arrive unbroken. Consultation, design, production and delivery are all handled under one roof, so the packing is done by the people who made the trophy.' },
    ],
  },
  {
    slug: 'acrylic-trophies',
    title: 'Acrylic Trophies & Awards — Custom Acrylic Plaques in Delhi | Shreeji Corporates',
    meta: 'Customised acrylic trophies, plaques and awards made in New Delhi in any shape, size and colour, with your branding engraved or printed. Bulk orders welcome. Get a quote today.',
    h1: 'Acrylic Trophies & Awards',
    intro: 'Acrylic is the most flexible trophy material — light, modern, and able to take almost any shape, size or colour. Shreeji Corporates makes customised acrylic trophies, plaques and awards in New Delhi, with your branding engraved or printed, for schools, sports events, corporate programmes and ceremonies. Bulk orders are welcome, and every piece is made to order.',
    photos: [
      { src: '/trophies/acrylic-star-prince.jpg', alt: 'Acrylic star trophy with custom laser engraving', caption: 'Acrylic Star — light, modern, and made to stand out.' },
      { src: '/trophies/championship-cup-prince.jpg', alt: 'Championship cup trophy with custom laser engraving', caption: 'Championship Cup — the classic cup for the biggest win of the season.' },
      { src: '/trophies/crystal-tower-prince.jpg', alt: 'Crystal tower trophy with custom laser engraving', caption: 'Crystal Tower — for when the award calls for crystal instead.' },
    ],
    sections: [
      {
        h2: 'Why acrylic works for so many occasions',
        html: `<p>Acrylic's strength is that it does not impose a shape. Crystal wants to be a tower or a globe; metal wants to be a cup. Acrylic can be a star, a plaque, a shield, a freeform shape cut to your logo, or a layered design in two or three colours. That makes it the right material when the award itself should carry the theme — a star for a rising star award, a shape that matches an event's branding, a plaque that sits flat on a desk.</p>
<p>It is also light. A school ordering fifty trophies for a sports day, or a company ordering a set for a dealer meet, will notice the difference in handling and in delivery. And because acrylic takes colour well, it is the material to choose when the award should match a brand colour or an event theme rather than stay in clear crystal or silver metal.</p>`,
      },
      {
        h2: 'Shapes, sizes and colours',
        html: `<p>There is no fixed catalogue of acrylic shapes. The size, the shape and the colour are tailored to the order — a small star for a participation award, a tall plaque for a winner, a thick freeform piece for a special recognition. Your branding can be engraved or printed, and the engraving is included with every piece.</p>
<p>When you get in touch, the most useful details are the occasion, the number of pieces, and whether you have a shape or a colour in mind. A sketch, a logo, or a photo of something you liked are all useful starting points. We will suggest what works in acrylic for that brief, and you approve the design before anything is cut.</p>`,
      },
      {
        h2: 'Acrylic for bulk orders',
        html: `<p>Acrylic is the material most often chosen for bulk orders, because it is consistent piece to piece and it scales well. A school sports day, a tournament with many categories, a corporate programme with an award for every region — these are the orders where acrylic's lightness and flexibility pay off. The engraving stays precise across the whole run, because each piece is engraved to the same approved layout.</p>
<p>For bulk orders, the timeline matters more than for a single piece. Get in touch as soon as you know the date and the approximate numbers, even if the final names are not ready yet — the design and the material can be settled early, and the engraving list can follow.</p>`,
      },
    ],
    faqs: [
      { q: 'Can acrylic trophies be made in any shape?', a: 'Yes. Acrylic can be cut to almost any shape, size or colour — a star, a plaque, a shield, a freeform shape or a design matched to your logo. Tell us the shape or theme you have in mind and we will work out the design with you.' },
      { q: 'Can you print or engrave our branding on acrylic?', a: 'Yes. Your branding can be engraved or printed on acrylic trophies, and engraving is included with every piece. Send your logo and the wording you want, and we will set out the layout for your approval.' },
      { q: 'Are acrylic trophies good for bulk orders?', a: 'Yes. Acrylic is light, consistent piece to piece and scales well, which makes it the usual choice for school sports days, tournaments with many categories and corporate programmes. Contact us early with the date and approximate numbers.' },
      { q: 'How do I order acrylic trophies in Delhi?', a: 'Message us on WhatsApp at +91 87969 77707 or email shreejicorporates@gmail.com with the occasion, the quantity and the date. We will suggest shapes and sizes, work out the engraving, and quote it.' },
      { q: 'What is the difference between acrylic and crystal trophies?', a: 'Crystal is heavier and more formal, and suits senior recognition and milestones. Acrylic is lighter, more flexible in shape and colour, and suits larger numbers and themed awards. We will help you pick the right material for your occasion.' },
    ],
  },
  {
    slug: 'metal-trophies',
    title: 'Metal Trophies & Championship Cups in Delhi | Shreeji Corporates',
    meta: 'Metal trophies, championship cups and sports awards crafted in New Delhi for tournaments, leagues and corporate events. Custom engraving included. Enquire on WhatsApp.',
    h1: 'Metal Trophies & Championship Cups in Delhi',
    intro: 'Metal is the original trophy material — the cup, the salver, the shield. Shreeji Corporates crafts metal trophies, championship cups and sports awards in New Delhi for tournaments, leagues and corporate events, with custom engraving included. Every metal piece is made to order, in the shape and size the occasion calls for.',
    photos: [
      { src: '/trophies/championship-cup-prince.jpg', alt: 'Championship cup trophy with custom laser engraving', caption: 'Championship Cup — the classic cup for the biggest win of the season.' },
      { src: '/trophies/silver-salver-prince.jpeg', alt: 'Silver salver trophy with custom laser engraving', caption: 'Silver Salver — a timeless tray for a formal presentation.' },
      { src: '/trophies/acrylic-star-prince.jpg', alt: 'Acrylic star trophy with custom laser engraving', caption: 'Acrylic Star — a lighter, modern alternative for larger numbers.' },
    ],
    sections: [
      {
        h2: 'The cup, the salver and the shield',
        html: `<p>Metal trophies come in three classic forms, and each one means something slightly different. The cup is the winner's trophy — tall, handled, and unmistakable. It is what a championship final deserves, and it is the shape a team lifts. The salver is a flat, formal tray, usually silver, and it suits presentations, long service and ceremonial occasions where a cup would be too much. The shield is the traditional school and club award, warm and understated, and it hangs well on a wall.</p>
<p>Within those forms, the size is tailored to the occasion. A league winner's cup is tall; a runner-up cup is a step down; a category winner's cup sits between them. Getting the sizes right across a set is part of the work — the pieces should look like they belong together, with the hierarchy clear at a glance.</p>`,
      },
      {
        h2: 'Metal for tournaments and leagues',
        html: `<p>Tournaments and leagues are where metal trophies earn their keep. A season is long, the final matters, and the trophy has to feel like the occasion. That means the right cup for the winners, matching pieces for runners-up and categories, and medals for the wider field — all engraved consistently, so the set reads as one event rather than a collection of unrelated pieces.</p>
<p>For a tournament, the most useful details to send are the name of the event, the categories, the number of pieces in each category, and the date of the final. Names for engraving can follow later — the cups and the layout can be settled first, and the engraving list added once the winners are known. That is how most tournaments order: design and production first, final names last.</p>`,
      },
      {
        h2: 'Engraving metal',
        html: `<p>Metal takes engraving cleanly, and the wording is what turns a cup into a record of a win. The tournament name, the category, the year and the recipient's name are the usual elements, and the layout is set out for your approval before it is cut. A logo can be engraved as well. The engraving is included with every piece.</p>
<p>Because metal trophies are often ordered in sets, consistency matters. The same wording style, the same placement, the same depth of cut across the whole set — that is what makes a tournament's trophies look like they were made together, which they were.</p>`,
      },
    ],
    faqs: [
      { q: 'What metal trophies do you make?', a: 'Championship cups, silver salvers and shields, in sizes tailored to the occasion. Metal is the traditional trophy material and suits tournaments, leagues, corporate events and formal presentations.' },
      { q: 'Can you make a full set for a tournament?', a: 'Yes. We regularly make full tournament sets — a winner\u2019s cup, runners-up and category trophies, plus medals — all engraved consistently so the set reads as one event. Send the categories, the numbers and the date of the final.' },
      { q: 'Is engraving included on metal trophies?', a: 'Yes. Free laser engraving of text, logos and motifs is included with every metal trophy. The layout is set out for your approval before it is cut.' },
      { q: 'How do I order metal trophies in Delhi?', a: 'Message us on WhatsApp at +91 87969 77707 or email shreejicorporates@gmail.com with the occasion, the categories and the quantity. We will suggest shapes and sizes, work out the engraving, and quote it.' },
      { q: 'Can the winners\u2019 names be added after the final?', a: 'Yes. The cups and the layout can be settled first, and the engraving list added once the winners are known. That is how most tournaments order.' },
    ],
  },
  {
    slug: 'corporate-awards',
    title: 'Corporate Awards & Employee Recognition Trophies — Delhi | Shreeji Corporates',
    meta: 'Corporate awards and employee recognition trophies customised with your company branding. Trusted by corporate organisations across India for 20+ years. Request a bespoke quote.',
    h1: 'Corporate Awards & Employee Recognition Trophies',
    intro: 'A corporate award is not just a trophy — it is a message from the company to the person receiving it. Shreeji Corporates makes corporate awards and employee recognition trophies in Delhi, customised with your company branding, for sales awards, service milestones, dealer meets and annual recognition nights. Every piece is made to order, with the design approved by you before production.',
    photos: [
      { src: '/trophies/crystal-tower-prince.jpg', alt: 'Crystal tower trophy with custom laser engraving', caption: 'Crystal Tower — a tall, clear statement for a standout achievement.' },
      { src: '/trophies/crystal-gold-prince.jpg', alt: 'Crystal gold star trophy with faceted crystal and gold star', caption: 'Crystal Gold Star — for the highest honour of the evening.' },
      { src: '/trophies/championship-cup-prince.jpg', alt: 'Championship cup trophy with custom laser engraving', caption: 'Championship Cup — the classic cup for a team win.' },
    ],
    sections: [
      {
        h2: 'What makes a corporate award work',
        html: `<p>A corporate award has to do two things at once. It has to honour the individual — the salesperson who exceeded target, the engineer who shipped the impossible, the employee who completed twenty-five years. And it has to carry the company — its name, its branding, its standard. A generic trophy with a name stuck on it does neither well. A piece designed around the company's branding, in a material that fits the level of the award, does both.</p>
<p>That is why the design conversation starts with the programme, not with a catalogue. Is this a single lifetime achievement award, or a set of fifty for a sales conference? Is it the top honour of the night, or one of several categories? The answers decide the material, the size and the shape — crystal for the senior recognition, a consistent set in one material for the wider programme, with the company branding carried across every piece.</p>`,
      },
      {
        h2: 'Branding, done properly',
        html: `<p>Company branding on a trophy is not a sticker. The logo is laser-engraved into the material, along with the award title and the recipient's name, and the layout is set out for your approval before it is cut. The engraving is included with every piece. For a set, the same layout runs across all of them, so the awards look like a programme rather than a collection of one-offs.</p>
<p>Send the logo as a clear file, along with the award titles and the list of recipients. If the list is not final yet, the design and the material can be settled first and the names added later — that is the normal way a recognition programme is ordered.</p>`,
      },
      {
        h2: 'Service milestones and long service',
        html: `<p>Long-service awards deserve particular care. Twenty-five years with a company is not a routine event, and the trophy should not look routine either. Crystal and wood suit these occasions best — crystal for its formality, wood for its warmth. The engraving carries the years of service, the name, and often a line that says what the person meant to the company. That wording is worth getting right, and it is part of the design conversation.</p>
<p>For annual recognition nights, the same care applies at scale. A consistent set in one material, with the company branding and a clear hierarchy — the top award visibly the top award — is what makes the evening feel considered rather than assembled.</p>`,
      },
    ],
    faqs: [
      { q: 'Can you put our company logo on the awards?', a: 'Yes. Your company logo is laser-engraved into the trophy along with the award title and the recipient\u2019s name, and the layout is set out for your approval before it is cut. Engraving is included with every piece.' },
      { q: 'Do you make awards for sales conferences and recognition nights?', a: 'Yes. Corporate organisations are among our regular customers — for sales awards, service milestones, dealer meets and annual recognition nights. We make both single top honours and consistent sets for a whole programme.' },
      { q: 'How do I order corporate awards?', a: 'Message us on WhatsApp at +91 87969 77707 or email shreejicorporates@gmail.com with the occasion, the number of awards and the date. Send the logo and the award titles, and we will suggest materials and shapes, work out the engraving, and quote it.' },
      { q: 'Can the recipients\u2019 names be added later?', a: 'Yes. The design, material and layout can be settled first, and the names added once the list is final. That is the normal way a recognition programme is ordered.' },
      { q: 'What material suits a long-service award?', a: 'Crystal and wood suit long service best — crystal for its formality, wood for its warmth. The engraving carries the years of service and the name, and we will help you get the wording right.' },
    ],
  },
  {
    slug: 'custom-medals',
    title: 'Custom Medals & Sports Medals Supplier in Delhi | Shreeji Corporates',
    meta: 'Custom medals for sports tournaments, schools and events, made to your design in consistent quality for bulk orders. Based in New Delhi, delivering across India. Order on WhatsApp.',
    h1: 'Custom Medals & Sports Medals in Delhi',
    intro: 'Medals are the award most people actually take home — and the one they keep. Shreeji Corporates makes custom medals for sports tournaments, schools and events in New Delhi, made to your design in consistent quality for bulk orders. Every medal is made to order, with your event name, logo and category engraved or struck to the design you approve.',
    photos: [
      { src: '/trophies/acrylic-star-prince.jpg', alt: 'Acrylic star trophy with custom laser engraving', caption: 'Acrylic Star — a lighter, modern award for larger numbers.' },
      { src: '/trophies/championship-cup-prince.jpg', alt: 'Championship cup trophy with custom laser engraving', caption: 'Championship Cup — the winner\u2019s cup, for the top of the podium.' },
      { src: '/trophies/crystal-globe-prince.jpg', alt: 'Crystal globe trophy with custom laser engraving', caption: 'Crystal Globe — for the overall champion.' },
    ],
    sections: [
      {
        h2: 'Medals for tournaments, schools and events',
        html: `<p>A medal order is usually a bulk order, and bulk is where consistency matters most. Fifty medals for a school sports day, two hundred for a tournament, a full set for every age group — each one has to look like the others, with the same event name, the same logo and the same finish. That consistency is the difference between a medal that feels earned and one that feels mass-produced.</p>
<p>Custom medals are made to your design: the event name, the category, the year, a logo or a motif. The design is approved by you before production, so what arrives is the medal you signed off on, not a surprise. Ribbons, where they are part of the order, are matched to the event as well.</p>`,
      },
      {
        h2: 'Medals and trophies together',
        html: `<p>Most tournaments order medals and trophies together, and they should be planned together. The winner's cup sits at the top, the medals cover the field, and the engraving style runs across both so the whole set reads as one event. Planning them together also means the timeline is worked out once, not twice — which matters when the final is a fixed date and the medals have to be ready for the presentation.</p>
<p>For a tournament, send the name of the event, the categories, the number of medals in each category, and the date of the final. The design can be settled early; the exact split across categories can be confirmed closer to the day.</p>`,
      },
      {
        h2: 'What to get right when ordering medals',
        html: `<p>Three things decide whether a medal order goes smoothly. First, the design — the event name and logo need to be clear files, not a blurry photo, so they reproduce cleanly. Second, the numbers — an honest count per category, with a few spares, because a missing medal on the day is worse than a spare in a drawer. Third, the timeline — medals are made to order, so the earlier the design is approved, the smoother the delivery. Get in touch as soon as the date is fixed, even if the final numbers are not.</p>`,
      },
    ],
    faqs: [
      { q: 'Can you make custom medals with our event name and logo?', a: 'Yes. Custom medals are made to your design — the event name, the category, the year, a logo or a motif. The design is approved by you before production.' },
      { q: 'Do you supply medals in bulk for tournaments?', a: 'Yes. Bulk orders for tournaments, schools and events are our regular work. Every medal is made in consistent quality so the whole run looks like one set. Send the categories, the numbers and the date of the final.' },
      { q: 'Can we order medals and trophies together?', a: 'Yes, and they should be planned together — the winner\u2019s cup, the medals for the field, and a consistent engraving style across both, with one timeline for the whole set.' },
      { q: 'How do I order custom medals in Delhi?', a: 'Message us on WhatsApp at +91 87969 77707 or email shreejicorporates@gmail.com with the event name, the categories, the quantity and the date. We will work out the design and quote it.' },
      { q: 'How far in advance should we order medals?', a: 'As soon as the date is fixed. Medals are made to order, so an approved design early on is what makes a smooth delivery. The final numbers per category can be confirmed closer to the day.' },
    ],
  },
  {
    slug: 'mementos',
    title: 'Mementos & Keepsakes — Custom Mementos in New Delhi | Shreeji Corporates',
    meta: 'Customised mementos for official functions, community programmes, farewells and ceremonies, crafted in crystal, metal, acrylic and wood in New Delhi. Order on WhatsApp or email.',
    h1: 'Mementos & Keepsakes in New Delhi',
    intro: 'A memento is not a prize for winning — it is a keepsake for being there. Shreeji Corporates makes customised mementos for official functions, community programmes, farewells and ceremonies in New Delhi, crafted in crystal, metal, acrylic and wood, and engraved with the words that make the occasion memorable. Every memento is made to order.',
    photos: [
      { src: '/trophies/crystal-tower-prince.jpg', alt: 'Crystal tower trophy with custom laser engraving', caption: 'Crystal Tower — a clear, formal keepsake.' },
      { src: '/trophies/crystal-globe-prince.jpg', alt: 'Crystal globe trophy with custom laser engraving', caption: 'Crystal Globe — for a farewell with a wider meaning.' },
      { src: '/trophies/crystal-gold-prince.jpg', alt: 'Crystal gold star trophy with faceted crystal and gold star', caption: 'Crystal Gold Star — for the highest honour.' },
    ],
    sections: [
      {
        h2: 'What a memento is for',
        html: `<p>A trophy marks a win. A memento marks a moment — a farewell, a retirement, a visit, a ceremony, a programme completed. It is given to someone who mattered to the occasion, not necessarily to someone who came first. That changes how it should be designed: the wording matters more than the size, and the piece should feel personal rather than competitive.</p>
<p>Mementos are most often given at official functions, community programmes, farewells and ceremonies. The recipient might be a guest of honour, a retiring colleague, a volunteer, a speaker, or a partner organisation. The piece carries the name of the event, the date, and often a line that says what the person contributed. Getting that wording right is the heart of the work.</p>`,
      },
      {
        h2: 'Choosing a memento',
        html: `<p>Crystal suits the most formal mementos — a farewell for a senior official, a retirement after long service, a ceremony with a chief guest. Wood suits a warmer, more personal farewell, and it takes engraving beautifully. Acrylic suits a community programme or a cultural event, where the memento can carry a shape or a colour that matches the occasion. Metal suits a formal presentation where a salver or a shield is the right form.</p>
<p>The size is usually modest. A memento is a keepsake, not a monument — it should sit comfortably on a desk or a shelf, and be easy to carry home. The engraving is what carries the weight: the person's name, the occasion, the date, and a line that will still mean something in ten years.</p>`,
      },
      {
        h2: 'The wording matters most',
        html: `<p>For a memento, spend the most time on the words. A trophy's wording is usually a title and a name. A memento's wording is a small piece of writing — a thank you, a recognition of service, a line about what the person gave. Send us the wording as you want it to appear, and we will set it out for your approval. If you are not sure what to write, tell us about the person and the occasion, and we will help you shape it.</p>
<p>Because mementos are often needed in small numbers — sometimes just one — the design conversation is personal from the start. There is no minimum order, and a single memento gets the same care as a set of fifty.</p>`,
      },
    ],
    faqs: [
      { q: 'What is the difference between a memento and a trophy?', a: 'A trophy marks a win; a memento marks a moment — a farewell, a retirement, a visit or a ceremony. Mementos are given to people who mattered to the occasion, and the wording is usually more personal than a trophy\u2019s title and name.' },
      { q: 'Can you make a single memento?', a: 'Yes. There is no minimum order, and a single memento gets the same care as a set of fifty. Mementos are often needed in small numbers, sometimes just one.' },
      { q: 'What should the engraving on a memento say?', a: 'The person\u2019s name, the occasion and the date, and a line that says what they contributed. Send the wording as you want it to appear and we will set it out for your approval — and if you are not sure what to write, tell us about the person and we will help you shape it.' },
      { q: 'How do I order mementos in Delhi?', a: 'Message us on WhatsApp at +91 87969 77707 or email shreejicorporates@gmail.com with the occasion, the number of pieces and the date. Tell us about the person and the wording, and we will suggest a material and shape, and quote it.' },
      { q: 'What material suits a farewell memento?', a: 'Crystal suits the most formal farewells, wood suits a warmer personal farewell, and acrylic suits a community programme or cultural event. We will help you pick the material that fits the occasion and the person.' },
    ],
  },
  {
    slug: 'corporate-gifts-in-delhi',
    title: 'Corporate Gifts in Delhi — Custom Branded Corporate Gifting | Shreeji Corporates',
    meta: 'Branded corporate gifts in Delhi that leave a lasting impression — customised with your logo, securely packed and reliably delivered. 20+ years of corporate gifting experience. Order on WhatsApp.',
    h1: 'Corporate Gifts in Delhi',
    intro: 'A corporate gift is a message, and the message is only as good as the gift. Shreeji Corporates makes branded corporate gifts in Delhi that leave a lasting impression — customised with your logo, securely packed and reliably delivered. With over 20 years of corporate gifting experience, the studio makes gifts that are kept, not put in a drawer.',
    photos: [
      { src: '/trophies/crystal-tower-prince.jpg', alt: 'Crystal tower trophy with custom laser engraving', caption: 'Crystal Tower — a gift that stays on the desk.' },
      { src: '/trophies/crystal-gold-prince.jpg', alt: 'Crystal gold star trophy with faceted crystal and gold star', caption: 'Crystal Gold Star — for the client or partner who matters most.' },
      { src: '/trophies/crystal-globe-prince.jpg', alt: 'Crystal globe trophy with custom laser engraving', caption: 'Crystal Globe — for a global relationship.' },
    ],
    sections: [
      {
        h2: 'What makes a corporate gift work',
        html: `<p>A corporate gift fails when it feels generic — the same item, the same branding, given to everyone, remembered by no one. It works when it feels chosen: the right piece, for the right person, with the company's branding carried properly. That is the difference between a gift and a handout, and it is the whole point of customising.</p>
<p>The best corporate gifts are the ones that stay visible. A crystal piece on a desk is seen every day; a well-made memento on a shelf is seen by visitors. That visibility is what the company is paying for — not the object itself, but the fact that it is still there, months later, carrying the brand. A cheap gift that is thrown away is not a saving; it is a message that the relationship was not worth much.</p>`,
      },
      {
        h2: 'Gifts for clients, partners and employees',
        html: `<p>Different recipients call for different gifts. A client or a partner deserves the most considered piece — crystal, engraved with care, and chosen for the relationship. An employee gift can be warmer and more personal, and it often carries a message about the year or the milestone. A dealer or a distributor gift sits between the two: it should carry the brand clearly, and it should be consistent across the whole set, so every dealer receives the same standard.</p>
<p>For festive gifting and year-end programmes, the numbers are usually the largest, and the timeline is the tightest. Get in touch as soon as you know the approximate numbers — the design and the material can be settled early, and the names or the branding list can follow.</p>`,
      },
      {
        h2: 'Branding, packing and delivery',
        html: `<p>Your logo is laser-engraved into the gift, not stuck on it, and the layout is approved by you before production. Every gift is checked before it leaves and packed to arrive unbroken — securely packed matters more for gifts than for anything else, because a gift that arrives damaged is worse than no gift at all.</p>
<p>Delivery is handled under the same roof as production, so the packing is done by the people who made the gift. If the gifts are going to multiple addresses, tell us early — the packing and the list can be worked out together rather than at the last minute.</p>`,
      },
    ],
    faqs: [
      { q: 'Can you brand corporate gifts with our logo?', a: 'Yes. Your logo is laser-engraved into the gift along with any message, and the layout is approved by you before production. Engraving is included with every piece.' },
      { q: 'Do you handle bulk corporate gifting orders?', a: 'Yes. Bulk orders for festive gifting, year-end programmes and dealer meets are regular work. Get in touch as soon as you know the approximate numbers — the design and material can be settled early, and the final list can follow.' },
      { q: 'How do I order corporate gifts in Delhi?', a: 'Message us on WhatsApp at +91 87969 77707 or email shreejicorporates@gmail.com with the occasion, the number of gifts and the date. Send your logo and we will suggest pieces, work out the branding, and quote it.' },
      { q: 'Are the gifts packed securely?', a: 'Yes. Every gift is checked before it leaves and packed to arrive unbroken. Delivery is handled under the same roof as production, so the packing is done by the people who made the gift.' },
      { q: 'What is a good corporate gift for a client?', a: 'A crystal piece, engraved with care, is the usual choice for a client or partner — it stays on the desk and carries the brand every day. Tell us about the relationship and we will suggest a piece that fits it.' },
    ],
  },
  {
    slug: 'trophy-shop-in-uttam-nagar',
    title: 'Trophy Shop in Uttam Nagar, Delhi — Trophies, Medals & Mementos | Shreeji Corporates',
    meta: 'Shreeji Corporates is a trophy shop in Uttam Nagar, New Delhi for trophies, awards, medals and mementos, customised and engraved to order. Visit us or order on WhatsApp: +91 87969 77707.',
    h1: 'Trophy Shop in Uttam Nagar, Delhi',
    intro: 'Shreeji Corporates is a trophy shop in Uttam Nagar, New Delhi, for trophies, awards, medals and mementos — customised and engraved to order. Based at Plot D-102, FF Back Side, Hastsal Vihar Part-III, Uttam Nagar, the studio has been making recognition for over 20 years, led by Ms. Madhu Sharma. Visit us, or order on WhatsApp at +91 87969 77707.',
    photos: [
      { src: '/trophies/championship-cup-prince.jpg', alt: 'Championship cup trophy with custom laser engraving', caption: 'Championship Cup — the classic cup for the biggest win of the season.' },
      { src: '/trophies/acrylic-star-prince.jpg', alt: 'Acrylic star trophy with custom laser engraving', caption: 'Acrylic Star — light, modern, and made to stand out.' },
      { src: '/trophies/crystal-tower-prince.jpg', alt: 'Crystal tower trophy with custom laser engraving', caption: 'Crystal Tower — a tall, clear statement for a standout achievement.' },
    ],
    sections: [
      {
        h2: 'Visit the shop, or order on WhatsApp',
        html: `<p>There are two ways to order, and both start the same conversation. You can visit the studio in Uttam Nagar — Plot D-102, FF Back Side, Hastsal Vihar Part-III — and see the materials and finished pieces before you commit. Seeing a crystal tower and an acrylic star side by side is often what settles the choice of material, and it is the easiest way to judge size.</p>
<p>Or you can order on WhatsApp at +91 87969 77707, or by email at shreejicorporates@gmail.com. Send the occasion, the design idea and the quantity, and the same design conversation happens over messages — with photos, a logo, or a sketch. Many customers never visit in person, and that is fine; the process is built for it.</p>`,
      },
      {
        h2: 'What the shop makes',
        html: `<p>The shop makes trophies, awards, medals and mementos, in crystal, metal, acrylic and wood, all customised and engraved to order. The range covers the usual occasions: school annual days and sports days, tournaments and leagues, corporate awards and employee recognition, government ceremonies, community programmes and farewells. There is no fixed catalogue and no fixed price list, because every order is made for its occasion.</p>
<p>Engraving is included with every piece — the names, the award wording, a logo or a motif, laser-engraved and approved by you before it is cut. The studio handles consultation, design, production and delivery under one roof, so the person you speak to is connected to the person who makes your trophy.</p>`,
      },
      {
        h2: 'Uttam Nagar, and the neighbourhoods around it',
        html: `<p>Uttam Nagar is in West Delhi, and the shop serves the neighbourhoods around it as well as the wider city — schools and sports clubs in the area, corporate offices across Delhi, and event organisers who need a reliable local maker. Being local matters when the date is close: you can come in, approve a design, and know that production and delivery are in the same place.</p>
<p>Over 20 years, the studio has become the trophy shop that schools, clubs and companies in the area return to — not because it is the nearest, but because the work is consistent. The same standard, the same care with engraving, the same packing, whether the order is one memento or a hundred medals.</p>`,
      },
    ],
    faqs: [
      { q: 'Where is the trophy shop in Uttam Nagar?', a: 'Shreeji Corporates is at Plot D-102, FF Back Side, Hastsal Vihar Part-III, Uttam Nagar, New Delhi – 110059. You can visit us to see materials and finished pieces, or order on WhatsApp at +91 87969 77707.' },
      { q: 'Can I order without visiting the shop?', a: 'Yes. Most orders happen on WhatsApp or email — send the occasion, the design idea and the quantity, and we will work out the design and the engraving with you, and quote it. You approve the design before anything is made.' },
      { q: 'What do you make at the Uttam Nagar shop?', a: 'Trophies, awards, medals and mementos in crystal, metal, acrylic and wood, all customised and engraved to order — for schools, sports tournaments, corporate awards, government ceremonies, community programmes and farewells.' },
      { q: 'Is engraving included?', a: 'Yes. Free laser engraving of text, logos and motifs is included with every trophy, medal and memento. The layout is set out for your approval before it is cut.' },
      { q: 'How do I get a quote?', a: 'Message us on WhatsApp at +91 87969 77707 or email shreejicorporates@gmail.com with the occasion, the quantity and the date. We will suggest shapes and materials, work out the engraving, and quote it. Every order is bespoke, so there is no fixed price list.' },
    ],
  },
];

// ---- generate ----
for (const p of PAGES) {
  const dir = resolve(pub, p.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'index.html'), pageHtml(p));
  console.log(`[seo-pages] wrote public/${p.slug}/index.html`);
}

// Sitemap: homepage + all 9 pages, .com only, no 404 URLs.
const urls = ['', ...PAGES.map((p) => `/${p.slug}/`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url>\n    <loc>${SITE}${u === '' ? '/' : u}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${u === '' ? '1.0' : '0.8'}</priority>\n  </url>`).join('\n')}\n</urlset>\n`;
writeFileSync(resolve(pub, 'sitemap.xml'), sitemap);
console.log(`[seo-pages] wrote public/sitemap.xml (${urls.length} URLs)`);
