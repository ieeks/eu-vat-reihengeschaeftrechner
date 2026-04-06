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
`usedUidCountry = uidOverride || companyHome` (Z. 1153)
Wenn `usedUidCountry === s1` → Lieferant müsste L1 als Inlandslieferung behandeln
→ keine steuerfreie IG-Lieferung möglich → Dreiecksgeschäft blockiert.

## _detectTriangle4() — 4-Parteien-Varianten (Z. 1184)
| Variante | Parteien | Bedingung | deRecognized |
|---|---|---|---|
| **last3** | U2→U3→U4 | `movingIndex===1 && s4===dest && !bHasDestVat` | `true` |
| **first3** | U1→U2→U3 | `movingIndex===0 && !bHasDestVat` | `false` (eugExtended) |

- `last3`: Alle 3 Parteien in verschiedenen MS, U4 im dest
- `first3`: U3 muss NICHT in dest sitzen (registriert sich erst dort)
- Primary = erstes `deRecognized`-Ergebnis || erstes Ergebnis überhaupt

## dreiecksOpportunity
Berechnet in `buildKurzbeschreibung()` (Z. 5347):
```js
!eng.trianglePossible && !vatIds[dest] && s2!==s4 && s1!==s4
&& movIdx===0 && s4===dest && hasAnyNonDestId && alle EU
```
Zeigt „Dreiecksgeschäft möglich"-Banner in `buildDreiecksOpportunity()`.
Wird aktiv wenn User eine UID auswählt (`selectedUidOverride`).
In `buildVergleichTab()` (Z. 8884) pro Transport-Szenario einzeln berechnet.

## NL-Sonderfall
`dest === 'NL' && s1 === 'NL'` → Art. 37c Wet OB 1968 Bedingung (3):
Ware darf nicht aus dem MS kommen, der B die NL-UID erteilt hat.
Da B die NL-UID von NL hat und Ware aus NL kommt → blockiert (Z. 1165).
