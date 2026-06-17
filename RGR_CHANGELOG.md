# RGR Changelog — Reihengeschäftsrechner

---

## v4.3 · 17.06.2026 — Code-Review Sofort-Gruppe (K1, H1, H2, H3, H5, M5)

### Fix · K1 — QuickCheck übergab Engine Buchstaben statt kanonischer Transport-Werte
- `buildQuickCheck()` mappte `transport` auf `'A'/'B'/'C'` und übergab den Buchstaben an `VATEngine.run()`; die Engine vergleicht aber gegen Wörter → **jeder** QuickCheck fiel auf `movingIndex 0`. „Kunde holt ab" zeigte fälschlich L1, die Dreieckssperre Art. 141 lit. e griff nie. Zusätzlich wurde `uidOverride` als UID-String statt Länderkürzel übergeben (immer ignoriert).
- **Fix:** `transport` (bereits kanonisch) direkt durchreichen, `uidOverride: _triUid.country`. Neue Smoke-Tests `QC-01..04` (movingL1/Dreieck je Transport-Variante) in `runOutputTests` → 12 Output-Tests.

### Fix · H1 — `dep` undefinierte Variable in `buildDeliveryBox()`
- `const pos = … (isMoving ? dep : dest)` griff das implizite Window-Global des `<select id="dep">` → falsche SAP-Badges bei CH/GB-Pfaden. **Fix:** `from` (Abgangsland der jeweiligen Strecke) statt `dep`.

### Fix · H2 — Share-Link-Länderkette wurde geschrieben, nie wiederhergestellt
- `shareLink()` serialisierte `countries=…`, aber weder `handleURLParams()` noch `init()` schrieben sie zurück (cp-*-Selects existieren erst nach `renderAll()`/`renderPickers()`). **Fix:** Länderkette nach `renderAll()` anwenden (URL > localStorage, Validierung gegen `EU_MAP`), dann `onCC()`. Behebt zugleich die latent gleiche Lücke beim localStorage-Restore.

### Fix · H3 — `['A','B','C','D'].indexOf(selectedTransport)` immer −1
- `selectedTransport` ist immer ein Wort → Begründungstext zeigte „Transporteur: undefined". **Fix:** `getTransportLetter()` (beide Vorkommen).

### Fix · H5 — Firmen-abhängige TRANSLATIONS beim Parsen eingefroren
- `header.sub`/`dreiecks.title`/`eug.subtitle` evaluierten `currentCompany` mit Startwert `EPDE` → EPROHA-Banner zeigte dauerhaft „§ 25b" statt „Art. 25 UStG AT" (Regel 2). **Fix:** Keys als Funktionen, `T()` löst funktionswertige Einträge zur Renderzeit auf.

### Fix · M5 — `natLaw('vat')` — Key existierte nicht
- Output zeigte „Vorsteuerabzug gem. vat." **Fix:** `'vat'`-Key ergänzt (§ 12 UStG AT / § 15 UStG / Art. 167 ff. MwStSystRL), Aufruf mit Lieferland-Override (`natLaw('vat', sup)`); Dev-Mode-Warnung bei unbekanntem Key.

---

## v4.3 · 17.06.2026 — Code-Review K2

### Fix · `_applyQuickFix()` UID-Override: Abgangsland-UID-Logik korrigiert (Art. 36a)

