# RGR Changelog — Reihengeschäftsrechner

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
