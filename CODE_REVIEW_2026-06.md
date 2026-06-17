# Code-Review — EU VAT Reihengeschäftsrechner (v4.3)

**Datum:** 2026-06-10 · **Stand:** `4356ad8` (main) · **Umfang:** `docs/assets/scripts/app.js` (vollständig, ~12.100 Zeilen), `docs/index.html`, `docs/assets/styles/app.css`, `scripts/serve.mjs`, `.github/workflows/pages.yml`, `package.json`, `docs/v1/`-Struktur.

Die drei kritischsten Befunde (K1, K2, H1) wurden direkt am Code gegenverifiziert.

---

## Zusammenfassung

Die Codebasis ist für eine framework-lose 12k-Zeilen-App erstaunlich diszipliniert: VATEngine als isolierte IIFE, State-Helper, drei eingebaute Test-Suiten, durchgängig abgesicherter localStorage, sauberer Path-Traversal-Schutz im Dev-Server, minimale Workflow-Permissions, fachlich tiefe Domänenmodellierung (Art. 36a, EuGH-Rechtsprechung, SAP-Mapping).

Die gravierendsten Probleme sitzen an den **Nahtstellen zwischen UI und Engine** (Format-Mismatches bei `transport` und `uidOverride`) sowie in der **Koexistenz dreier Code-Generationen** (v3.2-Leichen, Engine, v4-Rendering) mit teils duplizierter, divergierender Steuerlogik. Dazu kommt durchgängig fehlendes HTML-Escaping bei `innerHTML`-Rendering.

---

## 🔴 Kritisch (fachlich falsche Ergebnisse)

### K1 — QuickCheck übergibt der Engine Buchstaben statt kanonischer Transport-Werte
`app.js:11680-11697` — **verifiziert**

`buildQuickCheck()` mappt `transport` via `{ supplier:'A', middle:'B', customer:'C' }` und übergibt den **Buchstaben** an `VATEngine.run()`. Die Engine vergleicht aber nur gegen Wörter (`transport === 'supplier'` etc., `app.js:812-841`) → jeder QuickCheck fällt in den Default `movingIndex: 0`:

- Bei „Kunde holt ab" zeigt der QuickCheck **fälschlich L1 als bewegte Lieferung** (statt L2).
- Die Dreiecks-Sperre Art. 141 lit. e (`transport === 'customer'`, `app.js:1061`) greift **nie**.
- Zusätzlich wird `uidOverride: _triUid.uid` als **UID-String** (z. B. `DE449663039`) übergeben; die Engine erwartet ein **Länderkürzel** (`vatIds[uidOverride]`, `app.js:860`) → der Quick-Fix-Override im QuickCheck wird immer ignoriert.

**Fix:** `transport: transport` direkt durchreichen (qcState ist bereits kanonisch) und `uidOverride: _triUid.country` übergeben. QC-Smoke-Test für `movingL1` je Transport-Variante ergänzen.

### K2 — `_applyQuickFix()`: lit.-a-Zweig unerreichbar, alle Overrides liefern dasselbe Ergebnis
`app.js:860-892` — **verifiziert** · ✅ **BEHOBEN (17.06.2026, Branch `claude/code-review-k2-feedback-vxnhj6`)**

> **Resolution:** Override-Zweig auf Art. 36a Abs. 1/2 umgestellt (`uidOverride === dep` ⇒ `chainIndex`, sonst ⇒ `chainIndex - 1`), UID-Labels korrigiert, Auto-Vorwahl bevorzugt dep-UID. Verifiziert gegen `vat-knowledge/` (Widerspruch zwischen `LF-02c`/A2 und `LIT-C-01/02`/F2 aufgelöst zugunsten der Gesetzeslage). Tests `LF-02c`/`DG-02`/`LF-04c`/`C037m-ALTB`/`LF-02d` angepasst; 45 Lehrfall- + 8 Output-Tests grün. Doku (`art36a_mwstrl.md`, `moving_supply_logic.md`, `reference-cases.md`) angeglichen. Scope B (Guard-Lockerung für nicht gehaltene dep-UID, `LIT-C-02`) bewusst nicht umgesetzt — in der echten UI nicht erzeugbar.

