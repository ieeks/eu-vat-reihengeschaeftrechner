# Consistency Report
Datum: 2026-04-06

Pruefumfang: Alle Dateien unter `vat-knowledge/` wurden vollstaendig gelesen. Der Codeabgleich erfolgte ausschliesslich gegen den `VATEngine`-IIFE-Block in `docs/assets/scripts/app.js` von `const VATEngine = (() => {` bis zum schliessenden `})();`. Aussagen zu Funktionen ausserhalb dieses Blocks sind als Scope-Warnung markiert.

## Zusammenfassung
- Gepruefte KB-Dateien: 17
- KRITISCH: 6
- WARNUNG: 9
- HINWEIS: 4
- BESTAETIGT: 2

## Ergebnisse pro KB-Datei

### vat-knowledge/CLAUDE-vat-knowledge.md
STATUS: 🚨 KRITISCH

- KB behauptet: `| **DE** | § 13b UStG | RC gilt NICHT fuer Warenlieferungen (nur Werklieferungen) |` und `rules/rc_country_rules.md — _checkRCBlock() fuer BE/PL/CZ/SI/LV/EE/IT/DE`.
- Code macht: `_checkRCBlock()` enthaelt nur Branches fuer `BE`, `PL`, `CZ`, `SI`, `LV`, `EE` und `IT`. Ein `DE`-Branch existiert im VATEngine-Block nicht.
- Schweregrad: KRITISCH. Diese Kurzreferenz bildet die tatsaechliche Engine-Implementierung falsch ab und wuerde bei Codearbeit an RC-Logik in die falsche Richtung fuehren.

- Bestaetigt: Die `NEVER TOUCH`-Liste fuer `determineMovingSupply()`, `_applyQuickFix()`, `classifySupplies()`, `_detectTriangle3()`, `_detectTriangle4()`, `detectRegistrationRisk()` und `_checkRCBlock()` stimmt mit dem gelesenen Block ueberein.
- Bestaetigt: Die Dreiecks-Blocker `dest-UID` und `UID aus Land von A` werden im Code tatsaechlich verwendet.

### vat-knowledge/at/ustg_at_dreieck.md
STATUS: ⚠️ WARNUNG

- Nicht im geprueften VATEngine-Block verifizierbar: `natLaw('zm')`, `buildDreiecks3Result()`, `invTriangle(uidCode)`.
- Schweregrad: WARNUNG. Die Datei ist fuer den angeforderten Pruefumfang nur teilweise gegen den Code belegbar.

- Bestaetigt: `_detectTriangle3()` liefert bei Erfolg `possible:true` und `legalBasis: 'Art. 141 lit. a–e, Art. 42, Art. 197 MwStSystRL / § 25b UStG'`.
- Bestaetigt: Die bewusste Blockierung bei `!!vatIds[dest]` ist im Code vorhanden.

### vat-knowledge/at/ustg_at_reihengeschaeft.md
STATUS: ⚠️ WARNUNG

- Nicht im geprueften VATEngine-Block verifizierbar: `analyze2()`, `analyzeInland()`, `COMPANIES['EPROHA']`, `natLaw()`.
- Schweregrad: WARNUNG. Ein wesentlicher Teil der Datei referenziert Funktionen ausserhalb des gelesenen Blocks.

- Bestaetigt: `classifySupplies()` setzt fuer die bewegte Lieferung `placeOfSupply = dep`.
- Bestaetigt: `_applyQuickFix()` implementiert die lit. a/b/c-Logik grundsaetzlich wie beschrieben.

### vat-knowledge/eu/quick_fixes_2020.md
STATUS: ⚠️ WARNUNG

- KB behauptet: `_applyQuickFix(): Prueft uidOverride, intermediaryResidentInDep, hasDepVat -> bestimmt lit. a / b / c Variante`.
- Code macht: `_applyQuickFix()` verwendet in der automatischen lit.-b-Route zusaetzlich `hasDestVat` fuer den `_litBVatCountry`-Fallback.
- Schweregrad: HINWEIS. Die Aussage ist nicht falsch im Kern, aber unvollstaendig.

