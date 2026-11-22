// Typography pass applied to translations: keeps numbers with their units, arrows with the value
// before them, dashes and short words with their neighbours, French spacing before : ; ? !
const NB = ' ';
const UNITS = '(?:%|€|тыс\\.|млн|Tsd\\.|Mio\\.|k€|M€|mln|εκατ\\.|ألف|آلاف|مليون|يورو|Wochen|semaines|settimane|semanas|недели|недель|дней|дня|Tage|jours|giorni|días|ημέρες|εβδομάδες|يومًا|أسابيع|Filialen|boutiques|negozi|tiendas|магазинов|καταστήματα|متجرًا|VIP)';
function fixText(t, code) {
  t = t.replace(new RegExp(`(\\d) (?=${UNITS})`, 'g'), `$1${NB}`);           // 480 тыс. / 15 % / 18 дней
  t = t.replace(/(тыс\.|млн|Tsd\.|Mio\.|mln|εκατ\.|ألف|آلاف|مليون) (?=€|يورو)/g, `$1${NB}`); // тыс. €
  t = t.replace(/(\d) (?=\d{3}(?!\d))/g, `$1${NB}`);                          // 60 000
  t = t.replace(/ (→|←)/g, `${NB}$1`);                                        // value →
  t = t.replace(/ (—|–) /g, `${NB}$1 `);                                       // dash never starts a line
  t = t.replace(/(^|[\s(«])([−+]?)(?=\d)/g, '$1$2');
  if (code === 'fr') t = t.replace(/ ([:;?!»])/g, `${NB}$1`).replace(/« /g, `«${NB}`);
  if (code === 'ru') t = t.replace(/(^|[\s(«])([вкосуиаВКОСУИА]) /g, `$1$2${NB}`);
  if (code === 'el') t = t.replace(/(^|\s)(και|σε|το|τα|η|ο|οι|με|να) /g, `$1$2${NB}`);
  return t;
}
export function typo(s, code) {
  if (code === 'zh') return s;
  return s.split(/(<[^>]+>)/).map((p) => (p.startsWith('<') ? p : fixText(p, code))).join('');
}
