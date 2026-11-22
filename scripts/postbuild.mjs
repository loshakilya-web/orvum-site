// Writes dist/sitemap.xml after the Astro build (Site Brief #1, R7):
// only pages that are served with 200 and "index"; lastmod = the date the page's source last changed in git.
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';

const SITE = 'https://www.orvum.com';
const PAGES = [
  { path: '/', src: ['src/pages/index.astro', 'public/hero.html'] },
  { path: '/platform', src: ['src/pages/platform.astro'] },
  { path: '/about', src: ['src/pages/about.astro'] },
  { path: '/contact', src: ['src/pages/contact.astro'] },
  { path: '/privacy', src: ['src/pages/privacy.astro', 'src/legal/privacy-body.html', 'src/site.mjs'] },
  { path: '/terms', src: ['src/pages/terms.astro', 'src/legal/terms-body.html'] },
  { path: '/tools', src: ['src/pages/tools/index.astro', 'src/learn.mjs'] },
  { path: '/tools/open-to-buy-calculator', src: ['src/pages/tools/open-to-buy-calculator.astro', 'public/js/calc-otb.js', 'src/learn.mjs'] },
  { path: '/tools/sell-through-calculator', src: ['src/pages/tools/sell-through-calculator.astro', 'public/js/calc-st.js', 'src/learn.mjs'] },
  { path: '/glossary', src: ['src/pages/glossary/index.astro', 'src/learn.mjs'] },
  ...['open-to-buy', 'sell-through-rate', 'gmroi', 'weeks-of-supply', 'inventory-turnover', 'clienteling'].map((s) => ({ path: `/glossary/${s}`, src: ['src/pages/glossary/[slug].astro', 'src/learn.mjs'] })),
];

const today = new Date().toISOString().slice(0, 10);
function lastChanged(files) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...files], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return out || today;
  } catch { return today; }
}

for (const p of PAGES) {
  const file = p.path === '/' ? 'dist/index.html' : `dist${p.path}.html`;
  const html = readFileSync(file, 'utf8');
  if (/<meta name="robots" content="[^"]*noindex/.test(html)) throw new Error(`${p.path} is noindex but listed in the sitemap`);
}

const urls = PAGES.map((p) => `  <url>\n    <loc>${SITE}${p.path}</loc>\n    <lastmod>${lastChanged(p.src)}</lastmod>\n  </url>`).join('\n');
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
console.log(`sitemap.xml: ${PAGES.length} URLs`);
