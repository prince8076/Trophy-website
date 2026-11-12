// Build-time pre-render (P1 SEO): renders the homepage React app to
// static HTML and injects it into dist/index.html, so the served
// homepage contains the H1, headings and body text without JS.
// Runs as `postbuild` (after `vite build`). Uses Vite's SSR loader,
// so it renders the real components — no duplicated copy to keep
// in sync. The client still mounts with createRoot and replaces
// this static snapshot with the live app. If rendering fails, the
// build fails loudly — do not silently ship the empty #root.
import { createServer } from 'vite';
import { renderToString } from 'react-dom/server';
import React from 'react';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = resolve(root, 'dist', 'index.html');

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent',
});
try {
  const { default: App } = await vite.ssrLoadModule('/src/App.tsx');
  const html = renderToString(React.createElement(App));
  // Sanity: the pre-render must contain the homepage H1 and a
  // catalogue product, or the deploy would ship an empty shell.
  if (!html.includes('Trophies, Awards') || !html.includes('Championship Cup')) {
    throw new Error('pre-render is missing the H1 or catalogue — refusing to inject');
  }
  const out = readFileSync(outFile, 'utf8');
  if (!out.includes('<div id="root"></div>')) {
    throw new Error('dist/index.html has no empty #root to inject into');
  }
  writeFileSync(outFile, out.replace('<div id="root"></div>', `<div id="root">${html}</div>`));
  console.log(`[prerender] injected ${html.length} chars into dist/index.html`);
} finally {
  await vite.close();
}
