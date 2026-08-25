# Prüfung der SAP-Findungsmatrix „Plants Abroad"

> Lebendes Dokument. **Aktueller Stand: `Matrix_erweitert_V1_2.xlsx`** (25.08.2026, 65 Zeilen,
> Kopfzeile Z2, EPDE Z3–44 · EPROHA Z45–65). Testlauf: `npm run check:matrix`.

**Ergebnis: 57 von 63 prüfbaren Zeilen deckungsgleich** (Vorrunde: 55).
Von den 8 Befunden der ersten Runde sind **4 vollständig und 3 teilweise umgesetzt**; die
Regel-Ebene (Kopfkommentare in Zeile 1) ist unverändert.

---

## 1 · Status der Befunde

| # | Befund (Runde 1) | Status |
|---|---|---|
| A1 | Z54 Abgangsland `FR` ↔ Fallname „Lieferant DE" | ✅ **erledigt** — `country delivered from` = `DE`; Zeile ist jetzt eine saubere DE-Inlandskette (`DS`/`VD`), Rechner bestätigt |
| A2 | Z40 Miro `NP` (ig. Erwerb) statt Inlands-Vorsteuer | ✅ **erledigt** — `NI`, Rechner bestätigt |
| A3 | Z59 Miro `P0` (EPDE-Kennzeichen, für EPROHA nicht hinterlegt) | ✅ **erledigt** — `VD` |
| A4 | Z60 Miro `V0` (existiert im Mapping nicht) | ✅ **erledigt** — `V2` |
| A5 | Z57 Kunden-UID `ATxxx` **und** Abgangsland `AT` | ⚠️ **halb** — Kunden-UID auf `ITxxx` korrigiert, **Abgangsland steht weiter auf `AT`** |
| A6 | Z37 Label „ig. Lieferung" bei Code `CB` + falsche Notiz | ⚠️ **halb** — Label auf „Inlandslieferung" korrigiert, **die Notiz „Dann DH+Dreieck" steht noch** |
| A7 | Z50/51 Label „Ausfuhr Drittland" bei Code `B5` | ⚠️ **halb** — Label auf „Inlandslieferung" korrigiert, **Abgangsland steht weiter auf `AT`** |
| A8 | Z37/38 gleicher Name für gegensätzliche Fälle | ❌ offen |
| B1–B4 | Findungsregeln in Zeile 1 (DAP/DDP → BUKRS · Incoterm-Doppelbedeutung · Dreiecks-Definition · Mondi/SAPPI) | ❌ unverändert |
| D1 | Rechner: Sitzland statt Abgangsland im Ausfuhr-Renderer | ✅ behoben (in `main`) |
| D2 · D3 | Rechner: `DH` trotz fehlender Registrierung · `A2`-Variante beim AT-Drop-Shipment | ❌ offen (`RGR_TODO.md`) |

---

## 2 · Was noch zu tun ist

### 2.1 Der wichtigste offene Punkt: `tax delivered from country` (Z50, Z51, Z57)

Bei diesen drei Zeilen ist das **Label** jetzt richtig, der **Findungs-Hebel** fehlt aber noch.
Das steuerliche Abgangsland ist die Spalte, aus der SAP zusammen mit dem Empfangsland die
Behandlung ableitet:

| Zeile | Abgangsland heute | Ship-to | was SAP daraus findet | gepflegter Code | richtig |
|---|---|---|---|---|---|
| **50** | `AT` | `CH` | AT → CH = **Ausfuhr** → `A0` | `B5` | Abgangsland **`CH`** (CH → CH = Inland → `B5`) |
| **51** | `AT` | `LI` | AT → LI = **Ausfuhr** → `A0` | `B5` | Abgangsland **`LI`** |
| **57** | `AT` | `IT` | AT → IT = **ig. Lieferung** → `AF` | `IC` | Abgangsland **`IT`** (IT → IT = Inland/RC → `IC`) |

