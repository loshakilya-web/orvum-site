// Builds the translated site from the English build (dist/) and i18n/<code>.json.
// Each locale gets /<code>/ (home), /<code>/platform, /<code>/about, /<code>/contact and its own hero (/<code>/hero),
// with translated JS display strings (site/v5/<file>.<code>.js). Legal pages stay in English: the English text is binding.
// Every page (English included) gets hreflang alternates and a language menu. The build fails on any missing translation.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { LOCALES, PAGES, JS_FILES, ATTRS, META, LD_KEYS, walk, parsePage, norm, id, keep, jsLiterals } from './core.mjs';

const SITE = 'https://www.orvum.com';
const ALLOW_MISSING = process.env.I18N_ALLOW_MISSING === '1';
const ROUTES = ['/', '/platform', '/about', '/contact'];
const LOCAL = new Set(['/', '/platform', '/about', '/contact', '/hero']);
const ENGLISH = { code: 'en', lang: 'en', og: 'en_GB', name: 'English' };
const ALL = [ENGLISH, ...LOCALES];

const pathFor = (code, p) => (code === 'en' ? p : p === '/' ? `/${code}` : `/${code}${p}`);
function localHref(href, code) {
  const m = /^(\/[a-z]*)(\.html)?([#?].*)?$/.exec(href);
  if (!m) return href;
  const p = m[1] === '' ? '/' : m[1];
  if (!LOCAL.has(p)) return href;
  return pathFor(code, p) + (m[3] || '');
}
function jsFileFor(src, code) {
  for (const f of JS_FILES) { const base = '/' + f; if (src.split('?')[0] === base) return base.replace(/\.js$/, `.${code}.js`); }
  return null;
}

// ── language menu (no script: <details>, so the CSP and every page stay script-free for it) ──
const MENU_CSS = `<style id="orvum-lang-css">
.lang { position: relative; display: inline-block; font-size: 13px; }
.lang > summary { list-style: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,.16); color: inherit; font: inherit; letter-spacing: .04em; user-select: none; }
.lang > summary::-webkit-details-marker { display: none; }
.lang > summary::after { content: ""; width: 6px; height: 6px; border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor; transform: translateY(-2px) rotate(45deg); opacity: .7; }
.lang[open] > summary::after { transform: translateY(1px) rotate(-135deg); }
.lang ul { position: absolute; top: calc(100% + 6px); inset-inline-end: 0; z-index: 50; margin: 0; padding: 6px; list-style: none; min-width: 168px; border-radius: 12px; background: #17130f; border: 1px solid rgba(255,255,255,.14); box-shadow: 0 18px 40px rgba(0,0,0,.45); }
.lang li a { display: block; padding: 8px 10px; border-radius: 8px; color: #ece6de; text-decoration: none; font-size: 14px; letter-spacing: 0; text-transform: none; }
.lang li a:hover, .lang li a:focus-visible { background: rgba(252,86,9,.16); color: #fff; }
.lang li a[aria-current="true"] { color: #ff9a5c; }
.pnav-links .lang { margin-inline-start: 6px; }
@media (max-width: 760px) { .pnav-links .lang ul { position: static; margin-top: 6px; box-shadow: none; } }
html:not([dir="rtl"]) .lang li a { text-align: left; } html[dir="rtl"] .lang li a { text-align: right; }
.hero-lang ul { inset-inline-end: auto; inset-inline-start: auto; left: 0; right: auto; max-height: calc(100vh - 90px); overflow-y: auto; }
.hero-lang { position: fixed; top: 26px; left: 26px; right: auto; z-index: 30; color: #ece6de; }
@media (max-width: 1099px) { .hero-lang { top: 18px; left: 16px; right: auto; } }
</style>`;
function menu(code, p, cls = '', top = false) {
  const cur = ALL.find((l) => l.code === code);
  const items = ALL.map((l) => `<li><a href="${pathFor(l.code, p)}" hreflang="${l.lang}" lang="${l.lang}"${l.dir ? ` dir="${l.dir}"` : ''}${top ? ' target="_top"' : ''}${l.code === code ? ' aria-current="true"' : ''}>${l.name}</a></li>`).join('');
  return `<details class="lang${cls ? ' ' + cls : ''}"><summary aria-label="${LANG_LABEL[code]}">${code === 'zh' ? '中文' : code.toUpperCase()}</summary><ul>${items}</ul></details>`;
}
const LANG_LABEL = { en: 'Language', de: 'Sprache', fr: 'Langue', it: 'Lingua', es: 'Idioma', ru: 'Язык', el: 'Γλώσσα', ar: 'اللغة', zh: '语言' };

// per-locale type: Arabic and Chinese use their own families; uppercase letter-spaced mono labels do not suit them
const LOCALE_CSS = {
  ar: `<style id="orvum-locale-css">:root, body { --display: "IBM Plex Sans Arabic", "Manrope", "Helvetica Neue", Arial, sans-serif; --mono: "IBM Plex Sans Arabic", "JetBrains Mono", ui-monospace, monospace; }
body { font-family: var(--display); } .eyebrow, .kicker, .k, [class*="-k"], .dk, .m-k, .gate-k { letter-spacing: 0 !important; text-transform: none !important; }
h1, h2, h3, .claim, .lead { letter-spacing: 0 !important; }
[dir="rtl"] .chain-flow li + li::before { left: auto; right: -24px; }
[dir="rtl"] .chain-flow li + li::after { left: auto; right: -8px; border-left: 0; border-right: 6px solid var(--signal); }
@media (max-width: 1320px) { [dir="rtl"] .chain-flow li + li::before { right: -20px; } [dir="rtl"] .chain-flow li + li::after { right: -7px; } }
[dir="rtl"] .farrow { transform: scaleX(-1); }
[dir="rtl"] .econ article { padding: 22px 0 6px 20px; border-right: 0; border-left: 1px solid var(--line-l); margin-right: 0; margin-left: 20px; } [dir="rtl"] .econ article:last-child { border-left: 0; margin-left: 0; }</style>`,
  zh: `<style id="orvum-locale-css">:root, body { --display: "Manrope", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", "Source Han Sans SC", sans-serif; --mono: "JetBrains Mono", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", monospace; }
body { font-family: var(--display); } .eyebrow, .kicker, .k, [class*="-k"], .dk, .m-k, .gate-k { letter-spacing: .06em !important; }
h1, h2, h3, .claim { letter-spacing: 0 !important; } p, li, dd { line-break: strict; }</style>`,
  ru: '', el: '', de: '', fr: '', it: '', es: '',
};

function hreflang(p) {
  return ALL.map((l) => `<link rel="alternate" hreflang="${l.lang}" href="${SITE}${pathFor(l.code, p) === '/' ? '/' : pathFor(l.code, p)}">`).join('') +
    `<link rel="alternate" hreflang="x-default" href="${SITE}${p}">`;
}

function load(code) {
  const f = `i18n/${code}.json`;
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : {};
}

const missing = {};
function tr(dict, code, en, where) {
  const n = norm(en); if (keep(n)) return en;
  const k = id(n); const t = dict[k];
  if (t === undefined) { (missing[code] ||= []).push(`${k} [${where}] ${n.slice(0, 80)}`); return en; }
  return t;
}

// English pages get the menu and hreflang too
function decorate(root, code, page) {
  const head = root.querySelector('head');
  if (page.path) head.insertAdjacentHTML('beforeend', hreflang(page.path));
  head.insertAdjacentHTML('beforeend', MENU_CSS + (LOCALE_CSS[code] || ''));
  if (page.file === 'hero.html') {
    const body = root.querySelector('body');
    body.insertAdjacentHTML('afterbegin', menu(code, '/', 'hero-lang', true));
  } else {
    const nav = root.querySelector('.pnav-links');
    if (nav && page.path) nav.insertAdjacentHTML('beforeend', menu(code, page.path));
  }
}

for (const page of PAGES) {
  const enHtml = readFileSync(`dist/${page.file}`, 'utf8');
  // English
  if (page.file !== '404.html') {
    const root = parsePage(enHtml); decorate(root, 'en', page); writeFileSync(`dist/${page.file}`, root.toString());
  }
  if (page.file === '404.html') continue;
  for (const L of LOCALES) {
    const dict = load(L.code);
    const root = parsePage(enHtml);
    const html = root.querySelector('html');
    html.setAttribute('lang', L.lang); if (L.dir) html.setAttribute('dir', L.dir);
    const t = root.querySelector('title'); if (t) t.set_content(tr(dict, L.code, t.innerHTML, page.file));
    for (const m of root.querySelectorAll('meta')) {
      const k = m.getAttribute('name') || m.getAttribute('property');
      if (META.includes(k)) m.setAttribute('content', tr(dict, L.code, m.getAttribute('content') || '', page.file + ' meta').replace(/<[^>]+>/g, ''));
      if (k === 'og:locale') m.setAttribute('content', L.og);
      if (k === 'og:url') m.setAttribute('content', SITE + pathFor(L.code, page.path || '/'));
    }
    const canon = root.querySelector('link[rel="canonical"]');
    if (canon && page.path) canon.setAttribute('href', SITE + pathFor(L.code, page.path));
    for (const s of root.querySelectorAll('script[type="application/ld+json"]')) {
      const visit = (o) => { if (Array.isArray(o)) return o.forEach(visit); if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (typeof v === 'string' && LD_KEYS.has(k)) o[k] = tr(dict, L.code, v, page.file + ' json-ld').replace(/<[^>]+>/g, ''); else visit(v); } };
      const data = JSON.parse(s.innerHTML); visit(data);
      if (data['@graph']) for (const g of data['@graph']) { if (g['@type'] === 'WebPage' || g['@type'] === 'AboutPage') { g.inLanguage = L.lang; if (page.path) g.url = SITE + pathFor(L.code, page.path); } }
      s.set_content(JSON.stringify(data));
    }
    decorate(root, L.code, page); // menu first: the page then has the same structure the English source was extracted from
    const body = root.querySelector('body') || root;
    const segs = []; walk(body, (el) => segs.push(el));
    for (const el of segs) {
      if (el.loose) { el.node._rawText = el.node.rawText.replace(norm(el.node.rawText), tr(dict, L.code, el.node.rawText, page.file)); continue; }
      el.set_content(tr(dict, L.code, el.innerHTML, page.file));
    }
    for (const el of body.querySelectorAll('*')) for (const a of ATTRS) { if (el.closest && el.closest('details.lang')) continue; const v = el.getAttribute(a); if (v) el.setAttribute(a, tr(dict, L.code, v, page.file + ' @' + a).replace(/<[^>]+>/g, '')); }
    // links, the hero frame and the translated scripts
    for (const a of root.querySelectorAll('a[href]')) if (!a.closest('details.lang')) a.setAttribute('href', localHref(a.getAttribute('href'), L.code));
    for (const f of root.querySelectorAll('iframe[src]')) f.setAttribute('src', localHref(f.getAttribute('src'), L.code));
    for (const s of root.querySelectorAll('script[src]')) { const j = jsFileFor(s.getAttribute('src'), L.code); if (j) s.setAttribute('src', j); }
    const out = page.file === 'index.html' ? `dist/${L.code}/index.html` : `dist/${L.code}/${page.file}`;
    mkdirSync(`dist/${L.code}`, { recursive: true });
    writeFileSync(out, root.toString());
  }
}

// translated JS display strings
const escQ = (s, q) => s.replace(/\\/g, '\\\\').replace(new RegExp(q, 'g'), '\\' + q).replace(/\n/g, ' ');
const escRun = (s, encQ) => { let r = s.replace(/\\/g, '\\\\').replace(new RegExp(encQ, 'g'), '\\' + encQ); if (encQ === '`') r = r.replace(/\$\{/g, '\\${'); return r; };
for (const f of JS_FILES) {
  const src = readFileSync(`dist/${f}`, 'utf8');
  const lits = jsLiterals(src).sort((a, b) => b.start - a.start);
  for (const L of LOCALES) {
    const dict = load(L.code);
    let out = src;
    for (const l of lits) {
      const t = tr(dict, L.code, l.val, f);
      if (l.q) out = out.slice(0, l.start) + l.q + escQ(t, l.q) + l.q + out.slice(l.end);
      else out = out.slice(0, l.start) + escRun(t, l.encQ) + out.slice(l.end);
    }
    writeFileSync(`dist/${f.replace(/\.js$/, `.${L.code}.js`)}`, out);
  }
}

const n = Object.values(missing).reduce((a, b) => a + b.length, 0);
if (n) {
  for (const [c, list] of Object.entries(missing)) console.log(`${c}: ${list.length} missing`, list.length < 30 || !ALLOW_MISSING ? '\n  ' + list.slice(0, 20).join('\n  ') : '');
  if (!ALLOW_MISSING) throw new Error(`i18n: ${n} missing translations`);
}
console.log(`i18n: ${LOCALES.length} languages × ${ROUTES.length} pages + hero, ${JS_FILES.length} scripts each`);
export { ROUTES, ALL, pathFor };
