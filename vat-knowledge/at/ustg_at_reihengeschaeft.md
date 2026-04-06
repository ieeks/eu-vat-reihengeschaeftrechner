# UStG AT — Reihengeschäft

## § 3 Abs. 8 UStG AT — Lieferort der bewegten Lieferung
Ort der Lieferung bei Beförderung/Versendung = Ort, wo Beförderung beginnt.
Entspricht Art. 32 MwStSystRL. Im Code: `placeOfSupply = dep` bei `isMoving`.

## § 3 Abs. 15 Z 1 UStG AT — Zuordnung (Quick-Fix-Umsetzung)
- **lit. a**: Zwischenhändler teilt dep-UID mit, nicht ansässig → L vor ZH bewegend
- **lit. b**: Andere UID oder Ansässigkeits-UID → L ab ZH bewegend
- **lit. c**: Keine dep-UID, nicht ansässig → Standardregel (L vor ZH)
Entspricht Art. 36a Abs. 2 MwStSystRL. In `_applyQuickFix()` als
`legalBasis` referenziert (Z. 946, 960, 981).

## Art. 6 Abs. 1 iVm. Art. 7 UStG 1994 — IG-Lieferung AT
Steuerbefreiung der innergemeinschaftlichen Lieferung bei Nachweis.
Im Code: `natLaw('ig.exempt')` gibt bei `isAT` diesen Verweis zurück (Z. 1763).

## § 27 Abs. 4 UStG AT — Haftung AT-Inlandskette
Haftungsregel bei Inlandslieferungen in AT. Relevant wenn `dep === dest === 'AT'`.

## Implementierung
- `analyze2()` (Z. 4151): Mode-2-Analyse für EPROHA (Sitz AT), liest `dest`
  aus UI, unterscheidet AT→CH, AT→EU, AT→AT, Drop-Shipment
- `analyzeInland(ctx)` (Z. 2445): Greift wenn `dep === dest` (kein IG-Sachverhalt),
  alle Lieferungen sind Inlandslieferungen mit lokaler MwSt
- `COMPANIES['EPROHA']`: `home='AT'`, `establishments=['AT']`,
  `vatIds: { AT:'ATU36513402', DE:'DE248554278', CH:'CHE-113.857.016 MWST' }`

## AT-spezifische Notation
Im Code: `isAT`-Check in `natLaw()` (Z. 1760) — AT verwendet „Art." statt „§"
für UStG-Verweise (z.B. Art. 6, Art. 7, Art. 25 UStG 1994).
