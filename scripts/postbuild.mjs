// Writes dist/sitemap.xml after the Astro build (Site Brief #1, R7):
// only pages that are served with 200 and "index"; lastmod = the date the page's source last changed in git.
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
// translated pages first (scripts/i18n/build.mjs): they are listed in the sitemap below
await import('./i18n/build.mjs');
const LANGS = [['en', 'en'], ['de', 'de'], ['fr', 'fr'], ['it', 'it'], ['es', 'es'], ['ru', 'ru'], ['el', 'el'], ['ar', 'ar'], ['zh', 'zh-Hans']];
const I18N_ROUTES = ['/', '/platform', '/about', '/contact'];
const at = (c, p) => (c === 'en' ? p : p === '/' ? `/${c}` : `/${c}${p}`);

const SITE = 'https://www.orvum.com';
const PAGES = [
  { path: '/', src: ['src/pages/index.astro', 'public/hero.html'] },
  { path: '/platform', src: ['src/pages/platform.astro'] },
  { path: '/about', src: ['src/pages/about.astro'] },
  { path: '/contact', src: ['src/pages/contact.astro'] },
  { path: '/privacy', src: ['src/pages/privacy.astro', 'src/legal/privacy-body.html', 'src/site.mjs'] },
  { path: '/terms', src: ['src/pages/terms.astro', 'src/legal/terms-body.html'] },
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

const alt = (p) => LANGS.map(([c, l]) => `\n    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${at(c, p)}"/>`).join('') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${p}"/>`;
const entries = [];
for (const p of PAGES) {
  const lm = lastChanged([...p.src, 'i18n']);
  if (I18N_ROUTES.includes(p.path)) for (const [c] of LANGS) entries.push(`  <url>\n    <loc>${SITE}${at(c, p.path)}</loc>\n    <lastmod>${c === 'en' ? lastChanged(p.src) : lm}</lastmod>${alt(p.path)}\n  </url>`);
  else entries.push(`  <url>\n    <loc>${SITE}${p.path}</loc>\n    <lastmod>${lastChanged(p.src)}</lastmod>\n  </url>`);
}
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`);
console.log(`sitemap.xml: ${entries.length} URLs`);
