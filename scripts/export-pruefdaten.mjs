#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  export-pruefdaten.mjs — exportiert die Prüf-Grundlagen der VATEngine nach ./export
//
//  Zweck: Aufbau einer externen Ist/Soll-Prüflogik (z. B. Excel) für SAP-Steuer-
//         kennzeichen auf Fakturapositionen. Liefert Szenarien, UID-Findung,
//         Länderstammdaten, Testfälle und bekannte Abweichungen als JSON + CSV.
//
//  LIEST NUR. Keine Änderung an app.js. Kein npm-Dependency (kein jsdom).
//  Die Datenkonstanten werden als Literal aus dem Quelltext geschnitten und
//  ausgewertet — die Tests laufen dabei nicht, Funktionen werden verworfen.
//
//  Aufruf: node scripts/export-pruefdaten.mjs [--out export]
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outArg = process.argv.indexOf('--out');
const OUT = join(root, outArg > -1 ? process.argv[outArg + 1] : 'export');
mkdirSync(OUT, { recursive: true });

const APP = readFileSync(join(root, 'docs/assets/scripts/app.js'), 'utf8');
const TESTMATRIX = readFileSync(join(root, 'scripts/test-matrix.mjs'), 'utf8');

// ── Literal-Scanner ──────────────────────────────────────────────────────────
// Schneidet `const NAME = [...]` / `{...}` aus dem Quelltext. String-, Template-
// und Kommentar-bewusst, damit Klammern in Texten die Tiefe nicht verfälschen.
function skipString(src, i) {
  const q = src[i++];
  while (i < src.length) {
    if (src[i] === '\\') { i += 2; continue; }
    if (src[i] === q) return i + 1;
    i++;
  }
  throw new Error('Unterminierter String');
}
function skipTemplate(src, i) {
  i++; // öffnendes Backtick
  while (i < src.length) {
    if (src[i] === '\\') { i += 2; continue; }
    if (src[i] === '`') return i + 1;
    if (src[i] === '$' && src[i + 1] === '{') { i = matchBracket(src, i + 1); continue; }
    i++;
  }
  throw new Error('Unterminiertes Template');
}
function matchBracket(src, start) {
  const open = src[start];
  const close = open === '[' ? ']' : '}';
  let depth = 0, i = start;
  while (i < src.length) {
    const ch = src[i], nx = src[i + 1];
    if (ch === '/' && nx === '/') { const j = src.indexOf('\n', i); i = j === -1 ? src.length : j + 1; continue; }
    if (ch === '/' && nx === '*') { const j = src.indexOf('*/', i); i = j === -1 ? src.length : j + 2; continue; }
    if (ch === "'" || ch === '"') { i = skipString(src, i); continue; }
    if (ch === '`') { i = skipTemplate(src, i); continue; }
    if (ch === open) depth++;
    else if (ch === close) { depth--; if (depth === 0) return i + 1; }
    i++;
  }
  throw new Error(`Unbalancierte Klammer ab ${start}`);
}
function literal(src, name) {
  const decl = new RegExp(`(?:^|\\n)\\s*(?:const|let|var)\\s+${name}\\s*=\\s*`).exec(src);
  if (!decl) throw new Error(`${name} nicht gefunden`);
  let i = decl.index + decl[0].length;
  while (i < src.length && src[i] !== '[' && src[i] !== '{') i++;
  const text = src.slice(i, matchBracket(src, i));
  return new Function(`return ${text}`)();
}
const lineOf = (src, name) => {
  const m = new RegExp(`(?:^|\\n)\\s*(?:const|let|var)\\s+${name}\\s*=`).exec(src);
  return m ? src.slice(0, m.index + 1).split('\n').length : null;
};

// ── Daten aus app.js ─────────────────────────────────────────────────────────
const COMPANIES       = literal(APP, 'COMPANIES');
const EU              = literal(APP, 'EU');
const FLAGS           = literal(APP, 'FLAGS');
const SAP_TAX_MAP     = literal(APP, 'SAP_TAX_MAP');
const SAP_CUSTTAX_MAP = literal(APP, 'SAP_CUSTTAX_MAP');
const SMOKE_TESTS     = literal(APP, 'SMOKE_TESTS');
const RENDER_TESTS    = literal(APP, 'RENDER_TESTS');
const OUTPUT_TESTS    = literal(APP, 'OUTPUT_TESTS');
const QC_TESTS        = literal(APP, 'QC_TESTS');
const QC4_TESTS       = literal(APP, 'QC4_TESTS');
const LOHN_TESTS      = literal(APP, 'LOHN_TESTS');
const STRECKE         = literal(TESTMATRIX, 'STRECKE');
const MODE2           = literal(TESTMATRIX, 'MODE2');
const LAGER           = literal(TESTMATRIX, 'LAGER');

