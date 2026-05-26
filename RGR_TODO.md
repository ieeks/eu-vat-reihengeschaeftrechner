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
  - Struktur lokal verifiziert (Session 28): relative Pfade (`./assets/...`) ✓ funktionieren
    sowohl auf Custom-Domain-Root als auch auf Projekt-Subpfad; 9 self-hosted woff2 in
    `docs/assets/fonts/` + `docs/v1/assets/fonts/` referenziert ✓, keine Google-Fonts-Reste ✓;
    `index.html`-Redirect `→ ./docs/` ✓; v1/v2-Toggle-Links (`./v1/index.html` / `../index.html`) ✓;
    `npm run check:pages` ✓; keine absoluten `/assets`-Pfade ✓.
  - **Offen (1):** Live-URL-Render im echten Browser — in der CI-Umgebung nicht prüfbar
    (Outbound-Fetch geblockt, 403 auf github.io + manuel-app.dev).
  - **Offen (2) — Bug:** `docs/v1/index.html` enthält `?v=dev`, aber das Deploy-sed in
    `pages.yml` ersetzt nur `docs/index.html` → für den v1-Fallback greift kein Cache-Busting.
  - **Offen (3):** Kein CNAME-File im Repo trotz Custom-Domain `manuel-app.dev` — Domain
    nur in Pages-Settings? Bei Actions-Deploy ggf. prüfen, ob Domain pro Deploy erhalten bleibt.

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
