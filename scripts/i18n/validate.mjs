// Checks every i18n/<code>.json against i18n/source.json:
// complete, same markup (tags, links, classes), same figures, brand names kept, no English left in non-Latin languages.
// Usage: node scripts/i18n/validate.mjs [code ...]
import { readFileSync, existsSync } from 'node:fs';
import { LOCALES } from './core.mjs';

const src = JSON.parse(readFileSync('i18n/source.json', 'utf8'));
const codes = process.argv.slice(2).length ? process.argv.slice(2) : LOCALES.map((l) => l.code);
const tags = (s) => (s.match(/<\/?[a-z][^>]*>/gi) || []).map((t) => t.replace(/\s+/g, ' ')).sort().join('|');
// figures: digits only, separators and trailing zeros removed (480k = 480.000 € = 48万 → "48"), leading zeros removed
function figures(s) {
  const t = s.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\d{1,2}\s*月/g, ' ');
  const out = [];
  for (const m of t.matchAll(/\d[\d.,   ']*\d|\d/g)) {
    let d = m[0].replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '').replace(/0+$/, '');
    if (d === '') d = '0';
    out.push(d);
  }
  return out.sort().join(',');
}
const LATIN_OK = /\b(?:ORVUM|OTB|RTW|POS|mPOS|CRM|AI|VIP|P&L|P&amp;L|ROI|NDA|EU|Delivery Match|LinkedIn|Instagram|truth@orvum\.com|orvum\.com|linkedin\.com\/company\/orvum|clienteling|sell-through|Shipment|Lot|XS|M|L|A1|B|C|ex-VAT|VAT|PDF|GDPR|ready-to-wear|shop-in-shop|e-mail|E-mail|email|Email|Clienteling|Ilya Loshak|open-to-buy|Open-to-buy|showroom|Showroom|denim|brands|brand)(?![A-Za-z0-9])/g;
let problems = 0;
for (const code of codes) {
  const f = `i18n/${code}.json`;
  if (!existsSync(f)) { console.log(`${code}: no file`); problems++; continue; }
  const tr = JSON.parse(readFileSync(f, 'utf8'));
  const out = [];
  for (const [k, en] of Object.entries(src)) {
    const t = tr[k];
    if (t === undefined) { out.push(`missing ${k}: ${en.slice(0, 70)}`); continue; }
    if (typeof t !== 'string' || !t.trim()) { out.push(`empty ${k}`); continue; }
    if (tags(t) !== tags(en)) out.push(`markup ${k}: ${en.slice(0, 60)} ⇒ ${t.slice(0, 60)}`);
    if (figures(t) !== figures(en)) out.push(`figures ${k}: [${figures(en)}] vs [${figures(t)}] :: ${t.slice(0, 90)}`);
    const orv = (s) => (s.match(/ORVUM/g) || []).length;
    if (orv(t) !== orv(en)) out.push(`ORVUM count ${k}: ${orv(en)} vs ${orv(t)} :: ${t.slice(0, 80)}`);
    if (['ru', 'el', 'ar', 'zh'].includes(code)) {
      const rest = t.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/[(（]\/[a-z]+[)）]/g, ' ').replace(LATIN_OK, ' ');
      const words = rest.match(/[A-Za-z]{3,}/g);
      if (words) out.push(`latin ${k}: ${words.join(' ')} :: ${t.slice(0, 80)}`);
    }
    if (t === en && /[a-z]{3,}\s[a-z]{3,}/i.test(en.replace(/<[^>]+>/g, " "))) out.push(`unchanged ${k}: ${en.slice(0, 70)}`);
  }
  for (const k of Object.keys(tr)) if (!(k in src)) out.push(`extra ${k}`);
  console.log(`${code}: ${Object.keys(tr).length} entries, ${out.length} issue(s)`);
  for (const o of out) console.log('  ' + o);
  problems += out.length;
}
process.exit(problems ? 1 : 0);
