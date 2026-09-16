// ─────────────────────────────────────────────────────────────────────────────
//  export-matrix.mjs — exportiert die gesamte Konstellationsfläche des Rechners
//  als CSV. Gedacht als Regressions-Baseline: der Export wird einmal als
//  tests/matrix-baseline.csv eingecheckt, jeder spätere Lauf wird per
//  scripts/matrix-diff.mjs dagegen verglichen.
//
//  Aufruf:
//    node scripts/export-matrix.mjs --countries eu --out tests/matrix-baseline.csv
//    node scripts/export-matrix.mjs --countries DE,AT,IT,SI,PL,CZ --skip-same
//
//  Optionen:
//    --countries eu|<Liste>  'eu' = alle EU-Länder aus dem EU-Array (ohne nonEU),
//                            sonst Komma-Liste von Ländercodes. Default: eu
//    --companies <Liste>     Default: EPDE,EPROHA
//    --transports <Liste>    Default: supplier,middle,customer
//    --out <Datei>           Default: tests/matrix-current.csv
//    --skip-same             Paare mit Lieferantenland === Kundenland auslassen
//    --limit <n>             nur die ersten n Fälle (Smoke-Test)
//    --quiet                 keine Fortschrittsausgabe
//
//  Die Konstellation eines Falls:
//    Gesellschaft × Lieferantenland (= Abgang) × Kundenland (= Bestimmung)
//    × Transportveranlasser × verwendete eigene UID
//  Die UID-Menge je Paar ist dedupliziert [home, dep, dest] — genau die
//  Auswahl, die renderUidOverrideBlock() dem Anwender anbietet.
//
//  WICHTIG: Dieses Script LIEST nur. Es lädt docs/index.html + app.js in jsdom
//  (gleicher Bootstrap wie scripts/test-matrix.mjs) und ruft analyze() auf.
//  docs/assets/scripts/app.js wird nicht verändert.
//
//  Die exportierten Spalten sind bewusst die stabilen Ergebnisfelder des
//  Haupt-Renderpfads. `note`, `moved_route`, `risks` und `hints` sind
//  Fließtext bzw. Zähler und stehen im Diff-Default nicht im Vergleich.
// ─────────────────────────────────────────────────────────────────────────────
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ── CLI ──────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
};
const flagSet = (name) => argv.includes('--' + name);

const OUT        = resolve(root, arg('out', 'tests/matrix-current.csv'));
const COUNTRIES  = arg('countries', 'eu');
const COMPANIES_ = arg('companies', 'EPDE,EPROHA').split(',').map((s) => s.trim()).filter(Boolean);
const TRANSPORTS = arg('transports', 'supplier,middle,customer').split(',').map((s) => s.trim()).filter(Boolean);
const SKIP_SAME  = flagSet('skip-same');
const LIMIT      = Number(arg('limit', 0)) || 0;
const QUIET      = flagSet('quiet');

// ── Bootstrap (identisch zu scripts/test-matrix.mjs) ─────────────────────────
const html  = readFileSync(join(root, 'docs/index.html'), 'utf8');
const appJs = readFileSync(join(root, 'docs/assets/scripts/app.js'), 'utf8');
const inl = html.replace(/<script\s+src=["'][^"']*app\.js[^"']*["'][^>]*><\/script>/i, `<script>${appJs}</script>`);
const vc = new VirtualConsole();
vc.sendTo(console, { omitJSDOMErrors: true });
const dom = new JSDOM(inl, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true, virtualConsole: vc });
const { window } = dom;
await new Promise((r) => setTimeout(r, 1500));
window.Element.prototype.scrollIntoView = function () {};

// ── Länderliste ──────────────────────────────────────────────────────────────
const euCodes = window.eval('EU.filter(c => !c.nonEU).map(c => c.code)');
const countries = COUNTRIES === 'eu'
  ? euCodes
  : COUNTRIES.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);

const unknown = countries.filter((c) => !euCodes.includes(c));
if (unknown.length) {
  console.error(`Unbekannte oder nicht-EU Ländercodes: ${unknown.join(', ')}`);
  console.error(`Verfügbar: ${euCodes.join(', ')}`);
  process.exit(2);
}
for (const comp of COMPANIES_) {
  if (!window.eval(`typeof COMPANIES[${JSON.stringify(comp)}] !== 'undefined'`)) {
    console.error(`Unbekannte Gesellschaft: ${comp}`);
    process.exit(2);
  }
}

