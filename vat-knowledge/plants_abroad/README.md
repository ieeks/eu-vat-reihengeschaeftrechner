# Begleitdokument zu den Test-Matrizen „Plants Abroad" (EPDE & EPROHA)

> **Aktueller Stand (25.08.2026): `Matrix_erweitert_V1.xlsx`** — eine Datei für beide
> Gesellschaften (EPDE Zeilen 3–44, EPROHA 45–65), mit den neuen Spalten `Dreiecksgeschäft`,
> `L/S` (Lager/Strecke), gefülltem `tax code Miro` und den Findungsregeln als Kommentar in
> Zeile 1. Die getrennten Dateien `Matrix_erweitert_EPDE.xlsx` / `Matrix_erweitert_EPROHA.xlsx`
> sind der Vorstand und bleiben zum Vergleich liegen.
> Prüfbericht + Rechner-Testlauf: [`PRUEFUNG_V1.md`](PRUEFUNG_V1.md) · `npm run check:matrix`

**Zweck dieses Dokuments:** Erklärung der beiden Excel-Dateien für die Buchhaltung / den
Steuerbereich — was darin steht, wie die Werte zustande kommen und was damit geprüft werden soll.

---

## 1. Worum geht es?

Für die SAP-Steuerkennzeichen-Findung („Plants Abroad" — Werke/Registrierungen im Ausland)
soll geprüft werden, ob **SAP in jeder Geschäftskonstellation das steuerlich richtige
Kennzeichen** (MWSKZ) ermittelt.

Dazu gibt es zwei Referenzen, die zusammengeführt wurden:

1. die **ursprüngliche SAP-Matrix** aus dem Workshop „Matrix for Plant Abroads" (18.06.2026), und
2. den **EU-VAT-Reihengeschäftsrechner** — ein Tool, das die umsatzsteuerliche Behandlung eines
   Geschäfts aus dem EU-Recht ableitet und je Fall das erwartete SAP-Kennzeichen ausgibt.

Die beiden Excel-Dateien sind eine **erweiterte Testmatrix**: viele typische Fälle, jeweils mit
dem **erwarteten Steuerkennzeichen**. Dieses Erwartungs-Kennzeichen ist **aus der Rechner-Logik
abgeleitet** (nicht von Hand geschätzt). Es dient als Soll-Wert, gegen den das SAP-Ergebnis
verglichen wird.

> **Kurz:** Spalte „tax code sales" = *so müsste SAP entscheiden*. Weicht SAP ab, ist das ein
> Prüf-/Korrekturfall.

Als Kontrolle wurde die Logik zuerst gegen die **8 Original-Zeilen der SAP-Matrix** laufen
gelassen — sie reproduziert alle 8 exakt. Erst danach wurden die zusätzlichen Fälle erzeugt.

---

## 2. Die beiden Dateien

| Datei | Gesellschaft | Buchungskreis-Land | Fälle | Registrierungen (UIDs) |
|---|---|---|---|---|
| **Matrix_erweitert_EPDE.xlsx** | EPDE | Deutschland (DE) | 40 | DE, PL, CZ, SI, BE, NL, LV, EE |
| **Matrix_erweitert_EPROHA.xlsx** | EPROHA | Österreich (AT) | 34 | AT, DE, CH (deckt auch LI) |

Die EPROHA-Datei enthält bewusst die **Schweiz (CH)** und **Liechtenstein (LI)**, weil das die
Drittland-Fälle mit eigener Registrierung sind.

Jede Datei hat zusätzlich die Tabellenblätter **„MIRO_Eingang"** (Eingangs-/Vorsteuerseite, siehe
Punkt 6) und **„Hinweise"** (Erläuterungen, u. a. zur Transport-/Positionsvariation, Punkt 10).

---

## 3. Was bedeuten die Spalten?

