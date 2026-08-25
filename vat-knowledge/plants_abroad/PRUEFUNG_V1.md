# Prüfung `Matrix_erweitert_V1.xlsx` — Zeile für Zeile + Rechner-Testlauf

**Stand:** 25.08.2026 · **Geprüfte Datei:** `Matrix_erweitert_V1.xlsx` (65 Zeilen, Kopfzeile Z2,
EPDE Z3–44 · EPROHA Z45–65) — die aktuell verwendete Arbeitsfassung. Sie ersetzt die getrennten
Dateien `Matrix_erweitert_EPDE.xlsx` / `Matrix_erweitert_EPROHA.xlsx` (bleiben als Vorstand liegen).

**Testlauf:** `npm run check:matrix` (`scripts/test-matrix.mjs`) fährt jede Zeile durch den Rechner
und vergleicht `tax code sales` und `tax code Miro`.
**Ergebnis: 55 von 63 prüfbaren Zeilen deckungsgleich**, 8 Abweichungen — alle unten aufgelöst.

---

## A · Zu korrigieren in der Matrix

| # | Zeile | Befund | Richtig |
|---|---|---|---|
| A1 | 54 | `country delivered from = FR`, Fallname sagt „Lieferant DE", Miro `VD` (DE-Inlandseinkauf). Bei FR-Lieferant ist der Eingang ein **ig. Erwerb** → `VH`. Mit `VH` ist die Zeile eine Dublette zu Z55. | Abgangsland auf **DE** korrigieren (dann `VD` richtig) — oder Zeile streichen |
| A2 | 40 | Miro `NP` (ig. Erwerb NL) — bei EXW + NL-UID ist L1 eine **NL-Inlandslieferung an uns**, kein grenzüberschreitender Erwerb. Z34/35/36/43 buchen in derselben Konstellation korrekt den Inlands-Vorsteuercode (B7/VC/BI/SI). | **`NI`** (NL-Vorsteuer 21 %) |
| A3 | 59 | Miro `P0` — der Einkauf beim DE-Lieferanten ist eine DE-Inlandslieferung mit 19 %. `P0` ist im Mapping ein **EPDE**-Kennzeichen (`rc-purchase`, Drittlandseinkauf) und für EPROHA gar nicht hinterlegt. | **`VD`** |
| A4 | 60 | Miro `V0` — dieses Kennzeichen existiert im Mapping **nirgends** (weder EPDE noch EPROHA). AT-Inlandseinkauf. | **`V2`** |
| A5 | 57 | `tax delivered from country = AT`, obwohl die Ware Italien nie verlässt und das Ausgangs-Kennzeichen `IC` italienisch ist → SAP leitet sonst einen AT-Vorgang ab. Zusätzlich `UID – determination – customer = ATxxx`, obwohl der Kunde Italiener ist und die Steuer per inversione schuldet. | **`IT`** · Kunden-UID **`ITxxx`** |
| A6 | 37 | `treatment = ig. Lieferung`, Code ist aber `CB` = **slowenische Inlandslieferung**. Die `derivation note` („Wer holt ab? EPDE? Dann DH+Dreieck") ist falsch: Art. 141 lit. a ist gesperrt, weil EPDE eine **SI-UID** hat — unabhängig davon, wer abholt. | Label **Inlandslieferung**; Note streichen (Codes `CB`/`EC` stimmen) |
| A7 | 50, 51 | `treatment = Ausfuhr Drittland`, Code ist aber `B5` = CH/LI-**Inland** 8,1 %. Bei DDP ist der Verkauf eine Inlandslieferung *nach Eigenimport*. | Label **CH/LI-Inlandslieferung (nach Eigenimport)** |
| A8 | 37 + 38 | Zwei Zeilen, **gleicher Geschäftsfall, gleicher Incoterm, gegensätzliches Ergebnis** — unterschieden allein durch „wer holt ab", was in der Matrix kein Feld ist. Z37 folgt zudem nicht der Kopfregel (EXW → Lieferantenland IT → Fallback), sondern nimmt die Ship-to-UID. | Zeilen als **„EPDE holt"** / **„Kunde holt"** benennen; Kopfregel um den Ship-to-Fallback ergänzen |

## B · Regel-Ebene (Kommentare in Zeile 1)

| # | Regel | Befund |
|---|---|---|
| B1 | „**DDP: Land des Buchungskreises · DAP: Land des Buchungskreises**" | Bricht, sobald wir im Warenempfänger-Land registriert sind. Beispiel *DAP, Lieferant SE, WE Slowenien*: Regel → DE-UID → `DH`; richtig ist **SI-UID → `CB`** (Dreieck durch die eigene SI-Registrierung gesperrt, sonst Doppelerwerb nach Art. 41). In V1 ist kein solcher Fall enthalten — die Regel würde ihn falsch entscheiden. **Empfehlung:** DAP/DDP wie „alle anderen" behandeln (Ship-to zuerst, dann BUKRS); die BUKRS-Regel nur für Drittlandsziele ohne eigene Registrierung. |
| B2 | Spalte `incoterm purchase order` | Trägt **zwei Bedeutungen**: bei EU-Zeilen die Transportzuordnung im *Einkauf* (EXW = wir holen), bei Drittlandszeilen (41/42/48–52/59/60) den *Verkaufs*-Incoterm (wer ist Einführer). Der Testlauf macht das sichtbar: Z42 (DAP) liefert `G0/VD` **nur, wenn wir transportieren**; transportiert der Lieferant, ist unsere L2 eine GB-Inlandslieferung ohne MWSKZ — und für Z41 (DDP) genau umgekehrt. **Empfehlung:** zwei Spalten „Incoterm Einkauf" und „Incoterm Verkauf / Einführer". |
| B3 | Dreiecks-Definition | „3 unterschiedliche EU-Länder" ist unvollständig: es fehlen (a) **Transport durch A oder B** — holt der Endkunde ab, kein Dreieck (Art. 141 lit. e; genau Zeile 38) und (b) **Kunde im Bestimmungsland registriert** (lit. c). |
| B4 | „Spezialfall Mondi/SAPPI: Lieferantenland erst auf der Eingangsrechnung" | Echtes Prozessrisiko: Die EXW-Regel braucht das Lieferantenland bei Auftragsanlage. Steht es erst mit der Eingangsrechnung fest, ist die Ausgangsrechnung ggf. schon mit der falschen UID gedruckt. **Empfehlung:** Fakturasperre für EXW-Aufträge ohne bestätigtes Lieferantenland. |

## C · Bestätigt korrekt (Auswahl)

- **Z18** (Lieferant DE → WE IT mit **SI**-UID → `C1`/`EC`) ist kein Fehler, sondern ein bewusst
  konstruiertes Dreieck über eine Dritt-MS-UID: mit der DE-UID wäre das Dreieck gesperrt
  (UID-Land = Abgangsland), mit der SI-UID sind die drei Länder DE·SI·IT verschieden. Rechner
  bestätigt `C1`/`EC`. Preis: SI-Meldung (UVA + ZM) für Ware, die Slowenien nie berührt.
- **Z19/32** (EXW/FCA + Abgangsland-UID) — Art. 36a Abs. 2: die Bewegung rutscht auf unsere
  Ausgangslieferung, L1 wird Inlandseinkauf. `DH`/`VD` ✓
- **Z24** NL mit `NC` — NL ist der einzige Fall, in dem EPDE Reverse Charge anwenden darf
  (Art. 12 Abs. 3 Wet OB) ✓
- **Z27–31, 56, 58** Dreiecke über die Heimat-UID ✓ · **Z12/13/39/40** SAP-Lücken korrekt als
  Lücke markiert ✓ · **Z62/64/65** Drop-Shipment EPROHA ✓

## D · Befunde im Rechner (nicht in der Matrix)

| # | Befund | Status |
|---|---|---|
| D1 | `_importerConsequence()` nahm für die ruhende L1 **und** die Ausfuhr das *Sitzland* statt des Abgangslands: EPDE PL→CH zeigte `VD` statt `B7` und `G0` statt „kein MWSKZ"; EPROHA DE→CH zeigte `V2` statt `VD`. | **behoben** (54 Output-Tests grün) |
| D2 | Fall Zeile 38 (Kunde holt in IT ab, keine IT-UID): Der Rechner warnt korrekt „Registrierungspflicht in Italien", zeigt daneben aber `DH` als Ausgangs-Kennzeichen. Ohne IT-Registrierung ist die ig. Lieferung aus Italien nicht über die DE-UID buchbar — die Matrix („kein SAP-Stkz") ist hier ehrlicher. | offen → `RGR_TODO.md` |
| D3 | Drop-Ship AT-Kunde **ohne** fremde EU-UID (Zeile 63 → `A2`) ist im Rechner nicht als eigener Fall schaltbar; er zeigt `AF` plus den Hinweis „sonst 20 % AT". | offen → `RGR_TODO.md` |

## E · Nicht abgedeckte Konstellationen

DAP/DDP-Zeilen mit EU-Ziel (genau der Fall aus B1) · Ausfuhr ab Werk CZ · CH-Konsignationslager
(EPROHA) · 4-Parteien-Ketten · Lohnveredelung.

---

*Testskript:* `scripts/test-matrix.mjs` · *Aufruf:* `npm run check:matrix`
