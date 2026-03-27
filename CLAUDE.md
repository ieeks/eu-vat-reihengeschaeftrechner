# CLAUDE.md — EU VAT Reihengeschäftsrechner

Developer guide für AI-Assistenten. **Zuerst lesen vor jeder Session.**

---

## Dateien

| Datei | Beschreibung |
|---|---|
| `Reihengeschaeftsrechner_22.html` | **Hauptdatei v4.2** (~12.800 Zeilen) |
| `CLAUDE.md` | Diese Datei |
| `README.md` | User-facing Übersicht |
| `RGR_CHANGELOG.md` | Änderungsprotokoll |
| `RGR_TODO.md` | Offene Punkte & Backlog |
| `index.html` | Einstiegspunkt für lokalen Server / Redirect |
| `package.json` | Start- und Check-Skripte |
| `scripts/serve.mjs` | Dependency-freier lokaler Static-Server |

## Entities

| Company | Sitz | UIDs |
|---|---|---|
| **EPDE** | DE | DE, SI, LV, EE, NL, BE, CZ, PL |
| **EPROHA** | AT | AT, DE, CH |

---

## Architektur

```
<script> BLOCK 1 ← Constants + Engine + Analysis
  VATEngine IIFE (NICHT modifizieren)
    detectStructureRisks() Section F: resting-buyer-no-uid
  buildKurzbeschreibung() ← PRIMARY OUTPUT (SAP+UID pro Lieferung)
  buildInvoiceSnapshot() ← gibt '' zurück
  buildDreiecks3Result() ← selectedUidOverride
  buildNormal3Result() ← _uidOverride für myCode
  buildDeliveryBox() ← Seller ruhend zeigt UID
  buildPerspektivwechsel() ← nur wenn expertMode
  analyzeInland() ← mit Warenfluss-Diagramm (movingIdx=-1)
  buildCHExportResult() ← EU→CH 3P: Diagramm + Kurzbeschreibung + Delivery-Boxen
  buildGBExportResult() ← EU→GB 3P: Diagramm + Kurzbeschreibung + Delivery-Boxen
  computeTaxCH() ← export/import/domestic-l1/domestic-l2-ch
  computeTaxGB() ← export/domestic-l1/domestic-l2-gb (NEU v4.2)
  analyzeLohn() ← sup===con → Inland-Sonderfall (v4.1)
  buildVergleichTab() ← ⚖ Vergleich-Tab (v4.1)

<script> BLOCK 2 ← Tests
<script> BLOCK 3 ← v4 UI Layer
  toggleDevMode() ← Dev-Overlay mit JS-Tooltip (v4.2)
```

## Output-Hierarchie

```
Desktop:                          Mobile (≤768px):
1. Reg-Warnings (.reg-warnings)   1. Reg-Warnings
2. Diagramm (offen, klappbar)     2. Diagramm (offen)
3. Kurzbeschreibung (offen)       3. Kurzbeschreibung (kein Titel)
4. Hints                          (alles andere hidden)
5. Details pro Lieferung (klappbar)
6. Perspektivwechsel (nur Expert)
```

## UID-Logik in Kurzbeschreibung
```
Override → gewinnt immer
Buyer bewegend → dest-UID
Seller bewegend → dep-UID
Ruhend → Lieferort-UID
Fallback → companyHome
```

## SAP-Badge Logik
```
badge-ig      → treatment ic-exempt / ic-acquisition
badge-export  → treatment export → A0 (AT) / G0 (DE)
badge-rc      → treatment rc
badge-resting → treatment domestic
```

## Header
```
Logo | EPDE/EPROHA | Expert-Toggle | BMF-Pill | [spacer] | Live | ⋯
⋯-Menü: Hell/Dunkel | Link teilen | PDF | 🏷 Dev Mode | Tests | Zurücksetzen
```

## Tabs: 5 (Expert-Modus)
📋 Ergebnis | 📝 Begründung & Recht | 📄 Rechnung & Pflichten | 📅 Meldepflichten | ⚖ Vergleich

## Dev-Overlay (v4.2)
```
toggleDevMode() → data-dev="true" auf <html>
#dev-tooltip → position:fixed im body, folgt mousemove
_devTipShow() → composedPath() + instanceof Element + parentElement-Fallback
Getaggte Komponenten: data-component="..."
  buildFlowDiagram, buildKurzbeschreibung, buildDeliveryBox,
  buildLegalRefs, buildPerspektivwechsel, buildMeldepflichten,
  buildVergleichTab, reg-warnings, resultContextBar,
  quickFix (Art. 36a)
```

## Drittland-Routing (3P)
```
hasCH + dep===CH + dest===CH + EPROHA → analyzeCHInland()
hasCH + dep===CH + dest!==CH          → analyzeCH()
hasCH + dest===CH + dep!==CH          → buildCHExportResult() ← Diagramm+Delivery-Boxen
hasGB + dep===GB + dest!==GB          → analyzeGBImport()
hasGB + dest===GB + dep!==GB          → buildGBExportResult() ← Diagramm+Delivery-Boxen
eng._depEqDest                        → analyzeInland()
```

## Linke Seite
Struktur → Warenkette → Transport → UID-Override → Context → Lohn → UID-Status (unten)

## Projekt-Rahmen
```bash
npm run dev
npm run check
```

- Einstieg lokal: `index.html`
- App-Quelle bleibt `Reihengeschaeftsrechner_22.html`
- Server-Logik nur in `scripts/serve.mjs`
- Ziel der Aufräumung: bessere Startbarkeit ohne Eingriff in die Kernlogik

---

## 🚫 NEVER TOUCH
- VATEngine IIFE
- analyze(), analyze2()

## Kritische Regeln
1. `#partyTopRow .party-btn` — nie global
2. AT: `Art.` nicht `§`
3. Tab-Merge: Legal→tab-begrundung, RPA→tab-invoice (append)
4. `themeBtn`/`langBtn` existieren nicht
5. `engRegHtml` → `.reg-warnings` für Mobile
6. `selectedUidOverride` durchreichen
7. Sprache immer DE
8. buildInvoiceSnapshot() gibt '' zurück
9. Alle 5 Files nach jeder Session updaten
10. badge-export für Ausfuhr (nicht badge-ig) → A0 statt AF

## Tests
```bash
cd /home/claude && node -e "
const {JSDOM}=require('jsdom');
const dom=new JSDOM(require('fs').readFileSync('work.html','utf8'),
  {runScripts:'dangerously',url:'http://localhost/'});
setTimeout(()=>{
  dom.window.eval('runOutputTests()');
  setTimeout(()=>console.log(dom.window.document.getElementById('testSummary')?.textContent),500);
},1000);"
```
