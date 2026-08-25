// ─────────────────────────────────────────────────────────────────────────────
//  test-matrix.mjs — Abgleich der SAP-Findungsmatrix „Plants Abroad" (V1)
//  gegen den Rechner. Jede Zeile der Matrix wird als Fall durch analyze()
//  gefahren; verglichen werden Ausgangs-Kennzeichen (tax code sales) und
//  Eingangs-Kennzeichen (tax code Miro).
//
//  Quelle der Sollwerte: vat-knowledge/plants_abroad/Matrix_erweitert_V1.xlsx
//  Aufruf: node scripts/test-matrix.mjs [--verbose]
// ─────────────────────────────────────────────────────────────────────────────
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html  = readFileSync(join(root,'docs/index.html'),'utf8');
const appJs = readFileSync(join(root,'docs/assets/scripts/app.js'),'utf8');
const inl = html.replace(/<script\s+src=["'][^"']*app\.js[^"']*["'][^>]*><\/script>/i, `<script>${appJs}</script>`);
const vc = new VirtualConsole(); vc.sendTo(console,{omitJSDOMErrors:true});
const dom = new JSDOM(inl,{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true,virtualConsole:vc});
const { window } = dom;
await new Promise(r=>setTimeout(r,1500));
window.Element.prototype.scrollIntoView = function(){};

// ── Zeilen der Matrix ────────────────────────────────────────────────────────
// [Zeile, Fall, Gesellschaft, Lieferant, WE/Kunde, dep, dest, Transport, UID, sales, miro]
const STRECKE = [
 [17,'Strecke DE→PL','EPDE','DE','PL','DE','PL','supplier','PL','A4','W5'],
 [18,'Strecke DE→IT (SI-UID)','EPDE','DE','IT','DE','IT','supplier','SI','C1','EC'],
 [19,'EXW/FCA DE→IT','EPDE','DE','IT','DE','IT','middle','DE','DH','VD'],
 [20,'Strecke DE→CZ','EPDE','DE','CZ','DE','CZ','supplier','CZ','AE','UR'],
 [21,'Strecke DE→SI','EPDE','DE','SI','DE','SI','supplier','SI','CB','EC'],
 [22,'Strecke SE→SI','EPDE','SE','SI','SE','SI','supplier','SI','CB','EC'],
 [23,'Strecke DE→BE','EPDE','DE','BE','DE','BE','supplier','BE','BS','BP'],
 [24,'Strecke FR→NL','EPDE','FR','NL','FR','NL','supplier','NL','NC','NP'],
 [25,'Strecke DE→LV','EPDE','DE','LV','DE','LV','supplier','LV','LS','LP'],
 [26,'Strecke PL→EE','EPDE','PL','EE','PL','EE','supplier','EE','ES','EP'],
 [27,'Dreieck SI→HU','EPDE','SI','HU','SI','HU','supplier','DE','DH','VH'],
 [28,'Dreieck IT→FR','EPDE','IT','FR','IT','FR','supplier','DE','DH','VH'],
 [29,'Dreieck PL→ES','EPDE','PL','ES','PL','ES','supplier','DE','DH','VH'],
 [30,'Dreieck FR→AT','EPDE','FR','AT','FR','AT','supplier','DE','DH','VH'],
 [31,'Dreieck CZ→RO','EPDE','CZ','RO','CZ','RO','supplier','DE','DH','VH'],
 [32,'EXW DE→SI','EPDE','DE','SI','DE','SI','middle','DE','DH','VD'],
 [33,'EXW SI→SI','EPDE','SI','SI','SI','SI','middle','SI','CB','SI'],
 [34,'EXW PL→IT','EPDE','PL','IT','PL','IT','middle','PL','T1','B7'],
 [35,'EXW CZ→DE','EPDE','CZ','DE','CZ','DE','middle','CZ','OB','VC'],
 [36,'EXW BE→BE','EPDE','BE','BE','BE','BE','middle','BE','BS','BI'],
 [37,'EXW IT→SI (SI-UID)','EPDE','IT','SI','IT','SI','middle','SI','CB','EC'],
 [38,'EXW IT→SI (Kunde holt)','EPDE','IT','SI','IT','SI','customer','DE','KEIN','VI'],
 [39,'EXW BE→FR','EPDE','BE','FR','BE','FR','middle','BE','KEIN','BI'],
 [40,'EXW NL→DE','EPDE','NL','DE','NL','DE','middle','NL','KEIN','NP'],
 [41,'DDP DE→GB','EPDE','DE','GB','DE','GB','middle','DE','KEIN','KEIN','self'],
 [42,'DAP DE→GB','EPDE','DE','GB','DE','GB','supplier','DE','G0','VD','customer'],
 [43,'EXW SI→IT','EPDE','SI','IT','SI','IT','middle','SI','C1','SI'],
 [44,'EXW SI→DE','EPDE','SI','DE','SI','DE','middle','SI','C1','SI'],
 [53,'Strecke DE→AT','EPROHA','DE','AT','DE','AT','supplier','AT','A2','VE'],
 [54,'Strecke DE/FR→DE','EPROHA','FR','DE','FR','DE','supplier','DE','DS','VD'],
 [55,'Strecke FR→DE','EPROHA','FR','DE','FR','DE','supplier','DE','DS','VH'],
 [56,'Dreieck DE→IT','EPROHA','DE','IT','DE','IT','supplier','AT','AF','VE'],
 [57,'Strecke IT→IT','EPROHA','IT','IT','IT','IT','supplier','AT','IC','VT'],
 [58,'Dreieck SI→HU','EPROHA','SI','HU','SI','HU','supplier','AT','AF','VE'],
 [59,'DAP/EXW DE→CH','EPROHA','DE','CH','DE','CH','supplier','DE','D0','P0','customer'],
 [60,'DAP/EXW AT→LI','EPROHA','AT','LI','AT','LI','supplier','AT','A0','V0','customer'],
 [61,'EXW DE→DE','EPROHA','DE','DE','DE','DE','middle','DE','DS','VD'],
];
// [Zeile, Fall, dest(Kunde), Warenempfänger, Kunden-UID-Land, Incoterm, sales]
const MODE2 = [
 [45,'Lager AT → WE AT','AT',null,null,'dap','A2'],
 [46,'Lager AT → WE DE','DE',null,null,'dap','AF'],
 [47,'Lager AT → WE IT','IT',null,null,'dap','AF'],
 [48,'Lager AT → CH (DAP/EXW)','CH',null,null,'dap','A0'],
 [49,'Lager AT → LI (DAP/EXW)','LI',null,null,'dap','A0'],
 [50,'Lager AT → CH (DDP)','CH',null,null,'ddp','B5'],
 [51,'Lager AT → LI (DDP)','LI',null,null,'ddp','B5'],
 [52,'Lager AT → GB (DAP/EXW)','GB',null,null,'dap','A0'],
 [62,'Drop-Ship Kunde AT (fremde UID) → WE DE','AT','DE',null,'dap','AF'],
 [63,'Drop-Ship Kunde AT (keine UID) → WE DE','AT','DE',null,'dap','A2'],
 [64,'Drop-Ship Kunde DE → WE IT','DE','IT',null,'dap','AF'],
 [65,'Drop-Ship Kunde CH → WE SK (SK-UID)','CH','SK','SK','dap','AF'],
];
// [Zeile, Fall, Gesellschaft, UID-Land (Werk), WE, sales]
const LAGER = [
 [3,'Werk DE → WE DE','EPDE','DE','DE','DS'],
 [4,'Werk DE → WE FR','EPDE','DE','FR','DH'],
 [5,'Werk DE → WE CH','EPDE','DE','CH','G0'],
 [6,'Werk DE → WE LI','EPDE','DE','LI','G0'],
 [7,'Werk DE → WE GB','EPDE','DE','GB','G0'],
 [8,'Werk PL → WE PL','EPDE','PL','PL','A4'],
 [9,'Werk PL → WE IT','EPDE','PL','IT','T1'],
 [10,'Werk PL → WE DE','EPDE','PL','DE','T1'],
 [11,'Werk PL → WE CZ','EPDE','PL','CZ','T1'],
 [12,'Werk PL → WE GB','EPDE','PL','GB','KEIN'],
 [13,'Werk PL → WE CH','EPDE','PL','CH','KEIN'],
 [14,'Werk CZ → WE CZ','EPDE','CZ','CZ','AE'],
 [15,'Werk CZ → WE SK','EPDE','CZ','SK','OB'],
 [16,'Werk CZ → WE DE','EPDE','CZ','DE','OB'],
];

// ── Auswertung ───────────────────────────────────────────────────────────────
function parseCodes(t){
  let out=null, inp=null;
  const di=t.indexOf('Details pro Lieferung');
  if(di>=0){
    const blocks=t.slice(di).split(/(?=L\d:\s)/);
    for(const b of blocks){
      const m=/^L(\d):/.exec(b); if(!m) continue;
      const a=/Ausg:\s*([A-Z0-9]+)/.exec(b), e=/Eing:\s*([A-Z0-9]+)/.exec(b);
      const missing=/Stkz\.\s*=\s*⚠\s*fehlt|kein SAP-Stkz|Buchung in SAP nicht möglich/.test(b.slice(0,600));
      if(m[1]==='2'){ if(a) out=a[1]; else if(missing) out='KEIN'; }
      if(m[1]==='1'){ if(e) inp=e[1]; else if(missing) inp='KEIN'; }
    }
  }
  const e2=/SAP-Stkz\. Eingangsrechnung[^=]*=\s*([^\s🧾]+)/.exec(t);
  const a2=/SAP-Stkz\. Ausgangsrechnung[^=]*=\s*([^\s🧾]+)/.exec(t);
  if(a2&&out===null) out = a2[1]==='⚠' ? 'KEIN' : a2[1];
  if(e2&&inp===null) inp = e2[1]==='⚠' ? 'KEIN' : e2[1];
  if(out===null||inp===null){
    const all=[...t.matchAll(/SAP Stkz\. = ([A-Z0-9]+)/g)].map(m=>m[1]);
    if(all.length>=2){ if(inp===null) inp=all[0]; if(out===null) out=all[1]; }
    else if(all.length===1&&out===null) out=all[0];
  }
  return {out,inp};
}
function notes(t){
  const f=[];
  if(/Dreiecksgeschäft blockiert|Dreiecksgeschäft ausgeschlossen|Vereinfachung blockiert/.test(t)) f.push('Dreieck gesperrt');
  const reg=/Registrierungspflicht in ([A-ZÄÖÜ][a-zäöüß]+)/.exec(t); if(reg) f.push('Registrierung '+reg[1]);
  else if(/Registrierung erforderlich|dortige Registrierung/.test(t)) f.push('Registrierung nötig');
  return f;
}
function runStrecke(comp,sup,cus,dep,dest,tr,uid,importer='customer'){
  window.eval(`
    currentCompany=${JSON.stringify(comp)}; MY_VAT_IDS=COMPANIES[${JSON.stringify(comp)}].vatIds;
    currentMode=3; mePosition=2; dropShipDest=null; mode2CustUid=null;
    importerRole=${JSON.stringify(importer)};
    selectedTransport=${JSON.stringify(tr)}; selectedUidOverride=${uid?JSON.stringify(uid):'null'};
    (function(){const home=COMPANIES[currentCompany].home;
     const setV=(id,val)=>{let el=document.getElementById(id); if(!el){el=document.createElement('select');el.id=id;el.style.display='none';document.body.appendChild(el);} el.innerHTML='<option value="'+val+'" selected>'+val+'</option>';};
     setV('cp-0',${JSON.stringify(sup)}); setV('cp-1',home); setV('cp-2',${JSON.stringify(cus)});
     setV('s1',${JSON.stringify(sup)}); setV('s2',home); setV('s3',${JSON.stringify(cus)}); setV('s4',${JSON.stringify(cus)});
     setV('dep',${JSON.stringify(dep)}); setV('dest',${JSON.stringify(dest)});})();
    analyze();`);
  const t=(window.document.getElementById('resultContent')?.textContent||'').replace(/\s+/g,' ');
  return {...parseCodes(t), notes:notes(t)};
}
function runMode2(dest,drop,custUid,inco){
  window.eval(`
    currentCompany='EPROHA'; MY_VAT_IDS=COMPANIES['EPROHA'].vatIds;
    currentMode=2; selectedTransport='supplier'; selectedUidOverride=null; importerRole='customer';
    dropShipDest=${drop?JSON.stringify(drop):'null'}; mode2CustUid=${custUid?JSON.stringify(custUid):'null'};
    mode2Incoterm=${JSON.stringify(inco)};
    (function(){const setV=(id,val)=>{let el=document.getElementById(id); if(!el){el=document.createElement('select');el.id=id;el.style.display='none';document.body.appendChild(el);} el.innerHTML='<option value="'+val+'" selected>'+val+'</option>';};
     setV('cp-1',${JSON.stringify(dest)}); setV('dest',${JSON.stringify(dest)}); setV('dep','AT');})();
    analyze();`);
  const t=(window.document.getElementById('resultContent')?.textContent||'').replace(/\s+/g,' ');
  const a=/Ausg:\s*([A-Z0-9]+)/.exec(t) || /SAP Stkz\. = ([A-Z0-9]+)/.exec(t)
        || /\b(A0|B5|AF|A2|D0|G0|X0)\b/.exec(t);
  return {out:a?a[1]:null, notes:notes(t)};
}
function runLager(comp,uidLand,dest){
  return window.eval(`(function(){
    currentCompany=${JSON.stringify(comp)}; MY_VAT_IDS=COMPANIES[${JSON.stringify(comp)}].vatIds;
    var tr = ${JSON.stringify(dest)}===${JSON.stringify(uidLand)} ? 'domestic' : (isNonEU(${JSON.stringify(dest)}) ? 'export' : 'ic-exempt');
    // Lieferort eines Lagerauftrags = Werksland (= UID-Land), nicht das Empfängerland
    return getSapCode(${JSON.stringify(comp)}, ${JSON.stringify(uidLand)}, tr, 'seller', ${JSON.stringify(uidLand)}) || 'KEIN';
  })()`);
}

const pad=(s,n)=>String(s??'—').padEnd(n).slice(0,n);
const TR={supplier:'Lieferant',middle:'wir (Zwischenhändler)',customer:'Kunde'};
let full=0, partial=0, diff=0; const findings=[];

console.log('\n═══ A · Streckengeschäfte (Modus 3, volle Analyse) ═══\n');
console.log(pad('Zl',3)+pad('Fall',26)+pad('UID',4)+pad('Matrix S/M',12)+pad('Rechner S/M',12)+pad('',4)+'Hinweise');
console.log('─'.repeat(122));
for(const [row,desc,comp,sup,cus,dep,dest,tr,uid,mS,mM,imp] of STRECKE){
  const r=runStrecke(comp,sup,cus,dep,dest,tr,uid,imp||'customer');
  const okS=(r.out===mS)||(mS==='KEIN'&&(r.out===null||r.out==='KEIN'));
  const okM=r.inp===mM;
  let note=r.notes.join('; ');
  if(!(okS&&okM)){
    for(const alt of ['supplier','middle','customer']){
      if(alt===tr) continue;
      const r2=runStrecke(comp,sup,cus,dep,dest,alt,uid,imp||'customer');
      if(r2.out===mS&&r2.inp===mM){ note=`Matrix-Codes nur wenn ${TR[alt]} transportiert`+(note?' · '+note:''); break; }
    }
    findings.push(`Zeile ${row} (${desc}): Matrix ${mS}/${mM} · Rechner ${r.out??'—'}/${r.inp??'—'}${note?' — '+note:''}`);
  }
  if(okS&&okM) full++; else if(okS||okM) partial++; else diff++;
  console.log(pad(row,3)+pad(desc,26)+pad(uid,4)+pad(mS+'/'+mM,12)+pad((r.out??'—')+'/'+(r.inp??'—'),12)+pad(okS&&okM?'✓':(okS||okM?'~':'✗'),4)+note);
}

console.log('\n═══ B · Lager AT + Drop-Shipment EPROHA (Modus 2) ═══\n');
console.log(pad('Zl',3)+pad('Fall',40)+pad('Matrix',8)+pad('Rechner',9)+pad('',4)+'Hinweise');
console.log('─'.repeat(122));
for(const [row,desc,dest,drop,cu,inco,mS] of MODE2){
  const r=runMode2(dest,drop,cu,inco);
  if(row===63){ console.log(pad(row,3)+pad(desc,40)+pad(mS,8)+pad(r.out??'—',9)+pad('n/a',4)
    +'Rechner kennt keinen Schalter „Kunde legt keine fremde UID vor\" — zeigt AF + Warnung „sonst 20% AT\"'); continue; }
  const ok=r.out===mS; if(ok) full++; else { diff++; findings.push(`Zeile ${row} (${desc}): Matrix ${mS} · Rechner ${r.out??'—'}`); }
  console.log(pad(row,3)+pad(desc,40)+pad(mS,8)+pad(r.out??'—',9)+pad(ok?'✓':'✗',4)+r.notes.join('; '));
}

console.log('\n═══ C · Lagerauftrag ab Werk (SAP_TAX_MAP-Abgleich) ═══\n');
console.log(pad('Zl',3)+pad('Fall',26)+pad('UID',4)+pad('Matrix',8)+pad('Rechner',9)+'');
console.log('─'.repeat(122));
for(const [row,desc,comp,uidLand,dest,mS] of LAGER){
  const got=runLager(comp,uidLand,dest);
  const ok=got===mS; if(ok) full++; else { diff++; findings.push(`Zeile ${row} (${desc}): Matrix ${mS} · Rechner ${got}`); }
  console.log(pad(row,3)+pad(desc,26)+pad(uidLand,4)+pad(mS,8)+pad(got,9)+(ok?'✓':'✗'));
}

console.log('\n═══ D · Transport-Variante für die Drittland-Strecken (Zeilen 41/42/59/60) ═══\n');
for(const [row,comp,sup,cus,dep,dest,uid] of [[41,'EPDE','DE','GB','DE','GB','DE'],[42,'EPDE','DE','GB','DE','GB','DE'],
                                              [59,'EPROHA','DE','CH','DE','CH','DE'],[60,'EPROHA','AT','LI','AT','LI','AT']]){
  const a=runStrecke(comp,sup,cus,dep,dest,'supplier',uid,'customer');
  const b=runStrecke(comp,sup,cus,dep,dest,'middle',uid,'customer');
  console.log(pad('Zl '+row,7)+' Lieferant transportiert: '+pad((a.out??'—')+'/'+(a.inp??'—'),10)
    +' · wir transportieren: '+pad((b.out??'—')+'/'+(b.inp??'—'),10));
}

const total=STRECKE.length+MODE2.length+LAGER.length;
console.log('\n'+'═'.repeat(122));
console.log(`Ergebnis: ${full} von ${total} Zeilen deckungsgleich · ${partial} teilweise · ${diff} abweichend`);
if(findings.length){ console.log('\nAbweichungen:'); findings.forEach(f=>console.log('  • '+f)); }
process.exit(0);