- Nicht im geprueften VATEngine-Block verifizierbar: `buildVATContext()`.
- Bestaetigt: `quickFixVariant` verwendet die Werte `'departure-id'`, `'dest-or-other-id'` und `'lit-c'`.
- Bestaetigt: `euroTyreNote` ist in allen `_applyQuickFix()`-Returns vorhanden; `kreuzmayerNote` nur in lit. a/b.

### vat-knowledge/eu/art36a_mwstrl.md
STATUS: ✅ KONSISTENT

- Bestaetigt: `determineMovingSupply()` dispatcht korrekt fuer `supplier`, `customer`, `middle` und `middle2`.
- Bestaetigt: `_applyQuickFix()` bildet die manuelle und automatische lit. a/b/c-Logik mit den beschriebenen Variablen ab.
- Bestaetigt: Die Hinweise zu `euroTyreNote` und `kreuzmayerNote` stimmen mit den Return-Objekten ueberein.

### vat-knowledge/eu/art138_mwstrl.md
STATUS: ⚠️ WARNUNG

- Nicht im geprueften VATEngine-Block verifizierbar: `invIG(...)`.
- Schweregrad: WARNUNG. Die Implementierungsbeschreibung ist nur teilweise innerhalb des angeforderten Lesebereichs pruefbar.

- Bestaetigt: `classifySupplies()` setzt bei `isMoving && isCrossEU` den `vatTreatment` auf `'ic-exempt'`.
- Bestaetigt: `isCrossEU` und `isICMoving` sind im Code so definiert wie beschrieben.

### vat-knowledge/eu/art141_triangle.md
STATUS: 🚨 KRITISCH

- KB behauptet: `_detectTriangle4() implementiert first3/last3/mid3`.
- Code macht: `_detectTriangle4()` implementiert nur `last3` und `first3`. Eine `mid3`-Variante existiert im gelesenen Block nicht.
- Schweregrad: KRITISCH. Das dokumentiert eine nicht vorhandene 4-Parteien-Variante und wuerde zu falschen Annahmen ueber den Funktionsumfang fuehren.

- HINWEIS: Die Zusammenfassung von `_detectTriangle3()` und `_detectTriangle4()` ist zudem verkuerzt. Der Code prueft zusaetzlich Gleichland-Faelle (`s2===s4`, `s1===s4`) sowie bei 4 Parteien weitere Guards wie `dest!==s2`.
- Bestaetigt: Der `dest`-UID-Blocker und der `UID aus Land von A`-Blocker sind im Code vorhanden.
- Bestaetigt: Der NL-Sonderfall `dest === 'NL' && s1 === 'NL'` ist implementiert.

### vat-knowledge/de/ustae_reihengeschaeft.md
STATUS: ⚠️ WARNUNG

- Nicht im geprueften VATEngine-Block verifizierbar: `natLaw('dreiecks')`, `invTriangle(uidCode)`, `buildDreiecks3Result()`, `RC_WORDING['DE']`.
- Schweregrad: WARNUNG. Der VATEngine-bezogene Teil ist pruefbar, mehrere DE-spezifische Rendering-Aussagen aber nicht.

- Bestaetigt: `_detectTriangle3()` und `_detectTriangle4()` sind im Block vorhanden.
- Bestaetigt: `luxuryTrustWarning` wird im 3-Parteien-Dreiecksergebnis gesetzt.

### vat-knowledge/de/ustg_de_3_6a.md
STATUS: 🚨 KRITISCH

- KB behauptet: `const deReg = pos === 'DE' && hasVat('DE') && iAmTheSeller;` und `deReg`-Check passiert in `_checkRCBlock()`.
- Code macht: `_checkRCBlock()` enthaelt keinen `DE`-Branch und keinen `deReg`-Check.
- Schweregrad: KRITISCH. Die Datei beschreibt eine konkrete Codepruefung, die im VATEngine-Block nicht existiert.

- Bestaetigt: `_applyQuickFix()` verwendet die `quickFixVariant`-Werte `'departure-id'` und `'dest-or-other-id'` mit den genannten `legalBasis`-Strings.

### vat-knowledge/ch/mwst_ch_konsignationslager.md
STATUS: ⚠️ WARNUNG

