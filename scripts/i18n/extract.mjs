// Lists every English segment of the built site in reading order: i18n/source.json ({ id: english }), i18n/source.md (review copy)
import { readFileSync, writeFileSync } from 'node:fs';
import { PAGES, JS_FILES, ATTRS, META, LD_KEYS, walk, parsePage, norm, id, keep, jsLiterals } from './core.mjs';

const seen = new Map(); const order = [];
function add(text, where) {
  const n = norm(text); if (!n || keep(n)) return;
  const k = id(n); if (!seen.has(k)) { seen.set(k, { en: n, where: [where] }); order.push(k); } else if (!seen.get(k).where.includes(where)) seen.get(k).where.push(where);
}
for (const p of PAGES) {
  if (p.file === '404.html') continue; // one shared 404 page, in English
  const root = parsePage(readFileSync(`dist/${p.file}`, 'utf8'));
  const t = root.querySelector('title'); if (t) add(t.innerHTML, p.file + ' title');
  for (const m of root.querySelectorAll('meta')) { const k = m.getAttribute('name') || m.getAttribute('property'); if (META.includes(k)) add(m.getAttribute('content') || '', `${p.file} meta`); }
  for (const s of root.querySelectorAll('script[type="application/ld+json"]')) {
    const visit = (o) => { if (Array.isArray(o)) return o.forEach(visit); if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (typeof v === 'string' && LD_KEYS.has(k)) add(v, `${p.file} json-ld`); else visit(v); } };
    visit(JSON.parse(s.innerHTML));
  }
  const body = root.querySelector('body') || root;
  walk(body, (el) => add(el.loose ? el.node.rawText : el.innerHTML, p.file));
  for (const el of body.querySelectorAll('*')) for (const a of ATTRS) { if (el.closest && el.closest('details.lang')) continue; const v = el.getAttribute && el.getAttribute(a); if (v) add(v, `${p.file} @${a}`); }
}
for (const f of JS_FILES) for (const l of jsLiterals(readFileSync(`dist/${f}`, 'utf8'))) add(l.val, f);

const src = Object.fromEntries(order.map((k) => [k, seen.get(k).en]));
writeFileSync('i18n/source.json', JSON.stringify(src, null, 1) + '\n');
writeFileSync('i18n/source.md', order.map((k) => `- ${k} [${seen.get(k).where.join(', ')}]\n  ${seen.get(k).en}`).join('\n') + '\n');
const words = order.reduce((n, k) => n + seen.get(k).en.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length, 0);
console.log(`segments: ${order.length}, words: ${words}`);