- **Bug (K2, CODE_REVIEW_2026-06):** Im Override-Zweig von `_applyQuickFix()` war der `lit. a`-Pfad durch einen widersprüchlichen Guard (`uidOverride === dep && !hasDepVat`, bei gleichzeitig erzwungenem `vatIds[uidOverride]`) **toter Code**. Jeder manuelle UID-Override landete im else-Zweig mit `movingIndex = chainIndex` — d. h. **jede** mitgeteilte UID verschob die Bewegung fälschlich auf die Ausgangslieferung. Da der UID-Block (`renderUidOverrideBlock`) beim Render automatisch `opts[0]` als Override setzt, feuerte der Bug bei transportierenden Zwischenhändlern ohne Abgangsland-UID **ohne jeden Klick** (z. B. `IT→EPDE(DE)→DE`, `FR→EPDE(DE)→IT`) → vorgetäuschte Registrierungspflicht im Abgangsland.
- **Fix (Engine, gesetzeskonform):** Override-Zweig folgt jetzt Art. 36a Abs. 1/2: `uidOverride === dep` → Ausnahme Abs. 2 → `chainIndex` (Ausgangslieferung); jede andere gehaltene UID → Grundregel Abs. 1 → `chainIndex - 1` (Eingangslieferung). Automatik-Pfad unverändert (war bereits korrekt).
- **UI:** UID-Auswahl-Labels von „lit. a / lit. b" auf die tatsächliche Wirkung umgestellt (`… (Abgangsland) — Ausgangslieferung bewegt` / `… — Eingangslieferung bewegt`); dep-UID bleibt sinnvolle Vorwahl.
- **Tests:** `LF-02c`, `DG-02`, `LF-04c` (→ L1 bewegend), `C037m-ALTB` (→ L2 bewegend), `LF-02d` (Code liefert jetzt rechtlich korrektes L2, Limitation entfernt) angepasst. Alle 45 Lehrfall-Tests + 8 Output-Tests grün.
- **Doku:** `art36a_mwstrl.md`, `moving_supply_logic.md`, `reference-cases.md` (A2, B2/Alt B, E2-Matrix) an die korrekte Auslegung angeglichen.
- **Bewusst offen (knownLimitation):** `LIT-C-02` — bewusst gewählte dep-UID greift nur bei vorhandener `vatIds`-Registrierung; in der echten UI nicht erzeugbar (Scope B nicht umgesetzt).

---

## v4.3 · 26.05.2026 — Session 28

### Fix · Vergleich-Tab „lädt nicht" außerhalb 3P-grenzüberschreitend

- **Bug:** Der Header-Button `⚖ Vergleich` war immer sichtbar, der Tab-Inhalt wird aber nur im 3P-grenzüberschreitenden Hauptpfad (`analyze()`) gebaut. In 4P / 2P / Lohn / Inland / CH-/GB-Export war `tabBtnVergleich` versteckt und das Panel leer — der Header-Button öffnete ein leeres Panel.
- **Fix:** `setVergleichBtnVisible()` synchronisiert jetzt **beide** Buttons (Tab-Bar + Header-View). `renderResult()` setzt die Verfügbarkeit am Anfang auf „aus"; nur die 3P-Gate schaltet sie ein (gemeinsamer Choke-Point, deckt alle Early-Return-Pfade ab). Der activeTab-Revert (`revertVergleichIfHidden()`) läuft am Ende von `renderResult` — so wird der Nutzer bei legitimen 3P-Re-Renders **nicht** aus dem Vergleich-Tab geworfen. `switchView('vergleich')` fällt zusätzlich defensiv auf Standard zurück, wenn der Tab nicht verfügbar ist. Header-Button startet in `index.html` versteckt.

### 4P-Diagramm · Kontrast der ruhenden Labels & Knoten

