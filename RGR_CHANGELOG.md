# RGR Changelog — Reihengeschäftsrechner

---

## v4.3 · 15.05.2026 — Session 25

### Tests

- **SMOKE_TESTS CH/GB EPROHA** — 4 neue Tests (CH-EP1, CH-EP2, GB-EP1, GB-EP2) für EPROHA als Zwischenhändler auf EU→CH- und EU→GB-Ketten; decken Transport=middle (L2 bewegend, lit. b) und Transport=supplier (L1 bewegend) ab; schließen die Lücke der bisherigen CH-SV1/2/3 die nur EPDE-Fälle abgedeckt haben. 33→37 Smoke Tests.
- **SMOKE_TESTS REAL_CASES_2026** — 7 neue Tests aus realen Geschäftsfällen: RC-HU-DE-LITC (EPDE holt in HU ab, lit. c, kein HU-Risiko), RC-HU-DE-LITA (EPDE mit HU-UID, lit. b, L2 bewegend), RC-SAPPI-1 (DE→EPDE→IT Lieferant, Dreieck blockiert, Reg-Pflicht IT), RC-SAPPI-2 (BE-UID-Override, Dreiecksgeschäft möglich), RC-SAPPI-3 (Abholung Fallback, kein IT-Risiko), RC-BG-AT-BG + RC-BG-DE-BG (dep===dest BG, needsReg). 37→44 Smoke Tests.

### vat-knowledge

- **`rules/inland_chain.md`** — neue Seite für Inlands-Reihengeschäft (dep===dest): `analyzeInland()`-Trigger, `partyStatus()`-Entscheidungslogik (domestic/itRC/needsReg), vollständige SAP-Matrizen EPROHA + EPDE, IT inversione contabile (Art. 17 DPR 633/1972), 4 Referenzfälle (R1–R4), bekannte Lücken NL (Art. 12 Wet OB) und EE (Satzabweichung 22% vs. 24%) dokumentiert.

---

## v4.3 · 15.05.2026 — Session 24

### Bugfixes

- **SAP-Badge L1-Delivery-Box** — bei Inlands-Reihengeschäft (Lieferort = Abgangsland) wurde in der L1-Box fälschlich kein Badge gerendert; `buildDeliveryBox()` gibt Badge jetzt korrekt aus.
- **`renderUIDInline()` Inlandsfall** — zeigte bei Inlands-Reihengeschäft falsche UID; greift jetzt korrekt auf `placeOfSupply`-UID zurück.
- **OT-M2 Browser-DOM-Robustheit** — Tests OT-M2-01/02/03 setzen `cp-0` und `cp-1` jetzt explizit; verhindert Fehlschlag wenn `analyze2()` im Browser einen cp-1-Wert aus einer vorherigen Mode-3-Session liest statt des `dest`-Fallbacks.

### vat-knowledge — neue Referenzdokumentation

- **`reference-cases.md`** — 14 menschenlesbare Referenzfälle mit verifizierten Ergebnissen (movingIndex, Lieferort, SAP-Codes Ein-/Ausgang, Dreiecksgeschäft-Status); alle Transport-Varianten (supplier/middle/customer/middle2), IG-Erwerb vs. IG-Lieferung, Quick Fix lit. a/b/c, Dreiecksgeschäft-Blockierungsgründe; deckt EPROHA + EPDE ab. Querverweise auf SMOKE_TESTS-IDs.
- **`at/eproha-buchungskreise.md`** — vollständige SAP-Matrix AT/DE/CH-Buchungskreis (AF/A0/VE/A2/DH/D0/VH/DS/B5/IB); A0 vs. AF Entscheidungstabelle (Drittland vs. EU); DH vs. AF (DE- vs. AT-Buchungskreis); `_sapEffectiveCountry()`-Logik erklärt; IT-Sonderfall inversione contabile (IC Ausgang / VT Eingang, kein IT-Buchungskreis).
- **`de/epde-buchungskreise.md`** — vollständige SAP-Matrix für alle 8 EPDE-UIDs (DE/SI/LV/EE/NL/BE/CZ/PL); G0 vs. DH Entscheidungstabelle; RC-NL-Ausnahme (Art. 12 Wet OB — einziger erlaubter RC bei EPDE); IT inversione contabile (IC/IP/VI); Warnung: BE/LV/EE/NL haben kein IG-Lieferung Ausgangs-Stkz.