// ── Einen Fall rechnen ───────────────────────────────────────────────────────
// Setzt denselben State wie runStrecke() in test-matrix.mjs und ruft analyze().
function runCase(comp, sup, cus, transport, uid) {
  window.eval(`
    currentCompany=${JSON.stringify(comp)}; MY_VAT_IDS=COMPANIES[${JSON.stringify(comp)}].vatIds;
    currentMode=3; mePosition=2; dropShipDest=null; mode2CustUid=null;
    importerRole='customer';
    selectedTransport=${JSON.stringify(transport)}; selectedUidOverride=${JSON.stringify(uid)};
    (function(){const home=COMPANIES[currentCompany].home;
     const setV=(id,val)=>{let el=document.getElementById(id); if(!el){el=document.createElement('select');el.id=id;el.style.display='none';document.body.appendChild(el);} el.innerHTML='<option value="'+val+'" selected>'+val+'</option>';};
     setV('cp-0',${JSON.stringify(sup)}); setV('cp-1',home); setV('cp-2',${JSON.stringify(cus)});
     setV('s1',${JSON.stringify(sup)}); setV('s2',home); setV('s3',${JSON.stringify(cus)}); setV('s4',${JSON.stringify(cus)});
     setV('dep',${JSON.stringify(sup)}); setV('dest',${JSON.stringify(cus)});})();
    analyze();`);
  return window.document.getElementById('resultContent');
}

// ── Extraktion ───────────────────────────────────────────────────────────────
const FLAGS = /[\u{1F1E6}-\u{1F1FF}]/gu;               // Regional-Indicator-Paare
const clean = (s) => (s || '').replace(FLAGS, '').replace(/\s+/g, ' ').trim();

// SAP-Kennzeichen, primär aus den rollenbezogenen Blöcken der Kurzbeschreibung
// (`.decision-own-note`: L1 = ICH ALS KÄUFER → Eingang, L2 = ICH ALS VERKÄUFER
// → Ausgang). Nur dort steht das Kennzeichen eindeutig an einer Rolle.
// Absichtlich NICHT die Einzelcode-Heuristik aus test-matrix.mjs: die ordnet
// ein allein stehendes Kennzeichen pauschal dem Ausgang zu und verschiebt damit
// z.B. ein reines Erwerbskennzeichen (VH) in die falsche Spalte.
function parseOwnNotes(rc) {
  let out = null, inp = null;
  for (const note of rc.querySelectorAll('.decision-own-note')) {
    const role = clean(note.querySelector('.decision-own-role')?.textContent);
    const body = clean(note.querySelector('.decision-own-body')?.textContent);
    const a = /Ausg:\s*([A-Z0-9]+)/.exec(body);
    const e = /Eing:\s*([A-Z0-9]+)/.exec(body);
    const single = /SAP Stkz\.\s*=\s*([A-Z0-9]+)/.exec(body);
    if (a) out = a[1];
    if (e) inp = e[1];
    if (!a && !e && single) {
      if (/VERKÄUFER/.test(role)) out = single[1];
      else if (/KÄUFER/.test(role)) inp = single[1];
    }
  }
  return { out, inp };
}

// Fallback für Renderpfade ohne Kurzbeschreibungs-Blöcke (z.B. Drittland).
function parseCodes(t) {
  let out = null, inp = null;
  const di = t.indexOf('Details pro Lieferung');
  if (di >= 0) {
    const blocks = t.slice(di).split(/(?=L\d:\s)/);
    for (const b of blocks) {
      const m = /^L(\d):/.exec(b); if (!m) continue;
      const a = /Ausg:\s*([A-Z0-9]+)/.exec(b), e = /Eing:\s*([A-Z0-9]+)/.exec(b);
      const missing = /Stkz\.\s*=\s*⚠\s*fehlt|kein SAP-Stkz|Buchung in SAP nicht möglich/.test(b.slice(0, 600));
      if (m[1] === '2') { if (a) out = a[1]; else if (missing) out = 'KEIN'; }
      if (m[1] === '1') { if (e) inp = e[1]; else if (missing) inp = 'KEIN'; }
    }
  }
  const e2 = /SAP-Stkz\. Eingangsrechnung[^=]*=\s*([^\s🧾]+)/.exec(t);
  const a2 = /SAP-Stkz\. Ausgangsrechnung[^=]*=\s*([^\s🧾]+)/.exec(t);
  if (a2 && out === null) out = a2[1] === '⚠' ? 'KEIN' : a2[1];
  if (e2 && inp === null) inp = e2[1] === '⚠' ? 'KEIN' : e2[1];
  return { out, inp };
}

function summaryValue(rc, label) {
  for (const si of rc.querySelectorAll('.summary-item')) {
    if (clean(si.querySelector('.summary-label')?.textContent) === label) {
      return clean(si.querySelector('.summary-value')?.textContent);
    }
  }
  return '';
}

