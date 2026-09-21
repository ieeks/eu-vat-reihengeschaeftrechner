# Prüfdaten-Export — Grundlage für eine Excel-Ist/Soll-Logik (SAP-Steuerkennzeichen)

Erzeugt mit `npm run export:pruefdaten` (`scripts/export-pruefdaten.mjs`, liest nur).
Stand der Daten = Stand von `docs/assets/scripts/app.js` zum Zeitpunkt des Laufs.

## Was liegt hier

| Datei | Inhalt | Herkunft |
|---|---|---|
| `01_szenarien.json/.csv` | Alle Szenarien mit **Prüfreihenfolge** und benötigten Inputs | kuratiert aus `renderResult()` / `analyze()` / `analyze2()` / `VATEngine.run()` / `computeLohn()` |
| `02_uid_findung.json/.csv` | UID-Findung als Entscheidungstabelle, 3 Ebenen (inkl. EXW + Fallbacks) | kuratiert aus `_applyQuickFix()`, `_sapEffectiveCountry()`, `plants_abroad/README.md` |
| `03_laender.json/.csv` | Länderstammdaten: EU/Drittland, Sätze, CH-MWST-Raum, Zollunion, SAA, Sanktionen, eigene UIDs | maschinell aus `EU` + `COMPANIES` |
| `04_testfaelle.json/.csv` | 184 Testfälle/Fixtures, davon 63 Matrix-Zeilen mit erwartetem Kennzeichen | maschinell aus `test-matrix.mjs` + allen Test-Arrays in `app.js` |
| `05_abweichungen.json/.csv` | Bekannte Bugs, bewusste Vereinfachungen, Modellgrenzen | kuratiert aus `rechtskonformitaet.md`, `RGR_TODO.md`, `edge-cases.md`, `PRUEFUNG.md` |
| `06_sap_tax_map.json` · `06_sap_tax_map.csv` · `06_sap_custtax_map.csv` | MWSKZ-Mapping roh + flach, VK12-Umkehr-Lookup flach | maschinell aus `SAP_TAX_MAP` / `SAP_CUSTTAX_MAP` |

**Wichtig zur Belastbarkeit:** `03`, `04` und `06` sind mechanisch extrahiert — sie sind
exakt das, was im Code steht. `01`, `02` und `05` sind **von Hand aus Code und Doku
abgeleitet** (mit Fundstelle je Zeile). Sie sind eine Lesehilfe, keine generierte Wahrheit;
bei Abweichungen gilt der Code.

CSV: Semikolon-getrennt, UTF-8 mit BOM → öffnet in Excel ohne Import-Dialog.

### Zu `05_abweichungen`: IDs sind im Repo doppelt vergeben

`D2`, `D3` und `F3` existieren in **zwei verschiedenen Dateien** mit unterschiedlicher
Bedeutung. Deshalb hier mit Quellpräfix:

| angefragt | im Export | Datei | Bedeutung |
|---|---|---|---|
| F1 | `EC-F1` | `edge-cases.md` | Inlands-Reihengeschäft BG→AT→BG |
| F3 | `EC-F3` | `edge-cases.md` | Sappi DE→EPDE→IT (Abgangsland = Sitzland) |
| F3 | `RK-F3` | `rechtskonformitaet.md` | dep-UID ohne Registrierung — akademisch |
| D2 | `RK-D2` | `rechtskonformitaet.md` | NL-Dreieck, milde Auslegung |
| D2 | `TODO-D2` | `RGR_TODO.md` | **Bug:** MWSKZ trotz fehlender Registrierung |
| D3 | `RK-D3` | `rechtskonformitaet.md` | Lohnveredelung, Verbringen gemeldet |
| D3 | `TODO-D3` | `RGR_TODO.md` | **Modellgrenze:** Drop-Ship A2 nicht schaltbar |

Alle sieben sind enthalten, zusätzlich `EC-F2`, `EC-F4`, `RK-D1`, `SAP-EXW`,
`SAP-ABGANGSLAND`, `SAP-LUECKE-IGL`, `VAT-H02`, `VAT-M01`, `VAT-H04`, `VAT-M04`,
`BASELINE-SCOPE`.