---

## v4.3 · 14.05.2026 — Session 23

### Infrastruktur & UX

- **Self-hosted Fonts** — IBM Plex Sans (300–700) + IBM Plex Mono (400–700) als woff2 in `docs/assets/fonts/` und `docs/v1/assets/fonts/`; `@font-face`-Regeln in beiden `app.css`; Google-Fonts-`<link>` aus beiden `index.html` entfernt. App läuft vollständig offline ohne Drittanbieter-Request.
- **PDF-Export** — `exportPDF()` setzt vor `window.print()` einen sprechenden Dokumenttitel (`RGR EPDE · 3P · 14.05.2026`) als Default-Dateiname; `@media print` komplett überarbeitet: nur aktiver Tab druckt, alle eingeklappten Sektionen werden aufgeklappt (detail-collapse, flow-diagram, perspektiv-block, uid-body), interaktive Elemente (Toggle-Buttons, Wechseln-Karten, Overflow-Menü) versteckt, `@page`-Margins gesetzt, `page-break-inside: avoid` auf Karten.

### Bugfix

- **Vergleich-Tab scrollbar auf iPad Air** — `min-height: 0` auf `.pane-right-body` (Flex-Column-Item), sodass `overflow-y: auto` greift. Ohne `min-height: 0` wächst das Element auf Content-Höhe und scrollt nie. Zusätzlich `-webkit-overflow-scrolling: touch` und `min-width: 0` auf `.pane-right`.

---

## v4.3 · 14.05.2026 — Session 22

### Redesign — Light Theme + Header-Navigation

- **Light Theme CSS-Token-System** — vollständige `--variable`-Palette: Farben, Status, Dreieck, SAP-Badge, UID-Badge, Radius, Transitions. IBM Plex Sans + IBM Plex Mono als Schriften (Google Fonts).
- **Header-Modus-Tabs** — `h-mode-tabs` mit 3P/4P/2P/Lohn direkt im Header; `setPartiesFromHeader()` delegiert an `setParties()`; `syncHeaderModeTabs()` hält Tabs synchron.
- **View-Nav im Header** — `h-view-nav` mit Standard / Quick Check / Vergleich; `switchView()` delegiert an `switchTab()`; ersetzt alten `qcHeaderBtn`.
- **Sidebar-Mode-Badge** — zeigt aktiven Modus (Code + Titel + Beschreibung) oben in der Sidebar; `updateModeBadge()` aus `setParties()` aufgerufen.
- **SVG-Diagramme theme-aware** — `buildTriangleSVG()` und `buildTriangleSVG4()` lesen Farben via `getComputedStyle()` statt hardcodierter Hex-Werte.
- **`sapBadge()` / `sapBadgeBoth()`** — Inline-Styles auf CSS-Klasse `badge badge-sap` refactored.
- **4P-Diamond-Diagramm** — neues `buildTriangleSVG4()` Layout: A (links-unten) → B (links-oben) → C (rechts-oben) → D (rechts-unten); EuG T-646/24 im Titel.
- **4P-Warnhinweise** — UID-Pflicht C im Bestimmungsland + AT/DE-Länderrisikohinweis als `rH({type:'warn'})`.

### v1/v2-Toggle

