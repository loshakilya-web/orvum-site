// Static checks on dist/ before a preview is accepted (Site Brief #1 acceptance + R4/R7/R9).
import { readFileSync, existsSync } from 'node:fs';
const S = 'https://www.orvum.com';
const pages = {
  '/': { file: 'index.html', title: 'ORVUM — The AI-Native Retail Operating System', h1: 'ORVUM — The Intelligence Core for Retail', must: ['One operating system for the whole retail chain', 'What is ORVUM?', 'Where is ORVUM based?'] },
  '/platform': { file: 'platform.html', title: 'ORVUM Platform — Retail Buying, Inventory, POS & Finance', h1: 'The ORVUM platform', must: ['The problem: retail runs on disconnected systems', 'Design principles', 'Development status', 'One product master.'] },
  '/about': { file: 'about.html', title: 'About ORVUM — Founded by a Retail Operator in Cyprus', h1: 'About ORVUM', must: ['Why we are building ORVUM', 'How we build', 'Background: owner of First Boutique and Millya Group'] },
  '/contact': { file: 'contact.html', title: 'Contact ORVUM', h1: 'Contact ORVUM', must: ['truth@orvum.com', 'linkedin.com/company/orvum', 'Cyprus'] },
  '/privacy': { file: 'privacy.html', title: 'Privacy · ORVUM', h1: 'Privacy', must: ['Vercel Web Analytics', 'ORVUM TECHNOLOGIES LTD', 'Notice version'] },
  '/terms': { file: 'terms.html', title: 'Terms of use · ORVUM', h1: 'Website terms of use', must: ['Terms version'] },
};
let fail = 0;
const bad = (m) => { fail++; console.log('  FAIL', m); };
const dec = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
for (const [path, p] of Object.entries(pages)) {
  console.log(path);
  const h = readFileSync(`dist/${p.file}`, 'utf8');
  const title = dec((h.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  if (title !== p.title) bad(`title "${title}"`);
  if (title.length > 60) bad(`title ${title.length} chars`);
  const desc = dec((h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  if (!desc || desc.length > 160) bad(`description ${desc.length} chars`);
  const can = (h.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  if (can !== S + path) bad(`canonical ${can}`);
  const h1s = [...h.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => dec(m[1].replace(/<[^>]+>/g, '').trim()));
  if (h1s.length !== 1 || h1s[0] !== p.h1) bad(`h1 ${JSON.stringify(h1s)}`);
  const ld = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (path !== '/privacy' && path !== '/terms' && ld.length !== 1) bad(`json-ld blocks: ${ld.length}`);
  for (const m of ld) { try { const j = JSON.parse(m[1]); const t = JSON.stringify(j); if (/TODO|aggregateRating|"offers"|"review"|legalName/.test(t)) bad('forbidden JSON-LD property'); } catch { bad('invalid JSON-LD'); } }
  for (const m of p.must) if (!h.includes(m)) bad(`missing text: ${m}`);
  if (/<meta name="robots" content="[^"]*noindex/.test(h)) bad('noindex');
  if (!h.includes('/js/va-init.js')) bad('analytics init missing');
  if (/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>/.test(h)) bad('inline script (blocked by CSP)');
  for (const a of ['/platform', '/about', '/contact', '/privacy']) if (!h.includes(`href="${a}"`)) bad(`no link to ${a}`);
  if (/investor\.orvum/.test(h)) bad('investor site linked');
}
const sm = readFileSync('dist/sitemap.xml', 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log('sitemap', locs.length, 'URLs');
for (const path of Object.keys(pages)) if (!locs.includes(S + path)) bad(`sitemap lacks ${path}`);
const hero = readFileSync('dist/hero.html', 'utf8');
if (/pin-in|\/api\/pin|keypad/.test(hero)) bad('hero still contains the access-code gate');
if (!/noindex, indexifembedded/.test(hero)) bad('hero lost noindex');
for (const f of ['robots.txt', 'llms.txt', '404.html', 'site/brand/og-image.png', 'site/brand/icon-512.png', 'googlefe6f4722fdf19bee.html']) if (!existsSync(`dist/${f}`)) bad(`missing ${f}`);
// every local asset referenced by a page exists
for (const f of ['index.html', 'platform.html', 'about.html', 'contact.html', 'privacy.html', 'terms.html', '404.html', 'hero.html']) {
  const h = readFileSync(`dist/${f}`, 'utf8');
  for (const m of h.matchAll(/(?:src|href)="(\/[^"#?]*)"/g)) {
    const u = m[1]; if (u.startsWith('/_vercel/') || ['/hero', '/', '/platform', '/about', '/contact', '/privacy', '/terms'].includes(u)) continue;
    if (!existsSync(`dist${u}`)) bad(`${f}: missing asset ${u}`);
  }
}
console.log(fail ? `\n${fail} problem(s)` : '\nAll checks passed');
process.exit(fail ? 1 : 0);
