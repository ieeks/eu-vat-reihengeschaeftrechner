#!/usr/bin/env node
// gen-m365-knowledge.mjs — baut die konsolidierte M365-Wissensbasis.
//
// Single Source of Truth bleibt der Ordner `vat-knowledge/` (+ `copilot-m365/
// firmenkontext.md`). Dieses Skript konkateniert die kuratierten Dateien in
// EINE Datei `copilot-m365/wissensbasis.md`, die als Wissensquelle für einen
// deklarativen M365-Copilot-Agenten nach OneDrive/SharePoint hochgeladen wird.
//
// Aufruf:  node scripts/gen-m365-knowledge.mjs
// Prüfung: node scripts/gen-m365-knowledge.mjs --check   (Exit 1 wenn veraltet)

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'copilot-m365', 'wissensbasis.md');

// Reihenfolge = Priorität für die Grounding-Qualität des Agenten.
const SECTIONS = [
  ['Firmenkontext & SAP-Kennzeichen', 'copilot-m365/firmenkontext.md'],
  ['Kernregeln & Index',              'vat-knowledge/CLAUDE-vat-knowledge.md'],
  ['Referenzfälle (Goldstandard)',    'vat-knowledge/reference-cases.md'],
  ['Grenzfälle',                      'vat-knowledge/edge-cases.md'],
  ['Regel · Transportzuordnung',      'vat-knowledge/rules/moving_supply_logic.md'],
  ['Regel · Dreiecksgeschäft',        'vat-knowledge/rules/triangle_conditions.md'],
  ['Regel · Lieferort',               'vat-knowledge/rules/place_of_supply.md'],
  ['Regel · Reverse-Charge-Länder',   'vat-knowledge/rules/rc_country_rules.md'],
  ['Regel · Registrierungsrisiko',    'vat-knowledge/rules/registration_risk_logic.md'],
  ['Regel · UID-Nutzung',             'vat-knowledge/rules/uid_usage_rules.md'],
  ['Regel · Inlandskette',            'vat-knowledge/rules/inland_chain.md'],
  ['EU · Art. 36a MwStSystRL',        'vat-knowledge/eu/art36a_mwstrl.md'],
  ['EU · Art. 138 MwStSystRL',        'vat-knowledge/eu/art138_mwstrl.md'],
  ['EU · Art. 141 Dreieck',           'vat-knowledge/eu/art141_triangle.md'],
  ['EU · Quick Fixes 2020',           'vat-knowledge/eu/quick_fixes_2020.md'],
  ['AT · Reihengeschäft',             'vat-knowledge/at/ustg_at_reihengeschaeft.md'],
  ['AT · Dreiecksgeschäft',           'vat-knowledge/at/ustg_at_dreieck.md'],
  ['AT · EPROHA-Buchungskreise',      'vat-knowledge/at/eproha-buchungskreise.md'],
  ['DE · § 3 Abs. 6a UStG',           'vat-knowledge/de/ustg_de_3_6a.md'],
  ['DE · UStAE Reihengeschäft',       'vat-knowledge/de/ustae_reihengeschaeft.md'],
  ['DE · EPDE-Buchungskreise',        'vat-knowledge/de/epde-buchungskreise.md'],
  ['NL · Wet OB Reihengeschäft',      'vat-knowledge/nl/wet_ob_nl_reihengeschaeft.md'],
  ['CH · Ort der Lieferung',          'vat-knowledge/ch/mwst_ch_ort_lieferung.md'],
  ['CH · Konsignationslager',         'vat-knowledge/ch/mwst_ch_konsignationslager.md'],
];

function build() {
  const head = [
    '# VAT-Wissensbasis für den M365-Copilot-Agenten',
    '',
    '> **AUTOMATISCH GENERIERT** von `scripts/gen-m365-knowledge.mjs` —',
    '> nicht direkt bearbeiten. Quelle: `vat-knowledge/` +',
    '> `copilot-m365/firmenkontext.md`. Neu bauen mit:',
    '> `node scripts/gen-m365-knowledge.mjs`.',
    '>',
    '> Diese Datei nach OneDrive/SharePoint hochladen und im M365-Agenten',
    '> als Wissensquelle verknüpfen (siehe `copilot-m365/README.md`).',
    '',
    '## Inhaltsverzeichnis',
    '',
    ...SECTIONS.map(([title], i) => `${i + 1}. ${title}`),
    '',
    '---',
    '',
  ].join('\n');

  const body = SECTIONS.map(([title, rel], i) => {
    const raw = readFileSync(join(ROOT, rel), 'utf8').trimEnd();
    return [
      `# ${i + 1}. ${title}`,
      `<!-- Quelle: ${rel} -->`,
      '',
      raw,
      '',
      '---',
      '',
    ].join('\n');
  }).join('\n');

  return head + body;
}

const content = build();

if (process.argv.includes('--check')) {
  let current = '';
  try { current = readFileSync(OUT, 'utf8'); } catch { /* fehlt → veraltet */ }
  if (current !== content) {
    console.error('✗ copilot-m365/wissensbasis.md ist veraltet — `node scripts/gen-m365-knowledge.mjs` ausführen.');
    process.exit(1);
  }
  console.log('✓ copilot-m365/wissensbasis.md ist aktuell.');
} else {
  writeFileSync(OUT, content);
  const kb = Math.round(Buffer.byteLength(content) / 1024);
  console.log(`✓ copilot-m365/wissensbasis.md geschrieben (${SECTIONS.length} Abschnitte, ${kb} KB).`);
}