- **`docs/v1/`** — eingefrorener Stand von `v4.2-snapshot` (b1954f4); komplett isoliert, ändert sich nie automatisch.
- **`switchToDesign(version)`** — im ⋯-Menü beider Versionen; überträgt `window.location.search` → URL-Param-State bleibt erhalten.
- **Git-Tag `v4.2-snapshot`** — auf GitHub, zeigt dauerhaft auf pre-Redesign-Stand. Rollback: `git checkout v4.2-snapshot -- docs/`

### Bugfixes

- **UID-Override zurück in `buildTriangleSVG()` `node()`** — `uidLine`-Parameter beim Redesign-Refactor verloren gegangen; B-Node zeigt wieder `selectedUidOverride` im Diagramm.
- **`renderUIDInline()` zeigt Override-UID** — `buyerUID` nutzt `selectedUidOverride` wenn gesetzt (L1 + L2); vorher immer Home-UID.
- **`applyDreiecksUid()` ruft `renderUIDs()`** — Eigene-UIDs-Sektion wurde nach UID-Auswahl nicht neu gerendert.

---

## v4.2 · 21.04.2026 — Session 21

### Quick Check Tab — Full-Width Layout + Exit UX

- **Full-Width Mode:** `html.qc-active` blendet `.pane-left` aus und expandiert `.pane-right` auf 100 % Breite (Desktop + Mobile)
- **Header-Button:** Grüner Hintergrund + `✕`-Suffix via `html.qc-active .qc-header-btn::after` wenn QC aktiv — kein JS-Class-Toggle nötig
- **`toggleQuickCheck(btn)`** — ersetzt direkten `switchTab`-Call im Header-Button; wirkt als Toggle (Klick 1 → öffnet QC, Klick 2 → zurück zum Ergebnis-Tab)
- **Exit-Chip im Panel:** `qc-exit-bar` ganz oben im QC-Panel mit `← Zum Ergebnis ✕` — zweiter Ausstiegsweg, besonders für Mobile
- **STRUKTUR-Header readonly:** zeigt „3" aktiv, „4" und „Lohnveredelung" gedimmt + „Phase 1 — nur 3-Parteien-Modus" Hinweis
- **`#qcBackBar` dauerhaft versteckt:** alter Back-Bar ist durch Exit-Chip abgelöst
- `npm run check` grün

---

## v4.2 · 09.04.2026 — Session 20

### Quick Check Tab — Phase 1
- Neuer Tab `#tab-quickcheck` mit eigenem State `qcState` (company, dep, dest, transport)
- 🟢 Quick Check Button im Header neben Experten-Modus (grün abgehoben)
- `buildQuickCheck()`: bewegte Lieferung, ig./Inland/Import/Export, SAP-Codes aus `SAP_TAX_MAP`
- `renderQuickCheck()`: 2-Spalten-Grid ER | AR, SAP-Badge, Pflichtangaben, Dreiecks-/Reg.-Hinweise
- Art. 36a Hinweis wenn Transport=Zwischenhändler + Abgangsland-UID vorhanden
- Fix: dep===dest → Inlandslieferung statt ig. Erwerb
- Fix: EPDE mit UID im Abgangsland → dep-Land SAP-Code (nicht immer VH)
- Non-Expert-Mode: `← Ergebnis` Back-Bar wenn QC aktiv

### Dual Repo Workflow
- DEPLOY-Repo gelöscht; Sync jetzt PRIMARY/docs/ → `ieeks.github.io/eu-vat-reihengeschaeftrechner/`
- `manuel-app.dev/eu-vat-reihengeschaeftrechner/` live via GitHub Pages
- `sync-repos.sh`, `toggle-cloudflare-redirect.sh`, `WORKFLOW.md`, post-commit Hook

---

## v4.2 · 06.04.2026 — Session 19

### Bugfixes

