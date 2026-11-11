// Eingangskennzeichen im Drittland-Import: Lieferantenrechnung und EUSt trennen.
// Regression für CH -> EPROHA -> AT (Transport A/B), einschließlich Einführerwechsel.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'docs/index.html'), 'utf8');
const app = readFileSync(join(root, 'docs/assets/scripts/app.js'), 'utf8');
const vc = new VirtualConsole();
const dom = new JSDOM(html.replace(
  /<script\s+src=["'][^"']*app\.js[^"']*["'][^>]*><\/script>/i,
  () => `<script>${app}</script>`
), {
  runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(window) { window.HTMLElement.prototype.scrollIntoView = function() {}; },
});
const { window } = dom;
await new Promise(resolve => setTimeout(resolve, 1500));
const text = el => (el?.textContent || '').replace(/\s+/g, ' ').trim();

function render({ company = 'EPROHA', dep = 'CH', dest = 'AT', transport = 'middle', importer = 'customer' } = {}) {
  window.eval(`(() => {
    const c = ${JSON.stringify({ company, dep, dest, transport, importer })};
    currentCompany = c.company; MY_VAT_IDS = COMPANIES[c.company].vatIds;
    currentMode = 3; mePosition = 2; dropShipDest = null; mode2CustUid = null;
    importerRole = c.importer; selectedTransport = c.transport; selectedUidOverride = null;
    const home = COMPANIES[c.company].home;
    for (const [id, value] of Object.entries({
      'cp-0': c.dep, 'cp-1': home, 'cp-2': c.dest,
      s1: c.dep, s2: home, s3: c.dest, s4: c.dest, dep: c.dep, dest: c.dest
    })) {
      let el = document.getElementById(id);
      if (!el) { el = document.createElement('select'); el.id = id; document.body.appendChild(el); }
      el.innerHTML = '<option selected value="' + value + '">' + value + '</option>';
    }
    analyze();
  })()`);
  const result = window.document.getElementById('resultContent');
  const l1 = result.querySelector('.delivery-box');
  return {
    result,
    l1,
    badge: text(l1?.querySelector('.badge-sap')),
    hint: text(result.querySelector('[data-component="importerToggle"]')),
  };
}

let count = 0;
try {
  for (const transport of ['supplier', 'middle']) {
    for (const importer of ['customer', 'self', 'supplier']) {
      const r = render({ transport, importer });
      const expected = importer === 'supplier' ? 'V2' : 'V0';
      assert.match(r.badge, new RegExp(`Eing:\\s*${expected}\\b`), `${transport}/${importer}: L1 ${r.badge}`);
      assert.match(r.hint, new RegExp(`Eingangsrechnung = ${expected}\\b`), `${transport}/${importer}: Einführer-Hinweis`);
      assert.doesNotMatch(text(r.l1), /Erwerb in Österreich|Eing:\s*VE\b/);
      if (importer === 'supplier') assert.match(text(r.l1.querySelector('.delivery-detail')), /20%/);
      else {
        assert.match(text(r.l1.querySelector('.delivery-detail')), /0%/);
        assert.doesNotMatch(r.hint, /Typ P0|aktuell nicht in SAP angelegt/);
      }
      count++;
    }
  }
  for (const dep of ['LI', 'GB', 'TR']) {
    const r = render({ dep, importer: 'self' });
    assert.match(r.hint, /Eingangsrechnung = V0\b/, `${dep}: Import-Hinweis`);
    if (dep === 'LI') assert.match(r.badge, /Eing:\s*V0\b/);
    count++;
  }
  for (const importer of ['customer', 'self', 'supplier']) {
    const r = render({ company: 'EPDE', dest: 'DE', importer });
    const expected = importer === 'supplier' ? 'VD' : 'P0';
    assert.match(r.badge, new RegExp(`Eing:\\s*${expected}\\b`), `EPDE/${importer}`);
    assert.match(r.hint, new RegExp(`Eingangsrechnung = ${expected}\\b`));
    count++;
  }
  // Kein unbekanntes DE-Eingangskennzeichen für EPROHA erfinden oder VE/VH verwenden.
  const foreign = render({ dest: 'DE', importer: 'self' });
  assert.doesNotMatch(foreign.badge, /\b(V0|VE|VH)\b/);
  assert.match(foreign.hint, /Eingangsrechnung = .*kein MWSKZ/);
  count++;
  // Der Fix darf die echten innergemeinschaftlichen Erwerbe nicht verändern.
  for (const c of [
    { company: 'EPROHA', dep: 'DE', dest: 'AT', expected: 'VE' },
    { company: 'EPDE', dep: 'AT', dest: 'DE', expected: 'VH' },
  ]) {
    const r = render({ ...c, transport: 'supplier' });
    assert.match(text(r.result), new RegExp(`Eing:\\s*${c.expected}\\b|Eingangsrechnung[^.]*\\b${c.expected}\\b|SAP Stkz\\. = ${c.expected}\\b`), `${c.company}: echter IG-Erwerb`);
    count++;
  }
  console.log(`OK: ${count} Import-/IG-Einkaufsfälle (Ergebnis + Einführer-Hinweis).`);
} finally {
  window.close();
}
