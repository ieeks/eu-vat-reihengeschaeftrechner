#!/usr/bin/env node
// gen-m365-knowledge.mjs — baut die konsolidierten M365-Wissensbasen.
//
// Es gibt ZWEI Agenten (EPROHA, EPDE) für unterschiedliche Mitarbeiter. Der
// fachliche Kern (Recht, Regeln, Referenzfälle) ist identisch; firmenspezifisch
// sind nur Firmenkontext + SAP-Buchungskreise.
//
// Single Source of Truth bleibt `vat-knowledge/` (+ die firmenkontext-*.md).
// Dieses Skript konkateniert pro Firma EINE Datei:
//   copilot-m365/wissensbasis-eproha.md
//   copilot-m365/wissensbasis-epde.md
// die als Wissensquelle für den jeweiligen M365-Agenten nach OneDrive/SharePoint
// hochgeladen wird.
//
// Aufruf:  node scripts/gen-m365-knowledge.mjs
// Prüfung: node scripts/gen-m365-knowledge.mjs --check   (Exit 1 wenn veraltet)

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = (company) => join(ROOT, 'copilot-m365', `wissensbasis-${company}.md`);

// Fachlicher Kern — für beide Agenten identisch. Reihenfolge = Grounding-Priorität.
const SHARED = [
  ['Kernregeln & Index',            'vat-knowledge/CLAUDE-vat-knowledge.md'],
  ['Referenzfälle (Goldstandard)',  'vat-knowledge/reference-cases.md'],
  ['Grenzfälle',                    'vat-knowledge/edge-cases.md'],
  ['Regel · Transportzuordnung',    'vat-knowledge/rules/moving_supply_logic.md'],
  ['Regel · Dreiecksgeschäft',      'vat-knowledge/rules/triangle_conditions.md'],
  ['Regel · Lieferort',             'vat-knowledge/rules/place_of_supply.md'],
  ['Regel · Reverse-Charge-Länder', 'vat-knowledge/rules/rc_country_rules.md'],
  ['Regel · Registrierungsrisiko',  'vat-knowledge/rules/registration_risk_logic.md'],
  ['Regel · UID-Nutzung',           'vat-knowledge/rules/uid_usage_rules.md'],
  ['Regel · Inlandskette',          'vat-knowledge/rules/inland_chain.md'],
  ['EU · Art. 36a MwStSystRL',      'vat-knowledge/eu/art36a_mwstrl.md'],
  ['EU · Art. 138 MwStSystRL',      'vat-knowledge/eu/art138_mwstrl.md'],
  ['EU · Art. 141 Dreieck',         'vat-knowledge/eu/art141_triangle.md'],
  ['EU · Art. 141 Länderstand',     'vat-knowledge/eu/art141_dest_registration.md'],
  ['EU · Quick Fixes 2020',         'vat-knowledge/eu/quick_fixes_2020.md'],
  ['AT · Reihengeschäft',           'vat-knowledge/at/ustg_at_reihengeschaeft.md'],
  ['AT · Dreiecksgeschäft',         'vat-knowledge/at/ustg_at_dreieck.md'],
  ['DE · § 3 Abs. 6a UStG',         'vat-knowledge/de/ustg_de_3_6a.md'],
  ['DE · UStAE Reihengeschäft',     'vat-knowledge/de/ustae_reihengeschaeft.md'],
  ['NL · Wet OB Reihengeschäft',    'vat-knowledge/nl/wet_ob_nl_reihengeschaeft.md'],
  ['CH · Ort der Lieferung',        'vat-knowledge/ch/mwst_ch_ort_lieferung.md'],
  ['CH · Konsignationslager',       'vat-knowledge/ch/mwst_ch_konsignationslager.md'],
];

// Firmenspezifische Abschnitte: Firmenkontext zuerst (Priorität), Buchungskreise
// als detaillierte SAP-Referenz am Ende.
const COMPANIES = {
  eproha: {
    label: 'EPROHA (AT)',
    head:  ['Firmenkontext EPROHA',       'copilot-m365/firmenkontext-eproha.md'],
    tail:  ['AT · EPROHA-Buchungskreise', 'vat-knowledge/at/eproha-buchungskreise.md'],
  },
  epde: {
    label: 'EPDE (DE)',
    head:  ['Firmenkontext EPDE',       'copilot-m365/firmenkontext-epde.md'],
    tail:  ['DE · EPDE-Buchungskreise', 'vat-knowledge/de/epde-buchungskreise.md'],
  },
};

function build(company) {
  const cfg = COMPANIES[company];
  const sections = [cfg.head, ...SHARED, cfg.tail];

  const head = [
    `# VAT-Wissensbasis für den M365-Copilot-Agenten — ${cfg.label}`,
    '',
    '> **AUTOMATISCH GENERIERT** von `scripts/gen-m365-knowledge.mjs` —',
    '> nicht direkt bearbeiten. Quelle: `vat-knowledge/` +',
    `> \`copilot-m365/${cfg.head[1].split('/').pop()}\`. Neu bauen mit:`,
    '> `node scripts/gen-m365-knowledge.mjs`.',
    '>',
    `> Diese Datei nach OneDrive/SharePoint hochladen und im ${cfg.label}-Agenten`,
    '> als Wissensquelle verknüpfen (siehe `copilot-m365/README.md`).',
    '',
    '## Inhaltsverzeichnis',
    '',
    ...sections.map(([title], i) => `${i + 1}. ${title}`),
    '',
    '---',
    '',
  ].join('\n');

  const body = sections.map(([title, rel], i) => {
    const raw = readFileSync(join(ROOT, rel), 'utf8').trimEnd();
    return [`# ${i + 1}. ${title}`, `<!-- Quelle: ${rel} -->`, '', raw, '', '---', ''].join('\n');
  }).join('\n');

  return head + body;
}

const isCheck = process.argv.includes('--check');
let stale = false;

for (const company of Object.keys(COMPANIES)) {
  const content = build(company);
  const path = outPath(company);
  if (isCheck) {
    let current = '';
    try { current = readFileSync(path, 'utf8'); } catch { /* fehlt → veraltet */ }
    if (current !== content) {
      console.error(`✗ copilot-m365/wissensbasis-${company}.md ist veraltet.`);
      stale = true;
    } else {
      console.log(`✓ copilot-m365/wissensbasis-${company}.md ist aktuell.`);
    }
  } else {
    writeFileSync(path, content);
    const kb = Math.round(Buffer.byteLength(content) / 1024);
    console.log(`✓ copilot-m365/wissensbasis-${company}.md geschrieben (${kb} KB).`);
  }
}

if (isCheck && stale) {
  console.error('→ `node scripts/gen-m365-knowledge.mjs` ausführen.');
  process.exit(1);
}
