# Dreiecksgeschäft — Bedingungen & Code-Mapping

## Art. 141 lit. a–e — Code-Mapping
| Bedingung | Prüfung in _detectTriangle3() | Blockiert wenn |
|---|---|---|
| (a) B nicht in dest registriert | `!!vatIds[dest]` | `vatIds[dest]` vorhanden → `'blocked-by-dest-vat'` |
| (b) Erwerb für Weiterlieferung | implizit angenommen | — |
| (c) C sitzt in dest | `s4 !== dest` | C nicht im Bestimmungsland |
| (d) RC auf C (Art. 197) | implizit gesetzt | — |
| (e) Transport durch A oder B | `transport === 'customer'` | Transport durch C → sofort false |

## UID-Land-Check
`usedUidCountry = uidOverride || companyHome`
Wenn `usedUidCountry === s1` → Lieferant müsste L1 als Inlandslieferung behandeln
→ keine steuerfreie IG-Lieferung möglich → Dreiecksgeschäft blockiert.

## _detectTriangle4() — 4-Parteien-Varianten
| Variante | Parteien | Bedingung | deRecognized |
|---|---|---|---|
| **last3** | U2→U3→U4 | `movingIndex===1 && s4===dest && !bHasDestVat` | `true` |
| **first3** | U1→U2→U3 | `movingIndex===0 && !bHasDestVat` | `false` (eugExtended) |

- `last3`: Alle 3 Parteien in verschiedenen MS, U4 im dest
- `first3`: U3 muss NICHT in dest sitzen (registriert sich erst dort)
- Primary = erstes `deRecognized`-Ergebnis || erstes Ergebnis überhaupt

## dreiecksOpportunity
Berechnet in `buildKurzbeschreibung()`:
```js
!eng.trianglePossible && !vatIds[dest] && s2!==s4 && s1!==s4
&& movIdx===0 && s4===dest && hasAnyNonDestId && alle EU
```
Zeigt „Dreiecksgeschäft möglich"-Banner in `buildDreiecksOpportunity()`.
Wird aktiv wenn User eine UID auswählt (`selectedUidOverride`).
In `buildVergleichTab()` pro Transport-Szenario einzeln berechnet.

## NL-Sonderfall
`dest === 'NL' && s1 === 'NL'` → Art. 37c Wet OB 1968 Bedingung (3):
Ware darf nicht aus dem MS kommen, der B die NL-UID erteilt hat.
Da B die NL-UID von NL hat und Ware aus NL kommt → blockiert.

---

## Bewusste Design-Entscheidung: UID = Blockierung (konservative Auslegung)

### Was der Code macht
```js
// _detectTriangle3()
if (!!vatIds[dest]) return _noTriangle(
  'Art. 141 lit. a: B hat USt-ID in ' + dest + ' → Vereinfachung blockiert.',
  'blocked-by-dest-vat'
);

// _detectTriangle4()
const bHasDestVat = !!vatIds[dest];
```

### Warum das so bleibt — NICHT ÄNDERN

Art. 141 lit. a MwStSystRL sagt dem Wortlaut nach "nicht niedergelassen"
(kein Sitz, keine feste Niederlassung) — nicht "keine UID".

Es gibt daher eine liberalere Rechtsauffassung (VwGH 15.12.2021
Ro 2020/15/0003, UStR Rz 4150, Quick Fixes Explanatory Notes
Beispiel 8 S. 66) die besagt: eine bloße Registrierung ohne
Niederlassung blockiert Art. 141 nicht.

**Diese liberale Auslegung wird bewusst NICHT implementiert.**

Grund: Steuerrechtliche Beratung (2024) hat explizit bestätigt dass
die bestehende SI-Registrierung von EPDE dazu führt dass
verpflichtend mit slowenischer MwSt fakturiert werden muss.
Die nationalen Finanzbehörden (insb. SI, PL, CZ) folgen
mehrheitlich der strengen Auslegung. Bei Betriebsprüfung
würde die liberale Position ein erhebliches Nachforderungsrisiko
bedeuten.

**Das Tool wählt bewusst die compliance-sichere Option.**

### Betroffene Länder für EPDE
SI, LV, EE, NL, BE, CZ, PL — alle mit UID aber ohne Niederlassung.
In diesen 7 Ländern blockiert die UID das Dreiecksgeschäft,
auch wenn Art. 141 lit. a dem Wortlaut nach nur "niedergelassen"
verlangt.

### Betroffene Länder für EPROHA
DE, CH — UID ohne Niederlassung (echter Sitz nur AT).

### Wenn diese Entscheidung revidiert werden soll
Nur nach erneuter steuerrechtlicher Beratung und expliziter
Freigabe. Dann establishments-Array in COMPANIES verwenden:
- EPDE: establishments = ['DE']
- EPROHA: establishments = ['AT']
Und vatIds[dest]-Check durch establishments.includes(dest) ersetzen
in _detectTriangle3() und _detectTriangle4().

**Aktueller Stand**: `establishments`-Array existiert in COMPANIES-Objekten,
wird aber in `_detectTriangle3()` und `_detectTriangle4()` **nie verwendet** —
dort gilt weiterhin `vatIds[dest]`.
`establishments` aktiv verwendet in:
1. `_checkRCBlock()` → BE-Branch (hasEstablishment('BE'))
2. `classifySupplies()` → sellerEstablished-Check:
   `establishments.includes(pos) || (from===companyHome && companyHome===pos)`
   → beeinflusst RC, Inlandslieferung, Registrierungspflicht
