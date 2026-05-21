# RGR TODO — Reihengeschäftsrechner v4.3

Stand: 20.05.2026

---

## P0 — Kritisch

- [x] **Vergleichsmodus fachlich harmonisieren** — `⚖ Vergleich` 1:1 mit Hauptanalyse konsistent (Session 17)
- [x] **Lokale UI-/Code-Änderungen bewusst nachziehen** — Session 16 committed/pushed (04.04.2026)
- [x] **buildTrafficStatus: kein roter Block bei GB/CH** — Guard eingefügt (Session 19)
- [x] **buildKurzbeschreibung ruhende Lieferung: Rollen-Label** — `(A)`/`(B)`/`(C)` im intro (Session 19)
- [x] **GB/CH Export: verschlankt** — Header-Banner + Delivery-Boxen entfernt; DAP/DDP-Panel in step4 (Session 19)
- [x] **UID-Chip + Rechnungshinweis Ausfuhr** — Teal-Chip, 📄-Zeile bei dep=AT/DE (Session 19)
- [x] **Dev-Mode data-component komplett** — buildRiskPanel, dreiecksDisclaimer, deliveryDetails, CH/GB-Hints (Session 19)
- [x] **Quick Check: Full-Width Layout + Exit UX** — `html.qc-active`, `toggleQuickCheck()`, Exit-Chip, STRUKTUR-Header (Session 21)
- [x] **v4.3 Redesign live** — Light Theme, Header-Modus-Tabs, View-Nav, 4P-Diamond, v1/v2-Toggle (Session 22)
- [x] **renderUIDInline() UID-Override** — L1+L2 zeigen selectedUidOverride; applyDreiecksUid() ruft renderUIDs() (Session 22)
- [x] **3P CH/GB Browsertest** — CH-EP1/EP2 + GB-EP1/EP2 als SMOKE_TESTS automatisiert (Session 25)
- [x] **Arrow-Labels 3P-Dreieck** — Steuersatz + Behandlung restauriert, Positionierung oberhalb Pfeil korrigiert (Session 22)
- [x] **Vergleich-Tab scrollbar auf iPad Air** — `min-height: 0` + `-webkit-overflow-scrolling: touch` auf `.pane-right-body` (Session 23)
- [x] **Self-hosted Fonts** — Google Fonts Abhängigkeit entfernt, woff2 lokal in `docs/assets/fonts/` (Session 23)
- [x] **PDF-Export** — `window.print()` + verbesserter `@media print`: Titel, nur aktiver Tab, kollabierte Sektionen aufgeklappt (Session 23)
- [x] **SAP-Badge L1-Delivery-Box** — bei Inlands-Reihengeschäft kein Badge gerendert; korrigiert (Session 24)
- [x] **OT-M2 Browser-DOM-Robustheit** — Tests setzen cp-0/cp-1 explizit; stale DOM-Wert aus Mode-3-Session verhindert (Session 24)
- [x] **vat-knowledge Referenzfälle + Buchungskreis-Doku** — `reference-cases.md`, `at/eproha-buchungskreise.md`, `de/epde-buchungskreise.md` (Session 24)
- [x] **vat-knowledge NL-Länderdatei** — `nl/wet_ob_nl_reihengeschaeft.md` (Art. 5/12/37a/37c Wet OB, RC-Sonderfall trotz Direktregistrierung, EPDE NL-UID); Index in `CLAUDE-vat-knowledge.md` + `CLAUDE.md` (16 → 17 Dateien) aktualisiert (Session 27)

---

## Session 12 — Multi-File / Pages

- [x] **Single-File abgelöst** — deploybare App liegt jetzt unter `docs/`
- [x] **GitHub Pages per Actions vorbereitet** — Workflow + Publish-Ordner `docs/`
- [x] **Pages-Strukturcheck** — `npm run check:pages`
- [ ] **Live-Hosting prüfen** — GitHub Pages URL, Assets, Fonts, Redirect, lokale Links

---

## Session 13 — Ergebnis-Ampel

- [x] **Top-Status ergänzt** — Geht nicht / Dreieck angewendet / UID-Anpassung / nicht anwendbar
- [ ] **Browserabnahme Top-Status** — rot/grün/gelb/blau mit echten Fällen manuell prüfen

---

## Session 14 — Primäres Ergebnis vereinfacht

- [x] **Executive Summary ergänzt** — kompakte Struktur-/Transport-/UID-Zusammenfassung
- [x] **Sekundäre Hints reduziert** — Desktop-Panel `Weitere Hinweise`
- [ ] **Browserabnahme Ergebnisfläche** — Desktop und Mobile mit/ohne Warnungen manuell prüfen

---

## Session 10 — Repo / Struktur

- [x] **GitHub-Repo angelegt** — `eu-vat-reihengeschaeftrechner`
- [x] **Lokaler Start-Workflow** — `npm run dev` via `scripts/serve.mjs`
- [x] **Projekt-Einstiegspunkt** — `index.html` als Redirect auf Hauptdatei
- [ ] **Browserabnahme nach Struktur-Update** — Redirect + Menü + Tests im Browser prüfen