- **Lesbarkeit auf Desktop (und Mobile) verbessert** — in `buildChainSVG4` nutzten nicht-hervorgehobene Knoten `COL_BORDER` (#e8e7e4) auch als **Textfarbe** der Rollen-Zeile (`Lieferant (A)`, `2. ZH (C)`, `Kunde (D)`) → quasi unsichtbar; ruhende Chips (L2/L3) hatten Text in `COL_TX3` (#9ca3af) → zu blass. Neu: Rahmen- und Textfarbe getrennt — Rollen-Text in `--tx-2`, ruhende Chip-Texte in `--tx-2`, die **gestrichelte Linie bleibt dezent** (`--tx-3`). In `buildTriangleSVG4` zusätzlich der End-Kunde (D, `COL_BORDER`) lesbar gemacht. Schriftgrößen und Layout unverändert.

### 4P-Diagramm · Mobile-Lesbarkeit

- **4P-SVG auf Phone nicht mehr unleserlich klein** — die 4P-viewBox (800) wurde per `width:100%` auf ~360px-Screens auf ~0.45× geschrumpft → 8.5px-Text landete bei ~3.8px (nur L1 fiel durch die kräftige Farbe auf). Neu: Marker-Klasse `flow-diagram-4p` an beiden 4P-Buildern; Mobile-Regel `min-width: 680px` auf das SVG → der vorhandene `overflow-x:auto`-Scroll der `.flow-diagram` greift, Text bleibt lesbar (~7px, über dem akzeptierten 3P-Niveau). Desktop und 3P (viewBox 520) unverändert.

### Länder-Picker · Dropdown schiebt Inhalt statt zu überlagern

- **Typeahead-Dropdown jetzt in-flow** — bisher `position: absolute` (Overlay über Transport/UID). Neu: Dropdown wird als **2. Grid-Zeile (Spalte 2)** direkt ins `.picker-grid` gehängt (`grid-column: 2`), per `max-height`-Transition animiert (0 → 240px). Beim Öffnen „gleitet" der Transport-/UID-Bereich sanft nach unten, beim Auswählen/Schließen wieder zurück. Der A/B/C-Kreis bleibt in Zeile 1 am Input ausgerichtet (`align-items: end`, `row-gap: 0`) — robust auch bei umbrechenden Labels (4P).

### 3P-Diagramm · Chip-Labels wie 4P

- **`arrowLabel` (in `buildTriangleSVG`) auf Chip-Stil umgestellt** — bisher nackter Mono-Text, jetzt Box mit farbigem Rahmen + Surface-Fill (opacity 0.96) wie `edgeLabel` im 4P-Diagramm. Labels werden auf dem Pfeil-Mittelpunkt zentriert (statt mit `-26` darüber). Betrifft 3P-Modus **und** Drop-Shipment-Modus (beide rendern über `buildTriangleSVG`).

### Mode 2 · Drop-Shipment für EU-Kunden (Reihengeschäft / Dreiecksgeschäft)

- **Neuer `analyze2()`-Branch** — bisher griff der Drop-Shipment-Pfad nur, wenn der Kunde in **AT** sitzt. Neu: EPROHA(AT) als **erster Lieferant** an einen **EU-Kunden (z. B. DE)** mit **abweichendem Warenempfänger-Land (z. B. IT)**. Bedingung: `dropShipDest && dropShipDest !== dest && dropShipDest !== 'AT' && !isNonEU(dest)`. Bestehende Pfade unberührt (Regel: nur **neue** Branches in `analyze2()`).
  - EU-Warenempfänger → **Dreiecksgeschäft** (Art. 25 UStG AT / Art. 141): EPROHA = steuerfreie ig. Lieferung 0 % (**AF**), AT-UID → Kunden-UID, ZM auf Kunden-UID, Gelangensnachweis aus dem Empfängerland; Kunde = mittlerer Unternehmer (deemed taxed, keine Registrierung), Empfänger = Reverse Charge.
  - Drittland-Warenempfänger (CH/GB) → **Ausfuhrlieferung** (**A0**, § 7 UStG AT / Art. 146).
- **`renderContextToggles()` generalisiert** — Drop-Shipment-Sektion erscheint nun für **jeden EU-Kunden** (`!isNonEU(kundeCountry)`), nicht nur AT; Warenempfänger-Optionen schließen das **Kundenland** aus (`c.code !== kundeCountry`). „Nein"-Label neutralisiert.

### Warenflussdiagramm 4P (Normalfall)

- **`buildChainSVG4()` neu** — gestuftes Diamant-/Ketten-SVG im Referenz-Stil (B021j) für den **4-Parteien-Normalfall ohne Dreiecksvereinfachung**. Ersetzt das bisher verwendete horizontale Fallback-Layout. Rechnungskette A→B→C→D oben, physische Warenbewegung A→D als gerade Achse unten mit **Transport-Veranlasser-Label** (`getTransportLetter()` → „Transport durch DE (B) veranlasst").
- **Behandlung pro Strecke statt Länder-Sätze in Boxen** — Hintergrund: Im alten Layout zeigten die Boxen `rate(p.code)%` (statischer Länder-Regelsatz, z. B. NL 21 %, BE 21 %), was wie ein Liefer-Steuersatz aussah und verwirrte. Jetzt trägt jede Strecke ihr echtes Label: bewegte Lieferung = `IG · 0%` (bzw. `Ausfuhr · 0%` bei Drittland-Bestimmung via `isNonEU(dest)`), ruhende Lieferung = `Regelsatz % am Lieferort` (vor bewegt → Abgangsland, nach bewegt → Bestimmungsland). Ableitung **nur** aus bestehendem `movingIdx`/Lieferort — keine neue Steuerlogik (Regel 11).
- **Routing in `buildFlowDiagram()`** — 4P-Zweig: `isDreiecks` → `buildTriangleSVG4()` (Diamant), sonst → `buildChainSVG4()`. 3P (`buildTriangleSVG`) und 2P/Mode-2-Fallback unverändert.
- **„Ich"-Knoten** hervorgehoben (blauer Rahmen) + UID-Zeile bei `selectedUidOverride`.
- **Transport-Veranlasser im Dreieck-SVG** — `buildTriangleSVG4` zeigt auf der Warenfluss-Achse jetzt „Transport durch X (L) veranlasst" (via `getTransportLetter()`) statt des statischen „Direkte Warenbewegung …"-Texts, analog zum Normalfall-Diagramm und zum Referenz-Stil (B021j: „Transport durch U2 veranlasst").
- **3P-Diagramm angeglichen** — `buildTriangleSVG` zeigt nun ebenfalls „Transport durch X veranlasst" auf der Warenfluss-Achse (via `getTransportLetter()`, Mapping A/B/C) und `max-width` 520px→715px (gleicher Skalierungsfaktor ≈1.375× wie die 4P-Diagramme), Text `font-size 9 weight 500`.
- **4P-SVG auf 1100px** — `max-width` beider 4P-Diagramme 900px→1100px; Warenfluss-Text `font-size 11`→`9` gegengeregelt, damit er bei stärkerer Skalierung (viewBox 800) on-screen proportional bleibt.
- **4P-SVG größer + Transport-Text lesbarer** — `max-width` beider 4P-Diagramme von 700px auf 900px erhöht (viewBox 800 wurde vorher auf 0.875× herunterskaliert); Warenfluss-Text „Transport durch X veranlasst" von `font-size 8.5` auf `11` (+`font-weight 500`).
- **Größe/Legende beider 4P-SVGs** — `buildTriangleSVG4` (Dreieck) + `buildChainSVG4` (Normal): SVG `max-width:700px;margin:0 auto` (vorher unbegrenztes `width:100%` → Überskalierung auf breiten Screens); Legende `0.65rem`→`0.74rem`, Farbe `--tx-3`→`--tx-2` (lesbarer).

### Hosting-Audit + TODO-Pflege

- **Live-Hosting (statisch) verifiziert** — relative Asset-Pfade, 9 self-hosted Fonts (kein Google), `index.html`-Redirect, v1/v2-Toggle-Links und `check:pages` ✓. Live-URL-Render im Browser in CI-Umgebung nicht prüfbar (Outbound geblockt).
- **Cache-Busting v1 gefixt** — `pages.yml`-sed ersetzt den `?v=`-Platzhalter jetzt in `docs/index.html` **und** `docs/v1/index.html` (vorher nur v2 → v1-Fallback bekam dauerhaft `?v=dev`). Offen bleibt: kein CNAME-File trotz Custom-Domain `manuel-app.dev` (erst Pages-Settings prüfen, bevor CNAME angelegt wird).
- **Bulk-Modus / CSV-Batch (Highlight #3) aus TODO entfernt** — wird nicht umgesetzt (Entscheidung Nutzer).

### Nicht angefasst
- VATEngine IIFE
- analyze() / analyze2()
- `buildTriangleSVG` (3P), `buildTriangleSVG4` (4P Dreieck), horizontaler 2P-Fallback

---

## v4.3 · 20.05.2026 — Session 27

### vat-knowledge

- **`nl/wet_ob_nl_reihengeschaeft.md`** — neue Länderdatei für die Niederlande (EPDE NL-UID NL827914052B01, Direktregistrierung ohne Betriebsstätte). Dokumentiert Art. 5 Wet OB (Lieferort), **Art. 12 Abs. 3 Wet OB als RC-Sonderfall trotz Direktregistrierung** (einziger EPDE-Buchungskreis mit erlaubtem RC), Art. 37c Wet OB (Dreiecksgeschäft NL als Bestimmungsland, 5 Bedingungen inkl. Bed. 3 Code-Edge-Case `dest==='NL' && s1==='NL'`), Art. 37a Wet OB (ZM monatlich). Verweist auf `SAP_TAX_MAP['EPDE']['NL']` (NC/NI/NP), `RC_WORDING['NL']` und `computeTax()`-RC-Fallback bei `domestic.out===null`. Abgrenzung zu BE/PL/CZ/SI/LV/EE (RC dort blockiert).
- **Index aktualisiert** — `CLAUDE-vat-knowledge.md` Pflichtlektüre-Tabelle um Eintrag „NL-RC / NL-Dreieck" erweitert, neuer Abschnitt „Niederlande (`nl/`)" im Datei­index. `CLAUDE.md`: vat-knowledge-Zähler 16 → 17, Länder-Liste EU/AT/DE/CH/NL.

- **`reference-cases.md` Fall C4** — verifizierter EPDE-Produktionsfall `AT→EPDE(NL-UID)→NL`, Transport durch AT-Lieferant: L1 IG-Lieferung AT→NL (SAP NP für EPDE-Eingang), L2 NL-RC (SAP NC) statt § 25b-Dreieck (durch NL-UID blockiert nach Art. 141 lit. a). Direkter Vergleich der UID-Wahl NL vs. DE (wirtschaftlich identisch, unterschiedlicher Rechtsweg + Meldepflicht). SAP-Kurzreferenz oben um NP/NC/NI ergänzt. Querverweis in `nl/wet_ob_nl_reihengeschaeft.md` als Praxisbeispiel-Sektion.
- **NL-Datei gegen Primärquellen verifiziert** — Art. 5 lid 1 a, Art. 9 lid 1 (Wortlaut „De belasting bedraagt 21 percent"), Art. 12 lid 3, Art. 37a, Art. 37c gegen wetten.overheid.nl, Belastingdienst und Vakstudie-Encyclopedie geprüft. Korrekturen: (1) Art. 37c hat gesetzlich **3 onderdelen a/b/c** statt 5 — die „5 Bedingungen" sind eine Praxis-Lesart, die Art. 37c + Art. 12 lid 3 + Art. 37a kombiniert; (2) NL-Wortlaut verlangt strenger als EU-RL, dass Partij C in NL **gevestigd** sein muss, nicht nur geregistreerd (Art. 37c b juncto Art. 12 lid 3) — Belastingdienst wendet aber richtlinienkonforme Auslegung an; (3) Art. 37a ICP-Quartalsoption bei IG-Warenlieferungen < EUR 50.000/Quartal ergänzt. Quellen-Footer in der Datei.

### rechtskonformitaet.md

- **D2 ergänzt** — „NL-Dreiecksgeschäft: milde Belastingdienst-Auslegung statt strenger Wortauslegung". Spiegelbild zu D1: Tool folgt der milden Verwaltungspraxis (bloße NL-Registrierung des C reicht), obwohl Art. 37c onderdeel b iVm. Art. 12 lid 3 Wet OB wörtlich Ansässigkeit verlangt. Konsistenzprinzip mit D1: Tool spiegelt jeweils die tatsächliche Verwaltungspraxis, nicht den Wortlaut. Reverse-Trigger + Revisionspfad dokumentiert.

### Nicht angefasst
- VATEngine IIFE
- analyze() / analyze2()
- `docs/`-Code (reine Dokumentations-Session)

---

## v4.3 · 20.05.2026 — Session 26

### SAP-Steuerkennzeichen

- **AF vs. A0 korrigiert** — AF = steuerfreie IG-Lieferung EU (EPROHA AT-UID); A0 = Ausfuhr Drittland (CH, UK, CN …). Korrektur in CLAUDE.md-Dokumentation und `SAP_TAX_MAP`-Kommentaren.
- **ic-exempt + ic-acquisition: OUT = IN** — IG-Buchungen (Lieferung + Erwerb) buchen dasselbe MWSKZ für Ausgangs- und Vorsteuerseite, Netto = 0. Betrifft alle UIDs: AT (AF/VE), DE (DH/VH), CZ (OB/UR), SI (C1/EC), PL (T1/W5), BE (BP), IT (IP), EE (EP), LV (LP), NL (NP). Vorher hatte ic-exempt `in:null` und ic-acquisition `out:null`.

### UI

- **Header größer** — `height` 52 → 60 px; `h-title` 15 → 17 px; Mode-Tabs + Co-Pill 13 → 14 px; Logo-Icon 26 → 28 px. Mobile bleibt bei 44 px.
- **Typeahead-Länderpicker aktiviert** — `initTypeaheadPickers()` war vollständig implementiert aber nie aufgerufen. Jetzt nach `renderPickers()` (Moduswechsel) und einmalig beim `DOMContentLoaded`. Tippen filtert sofort (Name + ISO-Code), Arrow-Keys + Enter zur Auswahl, Escape schließt.
- **Typeahead Emoji-Bug behoben** — Flag-Emojis (2 Unicode-Zeichen) wurden beim Überschreiben per `input.select()` nicht vollständig ersetzt → Filter bekam Alttext als Query. Fix: `input.value = ''` on focus statt `input.select()`.

### Bugfixes Vergleich-Tab

- **`sapCode()`: ic-exempt → ic-acquisition für Käufer** — VATEngine speichert `vatTreatment = 'ic-exempt'` für bewegte Lieferungen aus Verkäufer-Sicht, unabhängig von der Perspektive. Vergleich hat das direkt übergeben → zeigte Verkäufer-Code auch für Käufer. Fix: `iAmTheBuyer && treatment === 'ic-exempt'` → `treatment = 'ic-acquisition'`. Bug wurde durch OUT=IN-Fix sichtbar (vorher war `ic-exempt.in = null` → stilles `''`).
- **`sapCode()`: uidCountry übergeben** — ohne `uidCountry` fiel `_sapEffectiveCountry` auf `home='DE'` zurück → DH statt NP. Jetzt: `selectedUidOverride || myHome` wird übergeben.
- **`sapCode()`: Käufer ic-acquisition bevorzugt Zielland-UID** — ig-Erwerb findet im Bestimmungsland statt. Wenn EPDE dort registriert ist (`MY_VAT_IDS[dest]` vorhanden), wird `dest`-UID verwendet statt home-UID. Beispiel: dest=NL → NP statt VH.

### Nicht angefasst
- VATEngine IIFE
- analyze()
- analyze2() Kernpfade

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
