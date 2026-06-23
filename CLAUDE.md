# CLAUDE.md — EU VAT Reihengeschäftsrechner

Developer guide für AI-Assistenten. **Zuerst lesen vor jeder Session.**

---

## ⚠️ VOR jeder Änderung — Git-Stand abgleichen (Pflicht)

Der lokale Checkout ist **oft viele Commits hinter `origin/main`**, weil die meiste
Entwicklung über Cloud-`claude/*`-Branches läuft, die in main mergen, während lokal
ein alter Feature-Branch liegt. (Am 19.06.2026 war lokal 136 Commits hinter main →
ein kompletter Patch musste neu gebaut werden.)

**Immer zuerst:**
```bash
git fetch origin
git rev-list --count origin/main..HEAD   # lokale Commits VOR main
git rev-list --count HEAD..origin/main   # main VOR lokal  → wenn > 0: lokal ist veraltet!
```
Ist `HEAD..origin/main > 0`, **erst lokal auf den Git-Stand bringen**, bevor du etwas
änderst — nicht auf veraltetem Code weiterarbeiten:
```bash
git checkout -b <neuer-branch> origin/main   # frisch von main branchen (empfohlen)
```
Danach prüfen, ob das geplante Feature nicht längst auf main existiert.

> **Deploy-Hinweis:** Jeder lokale Commit deployt via `hooks/post-commit` →
> `sync-repos.sh` **sofort live** (rsync `docs/` → Repo `~/Developer/ieeks.github.io`).
> Es gibt kein „Commit ohne Deploy". Schlägt der Deploy-Push fehl, im Deploy-Repo
> `git reset --hard origin/main` (sonst wird veralteter `docs/`-Stand ausgeliefert).

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
| `vat-knowledge/` | 17 Markdown-Dateien + Index — EU/AT/DE/CH/NL Steuerrecht ↔ Code-Mapping |
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
  buildTrafficStatus() ← Top-Status aus Risiko-/Dreiecksstatus (Guard: isNonEU(dep|dest) → '' , Drittland übernimmt buildDrittlandStatus)
  buildDrittlandStatus() ← Drittland-Status-Ampel (CH/GB/TR/RS/BA/RU): rot „Problem vorhanden" nur bei echtem Registrierungsproblem, sonst grün. Status aus importerRole + myVat (Helper drittlandRegCountry), KEINE neue Steuerlogik. Prepend in analyzeCH/analyzeGBImport/analyzeThirdImport/buildCHExportResult/buildGBExportResult/buildThirdExportResult; Summary-Karte via showRegistrationWarn synchron
  buildFlowDiagram() ← Diagramm-Router: 3P→buildTriangleSVG · 4P Dreieck→buildTriangleSVG4 · 4P Normal→buildChainSVG4 · 2P/Mode2→horizontaler Fallback
  buildChainSVG4() ← 4P Normalfall (ohne Dreieck) im Referenz-Stil B021j: Kette A→B→C→D + Warenachse A→D mit Transport-Veranlasser; Behandlung pro Strecke (bewegt IG/Ausfuhr 0%, ruhend Regelsatz Lieferort), KEINE Länder-Sätze in Boxen
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
  analyze2() ← Mode 2 EPROHA; Flag euGoodsRecipient (dropShipDest gesetzt, EU, ≠Kunde) entscheidet Ausfuhr vs. ig. Reihengeschäft. Drop-Shipment-Branches: (a) dest=AT + dropShipDest≠AT; (b) EU-Kunde dest≠AT + dropShipDest≠dest → Reihengeschäft/Dreiecksgeschäft (EPROHA=erster Lieferant); (c) Drittland-Kunde (CH/GB) + EU-Warenempfänger (Sub-Branch bIsNonEU) → 4 Fälle je nach vom Kunden vorgelegter EU-UID (State mode2CustUid, Picker im Drop-Shipment-Panel): keine→20% AT (A2) · Abgangsland-UID(AT)→20% AT · Bestimmungsland-UID(cCode)→ig. Lieferung AF 0% + ig.Erwerb/Inlandslieferung im Bestimmungsland (kein Dreieck) · Dritt-MS-UID→Dreiecksgeschäft Art.141. isTriangle=triByThirdUid (custUid≠AT, ≠cCode, EU). Drittland-Export-Branch (dest=CH/GB Sonderpfad bzw. isNonEU(dest) generisch TR/RS/BA/RU → AT-Ausfuhr A0 + _thirdCountryNote + _importerToggle) greift nur bei !euGoodsRecipient
  buildVergleichTab() ← ⚖ Vergleich-Tab (v4.1)
  simplifyBasisOutput() ← sekundäre Hints in Desktop-Panel bündeln
  setDropShip(country) / clearDropShip() ← Drop-Shipment State für Mode 2
  setMode2CustUid(code) ← Mode 2 Drittland-Kunde: Land der vom Kunden vorgelegten EU-UID (State mode2CustUid; '' = keine)

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
| `ic-exempt` | **AF** | **AF** | IG-Lieferung AT 0% — OUT+IN gleich, Netto 0 |
| `ic-acquisition` | **VE** | **VE** | IG-Erwerb AT 20% (ESA/ESE) — OUT+IN gleich, Netto 0 |
| `domestic` | **A2** | **V2** | Inlandslieferung AT 20% |
| `export` | **A0** | — | Ausfuhr ins Drittland 0% (CH, UK, CN …) |
| `dreiecks` | **AF** | — | Dreiecksgeschäft AT (Erwerbsteuer 0%) |
| `rc` | **RC** | **RC** | Reverse Charge AT (RCA/RCE) |
| `not-taxable` | **X0** | — | Nicht steuerbar AT |

