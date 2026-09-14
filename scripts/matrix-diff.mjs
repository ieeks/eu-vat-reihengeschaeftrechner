// ─────────────────────────────────────────────────────────────────────────────
//  matrix-diff.mjs — vergleicht zwei Matrix-Exporte und gruppiert die
//  Abweichungen, statt Zeilen zu spucken. Gedacht als Regressions-Gate nach
//  jeder Session an der VATEngine.
//
//  Aufruf:
//    node scripts/matrix-diff.mjs tests/matrix-baseline.csv tests/matrix-current.csv
//    node scripts/matrix-diff.mjs base.csv cur.csv --columns sap_out,sap_in
//    node scripts/matrix-diff.mjs base.csv cur.csv --examples 5 --md report.md
//
//  Exit-Code 0 = deckungsgleich, 1 = Abweichungen (taugt als CI-Gate).
//
//  Schlüssel einer Zeile: company|supplier|customer|transport|uid_used
//  Verglichen werden per Default nur die stabilen Ergebnisfelder. `note`,
//  `moved_route`, `risks` und `hints` sind Fließtext bzw. Zähler und würden
//  bei jeder Formulierungsänderung rauschen — bewusst nicht im Default.
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync } from 'fs';

const argv = process.argv.slice(2);
const positional = argv.filter((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));
const arg = (name, fallback) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
};

const [baseFile, curFile] = positional;
if (!baseFile || !curFile) {
  console.error('Aufruf: node scripts/matrix-diff.mjs <baseline.csv> <current.csv> [--columns a,b] [--examples n] [--md datei]');
  process.exit(2);
}

const KEY_COLS = ['company', 'supplier', 'customer', 'transport', 'uid_used'];
const DEFAULT_COMPARE = ['verdict', 'moved_delivery', 'triangle', 'sap_out', 'sap_in', 'registration', 'active_uid'];
const COMPARE = arg('columns', DEFAULT_COMPARE.join(',')).split(',');
const MAX_EXAMPLES = Number(arg('examples', 3));
const MD_FILE = arg('md', null);

// ── CSV lesen (quotes + eingebettete Trennzeichen) ───────────────────────────
function parseCsv(path) {
  let text = readFileSync(path, 'utf8');
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // BOM
  const delim = (text.split('\n')[0].match(/;/g) || []).length >= 3 ? ';' : ',';

  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === delim) { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }

  const header = rows.shift();
  return rows
    .filter((r) => r.length === header.length)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

const base = parseCsv(baseFile);
const cur = parseCsv(curFile);

const missingCols = COMPARE.filter((c) => !(c in (base[0] || {})) || !(c in (cur[0] || {})));
if (missingCols.length) {
  console.error('Spalten fehlen in einer der Dateien:', missingCols.join(', '));
  process.exit(2);
}

const keyOf = (r) => KEY_COLS.map((c) => r[c]).join('|');
const baseMap = new Map(base.map((r) => [keyOf(r), r]));
const curMap = new Map(cur.map((r) => [keyOf(r), r]));

// ── Vergleich ────────────────────────────────────────────────────────────────
const added = [...curMap.keys()].filter((k) => !baseMap.has(k));
const removed = [...baseMap.keys()].filter((k) => !curMap.has(k));

// changes: Spalte -> "alt → neu" -> Liste der betroffenen Schlüssel
const changes = new Map();
let changedRows = 0;

for (const [key, b] of baseMap) {
  const c = curMap.get(key);
  if (!c) continue;
  let touched = false;
  for (const col of COMPARE) {
    const ov = b[col] ?? '', nv = c[col] ?? '';
    if (ov === nv) continue;
    touched = true;
    if (!changes.has(col)) changes.set(col, new Map());
    const bucket = changes.get(col);
    const label = `${ov || '(leer)'} → ${nv || '(leer)'}`;
    if (!bucket.has(label)) bucket.set(label, []);
    bucket.get(label).push(key);
  }
  if (touched) changedRows++;
}

// ── Ausgabe ──────────────────────────────────────────────────────────────────
const lines = [];
const say = (s = '') => { lines.push(s); console.log(s); };

say(`Baseline : ${baseFile}  (${base.length} Zeilen)`);
say(`Aktuell  : ${curFile}  (${cur.length} Zeilen)`);
say(`Verglichen: ${COMPARE.join(', ')}`);
say('─'.repeat(78));

if (!changedRows && !added.length && !removed.length) {
  say('Deckungsgleich. Keine Abweichung in den verglichenen Spalten.');
  if (MD_FILE) writeFileSync(MD_FILE, lines.join('\n'));
  process.exit(0);
}

say(`${changedRows} von ${baseMap.size} Zeilen abweichend` +
    (added.length ? ` · ${added.length} neu` : '') +
    (removed.length ? ` · ${removed.length} entfallen` : ''));

// Spalten mit den meisten Treffern zuerst — da schaut man zuerst hin.
const byImpact = [...changes.entries()].sort(
  (a, a2) => [...a2[1].values()].flat().length - [...a[1].values()].flat().length
);

for (const [col, buckets] of byImpact) {
  const total = [...buckets.values()].flat().length;
  say('');
  say(`▌ ${col} — ${total} Abweichungen in ${buckets.size} Mustern`);
  const sorted = [...buckets.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [label, keys] of sorted) {
    say(`   ${String(keys.length).padStart(5)}×  ${label}`);
    for (const k of keys.slice(0, MAX_EXAMPLES)) say(`          ${k}`);
    if (keys.length > MAX_EXAMPLES) say(`          … ${keys.length - MAX_EXAMPLES} weitere`);
  }
}

if (added.length) {
  say('');
  say(`▌ Neue Konstellationen (${added.length})`);
  added.slice(0, MAX_EXAMPLES).forEach((k) => say(`          ${k}`));
  if (added.length > MAX_EXAMPLES) say(`          … ${added.length - MAX_EXAMPLES} weitere`);
}
if (removed.length) {
  say('');
  say(`▌ Entfallene Konstellationen (${removed.length})`);
  removed.slice(0, MAX_EXAMPLES).forEach((k) => say(`          ${k}`));
  if (removed.length > MAX_EXAMPLES) say(`          … ${removed.length - MAX_EXAMPLES} weitere`);
}

say('');
say('Wenn die Änderungen gewollt sind: Baseline mit `npm run matrix:baseline` neu setzen.');

if (MD_FILE) {
  writeFileSync(MD_FILE, '```\n' + lines.join('\n') + '\n```\n');
  console.log(`\nReport → ${MD_FILE}`);
}

process.exit(1);