Der Zusammenhang ist in allen drei Fällen derselbe: Die Ware ist beim Übergang der
Verfügungsmacht **schon im Bestimmungsland** — bei Z50/51 durch den Eigenimport (DDP,
Art. 7 Abs. 3 Bst. a MWSTG), bei Z57 weil sie Italien nie verlässt. Damit ist der Umsatz eine
Inlandslieferung *dort*, und genau das muss die Abgangsland-Spalte abbilden — sonst findet SAP
`A0` bzw. `AF` und das gepflegte Kennzeichen wird nie erreicht. Die Spaltenregel selbst
(„das Land der UID-Nr") liefert das Ergebnis bereits: Z50/51 tragen die CH-UID, Z57 wäre über
die Ship-to-Regel bei IT.

### 2.2 Zeile 37 — Notiz streichen

> „Wer holt ab? EPDE? Dann DH+Dreieck auf Sales seite & VH in MIRO."

Das gilt nicht: Art. 141 lit. a ist gesperrt, weil EPDE eine SI-UID hält — unabhängig davon, wer
abholt. Rechner: *„Die Dreiecksgeschäfts-Vereinfachung greift hier nicht … verfügt bereits über
eine UID im Bestimmungsland Slowenien."* Ersatz-Notiz z. B.: *„Kein Dreieck (eigene SI-UID,
Art. 141 lit. a) → ig. Erwerb SI (EC) + SI-Inlandslieferung 22 % (CB)."*

### 2.3 Zeilen 37/38 — Benennung und Zeile 38 in sich

Beide Zeilen heißen weiterhin wortgleich *„Strecke EXW – Lieferant Italien (ohne EPDE-UID) – WE
Slowenien"* und unterscheiden sich nur durch „wer holt ab" — kein Feld der Matrix.
Vorschlag: **„… (EPDE holt ab)"** / **„… (Kunde holt ab)"**.

Zusätzlich widerspricht sich Zeile 38 in sich: `tax code sales` = *kein SAP-Stkz, Registrierung
erforderlich*, `treatment` = *ig. Lieferung*, `tax code Miro` = **`VI`**. `VI` ist italienische
Vorsteuer und setzt eine IT-Registrierung voraus — dieselbe, deren Fehlen die Sales-Zelle
begründet. Konsequent wäre: Treatment „Inlandseinkauf IT, keine Registrierung" und Miro
**kein MWSKZ** (22 % IT-MwSt über das Vorsteuervergütungsverfahren).

### 2.4 Regel-Ebene (unverändert seit Runde 1)

- **B1** „DDP/DAP → Land des Buchungskreises" — bricht, sobald wir im Zielland registriert sind.
  Die eigenen Zeilen 50/51 machen es bereits anders (CH-UID statt BUKRS AT). Vorschlag für die
  Drittlandsfassung: **Kunde ist Einführer → UID + Abgangsland = Abgangsland** (`A0`/`D0`/`G0`) ·
  **wir sind Einführer → UID + Abgangsland = Bestimmungsland**, sofern dort registriert (`B5`);
  sonst nicht buchbar.
- **B2** Die Incoterm-Spalte trägt zwei Bedeutungen (Einkaufs-Transport bei EU-Zeilen,
  Einführerrolle bei Drittlandszeilen) → zwei Spalten.
- **B3** Dreiecks-Definition ohne Art. 141 lit. c (Kunde im Bestimmungsland registriert) und
  lit. e (Transport durch A oder B).
- **B4** Mondi/SAPPI: Lieferantenland erst auf der Eingangsrechnung → Fakturasperre für
  EXW-Aufträge ohne bestätigtes Lieferantenland.

---

## 3 · Testlauf `npm run check:matrix`

**57 / 63 deckungsgleich.** Die verbleibenden Abweichungen sind kein Wertfehler mehr:

