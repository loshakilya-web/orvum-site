// i18n/src/<code>.tsv (id<TAB>text, one per line) → i18n/<code>.json
import { readFileSync, writeFileSync } from 'node:fs';
import { typo } from './typo.mjs';
for (const code of process.argv.slice(2)) {
  const out = {};
  for (const line of readFileSync(`i18n/src/${code}.tsv`, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const i = line.indexOf('\t'); if (i < 0) throw new Error(`${code}: no tab in: ${line.slice(0, 60)}`);
    const k = line.slice(0, i).trim(); if (k in out) throw new Error(`${code}: duplicate ${k}`);
    out[k] = typo(line.slice(i + 1).trim(), code);
  }
  writeFileSync(`i18n/${code}.json`, JSON.stringify(out, null, 1) + '\n');
  console.log(code, Object.keys(out).length);
}
