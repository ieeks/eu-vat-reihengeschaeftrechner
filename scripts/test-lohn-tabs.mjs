// Modus-5-Experten-Tabs (Begründung / Rechnung & Pflichten / Meldepflichten).
//
// Diese Tabs wurden früher von der 3-Parteien-Engine gefüttert und widersprachen dem
// Ergebnis-Tab (Reihengeschäfts-Prosa, „Keine ZM-Pflicht" trotz ig. Lieferung ab dem
// Veredelungsland, Musterrechnung ans falsche Land). Seit dem Umbau rendern sie aus
// computeLohn(). Dieser Lauf prüft für 12 Konstellationen, dass die drei Tabs zur
// gewählten Fallgestaltung passen — im Browser-DOM, nicht nur auf Datenebene.
//
// Läuft als zweiter Schritt von `npm test`.
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const html=readFileSync(join(root,'docs/index.html'),'utf8');
const appJs=readFileSync(join(root,'docs/assets/scripts/app.js'),'utf8');
const vc=new VirtualConsole(); vc.sendTo(console,{omitJSDOMErrors:false});
const dom=new JSDOM(html.replace(/<script\s+src=["'][^"']*app\.js[^"']*["'][^>]*><\/script>/i,`<script>${appJs}</script>`),
 {runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true,virtualConsole:vc});
const {window,window:{document:D}}=dom;
window.HTMLElement.prototype.scrollIntoView=function(){};
await new Promise(r=>setTimeout(r,1500));
const g=(id)=>(D.getElementById(id)?.textContent||'').replace(/\s+/g,' ').trim();
let fail=0;
async function run(label, co, sup, con, cus, rueck, home, direkt){
  window.eval(`currentCompany='${co}'; expertMode=true;`);
  window.setParties(5, D.getElementById('partyBtn5'));
  D.getElementById('lohnSup').value=sup; D.getElementById('lohnCon').value=con; D.getElementById('lohnCus').value=cus;
  window.eval(`lohnRueck=${rueck}; lohnHome=${home}; lohnDirekt=${direkt};`);
  window.onLohnChange();
  await new Promise(r=>setTimeout(r,150));
  const L=window.eval('_lohnLast');
  const T={b:g('tab-begrundung'),i:g('tab-invoice'),m:g('tab-melde')};
  const all=[T.b,T.i,T.m].join(' ');
  const errs=[];
  // 1. keine 3P-Formulierungen
  if (/ruhende Lieferung/i.test(all)) errs.push('3P-Text „ruhende Lieferung"');
  if (/handelt es sich um ein .{0,30}Reihengeschäft/i.test(all)) errs.push('als Reihengeschäft beschrieben');
  // 2. lit.-f-Aussage muss zur Auswahl passen
  if (!L.litF && /zurückgesendet|zurückgelangt|gelangt in den Ausgangsmitgliedstaat/i.test(T.b) && !/greift.{0,40}nicht/i.test(T.b)) errs.push('behauptet Rückkehr trotz „bleibt"');
  // 3. ZM konsistent mit der Logik
  const s3=L.steps.find(s=>s.key==='verkauf');
  const zmPflicht = (s3&&s3.kind==='ig-sale') || !!(L.verbringen&&L.verbringen.meldepflichtig);
  const zmKeine = /Keine ZM-Pflicht/.test(T.m);
  if (zmPflicht && zmKeine) errs.push('ZM: „keine Pflicht" obwohl ig. Lieferung/Verbringen');
  if (!zmPflicht && !zmKeine) errs.push('ZM: Pflicht behauptet, obwohl keine besteht');
  if (s3&&s3.kind==='ig-sale' && !new RegExp(`ZM .{0,6}${window.eval(`cn('${con}')`)}`).test(T.m.replace(/[🇦-🇿]/gu,''))) errs.push('ZM nicht im Abgangsland '+con);
  // 4. RC-Aussage konsistent
  const s2=L.steps.find(s=>s.key==='veredelung');
  if (s2.kind==='rc' && !/Steuerschuldnerschaft|Reverse Charge/i.test(T.b)) errs.push('RC fehlt in Prosa');
  if (s2.kind==='inland-service' && /geht die Steuerschuld.{0,40}über/i.test(T.b)) errs.push('RC behauptet trotz Inlandsleistung');
  // 5. Beleg-Tab: pro Schritt ein Beleg (außer separate)
  const docs=L.steps.filter(s=>s.kind!=='separate').length;
  if (!new RegExp(`S${docs}`).test(T.i)) errs.push(`Belegauswahl unvollständig (erwartet ${docs})`);
  if (errs.length) fail++;
  console.log(`${errs.length?'❌':'✅'} ${label.padEnd(50)}${errs.length?'  ← '+errs.join(' | '):''}`);
}
await run('EPROHA AT→DE→AT, bleibt, Verfügungsm. AT','EPROHA','AT','DE','AT','false','true','true');
await run('EPROHA AT→DE→AT, zurück, Verfügungsm. AT','EPROHA','AT','DE','AT','true','true','true');
await run('EPROHA AT→DE→AT, zurück, DAP (con)','EPROHA','AT','DE','AT','true','false','true');
await run('EPROHA AT→DE→AT, bleibt, DAP (con)','EPROHA','AT','DE','AT','false','false','true');
await run('EPDE   AT→DE→AT, bleibt (Converter=Heimat)','EPDE','AT','DE','AT','false','true','true');
await run('EPDE   AT→DE→AT, zurück (Converter=Heimat)','EPDE','AT','DE','AT','true','true','true');
await run('EPROHA FI→PL→DE, bleibt, direkt','EPROHA','FI','PL','DE','false','true','true');
await run('EPROHA FI→PL→DE, zurück, über mich','EPROHA','FI','PL','DE','true','true','false');
await run('EPROHA FI→PL→DE, bleibt, über mich','EPROHA','FI','PL','DE','false','true','false');
await run('EPDE   DE→DE→AT (sup=con=Heimat)','EPDE','DE','DE','AT','false','true','true');
await run('EPROHA DE→DE→AT (sup=con, Sitz AT)','EPROHA','DE','DE','AT','false','true','true');
await run('EPDE   FI→PL→PL, bleibt (Verkauf Inland PL)','EPDE','FI','PL','PL','false','true','true');
console.log(fail ? `\n❌ ${fail} von 12 Lohn-Tab-Fällen inkonsistent` : '\n✅ Alle 12 Lohn-Tab-Fälle konsistent (Begründung · Rechnung · Meldepflichten)');
process.exit(fail?1:0);