---

## 1 · Wie wurde `SAP_CUSTTAX_MAP` erzeugt — und wie ziehst du es neu?

`SAP_CUSTTAX_MAP` ist **nicht von Hand gepflegt**, sondern aus einem SAP-VK12-Export
generiert. Generator: `scripts/gen-custtax-map.mjs`.

**Quelle und Kette:** Konditionstabellen `A002` (Inland, kein Zielland) und `A011`
(Export, mit `LLAND`) → über `KNUMH` nach `KONP` (liefert `MWSK1` = Kennzeichen und
`KBETR` = Satz in Zehnteln) → über `(KALSM, MWSKZ)` nach `T007A` (Bedeutungstext).
Kalkulationsschema je Abgangsland: `AT=TAXAT`, `DE=TAXD`, `PL=TAXPL`, `CZ=TAXCZ`.

**Gefiltert wird auf:** `DATBI = 9999-12-31` (aktuell gültig) und `TAXM1 = 1`
(Material-Steuerklasse 1, volle Steuer). Abgangsländer: `AT` = EPROHA,
`DE` = EPDE Werk 1701, `PL` = 1702, `CZ` = 1703.

**Mehrdeutigkeit:** Führen mehrere Kunden-Steuerklassen (`TAXK1`) zum selben Kennzeichen,
gewinnt die Klasse nach der festen Priorität `1, 2, 4, 5, 6, 3, 0`; die übrigen landen in
`alt`. `empf` wird gesetzt, sobald der Satz ≠ 0 ist (lokale Steuer → Empfangsland muss in
SAP gesetzt werden). Für `AI` und `B2` gibt es keinen T007A-Text → Fallback
„⚠ Sonderfall – prüfen".

**Neu ziehen:**

```bash
# 1. Aus SAP die vier Tabellen als CSV exportieren (Spaltennamen als Kopfzeile):
#    A002:  ALAND, TAXK1, TAXM1, DATBI, KNUMH
#    A011:  ALAND, LLAND, TAXK1, TAXM1, DATBI, KNUMH
#    KONP:  KNUMH, MWSK1, KBETR
#    T007A: KALSM, MWSKZ, Bedeutung
node scripts/gen-custtax-map.mjs <A002.csv> <A011.csv> <KONP.csv> <T007A.csv>

# 2. Danach den Export hier neu erzeugen:
npm run export:pruefdaten
```

Der Generator schreibt **direkt in `app.js`**, zwischen die Marker
`// <<GEN:SAP_CUSTTAX_MAP>>` und `// <<END:SAP_CUSTTAX_MAP>>`. Fehlen die Marker, bricht er
mit Exit-Code 2 ab. Keine npm-Abhängigkeit, eigener quote-aware CSV-Parser.

**Wann neu ziehen:** bei Satzänderungen, neuen Registrierungen, neuen Werken. Konkret
offen: Werk 1703 (CZ) live und eine eventuelle LT-Registrierung — dann auch die
Edge-Codes `AI`/`B2` klären (`RGR_TODO.md`).

**Grenze, die für deine Prüflogik zählt:** `SAP_CUSTTAX_MAP` kennt die Dimension
**Incoterm/EXW nicht**. Die SAP-Findung dreht bei EXW die UID aufs Lieferantenland
(`02_uid_findung`, Regel C2) — dieser Hebel steckt nicht in A002/A011. Für dieselbe
Konstellation können Tool und SAP deshalb abweichende Kennzeichen liefern
(`05_abweichungen`, `SAP-EXW`).

---

## 2 · Was die Engine abdeckt, das in einer reinen Werk/Ship-to-Logik untergeht

Die SAP-Findung leitet aus **Werk, Ship-to und (nur) EXW** ab. Das Steuerrecht hängt an
anderen Größen. Die folgenden zehn Punkte sind genau die Stellen, an denen beide
auseinanderlaufen — jeder davon ist ein potenzieller Ist/Soll-Befund:

1. **Transportzuordnung (Art. 36a).** *Wer* versendet auf eigene Rechnung, entscheidet,
   welche Lieferung die bewegte ist. Dieselbe Länderkonstellation ergibt je nach
   Transporteur ein anderes Kennzeichen. SAP modelliert diese Dimension nicht (außer EXW).
   → `01_szenarien` C-Engine `ENG-MOVING`, `02_uid_findung` Ebene A.

2. **Mitgeteilte UID ≠ besessene UID.** Art. 36a Abs. 2 greift nur, wenn die
   Abgangsland-UID dem Vorlieferanten für diesen Umsatz *mitgeteilt* wurde. Der bloße
   Besitz genügt nicht. Das ist eine Tatsache über den Umsatz, kein Stammdatum — in einer
   Stammdaten-Findung gibt es dafür kein Feld. → `02_uid_findung` A3/A5.

3. **Position in der Kette.** Ob die eigene Gesellschaft erster, mittlerer oder letzter
   Beteiligter ist (`mePosition`), ändert Zuordnung, Registrierungspflicht und Kennzeichen
   vollständig. Ship-to/Werk allein sagt darüber nichts.

4. **Dreiecksgeschäft und seine Sperren (Art. 141 lit. a–e).** Die Vereinfachung fällt weg,
   sobald eine eigene UID im Bestimmungsland besteht (konservative Linie, `RK-D1`) oder der
   Endabnehmer transportiert (lit. e). Der Praxisfall EXW · Lieferant IT · WE Slowenien:
   mit DE-UID → `DH`, richtig ist SI-UID → `CB` plus ig. Erwerb `EC`. Ein blinder
   BUKRS-Fallback unterstellt stillschweigend ein Dreieck, das rechtlich gesperrt ist.

5. **`dep = dest` (Inlands-Reihengeschäft).** Keine IG-Lieferung, kein Dreieck — alle
   Lieferungen sind Inlandslieferungen im selben Land, ggf. mit lokalem Reverse Charge
   (IT: `IC` Ausgang / `VI` Eingang). Ein IG-Kennzeichen wäre hier immer falsch. → `EC-F1`.

6. **Einführerrolle im Drittlandsfall.** DDP verlagert den Lieferort ins Bestimmungsland
   (CH: Art. 7 Abs. 3 Bst. a MWSTG) → `B5` 8,1 % statt `A0`. Das schlägt nur durch, wenn das
   **steuerliche Abgangsland** auf CH/LI gesetzt ist. Genau daran scheitern die
   Matrix-Zeilen Z50/Z51/Z57 heute. → `05_abweichungen`, `SAP-ABGANGSLAND`.

7. **Drop-Shipment: Warenempfänger ≠ Kunde.** Bei Drittland-Kunde mit EU-Warenempfänger
   verlässt die Ware die EU nicht → **keine Ausfuhr**, sondern ig. Reihengeschäft. Welches
   Kennzeichen greift, hängt daran, welche EU-UID der Kunde vorlegt: keine → `A2` 20 % AT ·
   Abgangsland-UID → `A2` · Bestimmungsland-UID → `AF` · Dritt-MS-UID → Dreieck. → `EC-F4`.

8. **Länderspezifische Reverse-Charge-Regeln.** Ob lokales RC greift oder lokale MwSt
   auszuweisen ist, hängt an Niederlassung vs. bloßer Registrierung — pro Land verschieden
   (BE Art. 51 § 2 WBTW, IT Art. 17 DPR 633, NL Art. 12 lid 3, CZ/PL/SI/EE/LV). EPDE mit
   BE-UID ohne BE-Betriebsstätte weist deshalb 21 % aus (`BS`/`BI`), nicht RC.
   ⚠ Für BE ist diese Linie fachlich noch offen (`VAT-H02`).

9. **Registrierungsrisiko statt Kennzeichen.** Eine ruhende Lieferung in einem Land ohne
   eigene UID ist kein Buchungsfall mit „irgendeinem" Code, sondern ein
   Registrierungsbefund — korrekt ist dann **kein MWSKZ**. Eine Findung, die immer einen
   Code liefert, verdeckt genau diese Fälle. (Der Rechner hat hier selbst noch einen Bug:
   `TODO-D2`.)

