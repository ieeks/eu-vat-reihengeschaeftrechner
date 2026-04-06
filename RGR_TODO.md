# RGR TODO — Reihengeschäftsrechner v4.2

Stand: 06.04.2026

---

## P0 — Kritisch

- [x] **Vergleichsmodus fachlich harmonisieren** — `⚖ Vergleich` 1:1 mit Hauptanalyse konsistent (Session 17: statusCell/recommendationCell/reasonCell/art41Cell + dreiecksOpportunity pro Szenario)
- [x] **Lokale UI-/Code-Änderungen bewusst nachziehen** — Session 16 committed/pushed (04.04.2026)
- [ ] **Release v4.2** — Finale Browserabnahme der `docs/`-App
- [ ] **3P CH/GB Browsertest** — B003a (AT→AT→CH middle), B003b (AT→DE→CH supplier), GB analog

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

- [ ] **Drop-Shipment Browserabnahme** — Mode 2 / EPROHA / Kunde=AT / Warenempfänger=DE (und Drittland) manuell prüfen
- [ ] **Typeahead Länder-Picker** — Native select ersetzen
- [ ] **REAL_CASES_2026 Tests** — HU→DE EXW, Sappi DE→EPDE→IT, BG→AT→BG
- [ ] **Vergleich-Tab: Struktur-Dimension** — 3P/4P/Dreieck als zweite Achse

---

## P2 — Nice-to-have

- [ ] **Code-Modularisierung** — IIFE-Module, tieferer AppState nach UI-Helper-Basis
- [ ] **External Verify Button**
- [ ] **Belegnachweis-Checkliste** (nur Expert)
- [ ] **PDF-Export**
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