Der Guard (Z. 860) verlangt `vatIds[uidOverride] !== undefined`; die Bedingung `overrideIsDepUid` (Z. 863) verlangt gleichzeitig `uidOverride === dep && !hasDepVat` — Widerspruch, da `hasDepVat = !!vatIds[dep]`. Folge: Der lit.-a-Zweig ist **toter Code**, und **jeder** manuelle UID-Override landet im else-Zweig mit `movingIndex = chainIndex` (Ausgangslieferung bewegt) — unabhängig davon, welche UID gewählt wurde.

Nach Art. 36a Abs. 2 MwStSystRL verschiebt aber nur die **Abgangsland-UID** die bewegte Lieferung auf die Ausgangslieferung; Heimat-/dest-UID müsste beim Default (Eingangslieferung bewegt, `chainIndex - 1`) bleiben. Wählt der User z. B. bei dep=FR explizit die AT-Heimat-UID, kippt das Ergebnis fälschlich von L1-bewegt auf L2-bewegt. Das widerspricht auch dem eigenen Kommentar (Z. 838-839).

**Vorgehen:** Wegen Never-Touch nicht direkt patchen — zuerst gegen Referenzfälle in `vat-knowledge/` verifizieren und gezielt freigeben. Soll-Logik: `uidOverride === dep` ⇒ `chainIndex`, sonst ⇒ `chainIndex - 1`.

### K3 — Kein HTML-Escaping im gesamten Rendering-Layer
`app.js` gesamt; konkreter Vektor: `app.js:6032, 6309-6314`

Es existiert **keine** `escapeHtml`-Funktion; sämtliches HTML wird per Template-String gebaut und via `innerHTML` gesetzt. Heute meist durch konstante Eingaben (Selects, `EU`-Tabelle) entschärft — aber `#customerUid` ist ein **Freitext-Feld**, dessen Wert in `getCustomerUidInfo()` nur per `.toUpperCase().replace(/\s/g,'')` normalisiert und dann als `<strong>${custInfo.uid}</strong>` in Meldungs-Strings eingebettet wird. `<`, `>`, `"` bleiben erhalten.

**Fix:** Zentrale `esc()`-Funktion einführen und auf alle nicht-konstanten Interpolationen anwenden (insbesondere `rH()` Z. 2032 und die UID-Meldungen); `custInfo.uid` zusätzlich auf `[A-Z0-9]` whitelisten. Flankierend: CSP-Meta-Tag in `docs/index.html` (siehe I2).

---

## 🟠 Hoch

### H1 — Undefinierte Variable `dep` in `buildDeliveryBox()`
`app.js:3310` — **verifiziert**

`const pos = placeOfSupply || (isMoving ? dep : dest) || dest;` — `dep` ist weder Parameter noch Closure-Binding. Es greift das **implizite Window-Global des `<select id="dep">`** (docs/index.html) → `pos` wird ein HTMLSelectElement statt eines Ländercodes. Bei Aufrufen ohne `placeOfSupply` für bewegte Lieferungen (CH/GB-Pfade, `app.js:2979, 3001`) liefert die SAP-Badge-Berechnung falsche/keine Ergebnisse.

**Fix:** `dep` als expliziten Parameter aufnehmen oder Fallback auf `from` umstellen (bei bewegter Lieferung ist `from` das Abgangsland).

### H2 — Share-Link-Roundtrip defekt: `countries` wird geschrieben, nie geparst
`app.js:9876-9884` vs. `app.js:11566-11584`

`shareLink()` serialisiert `countries=DE,AT,IT`, `handleURLParams()` liest nur `co/mode/transport/mePos/uid/theme`. Ein geteilter Link reproduziert die Länderkette beim Empfänger **nicht** — das Kernfeature des Links.

