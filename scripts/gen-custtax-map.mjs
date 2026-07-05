#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// gen-custtax-map.mjs — generiert SAP_CUSTTAX_MAP aus SAP-VK12-Exporten.
//
// Zweck: Umkehr-Lookup „gewünschtes Steuerkennzeichen → welche abweichende
//        Steuerklasse (Kunde) + Zielland muss in SAP gesetzt werden".
//        Speist den Experten-Hint `buildSapInputHint()` in app.js.
//
// Quelle: Konditionstabellen A002 (Inland) + A011 (Export) → KONP (Satz)
//         → T007A (Kennzeichen-Text je Kalkulationsschema).
//         Gefiltert: aktuell gültig (DATBI=9999-12-31), Material-Steuerklasse 1.
//
// Scope (Abgangsland → Gesellschaft/Werk):
//   AT = EPROHA · DE = EPDE 1701 · PL = EPDE 1702 · CZ = EPDE 1703 (coming soon)
//
// Aufruf:
//   node scripts/gen-custtax-map.mjs <A002.csv> <A011.csv> <KONP.csv> <T007A.csv>
//   → schreibt den Block zwischen den Markern in docs/assets/scripts/app.js:
//        // <<GEN:SAP_CUSTTAX_MAP>> ... // <<END:SAP_CUSTTAX_MAP>>
//
// Kein npm-Dependency. Bei Satz-/Registrierungsänderungen neu exportieren + laufen.
// ─────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync } from 'node:fs';

const [a002p, a011p, konpp, t007p] = process.argv.slice(2);
if (!a002p || !a011p || !konpp || !t007p) {
  console.error('Usage: node scripts/gen-custtax-map.mjs <A002.csv> <A011.csv> <KONP.csv> <T007A.csv>');
  process.exit(1);
}

// CSV-Parser (quote-aware: Felder in "…" dürfen Kommata enthalten, z. B. „8,1%")
function splitCsvLine(line) {
  const out = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }  // "" = escaped quote
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}
function parseCsv(path) {
  const text = readFileSync(path, 'utf8').replace(/^﻿/, '');
  const lines = text.split(/\r?\n/).filter(l => l.length);
  const header = splitCsvLine(lines[0]).map(c => c.trim());
  return lines.slice(1).map(l => {
    const cells = splitCsvLine(l);
    const o = {};
    header.forEach((h, i) => { o[h] = cells[i]; });
    return o;
  });
}

const CUR = '9999-12-31';
const DEPS = ['AT', 'DE', 'PL', 'CZ'];
const PROC = { AT: 'TAXAT', DE: 'TAXD', PL: 'TAXPL', CZ: 'TAXCZ' };
const FALLBACK = { AI: '⚠ Sonderfall – prüfen', B2: '⚠ Sonderfall – prüfen' };
const PRIO = ['1', '2', '4', '5', '6', '3', '0'];

// KONP: KNUMH → { mwsk, rate(×10-Zehntel → Prozent) }
const konp = new Map();
for (const r of parseCsv(konpp)) {
  if (!r.KNUMH || konp.has(r.KNUMH)) continue;
  let rate = '';
  const v = parseFloat(r.KBETR);
  if (!Number.isNaN(v)) rate = String(v / 10).replace(/\.0+$/, '');
  konp.set(r.KNUMH, { mwsk: r.MWSK1, rate });
}

// T007A: (KALSM, MWSKZ) → Bedeutung
const t007 = new Map();
for (const r of parseCsv(t007p)) t007.set(`${r.KALSM}|${r.MWSKZ}`, r.Bedeutung);

// A002 (Inland, kein Zielland → Zielland = Abgangsland) + A011 (Export, mit LLAND)
function rows(path, hasLland) {
  return parseCsv(path).filter(r => r.DATBI === CUR && r.TAXM1 === '1' && DEPS.includes(r.ALAND))
    .map(r => ({ dep: r.ALAND, dest: hasLland ? r.LLAND : r.ALAND, k: r.TAXK1, knumh: r.KNUMH }));
}
const all = [...rows(a002p, false), ...rows(a011p, true)];

// dep → dest → code → { classes:Set, rate }
const agg = {};
for (const r of all) {
  const k = konp.get(r.knumh);
  if (!k || !k.mwsk) continue;
  ((agg[r.dep] ??= {})[r.dest] ??= {})[k.mwsk] ??= { cls: new Set(), rate: k.rate };
  agg[r.dep][r.dest][k.mwsk].cls.add(r.k);
}

function pick(set) {
  const arr = [...set];
  for (const p of PRIO) if (set.has(p)) return [p, arr.filter(c => c !== p).sort()];
  const s = arr.sort();
  return [s[0], s.slice(1)];
}

const out = {
  _meta: {
    src: 'SAP VK12: A002/A011 -> KONP -> T007A',
    mat: '1 (volle Steuer)',
    stand: new Date().toISOString().slice(0, 10),
    deps: { AT: 'EPROHA', DE: 'EPDE Werk 1701', PL: 'EPDE Werk 1702', CZ: 'EPDE Werk 1703 (coming soon)' },
  },
};
for (const dep of DEPS) {
  out[dep] = {};
  for (const dest of Object.keys(agg[dep] || {}).sort()) {
    out[dep][dest] = {};
    for (const code of Object.keys(agg[dep][dest]).sort()) {
      const e = agg[dep][dest][code];
      const [cls, alt] = pick(e.cls);
      const txt = t007.get(`${PROC[dep]}|${code}`) || FALLBACK[code] || '';
      const o = { cls, rate: e.rate, txt };
      if (alt.length) o.alt = alt;
      if (e.rate !== '0' && e.rate !== '') o.empf = dest; // lokale Steuer → Empfangsland setzen
      out[dep][dest][code] = o;
    }
  }
}

const block =
  '// <<GEN:SAP_CUSTTAX_MAP>>  (generiert via scripts/gen-custtax-map.mjs — NICHT von Hand editieren)\n' +
  'const SAP_CUSTTAX_MAP = ' + JSON.stringify(out) + ';\n' +
  '// <<END:SAP_CUSTTAX_MAP>>';

const APP = 'docs/assets/scripts/app.js';
const src = readFileSync(APP, 'utf8');
const re = /\/\/ <<GEN:SAP_CUSTTAX_MAP>>[\s\S]*?\/\/ <<END:SAP_CUSTTAX_MAP>>/;
if (!re.test(src)) {
  console.error('Marker // <<GEN:SAP_CUSTTAX_MAP>> … // <<END:SAP_CUSTTAX_MAP>> nicht in app.js gefunden.');
  process.exit(2);
}
writeFileSync(APP, src.replace(re, block));
const n = DEPS.reduce((s, d) => s + Object.keys(out[d]).length, 0);
console.log(`SAP_CUSTTAX_MAP geschrieben: ${DEPS.length} Abgangsländer, ${n} Zielland-Einträge, ${block.length} Bytes.`);