| Zeile | Matrix | Rechner | Bewertung |
|---|---|---|---|
| 41 · 42 (GB) · 59 · 60 (CH/LI) | `KEIN`/`KEIN` · `G0`/`VD` · `D0`/`VD` · `A0`/`V2` | jeweils die Gegenvariante | **Kein Matrixfehler.** Die vier Zeilen sind untereinander konsistent nach der **Einführerrolle** gepflegt (DDP = wir importieren → keine EU-Kundenrechnung; DAP/EXW = Kunde importiert → Ausfuhr). Der Rechner leitet zusätzlich aus der **Transportzuordnung** ab; setzt man dort „wir transportieren", stimmen alle vier überein. Genau der Beleg für **B2**. |
| 38 | `kein SAP-Stkz` | `DH` + „Registrierungspflicht in Italien" | **Rechner-Befund D2** — die Matrix ist hier ehrlicher |
| 63 | `A2` | `AF` + Warnung | **Rechner-Befund D3** — Variante im Rechner nicht schaltbar |

Alle Wertkorrekturen der ersten Runde sind im Testlauf bestätigt: Z40 `NI` ✓, Z54 `DS`/`VD` ✓,
Z57 `IC`/`VT` ✓, Z59 `D0`/`VD` ✓, Z60 `A0`/`V2` ✓, Z37 `CB`/`EC` ✓, Z50/51 `B5` ✓.

---

## 4 · Nicht abgedeckte Konstellationen (unverändert)

DAP/DDP-Zeilen mit **EU**-Ziel (der Fall, an dem B1 bricht) · Ausfuhr ab Werk CZ ·
**Konsignationslager CH/LI** (Lieferort immer CH/LI, unabhängig vom Incoterm) ·
4-Parteien-Ketten · Lohnveredelung.

---

## Historie

| Runde | Datei | Ergebnis |
|---|---|---|
| 2 · 25.08.2026 | `Matrix_erweitert_V1_2.xlsx` | 57/63 · A1–A4 erledigt, A5–A7 halb, A8 + B1–B4 offen |
| 1 · 25.08.2026 | `Matrix_erweitert_V1.xlsx` | 55/63 · 8 Befunde (A1–A8), 4 Regel-Befunde (B1–B4), Rechner-Bugfix D1 |
| Vorstand | `Matrix_erweitert_EPDE.xlsx` / `..._EPROHA.xlsx` | EXW-Fallback ohne UID im Lieferantenland korrigiert |

### Anhang · Antworten an das SAP-Team (Runde 1)

**CH/LI + DDP:** Der Incoterm entscheidet, wer Einführer ist, und daran hängt der Lieferort.
DAP/EXW → Kunde importiert, Lieferort bleibt AT, steuerfreie Ausfuhr mit AT-UID (`A0`).
DDP → EPROHA importiert auf eigene Rechnung (Art. 7 Abs. 3 Bst. a MWSTG), der Lieferort verlagert
sich in die Schweiz → CH-Inlandslieferung 8,1 % über die CH-Registrierung (`B5`); die AT-Seite ist
die Ausfuhr eigener Ware (intern `A0`, keine zweite Kundenrechnung). LI über den gemeinsamen
MWST-Raum identisch. Konsignationslager: immer CH-Inland, unabhängig vom Incoterm.

**EXW ohne UID im Lieferantenland:** Der BUKRS-Fallback ist der *letzte* Schritt, nicht der
zweite — die Prüfung „hat der Buchungskreis dort eine UID" muss zuerst auf das Ship-to-Land
laufen. Die UID ändert nichts daran, wo die Ware ankommt: ig. Erwerb und Lieferort der
Weiterlieferung liegen in Slowenien (Art. 40 / Art. 31 MwStSystRL). Mit DE-UID käme die
SI-Registrierung trotzdem, zusätzlich griffe Art. 41 MwStSystRL / § 3d S. 2 UStG.
**Merksatz: Der BUKRS-Fallback *ist* der Dreiecksfall** — er trägt nur, wenn wir weder im
Lieferanten- noch im Bestimmungsland registriert sind.

---

*Testskript:* `scripts/test-matrix.mjs` · *Aufruf:* `npm run check:matrix`
