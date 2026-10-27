# ALIVE — Make the Web Feel Alive

A premium, scroll-driven interactive website, inspired in interaction style
only by the scrolling experience of string-tune — with original branding,
layouts, copy, and visuals throughout. Nothing from the reference site's
text, code, images, or marks is copied.

**Branch:** in `prince8076/Trophy-website`, this app lives on branch
`fresh-design-v4` under `motion-studio/` — a self-contained Vite app.
It reuses nothing from the trophy site's code or design. From that branch:
`cd motion-studio && npm install && npm run dev`.

## What it is

A creative development studio showcase where scrolling controls the experience:

- **Intro** — 0–100% progress, title rising character by character, grain texture, quick fade into the hero.
- **Hero (100vh)** — "MAKE THE WEB FEEL ALIVE." with staggered char rise, pointer parallax, canvas particles, grid lines, and a hero that shifts as scrolling begins.
- **Scroll reveal + parallax + kinetic type** — masked panel reveal, layers drifting at different speeds, a large sentence filling word by word on scroll.
- **Sticky storytelling** — a pinned stage with 3 stages (dot → rhythm → composition), scrubbed by scroll, with a progress bar. Stacks normally on mobile.
- **Horizontal section** — vertical scroll drives a horizontal card track, pinned on desktop, with progress bar and counter. Native horizontal swipe on mobile.
- **Motion Experiments** — 6 live demos: Reveal, Parallax, Kinetic Type, Magnetic Buttons, Cursor Tracking, Scroll Progress.
- **Principles** — 01 Motion with purpose, 02 Performance first, 03 Designed for discovery, 04 Built with precision.
- **Cursor** — dot + trailing ring on desktop fine pointers only, expands over interactive elements, never blocks clicks or selection.
- **Nav + progress** — fixed nav, thin page-progress line, active section, mobile menu, floating back-to-top.
- **Final CTA** — "LET'S MAKE SOMETHING MOVE." with a working contact modal (local success state, no real details invented, nothing sent anywhere) and a minimal footer.

## Tech

React 19 + Vite 8 + TypeScript, GSAP 3 + ScrollTrigger, Lenis (smooth scroll, desktop only — native scrolling on mobile and when reduced motion is on), Lucide icons, modern CSS with variables and clamp() typography. No external images — visuals are CSS/SVG/canvas, so there are no broken image assets.

## Run locally

```bash
cd motion-studio
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173/).

## Build / deploy

```bash
npm run build
npm run preview
```

`npm run build` outputs a static `dist/` folder. Deploy that folder to any
static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc.) — for
example, with Netlify: drag `dist/` into Netlify Drop, or set the build
command to `npm run build` and the publish directory to `dist`.

## Check at different widths

The layout is tested in code for 360px, 768px, 1024px, and 1440px+:
desktop gets pinned sections, horizontal scroll, and the custom cursor;
tablet simplifies parallax; mobile uses native scrolling, stacked layouts,
and no custom cursor. `prefers-reduced-motion` disables the heavy
animations and shows content statically.

## Structure

```
src/
  App.tsx                 — Lenis + GSAP wiring, nav progress, footer, CTA
  index.css               — design tokens and all section styles
  components/
    Intro.tsx             — loading sequence
    Navbar.tsx            — fixed nav, progress, mobile menu
    Cursor.tsx            — custom cursor (desktop only)
    Hero.tsx              — 100vh hero, particles, pointer parallax
    Reveal.tsx            — IntersectionObserver reveal helper
    Story.tsx             — reveal, parallax, kinetic type
    StickyStory.tsx       — pinned 3-stage story
    Horizontal.tsx        — pinned horizontal track
    Experiments.tsx       — 6 live demos
    Principles.tsx        — 01–04 editorial sections
    ContactModal.tsx      — working contact modal (local only)
```

## Notes / honest limits

- Visual verification in this VM was limited to a production build and a
  served preview returning 200 — the browser here blocks local addresses,
  so please check the animations yourself at 360 / 768 / 1024 / 1440px
  after `npm run dev`, especially the pinned horizontal section and the
  sticky story on your machine.
- If GSAP or Lenis ever failed to initialise, the Reveal sections still
  work via IntersectionObserver and the page remains scrollable and readable.