**Fix:** In `handleURLParams()` den Parameter splitten, gegen `EU`-Codes validieren und in die `cp-*`-Selects schreiben (analog `saved.countries` in `init`, `app.js:12093-12098`).

### H3 — `['A','B','C','D'].indexOf(selectedTransport)` liefert immer -1
`app.js:11302, 11322-11334` (analog `app.js:10900` im toten Code)

`selectedTransport` wird via `setState()` immer als Wort gespeichert. `renderExpertLegal()` rendert dadurch `Transporteur: undefined — <Abgangsland>` und zeigt immer den Zwischenhändler-Begründungstext. Genau der Fall, vor dem CLAUDE.md warnt („keine ad-hoc Transport-Normalisierung").

**Fix:** `getTransportLetter()` verwenden.

### H4 — Dreieckserkennung im 4P-Rendering dupliziert und weicht von der Engine ab
`app.js:3523-3534` vs. `app.js:1126-1135`

`buildDreiecks4Result()` berechnet `last3/first3/mid3` selbst neu und fordert für `first3` `s3===dest` — was `_detectTriangle4()` laut eigenem Kommentar explizit **nicht** fordert. Folge: Engine meldet `triangle.possible=true`, Rendering ermittelt `dtype=null` → Banner zeigt `typLabel='?'`. Verstößt gegen Regel 11 (Decision Flow nur aus Engine-Output).

**Fix:** `dtype` aus `triangleResult.allVariants`/`primary` der Engine durchreichen statt Bedingungen zu duplizieren.

### H5 — Company-abhängige TRANSLATIONS werden beim Laden eingefroren
`app.js:574, 602, 608`

`'dreiecks.title'` u. a. enthalten `currentCompany === 'EPROHA' ? … : …`, werden aber beim Parsen mit dem Startwert `EPDE` evaluiert. Für EPROHA zeigt der Dreiecks-Banner dauerhaft **„§ 25b UStG" statt „Art. 25 UStG AT"** — Verstoß gegen kritische Regel 2 („AT: Art. nicht §").

**Fix:** Die drei Keys als Funktionen oder via `natLaw()` zur Renderzeit auflösen.

### H6 — Auto-lit.-b-Rationale wählt falsche/keine UID
`app.js:917-924` · ⚠️ **Never-Touch-Zone**

`_litBVatCountry` ist nur `dep`, wenn Ansässigkeit **und** dep-Registrierung beide vorliegen. Der häufige EPROHA-Fall „nicht ansässig, aber dep-Registrierung vorhanden" landet im `dest`-Fallback → die Rationale nennt fälschlich die dest-UID (oder keine) als Begründung der Zuordnung.

**Vorgehen:** Wie K2 — mit Referenzfällen verifizieren, dann freigeben. Soll: `hasDepVat ? dep : (intermediaryResidentInDep ? dep : null)`.

### H7 — Lokaler Dev-Server: 404 für Verzeichnis-URLs
`scripts/serve.mjs:85` — live verifiziert

`readFile()` auf ein Verzeichnis wirft EISDIR → 404. `GET /docs/` liefert 404, damit ist der dokumentierte Einstieg über die Root-`index.html` (Meta-Refresh auf `./docs/`) **lokal kaputt**.

**Fix:** `stat()` prüfen, bei `isDirectory()` `index.html` anhängen.

### H8 — Toter Code in großem Stil
- `buildInvoiceSnapshot()` (`app.js:4744-4920`): baut ~170 Zeilen HTML und endet mit `return ''` — wird an ≥6 Call-Sites trotzdem voll ausgeführt. → `return ''` an den Anfang bzw. Funktion + Call-Sites entfernen.
- ~600 Zeilen `_v32_*`-Funktionen (`app.js:448-519, 665-748, 3709-3882` u. a.): 20 Funktionen ohne Aufrufer, referenzieren nicht mehr existente UI-Elemente. → Löschen oder in Legacy-Datei auslagern.
- `renderFlowDiagram()` (`app.js:10896-11022`): ~130 Zeilen ohne Aufrufer, enthält denselben Bug wie H3. → Entfernen.
- Unerreichbarer Duplikat-Check in `_detectTriangle3` (`app.js:1077-1082`, Never-Touch) und unerreichbarer `currentMode === 5`-Branch in `renderResult()` (`app.js:10852-10854`).

---

## 🟡 Mittel

### M1 — URL-Parameter ohne Validierung
`app.js:11577-11582` — `?mode=9`, `?transport=xyz` (Passthrough in `getCanonicalTransport`, Z. 9174), `?uid=beliebig` korrumpieren den State (`getDreiecksApplied()` kippt auf `!!selectedUidOverride`). Kein direktes XSS gefunden, aber Zustand wird inkonsistent. **Fix:** Whitelists (`mode ∈ {2,3,4,5}`, `transport`-Enum, `uid` nur wenn in `MY_VAT_IDS`).

### M2 — `computeTax()`: bewegte Lieferung immer `badge-ig`/„IG-Lieferung", nie Ausfuhr
`app.js:3069` + nachgelagerte String-Checks (`tax.label.includes('Ausfuhr')`, Z. 3296) prüfen auf Labels, die `computeTax` nie erzeugt. Widersprüchliche Badge-/Label-Kette zu Regel 10. **Fix:** Expliziter Ausfuhr-Zweig (`isNonEU(dest)`) mit `badge-export` in `computeTax()` — analog `buildChainSVG4.legLabel` (Z. 1681).

### M3 — `run()` liefert bei `dep===dest` ein anderes Ergebnis-Shape
`app.js:1256-1264` (Never-Touch) — Frühausstieg gibt `registrationRisk` statt `risks` zurück, `movingSupply` ist `null`. Jeder Consumer muss `_depEqDest` kennen, sonst Crash. **Fix (bei Freigabe):** gleiche Keys leer befüllt liefern; bis dahin in neuen Consumern immer `_depEqDest` zuerst prüfen.

### M4 — `analyzeInland()`: hartkodierte EPDE-/Italien-Texte
`app.js:2541-2570, 2744-2747` — Registrierungs-Banner sagt fix „EPDE…" auch bei EPROHA; U3/U4-Hinweise sprechen unconditional von „IVA"/„inversione contabile", auch wenn `land !== 'IT'`. **Fix:** `COMPANIES[currentCompany].name` verwenden; IT-Hinweise an `land==='IT'` koppeln.

### M5 — `natLaw('vat')` — Key existiert nicht
`app.js:4002` (Map: 1813-1848) — Output zeigt „Vorsteuerabzug gem. vat." (Key-Selbst-Fallback). **Fix:** Key ergänzen; Fallback im Dev-Mode loggen.

### M6 — Intrastat-Schwellen in Fremdwährung als „EUR" formatiert
`app.js:404-446` — CZ/DK/HU/PL/SE-Rohwerte (CZK/HUF/…) werden als `~EUR 12 Mio.` ausgegeben (Faktor bis ~390 bei HUF). **Fix:** EUR-Äquivalente in Tabelle aufnehmen oder Originalwährung anzeigen.

### M7 — Globale Brücken `lvDirect`/`lvRueck` fragil
`app.js:4071-4073, 10799-10801` — `lvRueck` typeof-geschützt, `lvDirect` nicht (potenzieller ReferenceError); doppelte Zustandsquellen (Locals vs. window-Globals), Tests setzen direkt die Globals. **Fix:** Am Dateianfang `let lvDirect = true, lvRueck = true;` deklarieren, eine Quelle, Brücke an genau einer Stelle.

### M8 — `runOutputTests()` hinterlässt inkonsistente UI
`app.js:8837-8843, 9031-9094` — `cp-0`/`cp-1` werden per `innerHTML` durch Einzel-Option ersetzt; `lvRueck` und die Selects werden nicht restauriert, kein abschließendes `renderAll()`. **Fix:** `lvRueck` mitsichern, am Ende `renderAll()`.

### M9 — `isScrollError()` verschluckt echte Fehler
`app.js:9046-9049, 10806-10814` — Substring-Match auf `'classList'`/`'visible'` schluckt auch echte TypeErrors aus der Analyse → Tests grün trotz unvollständigem Output. **Fix:** Kosmetische Aufrufe defensiv machen, catch-Filter entfernen.

### M10 — `switchToDesign()` verliert State, geteilter localStorage-Key
`app.js:9904-9907` — überträgt nur `location.search` vom Seitenladen statt aktuellem `getState()`; v1 und v2 teilen sich `rgr_v4_state` (Schema-Drift-Risiko). **Fix:** Params wie `shareLink()` bauen; pro Design-Version eigener Storage-Key oder Versionsfeld.

### M11 — Deep-Link/Restore synchronisiert Header-Tabs/Mode-Badge nicht
`app.js:11566-11584, 12080-12115` — `updateModeBadge()`/`syncHeaderModeTabs()` laufen nur in `setParties()`, nicht beim Boot. Bei `?mode=4` zeigen Badge und Header-Tabs den falschen Modus. **Fix:** In `init()` nach `handleURLParams()` beide nachziehen.

### M12 — VATEngine nicht „pure": Abhängigkeit von globalem `natLaw`/`currentCompany`
`app.js:1207-1208` (Never-Touch) — entgegen der Eigenbeschreibung „pure logic, zero DOM". **Fix (bei Freigabe):** `ctx.natLaw` injizieren.

### Infrastruktur (Mittel)

- **I1 — Deploy ohne Checks:** `pages.yml` lädt `docs/` ungeprüft hoch; `npm run check:pages` und der jsdom-Test existieren, laufen aber nicht in CI. Zudem prüft `check:pages` weder `docs/v1/*` noch Fonts. **Fix:** Check-/Test-Steps vor Upload; zusätzlich `node --check` für app.js.
- **I2 — Keine CSP + flächendeckende Inline-Handler:** `docs/index.html` nutzt überall `onclick="…"`. **Fix:** Baseline-CSP-Meta (`default-src 'self'; script-src 'self' 'unsafe-inline'`), mittelfristig Event-Delegation und `'unsafe-inline'` entfernen.
- **I3 — Actions nicht SHA-gepinnt:** `pages.yml:26-43` nutzt mutable Tags (`@v5`/`@v4`). **Fix:** auf Commit-SHAs pinnen. Cache-Busting-sed zusätzlich mit `grep`-Verifikations-Step absichern (schlägt sonst still fehl).
- **I4 — A11y:** kein `<h1>`, Tabs ohne vollständiges ARIA-Pattern (`tablist`/`aria-selected`/`tabpanel`), ⋯-Menü ohne Tastaturnavigation, Emoji-Buttons ohne `aria-label`, Status rein visuell.
- **I5 — CSS:** kompletter Light-Token-Block dupliziert (`app.css:18-100` vs. `103-175`, ~70 identische Properties); 115 `!important` außerhalb von `@media print` (Ursache: Inline-Styles im HTML). **Fix:** `:root, [data-theme="light"]` zusammenfassen; Inline-Styles in Klassen überführen.
- **I6 — Dev-Server-MIME-Types:** woff2 → `application/octet-stream` (weicht von Pages ab); `.png`/`.ico` fehlen.
- **I7 — SEO/Meta:** keine description, kein Favicon (404 pro Load), keine bewusste robots-Entscheidung; kein `<noscript>`-Fallback.

---

## 🟢 Niedrig / Code-Hygiene

- **SVG-Builder-Duplikation:** `edgePts()`/`arrow()`/`node()`/Theme-Farben-Block je 3× in `buildTriangleSVG`/`buildTriangleSVG4`/`buildChainSVG4` (~150+ Zeilen, driftende Pad-Werte 52/54/56). → Gemeinsames `svgKit` extrahieren; Magic Numbers in benannte `LAYOUT`-Objekte.
- **Marker-ID-Kollisionen:** `buildTriangleSVG.arrow()` bildet IDs aus Koordinaten, die anderen aus nicht diagramm-eindeutigen Zählern. → global-monotone `svgUid()`.
- **Riesenfunktionen:** `analyze2()` ~480 Z., `analyzeLohn()` ~270 Z., `buildKurzbeschreibung()` ~340 Z. → pro Branch eine `render*`-Funktion extrahieren, `analyze2()` wird Router (vorher mit Referenzfällen absichern, Never-Touch-Grenze beachten).
- **Testlücken:** `buildQuickCheck()` (genau dort sitzt K1), 3P/4P-`analyze()`-Output, Share-Link-Roundtrip, Vergleich-Tab ungetestet; `knownLimitation`-Tests zählen weder pass noch fail.
- **Null-Guards:** diverse `getElementById`-Zugriffe ohne Guard (`app.js:9106-9110, 9309-9310, 11533, 12106` u. a.), inkl. Modul-Level-Zugriff bei `?test=1`. → konsequent `?.`.
- **Kleinkram:** Company-Sync per `textContent`-Vergleich (→ `data-co`-Attribut); `rate()` liefert stumm 0 für unbekannte Codes; ungenutzte Variablen (`COL_TX2`, `u3HasItVat`, `buyerVat`, `optNum`); `<defs><marker>` pro Pfeil statt pro SVG; Einbuchstaben-Globals `$`/`PL`; `docs/v1/index.html` hat `data-theme="light"` obwohl CLAUDE.md v1 als dunkles Theme beschreibt (Doku oder Freeze prüfen); kein `docs/CNAME` (bekannt, Backlog).

---

## ✅ Positiv

- VATEngine-Isolation, State-Helper und Test-Infrastruktur (SMOKE/RENDER/OUTPUT) sind für Vanilla-JS dieser Größe vorbildlich.
- localStorage durchgängig try/catch-gekapselt (Private-Mode-sicher); `toggleDevMode()` ohne Listener-Leaks.
- Dev-Server: Path Traversal nachweislich abgewehrt, Bind nur auf 127.0.0.1.
- Workflow: minimale Permissions, korrekte `concurrency`; Font-Self-Hosting mit `font-display:swap`; `.nojekyll` vorhanden.
- Fachliche Tiefe (Art. 36a-Kommentierung, EuGH-Referenzen, SAP-MWSKZ-Mapping) deutlich über Branchenüblichem.

---

## Empfohlene Reihenfolge

1. **Sofort (klein, hoher Nutzen):** K1 (QuickCheck-Transport + UID-Country), H1 (`dep`-Fix), H3 (`getTransportLetter()`), H2 (countries-Parsing), H5 (TRANSLATIONS zur Renderzeit), M5 (`natLaw('vat')`) — jeweils mit Mini-Test.
2. **Mit Referenzfall-Verifikation (Never-Touch-Freigabe nötig):** K2 (`_applyQuickFix`), H6 (lit.-b-Rationale), H4 (4P-dtype aus Engine), M3 (Result-Shape).
3. **Sicherheit/Infra:** K3 (`esc()` + UID-Whitelist), I2 (CSP), H7 (Dev-Server-Verzeichnisse), I1 (CI-Checks vor Deploy), I3 (SHA-Pinning).
4. **Aufräumen:** H8 (toter Code, ~900 Zeilen), I5 (CSS-Token-Duplikat), SVG-Kit-Extraktion, M8/M9 (Test-Runner-Hygiene).
5. **Mittelfristig:** Funktions-Splitting (`analyze2` etc.), Inline-Handler → Event-Delegation, A11y-Pattern (I4), Testlücken schließen.