- **buildTrafficStatus: kein roter Block bei GB/CH** — Guard am Funktionsanfang; falls `ctx.dest` oder `ctx.dep` GB/CH ist, gibt die Funktion sofort `''` zurück. EU-Fälle unberührt.
- **buildKurzbeschreibung ruhende Lieferung: Rollen-Label** — `intro`-Satz zeigt `(A)` / `(B)` / `(C)` hinter Flagge + Land via `PL(indexOf)`.
- **Registrierung-Summary: Ampelfarben** — `warn: true` (rot + ⚠️) bei Registrierungsrisiko; `ok: true` (grün) bei „Keine Registrierung erforderlich" — gilt für alle drei Branches (hasBlockingRisk / dreiecks / else).

### UI / GB-CH-Pfad

- **UID-Override-Block: Auto-Collapse** — Block öffnet sich immer beim Transport-Wechsel zu B; nach UID-Auswahl klappt Body automatisch zu; Header-Klick öffnet zum Ändern.
- **serve.mjs defaultEntry → docs/index.html** — lokaler Dev-Server zeigt jetzt direkt die `docs/`-App auf Port 4173.
- **buildGBExportResult / buildCHExportResult: verschlankt** — Header-Banner, Delivery-Boxen und TLDR-Box entfernt; `buildKurzbeschreibung` übernimmt L1/L2/SAP. Hints-Block bleibt (Ausfuhrnachweis, Exporteur, TCA/FHA). Nordirland + UK VAT Registration nur noch bei expertMode.
- **buildCHExportResult: ⚖️ Transportzuordnung + ✅ Keine ZM** — redundante Hints entfernt.
- **buildKurzbeschreibung step4: DAP/DDP-Panel bei GB/CH** — für Drittland-Destinationen ersetzt Schritt 4 „Restliche Lieferung" durch ein 2-Spalten-Grid DAP/EXW (teal) vs DDP (amber) mit UID-Anzeige wenn vorhanden.
- **buildKurzbeschreibung UID-Chip** — UID wird jetzt als Teal-Chip im Mono-Font dargestellt statt als Fließtext.
- **buildKurzbeschreibung Rechnungshinweis Ausfuhr** — bei `iAmTheSeller && vatTreatment==='export'` + dep=AT/DE erscheint 📄-Zeile mit gesetzlichem Rechnungstext (§ 7 UStG AT / § 4 Nr. 1a i. V. m. § 6 UStG DE). Kein Text bei dep außerhalb AT/DE.
- **Dev-Mode data-component** — neue Tags: `buildRiskPanel`, `dreiecksDisclaimer`, `deliveryDetails` (4×), `buildCHExportResult`, `buildGBExportResult`.

### Nicht angefasst
- VATEngine IIFE
- analyze()

---

## v4.2 · 06.04.2026 — Session 18

### Bugfixes / UI

- **Drop-Shipment EU: UID-Pflicht prominent vor Diagramm** — neuer gestylter Block (`background:rgba(239,68,68,0.08)`) ersetzt alten `rH({type:'error'})`. Steht jetzt VOR `buildFlowDiagram()`, damit Mobile-User die Voraussetzung sofort sehen
- **Drop-Shipment EU: UID-Pflicht generisch formuliert** — „AT-Kunde muss ${cn(dsDest)}-UID mitteilen" → „AT-Kunde muss eine gültige EU-UID aus einem anderen Mitgliedstaat (nicht AT) mitteilen"
- **2P analyze2: Rechnungspflichtangaben entfernt** — redundante Detailtexte (§ 11 UStG AT, Belegnachweis, ZM, Rechnungstext) aus Decision-Steps und rH-Hints entfernt; Details stehen bereits im Expertenmodus (RPA-Section)