| Spalte | Bedeutung |
|---|---|
| **business case** | Kurzbeschreibung der Geschäftskonstellation |
| **sales org / plant** | SAP-Verkaufsorganisation und Werk (1701 = DE, 1702 = PL, 1703 = CZ; EPROHA-Werte als Platzhalter) |
| **country of company code** | Sitzland des Buchungskreises (EPDE = DE, EPROHA = AT) |
| **incoterm purchase order** | relevanter Incoterm — insbesondere **EXW** hat eine Sonderregel (siehe Punkt 5) |
| **uid company code** | **Welche eigene UID-Nummer** verwendet wird (echte Nummern eingetragen) |
| **uid Findung (Info)** | *Warum* diese UID: Werk / Ship-to-Land / EXW-Lieferantland / BUKRS-Fallback |
| **country delivered from** | physisches Abgangsland der Ware |
| **tax delivered from country** | **steuerliches** Abgangsland (kann vom physischen abweichen!) |
| **ship-to country** | Warenempfänger-Land |
| **UID – determination – customer** | UID des Kunden (Format-Platzhalter „…xxx") |
| **tax code sales** | **⭐ erwartetes SAP-Ausgangs-Steuerkennzeichen** (der Soll-Wert für den Abgleich) |
| **treatment (Info)** | umsatzsteuerliche Einordnung im Klartext (Inland / ig. Lieferung / Ausfuhr) |
| **im Rechner-Code** *(nur EPROHA)* | ob das Tool den Fall abdeckt |
| **tax code Miro** | Eingangs-/Einkaufs-Kennzeichen — **bewusst offen gelassen** (siehe Punkt 6) |
| **derivation note** | Hinweis, wie die UID hergeleitet wurde |

---

## 4. Die UID-Findung in einfachen Worten

Welche eigene UID-Nummer verwendet wird, folgt dieser Reihenfolge:

1. **Lieferung ab eigenem Werk** → UID aus dem **Werksland**
   (z. B. Werk Polen → PL-UID).
2. **Streckengeschäft (3rd party)** → UID aus dem **Warenempfänger-Land**, sofern wir dort eine
   UID haben — sonst UID des **Buchungskreises** (Fallback: EPDE → DE, EPROHA → AT).
3. **Incoterm EXW** → UID aus dem **Lieferantenland** (EXW hat Vorrang, siehe Punkt 5).
   Haben wir im Lieferantenland **keine** UID, greift wieder Stufe 2: **zuerst das
   Warenempfänger-Land**, erst danach der Buchungskreis.

Aus **UID-Land + Warenempfänger-Land** ergibt sich dann die steuerliche Behandlung:

| Situation | Behandlung | Beispiel-Kennzeichen |
|---|---|---|
| Warenempfänger = UID-Land | **Inlandslieferung** (lokale MwSt) | A4 (PL), CB (SI), DS/A2 (DE/AT) |
| Warenempfänger ≠ UID-Land, beide EU | **ig. Lieferung** (0 %) | T1 (PL), DH (DE), AF (AT) |
| Warenempfänger im Drittland | **Ausfuhr** (0 %) | A0 (AT), D0/G0 (DE), B5 = CH/LI-Inland |

---

## 5. Sonderfall EXW (wichtig!)

Bei **EXW** („ab Werk", Kunde holt ab) dreht sich die Zuordnung: Die maßgebliche eigene UID wird
aus dem **Lieferantenland** gezogen, nicht aus dem Warenempfänger-Land. Dadurch kann **dieselbe
Warenkonstellation je nach Incoterm ein anderes Kennzeichen** ergeben.

Beispiel (EPDE, Lieferant in DE/EU, Warenempfänger Slowenien):
- **mit EXW** → DE-UID, ig. Lieferung → **DH**
- **ohne EXW** → SI-UID, Inlandslieferung Slowenien → **CB**

Das ist kein Fehler, sondern gewollt — beim SAP-Test unbedingt den Incoterm mitgeben.

### Fallback, wenn wir im Lieferantenland keine UID haben

Die EXW-Regel funktioniert, solange wir im Lieferantenland registriert sind — dann ist es genau
der Fall des Art. 36a Abs. 2 MwStSystRL (mitgeteilte **Abgangsland**-UID verschiebt die
Warenbewegung auf unsere Ausgangslieferung, z. B. EXW Polen → PL-UID → **T1**).

Fehlt diese UID, darf **nicht** direkt auf den Buchungskreis DE zurückgefallen werden: Ohne
Abgangsland-UID bleibt es bei der Grundregel des Art. 36a **Abs. 1** — bewegt ist die
**Eingangs**lieferung, der ig. Erwerb entsteht im Warenempfänger-Land, und unsere Ausgangs-
lieferung ist dort eine **ruhende Inlandslieferung**.

Beispiel EPDE, **EXW Lieferant Italien → Warenempfänger Slowenien** (Zeile in der Matrix):

| | UID | tax code sales | warum |
|---|---|---|---|
| ~~alt~~ | DE449663039 | ~~DH~~ | Fallback BUKRS DE — unterstellt stillschweigend ein Dreiecksgeschäft |
| **richtig** | **SI66423562** | **CB** | Ship-to-UID; Dreieck ist gesperrt, weil wir im Bestimmungsland registriert sind |

Grund: **Art. 141 lit. a** setzt voraus, dass der mittlere Unternehmer im Bestimmungsland
**keine** UID hat. EPDE hat eine SI-UID → kein Dreiecksgeschäft → L2 ist eine slowenische
Inlandslieferung mit 22 % (**CB**), Eingangsseite ig. Erwerb SI (**EC**). Mit der DE-UID drohte
zusätzlich der Doppelerwerb nach Art. 41 MwStSystRL / § 3d S. 2 UStG.

**Gegenprobe EPROHA:** dieselbe Konstellation (EXW Lieferant IT → WE Slowenien) bleibt in der
EPROHA-Matrix korrekt bei AT-UID → **AF**, weil EPROHA in Slowenien *nicht* registriert ist und
das Dreiecksgeschäft damit offensteht. Gleiche Warenkette, andere Gesellschaft, anderes
Kennzeichen — die eigene Registrierungslandkarte entscheidet.

---

## 6. Die Eingangsseite (MIRO) — Blatt „MIRO_Eingang"

Im Hauptblatt ist **tax code Miro** bewusst offen (`⟶ in SAP prüfen`), weil es von der
**Verkaufs**-Konstellation allein nicht ableitbar ist. Für die **Eingangsseite** gibt es deshalb
ein eigenes Tabellenblatt **„MIRO_Eingang"** mit einer eigenen Logik.

Das MIRO-Kennzeichen folgt **vier Vorgängen** (aus Käufer-/Erwerbersicht):

| Vorgang | wann | Beispiel-Kennzeichen |
|---|---|---|
| **ig. Erwerb** | eingehende Lieferung ist **bewegt** (Ware kommt grenzüberschreitend zu uns) → Selbstveranlagung im Ankunftsland | VE (AT), VH (DE), W5 (PL), EC (SI), UR (CZ) … |
| **Inlandseinkauf** | eingehende Lieferung ist **ruhend** (Ware schon im Land, Lieferant weist lokale MwSt aus) → Vorsteuer | VD (DE), V2 (AT), B7 (PL), IB (CH/LI) … |
| **Reverse Charge** | Auslandslieferant, wir Steuerschuldner | DC (DE §13b), RC (AT), VI (IT) |
| **Einfuhr Drittland** | Ware aus CH/GB/… | EUSt über EORI (kein Tabellen-MWSKZ) |
| *entfällt* | eigene Ware ab Werk → kein Einkauf | *not relevant* |

**Wichtig:** MIRO braucht **zwei Zusatz-Eingaben**, die die Verkaufsseite nicht hergibt — das
**Lieferantenland** und ob die **eingehende Lieferung bewegt oder ruhend** ist. Genau das
entscheidet zwischen ig. Erwerb (z. B. W5) und Inlandseinkauf (z. B. B7) und erklärt die
scheinbare Inkonsistenz der Original-Matrix (Zeile 3 = B7, Zeilen 5/6 = VD).

**Offen zu klären:** Der Workshop hat MIRO als teils **manuell** markiert („steuerliches
Abgangsland in der MIRO-Buchung korrekt pflegen"). Vor einer Automatisierung mit dem SAP-Team
abstimmen, ob die Findung MIRO automatisch ermitteln soll oder ob es ein manueller Schritt bleibt.

---

## 7. Welche Fälle sind abgedeckt?

**EPDE (40 Fälle):**
- Lageraufträge ab Werk PL / CZ / DE (Inland, ig. Lieferung, Ausfuhr)
- Streckengeschäfte ohne EXW (Ship-to-Findung, Dreiecksgeschäft über DE-Fallback)
- Streckengeschäfte mit EXW (Lieferantland-Regel)
- **Ausfuhr ins Drittland** (Schweiz / Liechtenstein / Großbritannien → G0)
- **SI als ig.-Lieferungs-Ausgang** (SI-UID → anderes EU-Land → C1)
- **Echtes Dreiecksgeschäft**, EPDE als mittlerer Unternehmer (Art. 141 → DH; ig. Erwerb VH)
- bewusst enthaltene **bekannte SAP-Lücken** (rot markiert), wo das Tool **kein** Kennzeichen hat —
  z. B. ig. Lieferung mit BE/NL/LV/EE-UID als Verkäufer, oder Ausfuhr ab PL-/CZ-Werk. Diese Zeilen
  sind gezielte Prüf-Kandidaten für SAP.

**EPROHA (34 Fälle):**
- Lageraufträge ab AT / DE / CH-Konsignationslager
- Streckengeschäfte ohne/mit EXW
- **Schweiz & Liechtenstein** im Fokus: Ausfuhr (DAP/EXW → A0/D0) vs. CH/LI-Inland (DDP → B5, 8,1 %)
- **Ausfuhr nach Großbritannien** (A0 / D0)
- **Echtes Dreiecksgeschäft**, EPROHA als mittlerer Unternehmer (Art. 141 → AF; ig. Erwerb VE)
- **Drop-Shipment** (Warenempfänger ≠ Kunde): ig. Lieferung AF · 20 % AT (A2) bei fehlender
  Kunden-UID · ig. Reihengeschäft bei Drittland-Kunde mit EU-Warenempfänger

**Liechtenstein (LI):** LI bildet mit der Schweiz einen **gemeinsamen Mehrwertsteuer-Raum**
(Zollvertrag 1923). Es wird durchgehend **wie die Schweiz** behandelt; die CH-Registrierung deckt
LI mit ab. LI ist seit der jüngsten Tool-Anpassung vollständig abgedeckt.

---

## 8. Steuerkennzeichen-Kurzglossar

| Code | Bedeutung |
|---|---|
| **A4 / B7** | Inland Polen 23 % (Ausgang / Vorsteuer) |
| **T1 / W5** | Polen: ig. Lieferung 0 % / ig. Erwerb |
| **CB / C1** | Slowenien: Inland 22 % (Ausgang) / ig. Lieferung 0 % |
| **AE / OB** | Tschechien: Inland 21 % / ig. Lieferung 0 % |
| **DS / VD** | Inland Deutschland 19 % (Ausgang / Vorsteuer) |
| **DH / VH** | Deutschland: ig. Lieferung 0 % / ig. Erwerb |
| **A2 / V2** | Inland Österreich 20 % (Ausgang / Vorsteuer) |
| **AF / VE** | Österreich: ig. Lieferung 0 % / ig. Erwerb |
| **A0** | Ausfuhr Drittland 0 % (über AT-UID) |
| **D0 / G0** | Ausfuhr Drittland 0 % (über DE-UID) |
| **B5** | CH/LI-Inland (Schweizer MWST 8,1 %) |

---

## 9. So wird die Matrix genutzt

1. Jede Zeile ist ein Testfall: Konstellation in SAP nachstellen.
2. Das von SAP ermittelte Ausgangs-Steuerkennzeichen mit **„tax code sales"** vergleichen.
3. **Stimmt es überein** → Findung korrekt.
4. **Weicht es ab** oder SAP liefert nichts, wo ein Wert erwartet wird → Prüf-/Korrekturfall.
5. **tax code Miro** aus SAP ergänzen und separat prüfen.

---

## 10. Wichtiger Hinweis: Transport-/Positionsvariation im Reihengeschäft

Diese Matrix bildet die **SAP-Findung** ab, die **ship-to-/werks-/incoterm-basiert** ist.

Im EU-Reihengeschäft kann **dieselbe Länderkonstellation** je nachdem,
- **wer die Ware transportiert** (Lieferant / mittlerer Unternehmer / Kunde) und
- **an welcher Position** der eigene Buchungskreis in der Kette steht (erster / mittlerer / letzter),

eine **andere „bewegte Lieferung"** und damit ein **anderes Steuerkennzeichen** ergeben
(EuGH C-245/04 *EMAG*; Art. 36a MwStSystRL / Quick Fixes).

Die SAP-Findung modelliert diese **Transportzuordnung nach aktuellem Stand nicht explizit** — sie
leitet aus Werk / Ship-to / Incoterm ab. **EXW ist der einzige explizit abgebildete
Transport-Trigger** (dreht die UID auf das Lieferantenland).

**Konsequenz:** Bei mehrgliedrigen Ketten mit abweichender Transportveranlassung gesondert prüfen —
hier besteht zwischen der ship-to-basierten SAP-Logik und der transportbasierten Rechtslage eine
bewusste Vereinfachung. **Mit dem SAP-Team klären, ob die Findung die Transportzuordnung überhaupt
berücksichtigen soll.** (Dieser Hinweis steht auch im Tabellenblatt „Hinweise" beider Dateien.)

---

*Erwartungswerte abgeleitet aus dem EU-VAT-Reihengeschäftsrechner (EU-Recht: MwStSystRL, UStG
AT/DE, nationale Regelungen PL/CZ/SI, Schweizer MWSTG für CH/LI). Zur Validierung gegen die
tatsächliche SAP-Findung gedacht — kein Ersatz für die steuerliche Einzelfallwürdigung.*