function extract(rc) {
  const text = rc.textContent.replace(/\s+/g, ' ');

  // Ampel-Titel: 'Kein Problem' / 'Problem vorhanden'.
  // Der Inlandspfad (analyzeInland, dep===dest) rendert keine Ampel, sondern
  // trägt einen eigenen Marker — den lesen wir, damit diese Zeilen nicht
  // komplett leer in der Baseline stehen und eine Regression dort unsichtbar
  // bliebe. Fehlt beides, bleibt das Feld leer statt zu raten.
  let verdict = clean(rc.querySelector('.traffic-status-title')?.textContent);
  if (!verdict && /Inlands-Reihengeschäft · Abgangsland = Bestimmungsland/.test(text)) {
    verdict = 'Inlandsfall';
  }

  // Bewegte Lieferung: L1/L2 aus den Streckenlabels des Diagramms.
  const diagram = clean(rc.querySelector('.flow-diagram')?.textContent);
  let moved = '';
  if (/L1 — bewegte/.test(diagram)) moved = 'L1';
  else if (/L2 — bewegte/.test(diagram)) moved = 'L2';
  else if (/L2 — Dreieck/.test(diagram)) moved = 'L1';

  // Dreieck. Die beiden Signale schließen einander aus:
  //   'Vereinfachungsregelung anwendbar' → mit der gewählten UID greift Art. 141
  //   dreiecksOpportunityBanner          → greift erst mit einer anderen UID
  // Die Diagramm-Strecke ('L2 — Dreieck') taugt NICHT als Signal: ist L2 die
  // bewegte Lieferung, trägt sie das Dreieck-Label nicht, obwohl die
  // Vereinfachung greift.
  let triangle = 'nicht anwendbar';
  if (/Vereinfachungsregelung anwendbar/.test(text)) triangle = 'angewendet';
  else if (rc.querySelector('[data-component="dreiecksOpportunityBanner"]')) triangle = 'möglich (UID-Anpassung)';

  // Risiko-/Hinweiszähler aus dem Kopf des Risiko-Panels.
  const rcCount = clean(rc.querySelector('.risk-count')?.textContent);
  const rm = /(\d+)\s+Risiko\S*\s*·\s*(\d+)\s+Hinweis/.exec(rcCount);

  const own = parseOwnNotes(rc);
  const fb = parseCodes(text);
  const out = own.out ?? fb.out ?? 'KEIN';
  const inp = own.inp ?? fb.inp ?? 'KEIN';

  return {
    verdict,
    moved_delivery: moved,
    moved_route: summaryValue(rc, 'Bewegte Lieferung'),
    triangle,
    sap_out: out,
    sap_in: inp,
    registration: summaryValue(rc, 'Registrierung'),
    active_uid: summaryValue(rc, 'Aktive UID'),
    risks: rm ? rm[1] : '',
    hints: rm ? rm[2] : '',
    note: clean(rc.querySelector('.risk-panel-body')?.textContent),
  };
}

// ── CSV ──────────────────────────────────────────────────────────────────────
const HEADER = ['company', 'home', 'supplier', 'customer', 'transport', 'uid_used',
  'verdict', 'moved_delivery', 'moved_route', 'triangle', 'sap_out', 'sap_in',
  'registration', 'active_uid', 'risks', 'hints', 'note'];

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

// ── Lauf ─────────────────────────────────────────────────────────────────────
const rows = [];
let done = 0;
const t0 = Date.now();

outer:
for (const comp of COMPANIES_) {
  const home = window.eval(`COMPANIES[${JSON.stringify(comp)}].home`);
  for (const sup of countries) {
    for (const cus of countries) {
      if (SKIP_SAME && sup === cus) continue;
      // Auswahl, die renderUidOverrideBlock() anbietet: [home, dep, dest] dedupliziert
      const uids = [...new Set([home, sup, cus])];
      for (const transport of TRANSPORTS) {
        for (const uid of uids) {
          const rc = runCase(comp, sup, cus, transport, uid);
          rows.push({ company: comp, home, supplier: sup, customer: cus, transport, uid_used: uid, ...extract(rc) });
          done++;
          if (!QUIET && done % 100 === 0) {
            const s = ((Date.now() - t0) / 1000).toFixed(0);
            process.stderr.write(`  ${done} Fälle · ${s}s\n`);
          }
          if (LIMIT && done >= LIMIT) break outer;
        }
      }
    }
  }
}

mkdirSync(dirname(OUT), { recursive: true });
const body = rows.map((r) => HEADER.map((h) => csvCell(r[h])).join(';')).join('\n');
writeFileSync(OUT, '\ufeff' + HEADER.join(';') + '\n' + body + '\n', 'utf8');

if (!QUIET) {
  const s = ((Date.now() - t0) / 1000).toFixed(0);
  console.log(`${rows.length} Konstellationen · ${countries.length} Länder · ${COMPANIES_.length} Gesellschaften · ${s}s`);
  console.log(`Export → ${OUT}`);
}