- **buildTrafficStatus RED: konkrete Risiken** — generischer Text ersetzt durch Liste mit Land + Steuersatz + Konsequenz pro Risikotyp (`registration-required` / `ic-acquisition-no-reg` / `resting-buyer-no-uid`)
- **analyzeInland regBanner: prominenter RED-Block** — `needsReg`-Banner konsistent mit `buildTrafficStatus` RED-Branch; zeigt Registrierungspflicht + 3 Handlungsoptionen statt einfachem `rH`-Hint
- **analyzeInland: Lieferort in Delivery-Titeln** — `buildInlandCard()` zeigt jetzt `(Lieferort: 🇧🇬 Bulgarien)` neben den Vertragsparteien — verhindert Fehlinterpretation des Warenwegs
- **analyzeInland: BG→DE→BG-Erklärung** — bei `s1 === s4` erscheint Info-Hint: „Pfeile zeigen Vertragsparteien, nicht physischen Warenweg, Ware berührt Deutschland nicht"

### Nicht angefasst
- VATEngine IIFE
- analyze()

---

## v4.2 · 06.04.2026 — Session 17

### Bugfixes

- **„Aktive UID" in buildKurzbeschreibung() korrigiert** — summaryItems-Fallback zeigte immer companyHome-UID (z.B. DE449663039 für EPDE), auch wenn EPDE Käufer auf einer bewegten IG-Lieferung war und die dest-UID korrekt wäre. Neue Logik: Käufer auf bewegter L → dest-UID, Verkäufer → dep-UID, Fallback → companyHome
- **Duplikat-Funktionen entfernt** — `_sapEffectiveCountry`, `getSapCode`, `getSapDesc`, `sapBadge`, `sapBadgeBoth` waren ab ~Z. 789 identisch zu Z. 241 dupliziert (SyntaxError im strict mode). Zweiter Block entfernt, ebenso `setMePosition` no-op-Duplikat bei ~Z. 8695
- **buildVergleichTab() — 5 Diskrepanzen zur Hauptanalyse behoben:**
  1. `statusCell()`: YELLOW für `warningRisks` (rc-blocked, double-acquisition) entfernt — Hauptanalyse kennt diesen Status nicht; stattdessen `dreiecksOpportunity`-Logik ergänzt
  2. `statusCell()` + `recommendationCell()`: `dreiecksOpportunity` pro Szenario berechnet (GELB „UID wählen" / GRÜN „bevorzugt ∆")
  3. `p0Cell()` → `art41Cell()`: Alte Prüfung auf `severity==='P0'` (existiert im Engine nie → immer grün) ersetzt durch echten `double-acquisition`-Check
  4. `reasonCell()`: Text für `dreiecksOpportunity`-Fall und nicht-blockierende Warnungen ergänzt; rc-blocked/double-acquisition als Info statt als Blocker
  5. Neue Helper `getDreiecksOpp(tr)` / `getDreiecksApplied(tr)` berechnen Dreiecks-Chance pro Transport-Szenario analog zu `buildKurzbeschreibung()`

### Neue Features

- **2P-Modus AT→EU: Strukturierte 4-Schritte-Analyse** — `analyze2()` AT→EU-Branch zeigt jetzt Decision-Flow-Grid (Transportzuordnung / Bewegte Lieferung / Steuerliche Behandlung / Fakturierung & Pflichten) analog zum 3P-Modus in `buildKurzbeschreibung()`
- **2P-Modus AT→AT: Ergebnis-Summary + 2-Schritte-Analyse** — Summary-Card mit 20% MwSt-Anzeige + Decision-Grid (Steuerliche Behandlung / Fakturierung & UID) vor den bestehenden rH()-Hints

### Doku

- **`/vat-knowledge/`-Wissensbasis erstellt** — 16 Markdown-Dateien (EU-Recht, AT, DE, CH, Implementierungsregeln) mit Code-Bezug (Funktionsname, Variablen, Edge Cases)
- **`CLAUDE-vat-knowledge.md`** — Zentraler Index mit 5 Regeln: Pflichtlektüre-Tabelle, gesperrte Funktionen, Smoke-Tests, RC-Kurzreferenz, UID-Logik

---

## v4.2 · 04.04.2026 — Session 16+

### Bugfixes (nach Session 16)

