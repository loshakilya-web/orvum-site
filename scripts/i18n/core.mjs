// ORVUM i18n core: splits built English pages and display strings in JS into translation segments.
// A segment is the inner HTML of the smallest element that holds text and only inline markup,
// so a translator sees whole sentences with their emphasis and links, never word fragments.
import { createHash } from 'node:crypto';
import { parse } from 'node-html-parser';

export const LOCALES = [
  { code: 'de', lang: 'de', og: 'de_DE', name: 'Deutsch' },
  { code: 'fr', lang: 'fr', og: 'fr_FR', name: 'Français' },
  { code: 'it', lang: 'it', og: 'it_IT', name: 'Italiano' },
  { code: 'es', lang: 'es', og: 'es_ES', name: 'Español' },
  { code: 'ru', lang: 'ru', og: 'ru_RU', name: 'Русский' },
  { code: 'el', lang: 'el', og: 'el_GR', name: 'Ελληνικά' },
  { code: 'ar', lang: 'ar', og: 'ar_AE', name: 'العربية', dir: 'rtl' },
  { code: 'zh', lang: 'zh-Hans', og: 'zh_CN', name: '简体中文' },
];
// pages that get a translated copy (dist file, public path); legal pages stay in English (the binding text)
export const PAGES = [
  { file: 'index.html', path: '/' },
  { file: 'platform.html', path: '/platform' },
  { file: 'about.html', path: '/about' },
  { file: 'contact.html', path: '/contact' },
  { file: '404.html', path: null },
  { file: 'hero.html', path: null },
];
// JS files whose display strings are translated; each locale gets name.<code>.js
export const JS_FILES = ['site/v5/decisions.js', 'site/v5/orvum-public.js', 'site/v5/orvum-public-3.js', 'site/v5/app.js'];

const INLINE = new Set(['a', 'b', 'strong', 'em', 'i', 'span', 'small', 'br', 'code', 'sup', 'sub', 'abbr', 'time', 'mark', 's', 'u', 'img', 'wbr']);
const SKIP = new Set(['script', 'style', 'svg', 'template', 'canvas', 'iframe', 'textarea', 'select', 'input']);
export const ATTRS = ['aria-label', 'alt', 'title', 'placeholder'];
export const norm = (s) => s.replace(/\s+/g, ' ').trim();
export const id = (s) => createHash('sha1').update(norm(s)).digest('hex').slice(0, 10);
const hasWords = (s) => /\p{L}{2,}/u.test(s.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' '));
// text that must stay as it is in every language
const KEEP = new Set(['ORVUM', 'LinkedIn ↗', 'LinkedIn', 'truth@orvum.com', 'Instagram ↗', 'Instagram', 'Ilya Loshak']);
export const keep = (s) => KEEP.has(norm(s.replace(/<[^>]+>/g, ''))) || !hasWords(s) || /^[\w.+-]+@[\w.-]+$/.test(norm(s));

function inlineOnly(el) {
  for (const c of el.childNodes) {
    if (c.nodeType === 3) continue;
    if (c.nodeType !== 1) continue;
    const t = c.rawTagName && c.rawTagName.toLowerCase();
    if (!INLINE.has(t) || !inlineOnly(c)) return false;
  }
  return true;
}
// walk(root, cb): cb(el) for each segment element
export function walk(el, cb) {
  for (const c of el.childNodes) {
    if (c.nodeType !== 1) continue;
    const t = c.rawTagName && c.rawTagName.toLowerCase();
    if (SKIP.has(t)) continue;
    if (t === 'details' && /\blang\b/.test(c.getAttribute('class') || '')) continue; // the language menu is built per locale
    if (inlineOnly(c)) { if (hasWords(c.innerHTML)) cb(c); }
    else {
      // loose text directly inside a block element that also has block children
      for (const n of c.childNodes) if (n.nodeType === 3 && hasWords(n.rawText)) cb({ loose: true, node: n, parent: c });
      walk(c, cb);
    }
  }
}
export function parsePage(html) { return parse(html, { comment: true, blockTextElements: { script: true, style: true, noscript: false, pre: true } }); }

