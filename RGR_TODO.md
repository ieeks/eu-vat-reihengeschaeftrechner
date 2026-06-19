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
- [x] **Mode 2 Drop-Shipment für EU-Kunden** — neuer `analyze2()`-Branch: EPROHA(AT) = erster Lieferant → EU-Kunde (z.B. DE) → abweichender Warenempfänger (z.B. IT) = Reihengeschäft/Dreiecksgeschäft (AF/Reverse Charge), Drittland-Empfänger = Ausfuhr (A0); `renderContextToggles()` zeigt Drop-Shipment nun für jeden EU-Kunden (Session 28)
- [x] **Warenfluss-Diagramme vereinheitlicht** — Transport-Veranlasser in 4P-Dreieck + 3P + Normalfall; 4P-SVG `max-width` 1100px, 3P 715px; 3P-Labels auf Chip-Stil (Box + Rahmen) wie 4P umgestellt (Session 28)
- [x] **K2 — `_applyQuickFix()` UID-Override gesetzeskonform** — toter lit.-a-Zweig entfernt; `uidOverride === dep` → Ausgangslieferung (Abs. 2), sonst Eingangslieferung (Grundregel Abs. 1); UID-Labels korrigiert; Tests + vat-knowledge angeglichen (Code-Review 06/2026)
- [x] **Code-Review Sofort-Gruppe** — K1 (QuickCheck Transport/UID an Engine + QC-Tests), H1 (`dep`→`from` in buildDeliveryBox), H2 (Share-Link-Länderkette restore), H3 (`getTransportLetter()`), H5 (TRANSLATIONS zur Renderzeit), M5 (`natLaw('vat')`-Key) (Code-Review 06/2026)
- [x] **Share-Link Restore: UID-Override + Lohn-Länder** — `?uid=` ging durch `onCC()` (setzt `selectedUidOverride=null`) verloren → nach Länder-Kaskade erneut anwenden; Mode 5 (Lohn) schrieb Länder in `cp-*` statt `lohnSup/Con/Cus` → eigener Restore-Zweig + `onLohnChange()`. JSDOM-Roundtrip Mode 2/3/4/5 + Override verifiziert (Session 29)
- [x] **4P-Dreieck Top-Status konsistent** — `buildTrafficStatus()` + Summary in `buildKurzbeschreibung()` filtern `ic-acquisition-no-reg`/`registration-required` bei greifendem Dreieck (wie `engRegHtml`); 4P war rot, 3P-Pendant bereits grün. Rendering-Layer, Engine unberührt. JSDOM-verifiziert (Session 30)
- [x] **QuickCheck 3P gehärtet** — 3 Bugs gefixt (Ausfuhr folgt bewegter Lieferung, kein Dreieck bei Drittland, SAP aus Abgangsland) + QC-Smoke-Tests QC-01…12 (Typ/SAP/Dreieck). 20 Output-Tests.
- [x] **QuickCheck 4-Parteien-Modus (Normalkette)** — 4 Selects, mePosition U2/U3, 3 Boxen L1/L2/L3 (2 eigene + 1 Fremdlieferung), engine-getrieben. `buildQuickCheck4()`/`_qcBox4()`. Tests QC4-01…04.
- [x] **QuickCheck 4P · Ausbaustufe 2 (Dreiecks-Überlagerung)** — `buildQuickCheck4()` überlagert die ruhende Ausgangslieferung des Beneficiary (first3→B/mePos2, last3→C/mePos3) zur Dreieckslieferung AF (EPROHA) / DH (EPDE-Pendant), `regRisk` entfällt, IG-Erwerb-Risk neutralisiert; RC-Empfänger/Erstlieferant behalten Pflichten. Spiegelt 3P-QC + Hauptpfad. QC4-01 aktualisiert. JSDOM-verifiziert (Session 31). Offen: Transport „2. ZH" (middle2) + 4P-Diagramm im QC.
- [ ] **QuickCheck Lohnveredelung** — Coming Soon: Sonderlogik aus `analyzeLohn()` ableiten.
- [x] **QuickCheck 3P · Dreieck vs. RC (L2)** — gelöst: `triangle` gewinnt über `l2IsRC` → Dreieck-L2 = AF (statt IC). IC/VI bleiben dem IT-Inlandsfall dep=dest vorbehalten. Tests QC-01/05/13/14.
- [x] **Drittländer TR/RS/BA/RU + Einführer (Importer of Record)** — neue nonEU-Länder im `EU`-Modell (Meta: customsUnion/saa/sanctions); generisches 3P-Routing `analyzeThirdImport()`/`buildThirdExportResult()`; DDP/DAP-Toggle `setImporter()`/`importerRole` leitet UID/Registrierung im Bestimmungsland ab (EPDE→SI vorhanden, ES/RU fehlen→Registrierung); RU-Sanktionswarnung, TR-Zollunion/A.TR, RS/BA-SAA. **Mode 2 (EPROHA AT-Lager) nachgezogen** (neuer `analyze2()`-Branch isNonEU(dest) → AT-Ausfuhr A0 + Toggle + Länder-Hinweis). Tests OT-3RD-* (31 grün) (Session 32).
- [x] **Drittland-Einführer UX** — Toggle + Sanktions-/Länderhinweis auf Mobile sichtbar (`data-component` + `@media`-Ausnahme); Folge-Box als Checkliste inkl. EORI-Klarstellung; irreführender IG-UID-Block bei Einfuhr ausgeblendet (`renderUIDInline`/`renderUidOverrideBlock`-Guards). Rendering/CSS, Engine unberührt (Session 33).
- [x] **Einführer-Toggle + SAP-MWSKZ für CH/GB (3P)** — Toggle in `analyzeCH`/`buildCHExportResult`/`analyzeGBImport`/`buildGBExportResult` (statische Karten ersetzt); `_importerConsequence` länderbewusst (CH/GB-Spezifika) + SAP-Codes je `importerRole` via `sapBadgeBoth` (nur vorhandene Codes, EUSt-/Lückenhinweis). 33 Tests grün (Session 34). Offen: 2P/`analyze2`-CH/GB-Karten auf Toggle umstellen; optional `SAP_TAX_MAP` um EUSt-/fehlende Länder-MWSKZ ergänzen (sobald Excel-Codes vorliegen); 4P-Drittland-Spezialpfad; pausierter app.js-Split (Tier 2).
- [x] **Drittland-Status-Ampel (CH/GB/TR/RS/BA/RU)** — `buildDrittlandStatus(ctx)` macht das Registrierungs-/Einfuhrproblem im Drittlandsfall genauso prominent wie die EU-Ampel (rot „Problem vorhanden" / grün „Kein Registrierungsproblem"). Eingebunden in alle 6 Drittland-Renderer; Status rein aus `importerRole` + `myVat` (Helper `drittlandRegCountry`), keine neue Steuerlogik. `buildTrafficStatus`-Guard auf `isNonEU` verbreitert (keine Doppelampel); Summary-Karte in `buildKurzbeschreibung` Drittland-bewusst (`showRegistrationWarn`). 36 Output- + 45 Lehrfall-Tests grün; Logik-/Integrationsmatrix JSDOM-verifiziert (Session 35). **Offen: visuelle Browserabnahme der Box-Platzierung.**
- [ ] **GB/CH-Export: Eingangsrechnung-MWSKZ fehlt + Leg-Zuordnung bei `transport=supplier` falsch** (morgen prüfen). Repro: `?co=EPDE&mode=3&transport=supplier&countries=DE,DE,GB&mePos=2` (DE→DE→GB, EPDE, Kunde=Einführer/DAP/EXW). Zwei Befunde:
  1. **Eingangsrechnung-Code wird nie gezeigt.** `_importerConsequence(country, 'export')` rendert im `importerRole==='customer'`-Zweig (app.js ~5293) **nur** `stk('Ausgangsrechnung (Ausfuhr 0 %)', …, 'export')` → G0; es fehlt die `Eingangsrechnung`-Zeile (Import-Pfad hat beide). Soll: Einkauf L1 ruhend → **VD** (Vorsteuer DE 19 %), L1 bewegt → 0 % Ausfuhr. Dafür `movingL1` in `_importerConsequence` durchreichen.
  2. **Inkonsistenz bei `transport=supplier`.** `computeTaxGB` macht L1 (Einkauf) = bewegte Ausfuhr 0 % und L2 (Verkauf) = `domestic-l2-gb` (GB-Inland). Die Box behauptet aber Ausgangsrechnung = G0 (Ausfuhr) statt GB-Inland. Zusatz: `isIExporter = (s1 === myCode)` in `buildGBExportResult` (~5193) vergleicht **Länder** statt Parteien → bei s1=s2=DE schlägt „Du bist Exporteur" fälschlich an. Fix: Ausgangsrechnung-Behandlung an `computeTaxGB`/`movingL1` koppeln; `isIExporter` partei- statt länderbasiert.
  → Empfehlung: (1) + (2) zusammen, da verzahnt. Vermutlich auch CH-Export (`_importerConsequence(..., 'export')` teilt denselben Zweig) prüfen.
- [ ] **Scope B (Backlog, niedrig):** bewusst gewählte dep-UID auch ohne `vatIds`-Eintrag wirken lassen (`LIT-C-02`). Berührt Registrierungs-Risiko-Logik; in der echten UI nicht erzeugbar → vorerst zurückgestellt.

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
  - ~~**Offen (2) — Bug:** `docs/v1/index.html` ?v=dev wird vom Deploy-sed nicht erfasst~~
    → **gefixt (Session 28):** `pages.yml`-sed verarbeitet jetzt `docs/index.html` *und* `docs/v1/index.html`.
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