10. **Warenbewegungen ohne Verkauf.** Ig. Verbringen bei Lohnveredelung (Art. 17) und
    Konsignationslager (Art. 17a): Es gibt Meldepflichten und ggf. Registrierungspflichten
    **ohne** Fakturaposition — bzw. die Lieferung entsteht erst beim Abruf. Eine rein
    belegbasierte Prüfung sieht diese Fälle nie. → `01_szenarien` E-Lohn, `RK-D3`.

Zusatzpunkt, weil leicht übersehen: **Art. 41 Doppelerwerb.** Wird eine UID verwendet, die
weder Abgangs- noch Bestimmungsland ist, entsteht ein zusätzlicher fiktiver Erwerb im
UID-Staat, bis der Nachweis nach Art. 42 geführt ist (ZM mit der Folgelieferung).

---

## 3 · Was ich für die Excel-Prüflogik sonst mitgeben würde

### 3.1 Erst den Schlüssel klären, dann die Formeln

Das Minimum pro Fakturaposition, um überhaupt ein Soll bilden zu können:

| Feld | woher | Problem |
|---|---|---|
| Gesellschaft / Buchungskreis | Beleg | — |
| steuerliches Abgangsland | Beleg | ⚠ oft = physisches Werk gepflegt, siehe Punkt 6 oben |
| Ship-to-Land | Beleg | — |
| verwendete eigene UID | Beleg | — |
| Kunden-UID-Land | Beleg | — |
| Incoterm (EXW ja/nein) | Beleg | — |
| **Transportveranlasser** | **nicht im Beleg** | ⚠ muss angereichert werden |
| **mitgeteilte UID (Art. 36a Abs. 2)** | **nicht im Beleg** | ⚠ Tatsache über den Umsatz |
| Position in der Kette | nicht im Beleg | ⚠ nur bei Streckengeschäft relevant |

Die drei ⚠-Felder sind der eigentliche Knackpunkt. Mein Rat: **nicht raten**, sondern eine
Spalte `prüfbar ja/nein` führen und Positionen ohne diese Angaben als *nicht abschließend
prüfbar* ausweisen. Eine Prüflogik, die stillschweigend „Lieferant transportiert"
unterstellt, produziert Fehlbefunde in genau den Fällen, in denen sie gebraucht wird.

### 3.2 Zwei Prüfstufen statt einer

**Stufe 1 — Plausibilität (ohne Transportwissen, auf 100 % der Positionen anwendbar).**
Reine Lookups gegen `06_sap_tax_map.csv` / `03_laender.csv`. Diese Regeln finden echte
Fehler und brauchen keine Rechtslogik:

- Kennzeichen existiert für die Kombination Gesellschaft + UID-Land überhaupt
  (erfundene / veraltete Codes fallen auf — z. B. `V0` und `P0` aus der Matrix-Prüfung).
- **Paarungsregel:** Bei ig. Erwerb und ig. Lieferung sind OUT und IN identisch, Netto 0
  (`AF/AF`, `VE/VE`, `DH/DH`, `VH/VH`). Bricht das auf, stimmt die Buchung nicht.
- **Satzkonsistenz:** Code → erwarteter Satz (`06_sap_custtax_map.csv`, Spalte `satz`)
  gegen den tatsächlich gebuchten Satz.
- **Steuerklasse Kunde (TAXK1)** ↔ Code, ebenfalls aus `06_sap_custtax_map.csv`
  (`steuerklasse_kunde` + `alternative_klassen`).
- **Widerspruchsregeln:**
  - EU-Ziel + Ausfuhrcode (`A0`/`D0`/`G0`) → Befund, außer Warenempfänger im Drittland
  - Drittland-Ziel + IG-Code (`AF`/`DH`/`T1`/`C1`/`OB`) → Befund
  - Abgangsland = Bestimmungsland + IG-Code → Befund (kein IG im Inlandsfall)
  - `B5` gebucht, aber steuerliches Abgangsland ≠ CH/LI → Befund (die Z50/Z51-Falle)
  - lokale MwSt gebucht in einem Land ohne eigene UID → Registrierungsbefund