**EPROHA — DE-UID**

| Treatment | Out | In | Bedeutung |
|---|---|---|---|
| `ic-exempt` | **DH** | **DH** | IG-Lieferung DE 0% — OUT+IN gleich, Netto 0 |
| `ic-acquisition` | **VH** | **VH** | IG-Erwerb DE 19% (ESA/ESE) — OUT+IN gleich, Netto 0 |
| `domestic` | **DS** | **VD** | Inlandslieferung DE 19% |
| `export` | **D0** | — | Ausfuhr Drittland 0% (über DE-UID) |

**EPDE — DE-UID**

| Treatment | Out | In | Bedeutung |
|---|---|---|---|
| `ic-exempt` | **DH** | **DH** | IG-Lieferung DE 0% — OUT+IN gleich, Netto 0 |
| `ic-acquisition` | **VH** | **VH** | IG-Erwerb DE 19% (ESA/ESE) — OUT+IN gleich, Netto 0 |
| `domestic` | **DS** | **VD** | Inlandslieferung DE 19% |
| `export` | **G0** | — | Ausfuhrlieferung DE 0% (§ 6 UStG; auch DE→CH) |
| `rc` | — | **DC** | Reverse Charge DE 19% (§ 13b UStG) |

**EPDE — weitere UIDs**

| UID-Land | Treatment | Out | In |
|---|---|---|---|
| CZ | `ic-exempt` | **OB** | **OB** |
| CZ | `ic-acquisition` | **UR** | **UR** |
| SI | `ic-exempt` | **C1** | **C1** |
| SI | `ic-acquisition` | **EC** | **EC** |
| PL | `ic-exempt` | **T1** | **T1** |
| PL | `ic-acquisition` | **W5** | **W5** |
| BE | `ic-acquisition` | **BP** | **BP** |
| BE | `domestic` | **BS** | **BI** |
| IT | `ic-acquisition` | **IP** | **IP** |
| IT | `rc` | **IC** | **VI** |

> **Merkhilfe:** AF = ig-Lieferung (EU, EPROHA-AT) · A0 = Ausfuhr Drittland (EPROHA-AT) · DH = ig-Lieferung (DE-UID) · G0 = Ausfuhr Drittland (EPDE-DE)

### Pendant-Beziehung EPROHA ⇄ EPDE (Erwerb/Lieferung)

Beide Mappings laufen strikt parallel — gleicher Vorgang, je Heimat-UID anderes Kennzeichen:

| Vorgang | Beleg | EPROHA (AT-UID) | EPDE (DE-UID) |
|---|---|---|---|
| IG-**Erwerb** | Eingangsrechnung | **VE** | **VH** |
| IG-**Lieferung** | Ausgangsrechnung | **AF** | **DH** |