// meta and JSON-LD strings
export const META = ['description', 'og:title', 'og:description', 'og:image:alt', 'twitter:title', 'twitter:description'];
export const LD_KEYS = new Set(['description', 'name', 'slogan', 'text', 'jobTitle', 'areaServed', 'alternateName']);

// JS display strings: quoted literals that read as text (a space or a capital letter, no code-like characters)
const LIT = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g;
// blank out comments (same length) so apostrophes in comments are not read as strings
export function blankComments(src) {
  let out = '', i = 0, q = null;
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (q) { out += c; if (c === '\\') { out += d ?? ''; i += 2; continue; } if (c === q) q = null; i++; continue; }
    if (c === "'" || c === '"' || c === '`') { q = c; out += c; i++; continue; }
    if (c === '/' && d === '/') { while (i < src.length && src[i] !== '\n') { out += ' '; i++; } continue; }
    if (c === '/' && d === '*') { const j = src.indexOf('*/', i + 2); const e = j < 0 ? src.length : j + 2; out += src.slice(i, e).replace(/[^\n]/g, ' '); i = e; continue; }
    out += c; i++;
  }
  return out;
}
export function jsLiterals(src0) {
  const src = blankComments(src0);
  const out = [];
  const LITS = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
  let m;
  while ((m = LITS.exec(src))) {
    const q = m[0][0], raw = m[1] ?? m[2] ?? m[3], base = m.index + 1;
    if (raw.includes('<')) {
      // markup built in JS: translate the text between tags only
      const RUN = />([^<>]*)</g; let r;
      const body = '>' + raw + '<';
      while ((r = RUN.exec(body))) {
        const t = r[1]; if (!/\p{L}{3,}/u.test(t) || /[(){}\[\]=;&]/.test(t) || t.includes('${') || t.includes("' +") || t.includes('" +')) continue;
        const lead = t.length - t.trimStart().length, trail = t.length - t.trimEnd().length;
        const start = base + r.index + 1 - 1 + lead, val = t.trim();
        out.push({ start, end: start + val.length, q: null, val, encQ: q });
      }
      continue;
    }
    if (q === '`') continue;
    const val = raw.replace(/\\'/g, "'").replace(/\\"/g, '"');
    if (!isDisplay(val)) continue;
    const before = src.slice(Math.max(0, m.index - 8), m.index);
    if (/(?:===|!==|==|!=|case)\s*$/.test(before)) continue;          // compared values (e.key === 'Home') are code
    out.push({ start: m.index, end: m.index + m[0].length, q, val });
  }
  return out;
}
const CODEY = /^(?:[a-z0-9-]+|[#.\[][^ ]*|.*[{};=]|https?:.*|\/.*|.*\(\).*|M[\d ,.]+.*)$/;
export function isDisplay(v) {
  if (!/\p{L}{2,}/u.test(v)) return false;
  if (['IntersectionObserver', 'POST', 'GET', 'Content-Type', 'Accept'].includes(v) || /^[a-z]+\.[a-z-]+$/.test(v)) return false;
  if (v === 'use strict' || /^\(.*\)$/.test(v) || /=["']|["']\s*$|^["']|^\s*["'\]]/.test(v) || /^]/.test(v)) return false; // directives, media queries, markup attribute pieces
  if (CODEY.test(v) && !/\s/.test(v) && !/^[A-Z]/.test(v)) return false;
  if (/^(?:aria-|data-|role|http|mailto:|\/|#|\.|\[|application\/|text\/|image\/)/.test(v)) return false;
  if (/querySelector|addEventListener|getElement|px\b|rgba?\(|var\(--|^\s*[.#]?[a-z-]+\s*[>+~]/.test(v)) return false;
  if (/^[a-z][a-zA-Z0-9]*$/.test(v)) return false;            // identifiers: buying, aria, click
  if (/^[a-z-]+(?: [a-z-]+)*$/.test(v) && /-/.test(v)) return false; // class lists
  if (/^(?:[a-z]+:)?[a-z-]+(?:\[[^\]]*\])?(?:\s*,\s*[a-z.#\[][^,]*)*$/.test(v) && !/\s[a-z]+\s/.test(v)) return false;
  return true;
}