- **Drop-Shipment AT→AT Diagramm:** `movingDeliveryIdx` `0` → `-1` — Inlandslieferung zeigte fälschlich „⚡ IG · 0%" statt neutralem `L1`
- **Drop-Shipment EU: UID-Pflicht prominent** — neuer roter Fehler-Block ganz oben: AT-Kunde muss dest-UID (z.B. DE-UID) mitteilen, sonst fakturiert EPROHA 20% AT-MwSt (Art. 138 Abs. 1 lit. b)
- **Cache-Busting automatisiert** — GitHub Actions Workflow ersetzt `?v=dev` in `index.html` beim Deploy durch den kurzen Git-Commit-Hash; kein manuelles Versionieren mehr nötig

---

## v4.2 · 04.04.2026 — Session 16

### Bugfixes

- **SAP-Kennzeichen Exports korrigiert**
  - EPDE › CH › export: `D0` → `G0` (Ausfuhr DE→CH, § 6 UStG)
  - EPROHA › DE › export: neu mit `D0` (nur bei DE-UID)
  - EPROHA › CH › export: `D0` → `A0` (bei AT-UID)
  - `_sapEffectiveCountry`: `'export'` zu `uidTreatments` ergänzt — SAP-Lookup für Ausfuhr läuft jetzt durch das UID-Land (DE→D0, AT→A0)
- **Art. 41 Doppelerwerb-Prüfung präzisiert** — von „alle nicht-dest UIDs" auf tatsächlich verwendete UID (`usedUidCountry`) umgestellt; dep-UID korrekt ausgenommen (Art. 36a Abs. 2 / Quick Fixes Exp. Notes S. 63)
- **`formatOwnUidCode` buyer-moving korrigiert** — UID-Inkonsistenz L1 (DE248554278) vs. L2 (ATU36513402) behoben; Fallback direkt zu `companyHome` statt über intermediäres `myVat(pos)`
- **`buildKurzbeschreibung`**: `double-acquisition` aus `hasBlockingRegistrationRisk` entfernt — Art.-41-Warnung blockiert grünen Top-Status nicht mehr

### Neue Features

- **Drop-Shipment Mode 2 (EPROHA, Kunde=AT)** — Direktlieferung aus AT-Lager an Endkunden des AT-Kunden (Warenempfänger in EU oder Drittland)
  - UI-Toggle in `renderContextToggles()` mit Warenempfänger-Picker
  - `analyze2()`: neuer Branch für `dest=AT && dropShipDest !== AT`
  - Dreieck-Fluss-Diagramm, SAP-Codes (AF / A0), Art.-41-Hinweis, Belegnachweis, ZM-Hinweise
  - State: `dropShipDest`, `setDropShip()`, `clearDropShip()`

### UI / Dev

- **Chain-Logo ⛓ aus Header entfernt**
- **`data-component` Attribute** auf alle Input-Sektionen (Dev Mode Hover-Tags): Struktur, Warenkette, Transport, UidOverride, AnalyseOptionen, Lohnveredelung, UidStatus
- **EMAG-Hinweis** (EuGH C-245/04): nur noch im Expert-Modus sichtbar
- **`buildVergleichTab`**: `blockingStatusRisks()` Helper (ohne `double-acquisition`); `statusCell`/`recommendationCell` harmonisiert; neue `pill`-Typen für Registration-/UID-Fehler

### Doku

- **`abgleich.md`** neu — Rechtsabgleich Tool vs. EU MwStSystRL, Quick Fixes Notes, EuG T-646/24
  - F1: Dreiecksgeschäft-Block bei reiner Registrierung fachlich falsch (VATEngine IIFE, nicht behebbar)
  - F3: Quick-Fix dep-UID ohne Registration — akademisch, nicht relevant für Tool
  - Art. 41 dep-UID-Ausschluss: korrekt bestätigt (Quick Fixes Exp. Notes S. 63)
  - EuG T-646/24: 4P-Kette und Art. 141 lit. c bestätigt