---

## Session 11 — Decision Flow / UI-State

- [x] **Decision Flow modernisiert** — steuerliche Kurzbegründung statt Debug-Stil
- [x] **Dreiecks-Opportunity-Banner geschärft** — Nutzen + UID-Auswahl klarer
- [x] **Minimaler UI-State-Helper** — `getState()` / `setState()` / Transport-Normalisierung
- [ ] **Browserabnahme Decision Flow** — 3P / 4P / 2P / Lohn sowie Light/Dark manuell klicken

---

## P1 — Wichtig

- [x] **Drop-Shipment Browserabnahme** — Mode 2 / EPROHA abgenommen (Session 24)
- [x] **Typeahead Länder-Picker** — Native select ersetzen; `initTypeaheadPickers()` aktiviert + Emoji-Bug behoben (Session 26)
- [x] **REAL_CASES_2026 Tests** — RC-HU-DE-LITC/LITA, RC-SAPPI-1/2/3, RC-BG-AT-BG, RC-BG-DE-BG als SMOKE_TESTS (Session 25)
- [ ] **Vergleich-Tab: Struktur-Dimension** — 3P/4P/Dreieck als zweite Achse
- [ ] **Bulk-Modus / CSV-Batch (Highlight #3)** — Mehrere Fälle in einem Lauf
  prüfen statt einzeln. Verschiebt das Tool vom Einzelfall-Rechner zum
  Quartalsabschluss-Werkzeug für Buchhaltung.

  **Use-Case:** 50 noch nicht verbuchte Rechnungen mit Reihengeschäft-Verdacht.
  Buchhalterin lädt CSV hoch, kriegt sortiert: 🟢 sofort verbuchbar / 🟡 Pflicht-
  Prüfung nötig / 🔴 Reg-Risk. Output-CSV mit MWSKZ-Spalten direkt in SAP
  importierbar.

  **Architektur:**
  - Eigene Seite `docs/bulk.html` (nicht Tab — eigener Workflow, mehr Platz)
  - Verlinkt aus ⋯-Menü („📊 Bulk-Modus")
  - Engine-API bereits vorhanden: `VATEngine.run(ctx)` + `VATEngine.classifySupplies(ctx, movingIndex)`
    — gleiche `ctx`-Objekte wie in `SMOKE_TESTS` (app.js 7378 ff., 8174 ff.)
  - Kein Touch an VATEngine IIFE, `analyze()` oder `analyze2()` (NEVER TOUCH)
  - Neue Bulk-Funktionen in `docs/assets/scripts/bulk.js` (eigene Datei, isoliert)
    oder am Ende von `app.js` — Vote: **eigene Datei**, damit Hauptdatei nicht
    weiter wächst

  **Komponenten:**
  - `parseBulkCSV(text)` — Auto-Detection Separator `;` vs `,`, UTF-8 BOM,
    Header-Validierung, Zeilen-Fehler sammeln (nicht abbrechen)
  - `buildCtxFromRow(row, company)` — baut `ctx`-Objekt analog zu
    `runSmokeTests()`-Pattern (app.js Zeile 8192) mit `Object.freeze`,
    `s3 = s4` für 3P, parties-getter, hasVatIn/vatIdIn/rateOf/nameOf etc.
    aus `COMPANIES[companyKey]`
  - `runBulk(rows)` — Schleife mit `setTimeout(r,0)` alle 10 Zeilen für UI-Yield;
    Progress-Bar; Fehler-Zeilen mit `{ok:false, error:msg}` statt throw
  - `classifyStatus(result, supplies, risks)` — 🟢/🟡/🔴 nach Logik:
    - 🟢 = SAP-Code eindeutig + keine Reg-Pflicht + kein Pflichttext-Risk
    - 🟡 = SAP-Code da, aber Pflichttext-Mahnung / Luxury-Trust / Belegnachweis
    - 🔴 = Reg-Pflicht erforderlich / Dreieck blockiert / Inputs inkonsistent
  - `renderBulkTable(rows, results)` — Tabelle mit Filter-Chips (Status/Dreieck/Reg-Risk),
    Klick auf Zeile → Detail-Panel rechts (Kurzbeschreibung + Diagramm reuse aus
    bestehender Render-Pipeline, falls möglich; sonst minimaler Renderer)
  - `exportBulkCSV(rows, results)` — Eingangs-CSV + angereicherte Spalten
    (status, movingIdx, l1_sap_out/in, l2_sap_out/in, dreieck, reg_risk_country,
    pflichttext, warnings, legal_basis), UTF-8 BOM, `;`-Separator (Excel-DE)

  **CSV-Input-Format (Pflichtspalten fett):**
  ```
  caseId; **company**; **mode**; **s1**; **s2**; s3; **s4**;
  dep; dest; **transport**; uidOverride; notes
  ```
  `company` = EPDE / EPROHA · `mode` = 3 / 4 · `transport` = supplier/middle/customer/middle2 ·
  `uidOverride` = ISO-2 Ländercode oder leer · `dep`/`dest` leer = aus s1/s4 abgeleitet

  **Template-Download:** Button generiert leere CSV mit Header + 2 Beispielzeilen
  (3P + 4P), damit User nicht raten muss.

  **Mode-Scope:** v1 nur `mode=3` und `mode=4`. Mode 2 (EPROHA AT-Lager) und
  Mode 5 (Lohnveredelung) später — brauchen zusätzliche Felder.

  **Drittland:** CH/GB-Ketten müssen mit durchlaufen, da `analyze()` selbst nicht
  aufgerufen wird, sondern direkt `VATEngine.run(ctx)`. CH/GB-Branches sind im
  Engine-Output nicht enthalten — entweder per Pre-Check vor VATEngine.run
  (analog `analyze()`-Dispatch app.js ~5873) routen oder v1 auf EU-EU beschränken
  und Drittland mit explizitem „skip — manuell"-Status markieren.

  **Performance:** 100 Zeilen ≈ 5 s, 1.000 Zeilen ≈ 50 s. Progress-Bar nötig
  ab > 50 Zeilen.

  **Privacy:** Alles im Browser, keine Network-Calls (außer wenn VIES-
  Validierung — Highlight #1 — parallel implementiert wird).

  **Aufwand:** ~4 Tage
  - 0.5 d Headless-Wrapper + ctx-Builder
  - 0.5 d CSV-Parser + Validator
  - 1 d Bulk-UI (`bulk.html`, Drag-Drop, Template-Download, Theme-Sync)
  - 1 d Result-Table + Filter + Detail-Panel
  - 0.5 d CSV-Export
  - 0.5 d Mode 4P sauber + Drittland-Entscheidung
  - 0.5 d Tests mit echten CSVs ≥ 50 Fälle, Browser-Abnahme

  **Erweiterungsoption (P2):** Combo mit Highlight #1 (VIES) — UID-Override-Spalte
  live validieren, ungültige UIDs als 🔴 markieren. Combo mit Highlight #2
  (Audit-PDF) — Batch-Export N PDFs als ZIP.

  **Nicht-Ziele v1:** kein Backend, kein Login, keine Multi-User-Sync,
  keine Persistenz über Browser-Reload hinaus (Fall-Archiv = separates Highlight #5).
- [ ] **VATEngine: establishments-Datenmodell pro Partei** —
  Niederlassung von Registrierung trennen. Aktuell kennt die Engine
  nur vatIds (hat UID / hat keine UID). Langfristig braucht jede
  Partei ein establishments-Array das angibt wo echter Sitz /
  feste Betriebsstätte vorliegt (nicht nur UID-Registrierung).
  Relevant für Art. 141 lit. a (_detectTriangle3/4),
  Art. 194 RC-Blockierung (_checkRCBlock BE-Branch).
  Erst nach steuerrechtlicher Freigabe implementieren.
  Datenmodell-Vorschlag:
    `COMPANIES['EPDE'].establishments = ['DE']`
    `COMPANIES['EPROHA'].establishments = ['AT']`
  Dann: `vatIds[dest]`-Check → `establishments.includes(dest)`
  in `_detectTriangle3()` und `_detectTriangle4()`.

---

## P2 — Nice-to-have

- [x] **vat-knowledge: Inlands-Reihengeschäft-Seite** — `rules/inland_chain.md`: meStatus, SAP-Matrizen EPROHA+EPDE, IT inversione contabile, 4 Referenzfälle (Session 25)
- [x] **vat-knowledge: bekannte Grenzfälle** — `edge-cases.md`: BG Inland, HU EXW lit. c/b, Sappi DE→EPDE→IT (Session 25)
- [ ] **Code-Modularisierung** — IIFE-Module, tieferer AppState nach UI-Helper-Basis
- [ ] **External Verify Button**
- [ ] **Belegnachweis-Checkliste** (nur Expert)
- [ ] **Mode 5 localStorage**

---

## P3 — Backlog

- [ ] **SAP Stkz BE/EE/LV/NL ic-exempt**
- [ ] **EN-Sprachversion** (deaktiviert)
- [ ] **localStorage-Migration**
- [ ] **Theme-Flash (FOUC)**

---

## ✅ Erledigt Session 9 (25–26.03.2026)

- [x] Lohnveredelung Inland-Bug (sup===con)
- [x] Vergleich-Tab ⚖ (Transport-Szenarien, Modal)
- [x] 2P AT→GB: Drittland-Zweig, A0, Hints bereinigt
- [x] 3P EU→CH + EU→GB: Diagramm + Delivery-Boxen + computeTaxGB
- [x] SAP Export: badge-export → treatment=export → A0
- [x] Dev-Overlay: JS-Tooltip, composedPath, alle Komponenten getaggt
