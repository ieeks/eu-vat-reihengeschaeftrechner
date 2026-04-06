# CLAUDE.md — EU VAT Reihengeschäftsrechner

Developer guide für AI-Assistenten. **Zuerst lesen vor jeder Session.**

---

## Dateien

| Datei | Beschreibung |
|---|---|
| `docs/assets/scripts/app.js` | **Hauptdatei v4.2** (deploybare App-Logik) |
| `docs/assets/styles/app.css` | Haupt-Styles der deploybaren App |
| `docs/index.html` | Deploybare Multi-File-App |
| `Reihengeschaeftsrechner_22.html` | Legacy-Snapshot der früheren Single-File-App |
| `CLAUDE.md` | Diese Datei |
| `README.md` | User-facing Übersicht |
| `RGR_CHANGELOG.md` | Änderungsprotokoll |
| `RGR_TODO.md` | Offene Punkte & Backlog |
| `abgleich.md` | Rechtsabgleich Tool vs. EU MwStSystRL / Rechtsprechung |
| `vat-knowledge/` | 16 Markdown-Dateien + Index — EU/AT/DE/CH Steuerrecht ↔ Code-Mapping |
| `vat-knowledge/CLAUDE-vat-knowledge.md` | Pflichtlektüre-Index vor VATEngine-Änderungen |
| `index.html` | Einstiegspunkt für lokalen Server / Redirect |
| `package.json` | Start- und Check-Skripte |
| `scripts/serve.mjs` | Dependency-freier lokaler Static-Server |
| `.github/workflows/pages.yml` | GitHub-Pages-Deployment |

## Entities

| Company | Sitz | UIDs |
|---|---|---|
| **EPDE** | DE | DE, SI, LV, EE, NL, BE, CZ, PL |
| **EPROHA** | AT | AT, DE, CH |

---

## Architektur

```
docs/assets/scripts/app.js
  Constants + Engine + Analysis
  VATEngine IIFE (NICHT modifizieren)
    detectStructureRisks() Section F: resting-buyer-no-uid
  buildTrafficStatus() ← Top-Status aus Risiko-/Dreiecksstatus
  buildKurzbeschreibung() ← PRIMARY OUTPUT als Executive Summary + Decision Flow + SAP/UID-Hinweise
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
  analyze2() ← Mode 2 EPROHA; enthält Drop-Shipment-Branch (dest=AT + dropShipDest≠AT)
  buildVergleichTab() ← ⚖ Vergleich-Tab (v4.1)
  simplifyBasisOutput() ← sekundäre Hints in Desktop-Panel bündeln
  setDropShip(country) / clearDropShip() ← Drop-Shipment State für Mode 2

Reihengeschaeftsrechner_22.html
  Legacy-Referenz, nicht wieder zur Hauptquelle machen

Tests
v4 UI Layer
  toggleDevMode() ← Dev-Overlay mit JS-Tooltip (v4.2)
```

## Aktuelle P0-Baustelle

- `buildVergleichTab()` ist in Session 17 fachlich harmonisiert (statusCell/recommendationCell/reasonCell/art41Cell + dreiecksOpportunity pro Szenario)
- `buildTrafficStatus` RED-Branch und `analyzeInland` regBanner zeigen jetzt konkrete Risiken mit Land + Steuersatz (Session 18)
- Offen: Finale Browserabnahme der `docs/`-App (Release v4.2)
- Änderungen am Vergleich nur minimal und mit echten Referenzfällen prüfen; keine neue Heuristik einführen, die vom Hauptstatus abweicht

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

## UI-State Helper
```
getState()            → liest UI-Status gesammelt
setState(patch)       → minimale, kompatible Zustandsupdates
getCanonicalTransport() → normalisiert A/B/C/D ↔ supplier/middle/customer
getTransportLetter()  → UI-Brücke für Transport-Buttons / Labels
```

- Keine ad-hoc Transport-Normalisierung mehr in `renderResult()`
- `selectedTransport` nur über UI-Helper konsistent halten
- Keine neue Tax-Logik in die Helper legen

## Decision Flow
```
0. Top-Status / Dreiecksstatus
0.5 Executive Summary
1. Transportzuordnung
2. Bewegte Lieferung
3. Steuerliche Behandlung
4. Restliche Lieferung
```

- Stil: kurze steuerliche Begründung, kein Debug-Output
- Rechtsgrundlagen nur subtil als Chips / Referenzen
- Bei fehlenden Daten defensiv rendern, nie hart abbrechen
- Dreiecks-Chance nur aus bestehender Engine-/Risiko-Logik ableiten, kein manueller Status-Toggle
- Sekundäre Hints auf Desktop nachrangig in `Weitere Hinweise` bündeln

## SAP-Badge Logik
```
badge-ig      → treatment ic-exempt / ic-acquisition
badge-export  → treatment export → A0 (EPROHA AT-UID) / D0 (EPROHA DE-UID) / G0 (EPDE DE→CH)
badge-rc      → treatment rc
badge-resting → treatment domestic
```
Export-Routing: `_sapEffectiveCountry` enthält 'export' in `uidTreatments` → SAP-Lookup über UID-Land

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
  Output: buildFlowDiagram, buildKurzbeschreibung, buildDeliveryBox,
          buildLegalRefs, buildPerspektivwechsel, buildMeldepflichten,
          buildVergleichTab, reg-warnings, resultContextBar, quickFix (Art. 36a)
  Input:  input.Structur, input.Warenkette, input.Transport, input.UidOverride,
          input.AnalyseOptionen, input.Lohnveredelung, input.UidStatus
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
npm run check:pages
```

- Einstieg lokal: `index.html`
- Deploybare App liegt unter `docs/`
- `Reihengeschaeftsrechner_22.html` nur noch als Legacy-Snapshot behalten
- Server-Logik nur in `scripts/serve.mjs`
- Ziel: statische Multi-File-App ohne Framework, per GitHub Pages deploybar
- **Cache-Busting:** `index.html` enthält `?v=dev` als Platzhalter — GitHub Actions ersetzt beim Deploy automatisch mit kurzem Git-Hash

---

## 🚫 NEVER TOUCH
- VATEngine IIFE
- analyze()
- analyze2() Kernpfade — neue Branches (z.B. Drop-Shipment) dürfen ergänzt werden, bestehende Pfade nicht anfassen

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
11. Decision Flow nur aus bestehendem Engine-Output ableiten, keine neue Steuerlogik erfinden
12. Neue Änderungen primär in `docs/` umsetzen; Legacy-Single-File nicht wieder zur Hauptquelle machen
13. Hosting-Dokumentation auf tatsächlichen GitHub-Pages-Stand halten

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
