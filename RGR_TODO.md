# RGR TODO — Reihengeschäftsrechner v4.3

Stand: 15.05.2026

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
- [ ] **3P CH/GB Browsertest** — B003a (AT→AT→CH middle), B003b (AT→DE→CH supplier), GB analog
- [x] **Arrow-Labels 3P-Dreieck** — Steuersatz + Behandlung restauriert, Positionierung oberhalb Pfeil korrigiert (Session 22)
- [x] **Vergleich-Tab scrollbar auf iPad Air** — `min-height: 0` + `-webkit-overflow-scrolling: touch` auf `.pane-right-body` (Session 23)
- [x] **Self-hosted Fonts** — Google Fonts Abhängigkeit entfernt, woff2 lokal in `docs/assets/fonts/` (Session 23)
- [x] **PDF-Export** — `window.print()` + verbesserter `@media print`: Titel, nur aktiver Tab, kollabierte Sektionen aufgeklappt (Session 23)
- [x] **SAP-Badge L1-Delivery-Box** — bei Inlands-Reihengeschäft kein Badge gerendert; korrigiert (Session 24)
- [x] **OT-M2 Browser-DOM-Robustheit** — Tests setzen cp-0/cp-1 explizit; stale DOM-Wert aus Mode-3-Session verhindert (Session 24)
- [x] **vat-knowledge Referenzfälle + Buchungskreis-Doku** — `reference-cases.md`, `at/eproha-buchungskreise.md`, `de/epde-buchungskreise.md` (Session 24)

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
- [ ] **Typeahead Länder-Picker** — Native select ersetzen
- [ ] **REAL_CASES_2026 Tests** — HU→DE EXW, Sappi DE→EPDE→IT, BG→AT→BG, BG→DE→BG Inland-Hint prüfen
- [ ] **Vergleich-Tab: Struktur-Dimension** — 3P/4P/Dreieck als zweite Achse
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

- [ ] **vat-knowledge: Inlands-Reihengeschäft-Seite** — eigene Seite für § 3 Abs. 6 UStG, analoges Format zu den Buchungskreis-Dateien
- [ ] **vat-knowledge: bekannte Grenzfälle** — BG→AT→BG, HU→DE EXW, Sappi DE→EPDE→IT
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