- Nicht im geprueften VATEngine-Block verifizierbar: `buildKonsiLagerCH()`, `analyzeCH()`, `analyze2()`.
- Schweregrad: WARNUNG. Die Datei beschreibt ausschliesslich Logik ausserhalb des gelesenen VATEngine-Blocks.

- Bestaetigt: Im geprueften Block selbst gibt es keine CH-spezifische Konsignationslager-Implementierung; die Datei verweist daher auf andere Codebereiche.

### vat-knowledge/ch/mwst_ch_ort_lieferung.md
STATUS: ⚠️ WARNUNG

- Nicht im geprueften VATEngine-Block verifizierbar: `computeTaxCH()`, `analyzeCH()`, `analyzeCHInland()`, das CH-Drittland-Routing ausserhalb des IIFE.
- Schweregrad: WARNUNG. Die Datei ist fuer diesen Auftrag nur als Kontext lesbar, nicht vollstaendig gegen den gelesenen Code pruefbar.

- Bestaetigt: Die Aussagen betreffen bewusst Nicht-EU-/CH-Routing ausserhalb des VATEngine-Kerns.

### vat-knowledge/rules/uid_usage_rules.md
STATUS: ⚠️ WARNUNG

- Nicht im geprueften VATEngine-Block verifizierbar: `_sapEffectiveCountry()`, globale Variable `selectedUidOverride`, `buildKurzbeschreibung()`, `buildNormal3Result()`.
- Schweregrad: WARNUNG. Der groesste Teil der Datei beschreibt Upstream-/Rendering-Logik ausserhalb des gelesenen Blocks.

- Bestaetigt: `_applyQuickFix()`, `_detectTriangle3()` und `_detectTriangle4()` arbeiten innerhalb des VATEngine-Blocks mit `ctx.uidOverride`.
- Bestaetigt: Die Euro-Tyre- und Kreuzmayr-Hinweise sind an den genannten Stellen im Engine-Block vorhanden.

### vat-knowledge/rules/moving_supply_logic.md
STATUS: 🚨 KRITISCH

- KB behauptet: `transport='middle2' ... lit. b: dep-UID mitgeteilt -> L3 bewegend (chainIndex=2).`
- Code macht: `_applyQuickFix()` behandelt `uidOverride === dep && !intermediaryResidentInDep && !hasDepVat` als lit. a und setzt dann `movingIndex = chainIndex - 1`, bei `middle2` also `L2`, nicht `L3`.
- Schweregrad: KRITISCH. Diese Aussage verdreht die implementierte Bewegungszuordnung fuer einen zentralen 4-Parteien-Fall.

- KB behauptet: `Jedes Ergebnis enthaelt exakt ... manualOverride ... kreuzmayerNote`.
- Code macht: Der lit.-c-Return enthaelt weder `manualOverride` noch `kreuzmayerNote`; der automatische lit.-b-Return enthaelt ebenfalls kein `manualOverride`.
- Schweregrad: HINWEIS. Die Feldliste ist zu strikt formuliert und stimmt nicht fuer alle `_applyQuickFix()`-Returns.

- Bestaetigt: Die Dispatch-Logik fuer `supplier`, `customer`, `middle` und `middle2` stimmt.
- Bestaetigt: Die Beschreibung fuer `transport='middle'` und `chainIndex = ctx.mePosition - 1` in Mode 4 ist korrekt.

### vat-knowledge/rules/triangle_conditions.md
STATUS: ⚠️ WARNUNG

- KB behauptet: `Einzige aktive Verwendung von establishments im Code: _checkRCBlock() BE-Branch`.
- Code macht: `classifySupplies()` verwendet `establishments.includes(pos)` ebenfalls aktiv, um `sellerEstablished` zu bestimmen; das beeinflusst RC, Inlandslieferung und Registrierungspflicht.
- Schweregrad: WARNUNG. Die Aussage ist fachlich nicht im Dreiecksblock selbst, aber als Code-Mapping objektiv unzutreffend.