### Nicht angefasst
- VATEngine IIFE
- analyze()

---

## v4.2 · 28.03.2026 — Session 15 (lokal, offen)

### Doku / offene Baustelle
- Vergleichsmodus `⚖ Vergleich` als `P0` markiert
- Offene Prüfung dokumentiert: Vergleich muss bei `Status`, `Empfehlung`, Dreiecksgeschäft und Art.-41-/Registrierungslogik 1:1 mit der Hauptanalyse harmonisiert werden
- Markdown-Doku auf den aktuellen lokalen Arbeitsstand ergänzt, ohne diese Baustelle fachlich als erledigt zu markieren

## v4.2 · 27.03.2026 — Session 14

### Primäres Ergebnis vereinfacht
- Top-Status jetzt aus vier klaren Zuständen: `ACHTUNG GEHT NICHT`, `Dreiecksgeschäft angewendet`, `Dreiecksgeschäft möglich (mit UID-Anpassung)`, `Dreiecksgeschäft nicht anwendbar`
- Neue kompakte Executive Summary oberhalb des Decision Flow
- Dreiecks-Status vollständig aus bestehender Engine-/Risiko-Logik abgeleitet, kein manueller Toggle mehr

### Sekundäre Hinweise reduziert
- Nicht-kritische Hints auf Desktop in einklappbares Panel `Weitere Hinweise` verschoben
- Mobile bleibt auf Primärinhalt fokussiert: Warnungen, Diagramm, Kurzbeschreibung
- Ergebnisfläche insgesamt ruhiger, ohne Warnlogik oder Expert-Tabs fachlich zu verändern

### Nicht angefasst
- VATEngine IIFE
- analyze()
- analyze2()

## v4.2 · 27.03.2026 — Session 13

### Ergebnis-Ampel
- Erste Top-Entscheidung in der Ergebnisbox ergänzt
- Ableitung nur aus bestehendem Risiko-/Registrierungsstatus und Dreiecks-Opportunity
- Integration oberhalb des Decision Flow in der `docs/`-App

### Nicht angefasst
- VATEngine IIFE
- analyze()
- analyze2()

## v4.2 · 27.03.2026 — Session 12

### Multi-File / Hosting
- Statische Multi-File-App unter `docs/` angelegt (`index.html`, `assets/styles/app.css`, `assets/scripts/app.js`)
- Root-`index.html` auf Redirect nach `docs/` umgestellt
- `Reihengeschaeftsrechner_22.html` als Legacy-Snapshot beibehalten
- GitHub-Pages-Workflow `.github/workflows/pages.yml` ergänzt
- `npm run check:pages` ergänzt und `scripts/serve.mjs` um Pages-Strukturcheck erweitert

### Doku
- README + CLAUDE auf neue Multi-File-/Pages-Struktur aktualisiert

### Hosting-Status
- GitHub Pages ist jetzt im Workflow-Modus aktiv
- Live-URL: `https://ieeks.github.io/eu-vat-reihengeschaeftrechner/`

### Nicht angefasst
- VATEngine IIFE
- analyze()
- analyze2()

## v4.2 · 27.03.2026 — Session 11

### Decision Flow / UI
- `buildKurzbeschreibung()` von Bullet-/Debug-Stil auf professionellen `Decision Flow` umgestellt
- Neue 4-Schritt-Struktur: Transportzuordnung, bewegte Lieferung, steuerliche Behandlung, restliche Lieferung
- Eigene Lieferungen zusätzlich als kompakte SAP-/UID-Hinweise unterhalb des Decision Flow
- Rechtsgrundlagen im Output nur noch subtil als Referenz-Chips

### Dreiecksgeschäft Opportunity
- Opportunity-Banner sprachlich und visuell auf praktische UID-Auswahl / Registrierungsvermeidung ausgerichtet
- Banner erscheint weiterhin nur bei bestehender Opportunity-Erkennung
- Keine Änderung an der zugrunde liegenden Steuer- oder Dreieckslogik

