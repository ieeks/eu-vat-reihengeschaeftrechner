# CLAUDE.md — EU VAT Reihengeschäftsrechner

Developer guide für AI-Assistenten. **Zuerst lesen vor jeder Session.**

---

## Dateien

| Datei | Beschreibung |
|---|---|
| `docs/assets/scripts/app.js` | **Hauptdatei v4.3** (deploybare App-Logik) |
| `docs/assets/styles/app.css` | Haupt-Styles der deploybaren App (Light Theme v4.3) |
| `docs/assets/fonts/` | Self-hosted IBM Plex Sans + Mono woff2 (latin, Session 23) |
| `docs/index.html` | Deploybare Multi-File-App — **v2 (Redesign)** |
| `docs/v1/` | Eingefrorener v1-Stand (b1954f4) — Production-Fallback |
| `docs/v1/index.html` | v1 Entry Point (dunkles Theme, QC-Topbar) |
| `Reihengeschaeftsrechner_22.html` | Legacy-Snapshot der früheren Single-File-App |
| `CLAUDE.md` | Diese Datei |
| `README.md` | User-facing Übersicht |
| `RGR_CHANGELOG.md` | Änderungsprotokoll |
| `RGR_TODO.md` | Offene Punkte & Backlog |
| `rechtskonformitaet.md` | Rechtsabgleich + bewusste Abweichungen (konservative Auslegung) |
| `vat-knowledge/` | 16 Markdown-Dateien + Index — EU/AT/DE/CH Steuerrecht ↔ Code-Mapping |
| `vat-knowledge/CLAUDE-vat-knowledge.md` | Pflichtlektüre-Index vor VATEngine-Änderungen |
| `index.html` | Einstiegspunkt für lokalen Server / Redirect |
| `package.json` | Start- und Check-Skripte |
| `scripts/serve.mjs` | Dependency-freier lokaler Static-Server |
| `.github/workflows/pages.yml` | GitHub-Pages-Deployment |

## Design-Snapshots / Rollback

| Tag / Commit | Stand | Wiederherstellen |
|---|---|---|
| `v4.2-snapshot` · `b1954f4` | v4.2 vor Redesign (dunkles Theme, QC-Topbar fertig) | `git checkout v4.2-snapshot -- docs/` |

> Tag auf GitHub gepusht. Alternativ: `docs/v1/` im Repo ist ein eingefrorener Stand desselben Commits.

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
  toggleQuickCheck(btn) ← QC Header-Button Toggle; Exit via basisBtn aus #tabBar (v4.2 Session 21)

v4.3 Header/Nav (Session 22)
  setPartiesFromHeader(n, btn) ← Modus-Tab im Header → delegiert an setParties()
  syncHeaderModeTabs(n)        ← Header-Tabs mit aktuellem Modus synchron halten
  updateModeBadge(n)           ← Sidebar-Mode-Badge (Code + Titel + Beschreibung)
  switchView(view, btn)        ← View-Nav (standard/quickcheck/vergleich) → delegiert an switchTab()
  switchToDesign(version)      ← v1/v2 Toggle im ⋯-Menü; überträgt URL-Params
  renderUIDInline()            ← Eigene UIDs: buyerUID = selectedUidOverride ?? homeUID
```

## Aktuelle P0-Baustelle

- v4.3 Redesign live auf `manuel-app.dev` (Session 22–23) — Light Theme, Header-Tabs, 4P-Diamond
- v1/v2-Toggle im ⋯-Menü: `docs/index.html` = v2, `docs/v1/` = eingefrorener Production-Stand
- Fonts self-hosted: `docs/assets/fonts/` + `docs/v1/assets/fonts/` — kein Google Fonts (Session 23)
- PDF-Export via `exportPDF()` → `window.print()`, verbesserter `@media print` (Session 23)
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
badge-export  → treatment export
badge-rc      → treatment rc
badge-resting → treatment domestic
```
Export-Routing: `_sapEffectiveCountry` enthält 'export' in `uidTreatments` → SAP-Lookup über UID-Land

## SAP-Steuerkennzeichen (MWSKZ) — Vollständiges Mapping

Quelle: `SAP_TAX_MAP` in app.js (2026_EPCA_Tax_Account_determination_S4P.xlsx)

**EPROHA — AT-UID**

| Treatment | Out | In | Bedeutung |
|---|---|---|---|
| `ic-exempt` | **AF** | — | IG-Lieferung AT 0% (steuerfreie ig Ausgangslieferung) |
| `ic-acquisition` | — | **VE** | IG-Erwerb AT 20% (ESA/ESE) |
| `domestic` | **A2** | **V2** | Inlandslieferung AT 20% |
| `export` | **A0** | — | Ausfuhr ins Drittland 0% (CH, UK, CN …) |
| `dreiecks` | **AF** | — | Dreiecksgeschäft AT (Erwerbsteuer 0%) |
| `rc` | **RC** | **RC** | Reverse Charge AT (RCA/RCE) |
| `not-taxable` | **X0** | — | Nicht steuerbar AT |

**EPROHA — DE-UID**

| Treatment | Out | In | Bedeutung |
|---|---|---|---|
| `ic-exempt` | **DH** | — | IG-Lieferung DE 0% |
| `ic-acquisition` | — | **VH** | IG-Erwerb DE 19% |
| `domestic` | **DS** | **VD** | Inlandslieferung DE 19% |
| `export` | **D0** | — | Ausfuhr Drittland 0% (über DE-UID) |

**EPDE — DE-UID**

| Treatment | Out | In | Bedeutung |
|---|---|---|---|
| `ic-exempt` | **DH** | — | IG-Lieferung DE 0% |
| `ic-acquisition` | — | **VH** | IG-Erwerb DE 19% (ESA/ESE) |
| `domestic` | **DS** | **VD** | Inlandslieferung DE 19% |
| `export` | **G0** | — | Ausfuhrlieferung DE 0% (§ 6 UStG; auch DE→CH) |
| `rc` | — | **DC** | Reverse Charge DE 19% (§ 13b UStG) |

**EPDE — weitere UIDs**

| UID-Land | Treatment | Out | In |
|---|---|---|---|
| CZ | `ic-exempt` | **OB** | — |
| CZ | `ic-acquisition` | — | **UR** |
| SI | `ic-exempt` | **C1** | — |
| SI | `ic-acquisition` | — | **EC** |
| PL | `ic-exempt` | **T1** | — |
| PL | `ic-acquisition` | — | **W5** |
| BE | `domestic` | **BS** | **BI** |
| IT | `rc` | **IC** | **VI** |

> **Merkhilfe:** AF = ig-Lieferung (EU, EPROHA-AT) · A0 = Ausfuhr Drittland (EPROHA-AT) · DH = ig-Lieferung (DE-UID) · G0 = Ausfuhr Drittland (EPDE-DE)

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
10. badge-export für Ausfuhr (nicht badge-ig) → AF = IG-Lieferung EU / A0 = Ausfuhr Drittland (EPROHA-AT) / G0 = Ausfuhr Drittland (EPDE-DE)
11. Decision Flow nur aus bestehendem Engine-Output ableiten, keine neue Steuerlogik erfinden
12. Neue Änderungen primär in `docs/` umsetzen; Legacy-Single-File nicht wieder zur Hauptquelle machen
13. Hosting-Dokumentation auf tatsächlichen GitHub-Pages-Stand halten
14. DE-RC-Logik liegt in `computeTax()` (Rendering-Layer), nicht in `_checkRCBlock()` (VATEngine). Engine hat keinen DE-Branch. § 13b UStG wird im Rendering geprüft.

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