- Nicht im geprueften VATEngine-Block verifizierbar: `dreiecksOpportunity`, `buildKurzbeschreibung()`, `buildVergleichTab()`.
- Bestaetigt: Die bewusste Design-Entscheidung `!!vatIds[dest]` als Blocker in `_detectTriangle3()` und `bHasDestVat = !!vatIds[dest]` in `_detectTriangle4()` entspricht exakt dem Code.
- Bestaetigt: Der Hinweis aus dem User-Kontext ist korrekt: Die UID-Blockierung in `_detectTriangle3()` und `_detectTriangle4()` ist bewusst und kein Bug.

### vat-knowledge/rules/registration_risk_logic.md
STATUS: 🚨 KRITISCH

- KB behauptet: Risk-Type (C) entsteht bei `isMoving && iAmTheBuyer && dep !== dest && usedUidCountry !== dest && usedUidCountry !== dep && vatIds[usedUidCountry]`.
- Code macht: `usedUidCountry` wird fuer Risk-Type (C) als `ctx.transport === 'middle' && ctx.uidOverride ? ctx.uidOverride : companyHome` bestimmt. Ein `uidOverride` ausserhalb von `transport === 'middle'` beeinflusst diesen Risk-Type also gerade nicht.
- Schweregrad: KRITISCH. Die KB dokumentiert eine allgemeinere Logik als implementiert und wuerde zu falschen Erwartungen beim Doppelerwerb-Risiko fuehren.

- HINWEIS: Bei Risk-Type (B) ist die KB verkuerzt. Der Code prueft `triangleResult.primary?.beneficiary === companyHome || triangleResult.beneficiary === companyHome`, nicht nur `triangleResult.beneficiary === companyHome`.
- Bestaetigt: Die Risk-Types A, D, E und F sowie die `severity`-Werte stimmen mit dem Code ueberein.
- Bestaetigt: `triangleMitigatesReg` ist korrekt als `triangleResult?.possible && placeOfSupply === dest` dokumentiert.

### vat-knowledge/rules/rc_country_rules.md
STATUS: 🚨 KRITISCH

- KB behauptet: `### DE — § 13b UStG` mit `const deReg = pos === 'DE' && hasVat('DE') && iAmTheSeller;` und `deReg`-Check in `_checkRCBlock()`.
- Code macht: `_checkRCBlock()` implementiert BE, PL, CZ, SI, LV, EE und IT, aber keinen DE-Fall.
- Schweregrad: KRITISCH. Die Datei beschreibt eine konkrete Branch-Implementierung, die nicht existiert.

- Bestaetigt: Die dokumentierten BE-, PL-, CZ-, SI-, LV-, EE- und IT-Regeln stimmen mit den vorhandenen Branches ueberein.

### vat-knowledge/rules/place_of_supply.md
STATUS: ✅ KONSISTENT

- Bestaetigt: `classifySupplies()` setzt `placeOfSupply` fuer bewegte Lieferung auf `dep`, fuer ruhende Lieferung vor der Bewegung auf `dep` und nach der Bewegung auf `dest`.
- Bestaetigt: `run()` behandelt `dep === dest` als Sonderfall und gibt `_depEqDest: true` zurueck.
- Bestaetigt: `isExport` ist als bewegte EU->Drittland-Lieferung implementiert.

## Korrekturen nach Report
Datum: 2026-04-06

1. `rules/rc_country_rules.md`, `de/ustg_de_3_6a.md` und `CLAUDE-vat-knowledge.md`: DE-Branch aus `_checkRCBlock()`-Beschreibung entfernt; ergaenzt, dass die DE-RC-Pruefung in `computeTax()` (Rendering-Layer) liegt und die Engine keinen DE-spezifischen RC-Block kennt.
2. `eu/art141_triangle.md`: `mid3` aus der `_detectTriangle4()`-Beschreibung entfernt; dokumentiert bleiben nur `last3` und `first3`.
3. `rules/moving_supply_logic.md`: `transport='middle2'`-Hinweis korrigiert auf `lit. a: dep-UID mitgeteilt -> movingIndex = chainIndex-1 = L2`.
4. `rules/registration_risk_logic.md`: Ergaenzt, dass Risk-Type C `ctx.uidOverride` nur bei `transport=middle` verwendet und dass Risk-Type B beide `beneficiary`-Felder prueft.
5. `rules/triangle_conditions.md`: Hinweis zur aktiven Verwendung von `establishments` erweitert um den `classifySupplies()`-Pfad.
