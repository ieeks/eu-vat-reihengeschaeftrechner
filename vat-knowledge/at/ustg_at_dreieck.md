# UStG AT — Dreiecksgeschäft

## Art. 25 UStG AT
AT-Umsetzung von Art. 141 MwStSystRL. Vereinfachung: Mittlerer Unternehmer (B)
muss sich nicht im Bestimmungsland registrieren; Steuerschuld geht auf C über.

## KZ 077 in UVA
Dreiecksgeschäfte werden in der UVA unter Kennzahl 077 gemeldet.
Im Code nicht als eigenes Feld, aber in ZM-/Meldepflicht-Hinweisen referenziert.

## § 21 Abs. 3 UStG AT — ZM-Pflicht
Zusammenfassende Meldung: IG-Lieferungen + Dreiecksgeschäfte melden.
`natLaw('zm')` → `'§ 21 Abs. 3 UStG AT'` bei `isAT` (Z. 1777).

## natLaw('dreiecks') für AT vs. DE
| Schlüssel | AT | DE |
|---|---|---|
| `dreiecks` | `Art. 25 UStG AT / Art. 141 MwStSystRL` | `§ 25b UStG / Art. 141 MwStSystRL` |
| `dreiecks.rc` | `§ 25 Abs. 4 UStG AT` | `§ 25b Abs. 2 / § 14a Abs. 7 UStG` |
| `dreiecks.hint` | `„...gem. Art. 25 UStG AT"` | `„...gem. § 25b UStG"` |

## Implementierung
- `_detectTriangle3()` (Z. 1133): Prüft 5 Bedingungen, gibt `possible:true`
  mit `legalBasis: 'Art. 141 lit. a–e, Art. 42, Art. 197 MwStSystRL / § 25b UStG'`
- `buildDreiecks3Result()` (Z. 3282): Rendert Dreiecks-Banner + L1/L2-Boxen,
  verwendet `selectedUidOverride || me` als aktiven UID-Code
- `invTriangle(uidCode)`: Rechnungspflichtangaben für B→C-Rechnung,
  nutzt `natLaw('dreiecks.rc')` für AT-/DE-spezifischen RC-Hinweis

## isAT-Checks
- `invTriangle()`: AT = `§ 25 Abs. 4 UStG AT`, DE = `§ 25b Abs. 2 UStG`
- `invIG()`: AT = `Art. 6 Abs. 1 iVm. Art. 7 UStG 1994`
- `natLaw()`: Gesamter Dispatch über `isAT = country === 'AT'` (Z. 1760)
- `buildDreiecks3Result()`: RC-Hinweis AT vs. DE (Z. 3312)