// ── Writer ───────────────────────────────────────────────────────────────────
const written = [];
function writeJson(file, data) {
  writeFileSync(join(OUT, file), JSON.stringify(data, null, 2) + '\n');
  written.push(file);
}
function csvCell(v) {
  if (v === null || v === undefined) return '';
  const s = Array.isArray(v) ? v.join('|') : String(v);
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function writeCsv(file, cols, rows) {
  const body = [cols.join(';'), ...rows.map(r => cols.map(c => csvCell(r[c])).join(';'))].join('\n');
  writeFileSync(join(OUT, file), '﻿' + body + '\n');  // BOM → Excel liest UTF-8
  written.push(file);
}

// ═════════════════════════════════════════════════════════════════════════════
//  1 · Szenarien mit Prüfreihenfolge und benötigten Inputs
// ═════════════════════════════════════════════════════════════════════════════
// Reihenfolge = tatsächliche Auswertungsreihenfolge im Code. Der ERSTE Treffer
// gewinnt und beendet die Prüfung (early return) — in Excel als IF-Kaskade in
// genau dieser Reihenfolge nachzubauen, nicht als unabhängige Regeln.
const INPUTS = {
  company:       'EPDE | EPROHA — steuert vatIds + companyHome (DE bzw. AT)',
  mode:          '2 = eigenes Lager/Werk (2 Parteien) · 3 = Reihengeschäft 3 Parteien · 4 = 4 Parteien · 5 = Lohnveredelung',
  kette:         's1..s4 = Länderkette der Parteien (ISO-2). Mode 3 nutzt s1,s2,s4',
  dep:           'Abgangsland = s1 (steuerliches Abgangsland, kann vom physischen abweichen)',
  dest:          'Bestimmungsland = letzte Partei der Kette',
  transport:     "supplier | middle | middle2 | customer — wer versendet auf eigene Rechnung (Art. 36a Abs. 3)",
  mePosition:    '1..4 — an welcher Stelle der Kette die eigene Gesellschaft steht',
  uidOverride:   'ISO-2 der dem Vorlieferanten MITGETEILTEN eigenen UID, sonst null (Art. 36a Abs. 2)',
  importerRole:  'self | customer | supplier — wer ist Einführer (Drittlandspfade)',
  mode2Incoterm: 'dap | ddp — nur Mode 2 Drittlandsexport: wer verzollt',
  mode2CustUid:  'ISO-2 der vom Drittland-Kunden vorgelegten EU-UID, sonst leer',
  dropShipDest:  'ISO-2 abweichender Warenempfänger (Mode 2 Drop-Shipment), sonst leer',
  lohn:          'lohnSup/lohnCon/lohnCus + lvDirect + litF + homeHandover (Mode 5)',
};

const szenarien = [
  // A · Modus-Dispatch
  { stufe: 'A-Dispatch', nr: 1, id: 'MODE-5', bedingung: 'currentMode === 5', ziel: 'analyzeLohn() / computeLohn()',
    inputs: ['company', 'lohn'], ergebnis: 'Lohnveredelung — 3 Schritte (Einkauf / Werkleistung / Verkauf), eigene Renderer', quelle: 'app.js renderResult()' },
  { stufe: 'A-Dispatch', nr: 2, id: 'MODE-2', bedingung: 'currentMode === 2', ziel: 'analyze2()',
    inputs: ['company', 'dest', 'transport', 'mode2Incoterm', 'mode2CustUid', 'dropShipDest'], ergebnis: 'Lieferung ab eigenem AT-Lager/Werk (EPROHA), 2 Parteien', quelle: 'app.js renderResult()' },
  { stufe: 'A-Dispatch', nr: 3, id: 'MODE-3-4', bedingung: 'sonst (mode 3 oder 4)', ziel: 'analyze()',
    inputs: ['company', 'kette', 'transport', 'mePosition', 'uidOverride'], ergebnis: 'Reihengeschäft — weiter mit B', quelle: 'app.js renderResult()' },

  // B · Routing innerhalb analyze() — erste zutreffende Zeile gewinnt
  { stufe: 'B-Routing', nr: 1, id: 'CH-INLAND', bedingung: "isCH(dep) && isCH(dest) && company === 'EPROHA'", ziel: 'analyzeCHInland()',
    inputs: ['company', 'kette'], ergebnis: 'CH-Inlandslieferung 8,1 % (B5 / IB) über CH-Registrierung', quelle: 'app.js analyze()' },
  { stufe: 'B-Routing', nr: 2, id: 'CH-IMPORT', bedingung: 'isCH(dep) && !isCH(dest)', ziel: 'analyzeCH()',
    inputs: ['company', 'kette', 'importerRole'], ergebnis: 'Einfuhr in die EU — EUSt über EORI, kein IG-Erwerb', quelle: 'app.js analyze()' },
  { stufe: 'B-Routing', nr: 3, id: 'CH-EXPORT', bedingung: 'isCH(dest) && !isCH(dep)', ziel: 'VATEngine.run() → buildCHExportResult()',
    inputs: ['company', 'kette', 'transport', 'importerRole'], ergebnis: 'Ausfuhr 0 % (A0/D0/G0) bzw. CH-Inland B5 wenn wir Einführer sind', quelle: 'app.js analyze()' },
  { stufe: 'B-Routing', nr: 4, id: 'GB-IMPORT', bedingung: "dep === 'GB' && dest !== 'GB'", ziel: 'analyzeGBImport()',
    inputs: ['company', 'kette', 'importerRole'], ergebnis: 'Einfuhr aus GB — EUSt', quelle: 'app.js analyze()' },
  { stufe: 'B-Routing', nr: 5, id: 'GB-EXPORT', bedingung: "dest === 'GB' && dep !== 'GB'", ziel: 'VATEngine.run() → buildGBExportResult()',
    inputs: ['company', 'kette', 'transport', 'importerRole'], ergebnis: 'Ausfuhr 0 % — UK VAT beim Einführer', quelle: 'app.js analyze()' },
  { stufe: 'B-Routing', nr: 6, id: 'DRITT-IMPORT', bedingung: 'isNonEU(dep) && dep ∉ {CH,LI,GB}  (TR/RS/BA/RU…)', ziel: 'analyzeThirdImport()',
    inputs: ['company', 'kette', 'importerRole'], ergebnis: 'Generische Einfuhr + Länderhinweis (Sanktionen/Zollunion/SAA)', quelle: 'app.js analyze()' },
  { stufe: 'B-Routing', nr: 7, id: 'DRITT-EXPORT', bedingung: 'isNonEU(dest) && dest ∉ {CH,LI,GB}', ziel: 'VATEngine.run() → buildThirdExportResult()',
    inputs: ['company', 'kette', 'transport', 'importerRole'], ergebnis: 'Generische Ausfuhr 0 % + Länderhinweis', quelle: 'app.js analyze()' },
  { stufe: 'B-Routing', nr: 8, id: 'INLAND', bedingung: 'dep === dest (beide EU) → eng._depEqDest', ziel: 'analyzeInland()',
    inputs: ['company', 'kette', 'transport'], ergebnis: 'Inlands-Reihengeschäft: keine IG-Lieferung, kein Dreieck, ggf. lokales RC (IT: IC/VI)', quelle: 'app.js analyze() / VATEngine.run()' },
  { stufe: 'B-Routing', nr: 9, id: 'STANDARD', bedingung: 'sonst — EU→EU grenzüberschreitend', ziel: 'VATEngine.run() + buildDreiecks3/4Result bzw. buildNormal3/4Result',
    inputs: ['company', 'kette', 'transport', 'mePosition', 'uidOverride'], ergebnis: 'Hauptpfad Reihengeschäft — einzige Konstellation mit Dreiecksvereinfachung', quelle: 'app.js analyze()' },

  // C · VATEngine-Pipeline (nur im Standardpfad vollständig)
  { stufe: 'C-Engine', nr: 1, id: 'ENG-GUARD', bedingung: 'dep === dest && !isNonEU(dep)', ziel: 'früher Ausstieg _depEqDest',
    inputs: ['dep', 'dest'], ergebnis: 'movingIndex = -1, keine Transportzuordnung, kein Dreieck', quelle: 'app.js VATEngine.run()' },
  { stufe: 'C-Engine', nr: 2, id: 'ENG-MOVING', bedingung: 'immer', ziel: 'determineMovingSupply() → ggf. _applyQuickFix()',
    inputs: ['transport', 'uidOverride', 'dep', 'company', 'mePosition'], ergebnis: 'movingIndex = welche Lieferung ist die bewegte (Art. 36a) — siehe 02_uid_findung', quelle: 'app.js VATEngine' },
  { stufe: 'C-Engine', nr: 3, id: 'ENG-CLASSIFY', bedingung: 'immer', ziel: 'classifySupplies()',
    inputs: ['kette', 'dep', 'dest', 'company'], ergebnis: 'Je Lieferung: Lieferort (Art. 32/36), vatTreatment, RC-Prüfung (Art. 194 + Länderregeln)', quelle: 'app.js VATEngine' },
  { stufe: 'C-Engine', nr: 4, id: 'ENG-TRIANGLE', bedingung: 'immer', ziel: 'detectTriangleTransaction()',
    inputs: ['kette', 'dep', 'dest', 'transport', 'uidOverride', 'company'], ergebnis: 'Art. 141 lit. a–e; blockiert u. a. bei eigener UID im Bestimmungsland (siehe RK-D1)', quelle: 'app.js VATEngine' },
  { stufe: 'C-Engine', nr: 5, id: 'ENG-RISK', bedingung: 'immer', ziel: 'detectRegistrationRisk()',
    inputs: ['kette', 'dep', 'dest', 'company'], ergebnis: 'Registrierungspflicht, Doppelerwerb (Art. 41), RC-Hinweise; vom Dreieck neutralisiert', quelle: 'app.js VATEngine' },
  { stufe: 'C-Engine', nr: 6, id: 'ENG-SAP', bedingung: 'Renderzeit, nicht Engine', ziel: '_sapEffectiveCountry() → SAP_TAX_MAP',
    inputs: ['company', 'uidOverride', 'dep', 'dest'], ergebnis: 'MWSKZ je Lieferung + Richtung (out/in) — siehe 02_uid_findung Ebene B', quelle: 'app.js Rendering-Layer' },

  // D · analyze2()-Zweige (Mode 2), Reihenfolge = if/else-if-Kette
  { stufe: 'D-Mode2', nr: 1, id: 'M2-CH', bedingung: "dest === 'CH' && !euGoodsRecipient", ziel: "buildMode2IncoExport('CH')",
    inputs: ['dest', 'mode2Incoterm', 'transport'], ergebnis: 'DAP/EXW → Ausfuhr A0 · DDP → CH-Inland B5 8,1 %', quelle: 'app.js analyze2()' },
  { stufe: 'D-Mode2', nr: 2, id: 'M2-LI', bedingung: "dest === 'LI' && !euGoodsRecipient", ziel: "buildMode2IncoExport('LI')",
    inputs: ['dest', 'mode2Incoterm', 'transport'], ergebnis: 'wie CH (gemeinsamer MWST-Raum, CH-Registrierung deckt LI ab)', quelle: 'app.js analyze2()' },
  { stufe: 'D-Mode2', nr: 3, id: 'M2-AT-DROP', bedingung: "dest === 'AT' && dropShipDest && dropShipDest !== 'AT'", ziel: 'Drop-Shipment-Zweig AT-Kunde',
    inputs: ['dropShipDest', 'mode2CustUid'], ergebnis: 'AF (fremde EU-UID des Kunden) bzw. 20 % AT A2 ohne UID — siehe TODO-D3', quelle: 'app.js analyze2()' },
  { stufe: 'D-Mode2', nr: 4, id: 'M2-AT', bedingung: "dest === 'AT'", ziel: 'AT-Inlandslieferung',
    inputs: ['dest'], ergebnis: '20 % AT — A2 / V2', quelle: 'app.js analyze2()' },
  { stufe: 'D-Mode2', nr: 5, id: 'M2-GB', bedingung: "dest === 'GB' && !euGoodsRecipient", ziel: "buildMode2IncoExport('GB')",
    inputs: ['dest', 'mode2Incoterm'], ergebnis: 'DAP/EXW → A0 · DDP → 20 % UK VAT, kein AP-MWSKZ', quelle: 'app.js analyze2()' },
  { stufe: 'D-Mode2', nr: 6, id: 'M2-DRITT', bedingung: 'isNonEU(dest) && !euGoodsRecipient (TR/RS/BA/RU)', ziel: 'buildMode2IncoExport(dest) bzw. _importerToggle bei RU',
    inputs: ['dest', 'mode2Incoterm', 'importerRole'], ergebnis: 'A0; DDP ist mangels Registrierung eine Warnkarte („so nicht möglich")', quelle: 'app.js analyze2()' },
  { stufe: 'D-Mode2', nr: 7, id: 'M2-DROP-EU', bedingung: "dropShipDest && dropShipDest !== dest && dropShipDest !== 'AT'", ziel: 'Reihengeschäft/Dreieck mit EPROHA als erstem Lieferanten',
    inputs: ['dest', 'dropShipDest', 'mode2CustUid'], ergebnis: 'AF · bei Dritt-MS-UID Dreiecksgeschäft Art. 141 · ohne UID 20 % AT', quelle: 'app.js analyze2()' },
  { stufe: 'D-Mode2', nr: 8, id: 'M2-EU', bedingung: 'sonst — EU-Kunde', ziel: 'IG-Lieferung ab AT',
    inputs: ['dest'], ergebnis: 'AF 0 % + ZM + Intrastat', quelle: 'app.js analyze2()' },

  // E · computeLohn()-Zweige (Mode 5)
  { stufe: 'E-Lohn', nr: 1, id: 'LV-INLAND', bedingung: 'sup === con', ziel: 'Inlandszweig',
    inputs: ['lohn'], ergebnis: 'Wareneinkauf innerstaatlich; Werkleistung trotzdem RC wenn con ≠ Heimat; lit. f greift NICHT', quelle: 'app.js computeLohn()' },
  { stufe: 'E-Lohn', nr: 2, id: 'LV-SUP-HOME', bedingung: 'sup === companyHome && con !== companyHome', ziel: 'supIsHome-Zweig',
    inputs: ['lohn'], ergebnis: 'homeHandover=true → Inlandslieferung + Verbringen (Art. 17 Abs. 2 lit. f) · false → ig. Lieferung + Erwerb im con-Land', quelle: 'app.js computeLohn()' },
  { stufe: 'E-Lohn', nr: 3, id: 'LV-NORMAL', bedingung: 'sonst', ziel: 'Normalpfad (lvDirect)',
    inputs: ['lohn'], ergebnis: 'Einkauf / Werkleistung (RC Art. 44+196) / Verkauf; litF entscheidet über Verbringen', quelle: 'app.js computeLohn()' },
];

writeJson('01_szenarien.json', {
  _hinweis: 'Reihenfolge ist die tatsächliche Auswertungsreihenfolge im Code. Erster Treffer gewinnt (early return). In Excel als IF-Kaskade in dieser Reihenfolge nachbauen.',
  _stand: new Date().toISOString().slice(0, 10),
  inputs: INPUTS,
  szenarien,
});
writeCsv('01_szenarien.csv', ['stufe', 'nr', 'id', 'bedingung', 'ziel', 'inputs', 'ergebnis', 'quelle'], szenarien);

// ═════════════════════════════════════════════════════════════════════════════
//  2 · UID-Findung als Entscheidungstabelle
// ═════════════════════════════════════════════════════════════════════════════
// Drei Ebenen, die oft verwechselt werden:
//   A = Welche Lieferung ist bewegt (Art. 36a) — hängt an der MITGETEILTEN UID
//   B = Welcher Buchungskreis/welches MWSKZ (Tool-Soll)
//   C = Wie SAP die UID heute findet (Ist) — Werk/Ship-to/EXW
const uidFindung = [
  // Ebene A — Transportzuordnung (Art. 36a)
  { ebene: 'A-Transportzuordnung', prio: 1, regel: 'A1', bedingung: "transport = supplier (Lieferant versendet)",
    ergebnis: 'L1 ist bewegt', uid_land: 'für die Zuordnung irrelevant',
    rechtsgrundlage: 'Art. 36a Abs. 1 MwStSystRL / § 3 Abs. 6a S. 2 UStG', quelle: 'determineMovingSupply()',
    hinweis: 'Die eigene UID beeinflusst hier nur das MWSKZ (Ebene B), nicht die Zuordnung.' },
  { ebene: 'A-Transportzuordnung', prio: 2, regel: 'A2', bedingung: 'transport = customer (Endabnehmer holt ab)',
    ergebnis: 'letzte Lieferung L(n-1) ist bewegt', uid_land: 'für die Zuordnung irrelevant',
    rechtsgrundlage: 'Art. 36a Abs. 1 Umkehrschluss / EuGH C-245/04 EMAG', quelle: 'determineMovingSupply()',
    hinweis: 'Schließt das Dreiecksgeschäft aus (Art. 141 lit. e).' },
  { ebene: 'A-Transportzuordnung', prio: 3, regel: 'A3', bedingung: 'transport = middle/middle2 UND uidOverride = dep (Abgangsland-UID mitgeteilt)',
    ergebnis: 'AUSGANGSlieferung des Zwischenhändlers ist bewegt (chainIndex)', uid_land: 'dep',
    rechtsgrundlage: 'Art. 36a Abs. 2 MwStSystRL / § 3 Abs. 6a S. 4 Nr. 2 UStG', quelle: '_applyQuickFix()',
    hinweis: 'Nur die tatsächliche MITTEILUNG löst Abs. 2 aus — Besitz der UID genügt nicht.' },
  { ebene: 'A-Transportzuordnung', prio: 4, regel: 'A4', bedingung: 'transport = middle/middle2 UND uidOverride gesetzt, aber ≠ dep',
    ergebnis: 'EINGANGSlieferung ist bewegt (chainIndex-1)', uid_land: 'uidOverride (dest / Ansässigkeit / Dritt-MS)',
    rechtsgrundlage: 'Art. 36a Abs. 1 MwStSystRL', quelle: '_applyQuickFix()',
    hinweis: 'Dritt-MS-UID (weder dep noch dest) löst zusätzlich Art. 41 Doppelerwerb aus.' },
  { ebene: 'A-Transportzuordnung', prio: 5, regel: 'A5', bedingung: 'transport = middle/middle2, kein uidOverride, companyHome ≠ dep',
    ergebnis: 'EINGANGSlieferung ist bewegt (Grundregel)', uid_land: 'companyHome',
    rechtsgrundlage: 'Art. 36a Abs. 1 / § 3 Abs. 15 Z 1 lit. c UStG', quelle: '_applyQuickFix()',
    hinweis: 'Gilt AUCH wenn eine dep-UID vorhanden ist (Besitz ≠ Mitteilung, korrigiert 25.08.2026).' },
  { ebene: 'A-Transportzuordnung', prio: 6, regel: 'A6', bedingung: 'transport = middle/middle2, kein uidOverride, companyHome = dep (im Abgangsland ansässig)',
    ergebnis: 'AUSGANGSlieferung ist bewegt', uid_land: 'dep (= companyHome)',
    rechtsgrundlage: 'Art. 36a Abs. 2 lit. b MwStSystRL', quelle: '_applyQuickFix()',
    hinweis: 'Ansässigkeit im Abgangsland; EPDE bei dep=DE, EPROHA bei dep=AT.' },

  // Ebene B — welches UID-Land bestimmt das MWSKZ (Tool-Soll)
  { ebene: 'B-MWSKZ-Findung', prio: 1, regel: 'B1', bedingung: "vatTreatment ∈ {ic-exempt, ic-acquisition, dreiecks, export}",
    ergebnis: 'MWSKZ aus dem UID-LAND, nicht aus dem Lieferort', uid_land: 'uidCountry → uidOverride → companyHome',
    rechtsgrundlage: 'Buchungskreis folgt der Rechnungs-UID', quelle: '_sapEffectiveCountry()',
    hinweis: 'Beispiel: IG-Lieferung ab DE mit DE-UID = DH, mit AT-UID = AF.' },
  { ebene: 'B-MWSKZ-Findung', prio: 2, regel: 'B2', bedingung: "vatTreatment ∈ {domestic, rc, not-taxable}",
    ergebnis: 'MWSKZ aus dem LIEFERORT-Land (Transaktionsland), UID irrelevant', uid_land: 'Lieferort',
    rechtsgrundlage: 'Ort des Umsatzes bestimmt das Steuerrecht', quelle: '_sapEffectiveCountry()',
    hinweis: 'Ruhende Lieferung vor Transport = dep, nach Transport = dest (Art. 31/36).' },
  { ebene: 'B-MWSKZ-Findung', prio: 3, regel: 'B3', bedingung: 'kein SAP_TAX_MAP-Eintrag für das ermittelte UID-Land',
    ergebnis: 'Fallback auf das Lieferort-Land; existiert auch dort keiner → KEIN Code', uid_land: 'Fallback',
    rechtsgrundlage: '—', quelle: '_sapEffectiveCountry()',
    hinweis: 'Nie ein Kennzeichen erfinden. Bekannte Lücken: EPDE ic-exempt für BE/EE/LV/NL.' },
  { ebene: 'B-MWSKZ-Findung', prio: 4, regel: 'B4', bedingung: 'Dreiecksgeschäft greift (triangle = true)',
    ergebnis: 'IG-Erwerb über Heimat-UID (VE/VH); ruhende L2 = Dreieckslieferung AF (EPROHA) bzw. DH (EPDE)', uid_land: 'companyHome',
    rechtsgrundlage: 'Art. 141/42 MwStSystRL · Art. 25 UStG AT · § 25b UStG', quelle: 'buildQuickCheck / buildDreiecks3Result',
    hinweis: 'triangle schlägt die Basisklassifikation rc — im Dreieck NIE das IT-Inlands-RC (IC).' },

  // Ebene C — SAP-Findung „Plants Abroad" (Ist-Seite)
  { ebene: 'C-SAP-Findung-Ist', prio: 1, regel: 'C1', bedingung: 'Lieferung ab eigenem Werk (Lagerauftrag)',
    ergebnis: 'UID des WERKSLANDES', uid_land: 'Werksland (1701=DE, 1702=PL, 1703=CZ, AT=EPROHA)',
    rechtsgrundlage: '—', quelle: 'plants_abroad/README.md Punkt 4',
    hinweis: 'SAP-Findung, nicht Steuerrecht.' },
  { ebene: 'C-SAP-Findung-Ist', prio: 2, regel: 'C2', bedingung: 'Incoterm EXW (Kunde holt ab Lieferantenwerk)',
    ergebnis: 'UID des LIEFERANTENLANDES — EXW hat Vorrang vor der Ship-to-Regel', uid_land: 'Lieferantenland',
    rechtsgrundlage: 'entspricht Art. 36a Abs. 2 (mitgeteilte Abgangsland-UID)', quelle: 'plants_abroad/README.md Punkt 5',
    hinweis: 'Das Tool kennt diese Dimension NICHT → bekannte Ist/Soll-Divergenz, siehe SAP-EXW in 05.' },
  { ebene: 'C-SAP-Findung-Ist', prio: 3, regel: 'C3', bedingung: 'EXW, aber im Lieferantenland KEINE eigene UID',
    ergebnis: 'erst Ship-to-Land prüfen, dann erst BUKRS', uid_land: 'Ship-to-Land, sonst BUKRS',
    rechtsgrundlage: 'Art. 36a Abs. 1 (ohne dep-UID bleibt es bei der Grundregel)', quelle: 'plants_abroad/README.md Punkt 5 + PRUEFUNG.md',
    hinweis: 'Direkter BUKRS-Fallback wäre falsch — er unterstellt stillschweigend ein Dreiecksgeschäft.' },
  { ebene: 'C-SAP-Findung-Ist', prio: 4, regel: 'C4', bedingung: 'Streckengeschäft (3rd party) ohne EXW',
    ergebnis: 'UID des WARENEMPFÄNGER-Landes, sofern dort eine eigene UID besteht', uid_land: 'Ship-to-Land',
    rechtsgrundlage: '—', quelle: 'plants_abroad/README.md Punkt 4', hinweis: '' },
  { ebene: 'C-SAP-Findung-Ist', prio: 5, regel: 'C5', bedingung: 'keine eigene UID im Ship-to-Land',
    ergebnis: 'UID des Buchungskreises (EPDE → DE, EPROHA → AT)', uid_land: 'BUKRS',
    rechtsgrundlage: 'Art. 141 (der BUKRS-Fallback IST der Dreiecksfall)', quelle: 'plants_abroad/PRUEFUNG.md Anhang',
    hinweis: 'Trägt nur, wenn wir weder im Lieferanten- noch im Bestimmungsland registriert sind.' },
  { ebene: 'C-SAP-Findung-Ist', prio: 6, regel: 'C6', bedingung: 'Drittland-Ziel, wir sind Einführer (DDP)',
    ergebnis: 'UID + steuerliches Abgangsland = BESTIMMUNGSLAND (sofern dort registriert, sonst nicht buchbar)', uid_land: 'Bestimmungsland',
    rechtsgrundlage: 'Art. 7 Abs. 3 Bst. a MWSTG (CH) — Lieferort verlagert sich', quelle: 'plants_abroad/PRUEFUNG.md B1',
    hinweis: 'Deshalb bei CH/LI-DDP B5 statt A0 — das steuerliche Abgangsland muss auf CH/LI stehen.' },
  { ebene: 'C-SAP-Findung-Ist', prio: 7, regel: 'C7', bedingung: 'Drittland-Ziel, Kunde ist Einführer (DAP/EXW)',
    ergebnis: 'UID + steuerliches Abgangsland = ABGANGSLAND → A0 / D0 / G0', uid_land: 'Abgangsland',
    rechtsgrundlage: '§ 7 UStG AT / § 6 UStG DE', quelle: 'plants_abroad/PRUEFUNG.md B1', hinweis: '' },
];

const uidCols = ['ebene', 'prio', 'regel', 'bedingung', 'ergebnis', 'uid_land', 'rechtsgrundlage', 'quelle', 'hinweis'];
writeJson('02_uid_findung.json', {
  _hinweis: 'Drei getrennte Ebenen. A = welche Lieferung ist bewegt (Recht). B = welches UID-Land liefert das MWSKZ (Tool-Soll). C = wie SAP die UID heute findet (Ist). Für einen Ist/Soll-Vergleich A+B gegen C stellen.',
  _stand: new Date().toISOString().slice(0, 10),
  regeln: uidFindung,
});
writeCsv('02_uid_findung.csv', uidCols, uidFindung);

// ═════════════════════════════════════════════════════════════════════════════
//  3 · Länderstammdaten
// ═════════════════════════════════════════════════════════════════════════════
const laender = EU.map(c => ({
  code: c.code,
  name: c.name,
  name_en: c.en,
  satz_standard: c.std,
  eu_mitglied: c.nonEU ? 'nein' : 'ja',
  ch_mwst_raum: c.swissVatArea ? 'ja' : '',
  zollunion_eu: c.customsUnion ? 'ja' : '',
  saa_abkommen: c.saa ? 'ja' : '',
  sanktionen: c.sanctions ? 'ja' : '',
  flagge: FLAGS[c.code] || '',
  uid_epde: COMPANIES.EPDE.vatIds[c.code] || '',
  uid_eproha: COMPANIES.EPROHA.vatIds[c.code] || '',
})).sort((a, b) => a.code.localeCompare(b.code));

writeJson('03_laender.json', {
  _hinweis: 'satz_standard = Normalsatz in Prozent. uid_* leer = keine eigene Registrierung → Dreiecksgeschäft möglich, aber auch Registrierungsrisiko bei ruhender Lieferung dort.',
  _stand: new Date().toISOString().slice(0, 10),
  gesellschaften: {
    EPDE:   { sitz: COMPANIES.EPDE.home,   betriebsstaetten: COMPANIES.EPDE.establishments,   uids: COMPANIES.EPDE.vatIds },
    EPROHA: { sitz: COMPANIES.EPROHA.home, betriebsstaetten: COMPANIES.EPROHA.establishments, uids: COMPANIES.EPROHA.vatIds },
  },
  laender,
});
writeCsv('03_laender.csv', ['code', 'name', 'name_en', 'satz_standard', 'eu_mitglied', 'ch_mwst_raum', 'zollunion_eu', 'saa_abkommen', 'sanktionen', 'uid_epde', 'uid_eproha'], laender);

// ═════════════════════════════════════════════════════════════════════════════
//  4 · Testfälle / Fixtures mit erwartetem Kennzeichen
// ═════════════════════════════════════════════════════════════════════════════
const flach = [];
const push = o => flach.push(o);

// 4a · SAP-Findungsmatrix „Plants Abroad" — die belastbarsten Sollwerte
STRECKE.forEach(([zeile, fall, company, lieferant, we, dep, dest, transport, uid, sales, miro, importer]) => push({
  suite: 'matrix-strecke', id: `Z${zeile}`, name: fall, company, mode: 3,
  dep, dest, kette: [lieferant, company === 'EPDE' ? 'DE' : 'AT', we].join('→'),
  transport, uid_verwendet: uid, importer_role: importer || '',
  erwartet_out: sales, erwartet_in: miro, erwartet_sonstiges: '',
  quelle: 'Matrix_erweitert_V1_2.xlsx / scripts/test-matrix.mjs',
}));
LAGER.forEach(([zeile, fall, company, werk, we, sales]) => push({
  suite: 'matrix-lager', id: `Z${zeile}`, name: fall, company, mode: 2,
  dep: werk, dest: we, kette: `Werk ${werk}→${we}`,
  transport: '', uid_verwendet: '', importer_role: '',
  erwartet_out: sales, erwartet_in: '', erwartet_sonstiges: 'Lieferung ab eigenem Werk',
  quelle: 'Matrix_erweitert_V1_2.xlsx / scripts/test-matrix.mjs',
}));
MODE2.forEach(([zeile, fall, dest, we, custUid, incoterm, sales]) => push({
  suite: 'matrix-mode2', id: `Z${zeile}`, name: fall, company: 'EPROHA', mode: 2,
  dep: 'AT', dest, kette: we ? `AT→${dest}(Kunde)→${we}(WE)` : `AT→${dest}`,
  transport: '', uid_verwendet: custUid || '', importer_role: incoterm,
  erwartet_out: sales, erwartet_in: '', erwartet_sonstiges: `incoterm=${incoterm}`,
  quelle: 'Matrix_erweitert_V1_2.xlsx / scripts/test-matrix.mjs',
}));

// 4b · QuickCheck 3P — Typ + MWSKZ je Lieferung
QC_TESTS.forEach(t => push({
  suite: 'quickcheck-3p', id: t.id, name: t.name, company: t.company, mode: 3,
  dep: t.dep, dest: t.dest, kette: `${t.dep}→${t.company}→${t.dest}`,
  transport: t.transport, uid_verwendet: '', importer_role: '',
  erwartet_out: t.l2Sap ?? '', erwartet_in: t.l1Sap ?? '',
  erwartet_sonstiges: [t.movingL1 !== undefined ? `movingL1=${t.movingL1}` : '', t.triangle !== undefined ? `triangle=${t.triangle}` : '',
    t.l1Type ? `L1=${t.l1Type}` : '', t.l2Type ? `L2=${t.l2Type}` : ''].filter(Boolean).join(' · '),
  quelle: 'app.js QC_TESTS',
}));

// 4c · QuickCheck 4P
QC4_TESTS.forEach(t => {
  const b = t.boxes || [];
  push({
    suite: 'quickcheck-4p', id: t.id, name: t.name, company: t.company, mode: 4,
    dep: t.q4?.[0] ?? '', dest: t.q4?.[3] ?? '', kette: (t.q4 || []).join('→'),
    transport: t.transport, uid_verwendet: '', importer_role: '',
    erwartet_out: b.filter(x => x.role === 'out').map(x => x.sap).filter(Boolean).join('|'),
    erwartet_in: b.filter(x => x.role === 'in').map(x => x.sap).filter(Boolean).join('|'),
    erwartet_sonstiges: [`mePos=${t.mePos}`, t.movingIndex !== undefined ? `movingIndex=${t.movingIndex}` : '',
      t.triangle !== undefined ? `triangle=${t.triangle}` : '', b.map(x => `${x.role}:${x.type}`).join(',')].filter(Boolean).join(' · '),
    quelle: 'app.js QC4_TESTS',
  });
});

// 4d · Lohnveredelung
LOHN_TESTS.forEach(t => push({
  suite: 'lohnveredelung', id: t.id, name: t.name, company: t.o?.company, mode: 5,
  dep: t.o?.sup ?? '', dest: t.o?.cus ?? '', kette: `${t.o?.sup}→${t.o?.con}(Veredelung)→${t.o?.cus}`,
  transport: '', uid_verwendet: '', importer_role: '',
  erwartet_out: t.exp?.s3sap ?? '', erwartet_in: '',
  erwartet_sonstiges: Object.entries(t.exp || {}).filter(([k]) => k !== 's3sap')
    .map(([k, v]) => `${k}=${Array.isArray(v) ? `[${v.join(',')}]` : v}`).join(' · ')
    + ` · lvDirect=${t.o?.lvDirect} · litF=${t.o?.litF}`,
  quelle: 'app.js LOHN_TESTS',
}));

// 4e · Smoke-Tests (Struktur-Erwartungen, keine MWSKZ)
SMOKE_TESTS.forEach(t => push({
  suite: 'smoke', id: t.id, name: t.name, company: t.company, mode: t.ctx?.mode ?? '',
  dep: t.ctx?.dep ?? '', dest: t.ctx?.dest ?? '',
  kette: [t.ctx?.s1, t.ctx?.s2, t.ctx?.s3, t.ctx?.s4].filter(Boolean).join('→'),
  transport: t.ctx?.transport ?? '', uid_verwendet: t.ctx?.uidOverride ?? '', importer_role: '',
  erwartet_out: '', erwartet_in: '',
  erwartet_sonstiges: Object.entries(t.expect || {}).map(([k, v]) => `${k}=${Array.isArray(v) ? `[${v.join(',')}]` : v}`).join(' · '),
  quelle: `app.js SMOKE_TESTS${t.source ? ` (${t.source})` : ''}`,
}));

// 4f · Output-/Render-Tests: HTML-Assertions, kein maschinenlesbarer Sollwert
OUTPUT_TESTS.forEach(t => push({
  suite: 'output-html', id: t.id, name: t.name, company: '', mode: '', dep: '', dest: '', kette: '',
  transport: '', uid_verwendet: '', importer_role: '', erwartet_out: '', erwartet_in: '',
  erwartet_sonstiges: [
    (t.expect || []).map(e => `enthält "${e.contains}"`).join(' · '),
    (t.notExpect || []).map(e => `enthält NICHT "${e.contains}"`).join(' · '),
  ].filter(Boolean).join(' · '),
  quelle: 'app.js OUTPUT_TESTS (HTML-Assertion, Setup ist Code)',
}));
RENDER_TESTS.forEach(t => push({
  suite: 'render', id: t.id, name: t.name, company: '', mode: '', dep: '', dest: '', kette: '',
  transport: '', uid_verwendet: '', importer_role: '', erwartet_out: '', erwartet_in: '',
  erwartet_sonstiges: '', quelle: 'app.js RENDER_TESTS (Assertion im Code)',
}));

writeJson('04_testfaelle.json', {
  _hinweis: 'suite=matrix-* sind die belastbarsten Sollwerte (Ist/Soll gegen SAP). quickcheck-* und lohnveredelung tragen MWSKZ je Lieferung. smoke prüft Struktur (bewegte Lieferung, Dreieck, Lieferort), nicht Kennzeichen. output-html/render sind HTML-Assertions ohne maschinenlesbaren Sollwert.',
  _stand: new Date().toISOString().slice(0, 10),
  _zaehlung: flach.reduce((a, r) => { a[r.suite] = (a[r.suite] || 0) + 1; return a; }, {}),
  faelle: flach,
  roh: { matrix_lager: LAGER, matrix_strecke: STRECKE, matrix_mode2: MODE2, quickcheck_3p: QC_TESTS, quickcheck_4p: QC4_TESTS, lohnveredelung: LOHN_TESTS, smoke: SMOKE_TESTS },
});
writeCsv('04_testfaelle.csv',
  ['suite', 'id', 'name', 'company', 'mode', 'dep', 'dest', 'kette', 'transport', 'uid_verwendet', 'importer_role', 'erwartet_out', 'erwartet_in', 'erwartet_sonstiges', 'quelle'],
  flach);

// ═════════════════════════════════════════════════════════════════════════════
//  5 · Bekannte Bugs und bewusste Vereinfachungen
// ═════════════════════════════════════════════════════════════════════════════
// IDs sind im Repo doppelt vergeben (D2/D3/F3 gibt es in zwei Dateien).
// Hier mit Quellpräfix eindeutig: RK- = rechtskonformitaet.md, TODO- = RGR_TODO.md,
// EC- = vat-knowledge/edge-cases.md.
const abweichungen = [
  { id: 'RK-D1', quelle_datei: 'rechtskonformitaet.md § D1', typ: 'bewusste Abweichung (konservativ)',
    titel: 'Dreieck: eigene UID im Bestimmungsland blockiert, nicht erst die Niederlassung',
    konstellation: 'EPDE mit UID in SI/LV/EE/NL/BE/CZ/PL · EPROHA mit UID in DE/CH — jeweils als mittlerer Unternehmer mit diesem Land als Bestimmungsland',
    wirkung_kennzeichen: 'Statt Dreieck (AF/DH) → ig. Erwerb + lokale Inlandslieferung im Bestimmungsland (z. B. SI: EC + CB). Registrierung nötig.',
    status: 'bewusst so, Revision nur nach Steuerberatung', fundstelle: '_detectTriangle3() / _detectTriangle4()' },
  { id: 'RK-D2', quelle_datei: 'rechtskonformitaet.md § D2', typ: 'bewusste Abweichung (mild)',
    titel: 'NL-Dreieck: bloße NL-Registrierung des Kunden C genügt (Belastingdienst-Praxis)',
    konstellation: 'Bestimmungsland NL, Kunde C nur NL-registriert statt NL-ansässig',
    wirkung_kennzeichen: 'Dreieck bleibt anwendbar → AF/DH statt NL-Registrierung. Spiegelbild zu D1.',
    status: 'bewusst so', fundstelle: '_detectTriangle3() — kein gevestigd-Check' },
  { id: 'RK-D3', quelle_datei: 'rechtskonformitaet.md § D3', typ: 'bewusste Abweichung (konservativ)',
    titel: 'Lohnveredelung: ig. Verbringen gemeldet statt Art. 17 Abs. 2 lit. e in Anspruch genommen',
    konstellation: 'Mode 5, Ware kommt nach der Veredelung nicht zurück (litF=false) und geht ab dem Veredelungsland weiter',
    wirkung_kennzeichen: 'Zusätzliches ig. Verbringen (Ausgang AF/DH, Eingang VE/VH) + Registrierungspflicht im Veredelungsland statt „kein Verbringen".',
    status: 'bewusst so', fundstelle: 'computeLohn() Feld verbringen, reason=no-return' },
  { id: 'RK-F3', quelle_datei: 'rechtskonformitaet.md § F3', typ: 'akademisch, nicht relevant',
    titel: 'Quick-Fix mit manuell gewählter dep-UID ohne tatsächliche Registrierung',
    konstellation: 'Nur konstruierbar, wenn eine dep-UID gewählt wird, die nicht in COMPANIES hinterlegt ist',
    wirkung_kennzeichen: 'keine — in der UI nicht erzeugbar (UID nur aus Stammdatensatz wählbar)',
    status: 'kein Handlungsbedarf', fundstelle: '_applyQuickFix()' },
  { id: 'TODO-D2', quelle_datei: 'RGR_TODO.md (Matrix V1, Rechner-Befund D2)', typ: 'Bug im Rechner',
    titel: 'MWSKZ wird trotz fehlender Registrierung angezeigt',
    konstellation: 'Kunde holt im Abgangsland ab (transport=customer), eigene Gesellschaft hat dort KEINE UID — z. B. Matrix Z38 (EXW IT→SI, EPDE)',
    wirkung_kennzeichen: 'Rechner zeigt DH und warnt zugleich „Registrierungspflicht". Richtig wäre „kein MWSKZ (Registrierung fehlt)". Die Matrix ist hier ehrlicher.',
    status: 'offen', fundstelle: 'SAP-Badge im Rendering-Layer' },
  { id: 'TODO-D3', quelle_datei: 'RGR_TODO.md (Matrix V1, Rechner-Befund D3)', typ: 'Modellgrenze',
    titel: 'Drop-Shipment AT-Kunde ohne fremde EU-UID nicht schaltbar',
    konstellation: 'Mode 2, dest=AT, abweichender Warenempfänger, Kunde legt KEINE fremde EU-UID vor (Matrix Z63)',
    wirkung_kennzeichen: 'Rechner zeigt AF + Hinweis „sonst 20 % AT"; Sollwert der Matrix ist A2 (20 % AT).',
    status: 'offen', fundstelle: 'analyze2() Drop-Shipment-Zweig' },
  { id: 'SAP-EXW', quelle_datei: 'CLAUDE.md · RGR_TODO.md (EXW/Incoterms)', typ: 'Ist/Soll-Divergenz Tool ↔ SAP',
    titel: 'EXW dreht in SAP die UID aufs Lieferantenland — das Tool kennt diese Dimension nicht',
    konstellation: 'Alle EXW-Konstellationen; besonders Lieferantenland ohne eigene Registrierung (IT, FR, ES, HU, RO …) bei Warenempfänger-Land MIT eigener UID',
    wirkung_kennzeichen: 'Gleicher Sachverhalt kann in Tool und SAP unterschiedliche MWSKZ ergeben (z. B. DH vs. CB). Für die Excel-Prüfung EXW als eigene Spalte führen.',
    status: 'offen, mit SAP-Team zu klären', fundstelle: 'buildSapInputHint() / SAP_CUSTTAX_MAP kennen kein EXW-Feld' },
  { id: 'SAP-ABGANGSLAND', quelle_datei: 'plants_abroad/PRUEFUNG.md § 2.1', typ: 'Datenfehler in der Matrix',
    titel: 'steuerliches Abgangsland nicht gepflegt (Z50, Z51, Z57)',
    konstellation: 'CH-DDP (Z50), LI-DDP (Z51), IT→IT (Z57) — Abgangsland steht auf AT',
    wirkung_kennzeichen: 'SAP findet A0 bzw. AF statt der gepflegten B5 / IC. Abgangsland muss CH / LI / IT sein.',
    status: 'offen (Fachseite)', fundstelle: 'Matrix_erweitert_V1_2.xlsx Spalte „tax delivered from country"' },
  { id: 'SAP-LUECKE-IGL', quelle_datei: 'SAP_TAX_MAP / RGR_TODO.md P3', typ: 'fehlendes Kennzeichen',
    titel: 'Kein Ausgangs-MWSKZ für IG-Lieferung mit BE-, EE-, LV- oder NL-UID',
    konstellation: 'EPDE verkauft als Lieferant mit BE/EE/LV/NL-UID ig. an ein anderes EU-Land',
    wirkung_kennzeichen: 'SAP_TAX_MAP liefert null → Tool zeigt „kein MWSKZ". In SAP anzulegen (Pendant zu DH/T1/C1/OB).',
    status: 'offen', fundstelle: 'SAP_TAX_MAP.EPDE.{BE,EE,LV,NL}[ic-exempt]' },
  { id: 'VAT-H02', quelle_datei: 'RGR_TODO.md (offen, P0)', typ: 'fachlich offen',
    titel: 'BE: RC wird bei Direktregistrierung ohne Betriebsstätte gesperrt',
    konstellation: 'EPDE mit BE-UID ohne BE-Betriebsstätte, ruhende Lieferung in BE',
    wirkung_kennzeichen: 'Tool weist 21 % BE aus (BS/BI) statt RC. Wenn RC doch greift, ist das eine Fehlklassifikation über den vollen Steuerbetrag.',
    status: 'offen, mit Steuerberater zu klären — vorher nichts ändern', fundstelle: '_checkRCBlock() BE-Zweig' },
  { id: 'VAT-M01', quelle_datei: 'RGR_TODO.md (offen)', typ: 'fachlich offen',
    titel: 'IT: gleiche RC-Frage wie BE, aktuell latent',
    konstellation: 'Wird akut, sobald eine IT-UID in die Stammdaten aufgenommen wird',
    wirkung_kennzeichen: 'heute keine (EPROHA ohne IT-UID → IC ohne Eingangscode; EPDE mit IT-UID → VI)',
    status: 'latent', fundstelle: '_checkRCBlock() IT-Zweig' },
  { id: 'VAT-H04', quelle_datei: 'RGR_TODO.md (offen)', typ: 'Modellgrenze',
    titel: 'Art. 138: validierte Kunden-UID wird nicht modelliert',
    konstellation: 'Jede IG-Lieferung — das Tool kennt weder VIES-Status noch ZM-Abgabe',
    wirkung_kennzeichen: '„0 % steuerfrei" gilt nur dem Grunde nach. Für die UVA-/Fakturaprüfung ist die UID-Validierung eine EIGENE Kontrolle.',
    status: 'bewusst außerhalb des Scope', fundstelle: '—' },
  { id: 'VAT-M04', quelle_datei: 'RGR_TODO.md (offen)', typ: 'Anzeigefehler',
    titel: 'Rechtsgrundlage: _applyQuickFix() zitiert § 3 Abs. 6a UStG (DE) auch für EPROHA',
    konstellation: 'EPROHA in jedem Quick-Fix-Fall',
    wirkung_kennzeichen: 'keine — nur der zitierte Paragraf ist falsch (AT: Art. statt §)',
    status: 'offen', fundstelle: '_applyQuickFix()' },
  { id: 'EC-F1', quelle_datei: 'vat-knowledge/edge-cases.md § F1', typ: 'Sonderfall (abgedeckt)',
    titel: 'Inlands-Reihengeschäft BG→AT→BG bzw. BG→DE→BG',
    konstellation: 'dep = dest, eigene Gesellschaft in der Mitte',
    wirkung_kennzeichen: 'Keine IG-Lieferung, kein Dreieck — alle Lieferungen sind Inlandslieferungen im dep-Land; ohne dortige Registrierung entsteht Registrierungspflicht.',
    status: 'abgedeckt (analyzeInland)', fundstelle: 'rules/inland_chain.md' },
  { id: 'EC-F2', quelle_datei: 'vat-knowledge/edge-cases.md § F2', typ: 'Sonderfall (abgedeckt)',
    titel: 'HU→DE(EPDE)→DE, EXW-Abholung — UID-Wahl entscheidet',
    konstellation: 'Zwischenhändler holt beim HU-Lieferanten ab; dep=HU, dest=DE',
    wirkung_kennzeichen: 'Ohne mitgeteilte HU-UID greift die Grundregel → L1 bewegt, HU-Lieferant fakturiert 27 % HU. Mit dep-UID → L2 bewegt.',
    status: 'abgedeckt', fundstelle: '_applyQuickFix()' },
  { id: 'EC-F3', quelle_datei: 'vat-knowledge/edge-cases.md § F3', typ: 'Sonderfall (abgedeckt)',
    titel: 'DE(Sappi)→DE(EPDE)→IT — Abgangsland gleich Sitzland des Zwischenhändlers',
    konstellation: 'dep = companyHome = DE, Zwischenhändler transportiert',
    wirkung_kennzeichen: 'Ansässigkeit im Abgangsland → Art. 36a Abs. 2 lit. b → Ausgangslieferung bewegt (DH), nicht Grundregel.',
    status: 'abgedeckt', fundstelle: '_applyQuickFix() Zweig intermediaryResidentInDep' },
  { id: 'EC-F4', quelle_datei: 'vat-knowledge/edge-cases.md § F4', typ: 'Sonderfall (abgedeckt)',
    titel: 'AT(EPROHA)→CH-Kunde→SK — Drittland-Kunde, Ware bleibt in der EU',
    konstellation: 'Mode 2, Kunde im Drittland, Warenempfänger in der EU',
    wirkung_kennzeichen: 'KEINE Ausfuhr (A0), sondern ig. Reihengeschäft. Je vorgelegter EU-UID des Kunden: keine → A2 20 % AT · AT-UID → A2 · Bestimmungsland-UID → AF · Dritt-MS-UID → Dreieck.',
    status: 'abgedeckt', fundstelle: 'analyze2() euGoodsRecipient / bIsNonEU' },
  { id: 'BASELINE-SCOPE', quelle_datei: 'RGR_TODO.md (Regressions-Baseline)', typ: 'Abdeckungslücke',
    titel: 'Regressions-Baseline deckt nur Modus 3 mit EU-Ländern ab',
    konstellation: 'Nicht in tests/matrix-baseline.csv: Modus 2, Modus 4, Modus 5, alle Drittlandspfade, importerRole-Varianten',
    wirkung_kennzeichen: 'Für diese Bereiche gibt es keine automatische Regressionsabsicherung — Änderungen dort fallen nicht auf.',
    status: 'offen', fundstelle: 'scripts/export-matrix.mjs' },
];

writeJson('05_abweichungen.json', {
  _hinweis: 'IDs sind im Repo mehrfach vergeben (D2/D3/F3 existieren in zwei Dateien). Präfix macht sie eindeutig: RK- = rechtskonformitaet.md · TODO- = RGR_TODO.md · EC- = vat-knowledge/edge-cases.md.',
  _stand: new Date().toISOString().slice(0, 10),
  abweichungen,
});
writeCsv('05_abweichungen.csv', ['id', 'quelle_datei', 'typ', 'titel', 'konstellation', 'wirkung_kennzeichen', 'status', 'fundstelle'], abweichungen);

// ═════════════════════════════════════════════════════════════════════════════
//  6 · SAP-Kennzeichen-Mapping (roh + flach)
// ═════════════════════════════════════════════════════════════════════════════
writeJson('06_sap_tax_map.json', { SAP_TAX_MAP, SAP_CUSTTAX_MAP });

const sapFlach = [];
for (const [comp, laenderMap] of Object.entries(SAP_TAX_MAP))
  for (const [land, treatments] of Object.entries(laenderMap))
    for (const [treatment, e] of Object.entries(treatments))
      sapFlach.push({ gesellschaft: comp, uid_land: land, treatment, mwskz_out: e.out ?? '', mwskz_in: e.in ?? '', bedeutung: e.desc ?? '' });
writeCsv('06_sap_tax_map.csv', ['gesellschaft', 'uid_land', 'treatment', 'mwskz_out', 'mwskz_in', 'bedeutung'], sapFlach);

const custFlach = [];
for (const [dep, dests] of Object.entries(SAP_CUSTTAX_MAP)) {
  if (dep === '_meta') continue;
  for (const [dest, codes] of Object.entries(dests))
    for (const [code, e] of Object.entries(codes))
      custFlach.push({ abgangsland: dep, zielland: dest, mwskz: code, steuerklasse_kunde: e.cls,
        alternative_klassen: (e.alt || []).join('|'), satz: e.rate, bedeutung: e.txt, empfangsland_setzen: e.empf || '' });
}
writeCsv('06_sap_custtax_map.csv', ['abgangsland', 'zielland', 'mwskz', 'steuerklasse_kunde', 'alternative_klassen', 'satz', 'bedeutung', 'empfangsland_setzen'], custFlach);

console.log(`Export nach ${OUT}:`);
written.forEach(f => console.log(`  ${f}`));
console.log(`\n${flach.length} Testfälle · ${sapFlach.length} MWSKZ-Einträge · ${custFlach.length} VK12-Zeilen · ${laender.length} Länder`);
console.log(`SAP_TAX_MAP: app.js:${lineOf(APP, 'SAP_TAX_MAP')} · SAP_CUSTTAX_MAP: app.js:${lineOf(APP, 'SAP_CUSTTAX_MAP')}`);