### Minimaler UI-State-Refactor
- Neue Helper `getState()`, `setState()`, `getCanonicalTransport()`, `getTransportLetter()`
- Transport-Normalisierung aus `renderResult()` herausgezogen
- Bestehende UI-Workflows auf kompatible State-Helper umgelegt

### Nicht angefasst
- VATEngine IIFE
- analyze()
- analyze2()

## v4.2 · 27.03.2026 — Session 10

### Projektstruktur / Repo-Rahmen
- Neues GitHub-Repo `ieeks/eu-vat-reihengeschaeftrechner` angelegt und `main` gepusht
- Lokaler Einstiegspunkt `index.html` ergänzt → Redirect auf `Reihengeschaeftsrechner_22.html`
- `package.json` ergänzt mit `npm run dev`, `npm run start`, `npm run check`
- `scripts/serve.mjs` ergänzt als dependency-freier lokaler Static-Server
- README + CLAUDE auf neue Start- und Strukturinfos aktualisiert

### Nicht angefasst
- VATEngine IIFE
- analyze()
- analyze2()

## v4.2 · 26.03.2026 — Session 9

### Dev-Overlay (P2)
- Toggle im ⋯-Menü: "🏷 Dev Mode" → setzt data-dev="true" auf <html>
- JS-Tooltip (#dev-tooltip, position:fixed im body) folgt der Maus — nie geclippt
- composedPath() + instanceof Element + parentElement-Fallback für robustes Element-Walking
- Getaggte Komponenten: buildKurzbeschreibung, buildDeliveryBox, buildFlowDiagram (alle 3 Pfade: 2P/3P/4P), buildLegalRefs, buildPerspektivwechsel, buildMeldepflichten, buildVergleichTab, reg-warnings, resultContextBar, quickFix (Art. 36a)

### Bugfixes GB/CH Export-Reihengeschäft (3P)
- buildGBExportResult: computeTaxCH → computeTaxGB (neue Funktion mit UK-spezifischen Texten)
- computeTaxGB: badge-export statt badge-ig → SAP-Treatment korrekt auf 'export' gemapped
- buildDeliveryBox SAP-Ableitung: badge-export → treatment='export' → A0 statt AF
- Delivery-Titel: "Ausfuhr, Ware grenzüberschreitend" statt "IG-Lieferung" bei Export
- buildCHExportResult + buildGBExportResult: SVG-Diagramm + buildKurzbeschreibung + Delivery-Boxen
- computeTaxCH erweitert: domestic-l1, domestic-l2-ch

### Bugfixes 2P (EPROHA AT-Lager)
- AT→GB: eigener Drittland-Zweig (war ig. Lieferung), DAP/DDP, ATLAS, UK VAT/HMRC
- SAP AT→GB: A0 (Ausfuhr) statt AF (ig. Lieferung)
- Zoll GB (Einfuhr) entfernt — nicht EPROHA-relevant
- TCA/REX nur noch im Experten-Modus

### Vergleich-Tab (P1)
- Neuer Tab ⚖ Vergleich nach Berechnung (3P, dep≠dest)
- 3 Spalten (Supplier/Middle/Customer), 5 Dimensionen
- Modal-Wechsel, hideVergleichTab() in alle 6 Early-Returns

### P0 Fix: analyzeLohn() Inland
- sup===con → reiner Inland-Pfad, kein RC, kein ig. Erwerb

---

## v4.0 · 24.03.2026 — Session 8

- Kurzbeschreibung als Primary Output, SAP+UID pro Lieferung
- P0 resting-buyer-no-uid (4 Optionen)
- Inlandslieferung Diagramm, noMoving SVG
- Mobile komplett, Header Overflow, Tabs 6→4
- BMF-Pill, Keyboard Nav WCAG 2.2 AA
- Tests: 33 Smoke ✅ · 13 Render ✅ · 8 Output ✅