**Stufe 2 — Konstellation (nur mit den angereicherten Feldern).** Die IF-Kaskade aus
`01_szenarien.csv` in genau dieser Reihenfolge, dann `02_uid_findung` Ebene A+B für das
Soll-Kennzeichen. Erster Treffer gewinnt — die Reihenfolge ist nicht beliebig, sie bildet
`early return`s im Code ab.

### 3.3 Baseline statt Sollwert-Pflege

Das Repo fährt bewusst zweigleisig: feste Sollwerte für bekannte Fälle
(`test-matrix.mjs`, 63 Zeilen) **und** eine eingecheckte Vollbaseline über die gesamte
Konstellationsfläche (`tests/matrix-baseline.csv`, 12.642 Zeilen), gegen die gediffed wird.
Der zweite Typ prüft keine Richtigkeit, sondern **Unverändertheit** — er fängt die Fälle,
die niemand von Hand hinterlegt hat.

Für Excel übertragbar: einen Vollexport der geprüften Positionen als Referenzstand
einfrieren und bei jeder Änderung an der Prüflogik nur den **Diff** ansehen, statt das
Blatt neu zu lesen. Wichtig dabei — und im Repo ausdrücklich als Regel hinterlegt: eine
Baseline nie neu setzen, um eine unerklärte Abweichung loszuwerden.

### 3.4 Sollwerte sind zeitabhängig

Die Sätze in `03_laender.csv` sind ein Stand, kein Naturgesetz (EE 24 %, FI 25,5 % sind
junge Änderungen). Für eine Prüfung über mehrere Perioden brauchst du **Gültig-ab/bis** an
Satz und Kennzeichen, sonst prüfst du alte Belege gegen neue Sätze. `SAP_CUSTTAX_MAP`
filtert genau deshalb auf `DATBI = 9999-12-31` — es enthält **nur den aktuellen Stand** und
ist für rückwirkende Prüfungen ungeeignet.

### 3.5 Nicht doppelt arbeiten

- `vat-knowledge/plants_abroad/Matrix_erweitert_V1_2.xlsx` ist bereits eine Excel-Testmatrix
  mit Soll-Kennzeichen je Geschäftsfall, inkl. Blatt `MIRO_Eingang` für die Vorsteuerseite.
  Als Struktur-Vorlage direkt verwendbar.
- `vat-knowledge/plants_abroad/PRUEFUNG.md` listet die bereits gefundenen Abweichungen
  (57/63 deckungsgleich) samt Bewertung. Diese Befunde nicht neu erheben — sie sind in
  `05_abweichungen.csv` mit aufgenommen.
- Die Eingangsseite (MIRO) braucht **zwei Zusatzangaben**, die die Verkaufsseite nicht
  hergibt: das Lieferantenland und ob die eingehende Lieferung bewegt oder ruhend ist.
  Genau das entscheidet zwischen ig. Erwerb (z. B. `W5`) und Inlandseinkauf (z. B. `B7`).

### 3.6 Zwei Lücken, die du selbst schließen musst

- **UVA-Kennzahlen.** Für die Anbindung an die UVA-Kontrolle: Im Repo ist nur `KZ 077`
  (Dreiecksgeschäft, Art. 25 UStG AT) explizit verdrahtet. Eine vollständige Zuordnung
  „Treatment → UVA-Kennzahl (AT) / UStVA-Zeile (DE)" existiert **nicht** und müsste extern
  ergänzt werden.
- **Meldefristen je Land** liegen laut `RGR_TODO.md` in `EPDE_Steuerbuch.xlsx`
  (Sheet „UID-Nr."), nicht in diesem Repo.

---

*Regenerieren: `npm run export:pruefdaten`. Der Export liest ausschließlich — er verändert
weder `app.js` noch die Testdaten.*