- **VE ⇄ VH** (Erwerb/Eingang) · **AF ⇄ DH** (Lieferung/Ausgang).
- EPDE braucht **kein** eigenes `dreiecks`-Kennzeichen: **DH ist das EPDE-Pendant zu AF**. Im Dreieck greift der Fallback `ic-exempt[DE] = DH` korrekt.

### Regel · Dreieck vs. IT-Inland (kein IT-Erwerbskennzeichen ohne Registrierung)

- **Dreieck** (3 EU-Länder, `triangle=true`): IG-Erwerb läuft über die **Heimat-UID** (VE/VH); die ruhende L2 ist die **Dreieckslieferung → AF/DH**, NICHT das IT-Inlands-RC (IC). `triangle` gewinnt in `buildQuickCheck` über die Engine-Basisklassifikation `rc`.
- **IT-Inland** (`dep=dest`, IT→…→IT): IT-Reverse-Charge → Ausgang **IC**, Eingang **VI** (nur wenn IT-UID vorhanden: EPDE ja → VI; EPROHA nein → kein MWSKZ, Vorsteuervergütung).
- Ein **IT-Erwerbskennzeichen** (VE/VH-Äquivalent für IT) existiert bewusst **nicht** — es wäre erst bei tatsächlicher **IT-Registrierung** nötig (Nicht-Dreieck-Fallback). Im Dreieck spart Art. 141 genau diese Registrierung.

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
thirdC(dep|dest, nonEU≠CH/GB) Import  → analyzeThirdImport()      ← TR/RS/BA/RU generisch
thirdC(dep|dest, nonEU≠CH/GB) Export  → buildThirdExportResult()  ← Engine + generischer Renderer
eng._depEqDest                        → analyzeInland()
```

**Einführer-Toggle in ALLEN 3P-Drittland-Pfaden:** `_importerToggle(country, direction)` wird jetzt auch in `analyzeCH` (Import-Case 2), `buildCHExportResult`, `analyzeGBImport`, `buildGBExportResult` gerendert (statische DAP/DDP-Karten ersetzt). `_importerConsequence()` ist länderbewusst (CH: BAZG/8,1 %/Art. 67+28 MWSTG · GB: HMRC/UK VAT) und blendet je `importerRole` real existierende SAP-MWSKZ via `sapBadgeBoth` ein (Export A0/G0/D0 bei customer · Anschlusslieferung z.B. BE BS/BI, CH B5 bei self); fehlt ein Code bzw. für die EUSt → „kein AP-MWSKZ"-Hinweis (keine erfundenen Codes). 2P-`analyze2`-CH/GB-Karten bleiben (Folgeschritt).

**Generisches Drittland (TR/RS/BA/RU):** Daten in `EU`-Array (`nonEU:true` + Meta `customsUnion`/`saa`/`sanctions`). `analyzeThirdImport()`/`buildThirdExportResult()` mit `_thirdCountryNote()` (Sanktionen RU · Zollunion TR/A.TR · SAA RS/BA) und `_importerToggle()`/`setImporter()` → State `importerRole` ('self'|'customer'|'supplier', in getState/loadState persistiert). Importeur-Logik leitet UID/Registrierung im Bestimmungsland ab (z.B. EPDE→SI vorhanden, ES/RU fehlen → Registrierung). Einfuhr läuft über EORI, nicht UID. Toggle-Folgebox = Checkliste (inkl. EORI-Klarstellung: EU-weit gültig, keine separate Bestimmungsland-EORI). Mobile: `_thirdCountryNote()` und Toggle tragen `data-component` und sind via `@media`-Ausnahme sichtbar (sonst von `.hint`-Verkürzung versteckt). Bei Drittland-Einfuhr (dep nonEU, mode 3) blenden `renderUIDInline()`/`renderUidOverrideBlock()` den irreführenden IG-UID-Block aus (Einfuhr ≠ ig. Erwerb).

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
15. **Vor jeder Änderung Git-Stand abgleichen** — ist `origin/main` weiter als lokal, erst lokal nachziehen / frisch von `origin/main` branchen (siehe Callout ganz oben). Nie auf veraltetem Stand weiterbauen.

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
