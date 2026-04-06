# Art. 141 MwStSystRL — Dreiecksgeschäft

## Rechtsgrundlage
Art. 141 lit. a–e MwStSystRL: Vereinfachungsregel für innergemeinschaftliche
Dreiecksgeschäfte. Ergänzt durch Art. 42 (Erwerb gilt als besteuert) und
Art. 197 (Steuerschuld geht auf C über, Reverse Charge).

## 5 Bedingungen (lit. a–e)
- **(a)** B (Erwerber) ist NICHT im Bestimmungsland (dest) registriert
- **(b)** Erwerb erfolgt zum Zweck der anschließenden Weiterlieferung
- **(c)** C (Empfänger) sitzt im Bestimmungsland
- **(d)** C wird als Steuerschuldner benannt (RC, Art. 197)
- **(e)** Transport durch A oder B (nicht durch C)

## EuGH-Rechtsprechung
- **C-247/21 Luxury Trust**: Fehlende Pflichtangaben auf Rechnung = materieller
  Mangel, nicht rückwirkend heilbar → `luxuryTrustWarning` im Return-Objekt
- **EuG T-646/24**: Dreiecksgeschäft auch in 4-Parteien-Ketten anwendbar →
  `_detectTriangle4()` implementiert first3/last3/mid3

## Implementierung — _detectTriangle3() (Z. 1133)
1. `transport === 'customer'` → sofort `_noTriangle()` (lit. e verletzt)
2. `usedUidCountry === s1` → blockiert (B nutzt UID aus Land des Lieferanten)
3. `vatIds[dest]` → `'blocked-by-dest-vat'` (lit. a verletzt)
4. `s4 !== dest` → blockiert (lit. c verletzt)
5. NL-Sonderfall: `dest === 'NL' && s1 === 'NL'` → Art. 37c Wet OB 1968

## Implementierung — _detectTriangle4() (Z. 1184)
- **last3**: `s2→s3→s4`, Bedingung: `movingIndex===1 && s4===dest && !bHasDestVat`
  → `deRecognized:true`, klassisch anerkannt
- **first3**: `s1→s2→s3`, Bedingung: `movingIndex===0 && !bHasDestVat`
  → `eugExtended:true`, auf EuG T-646/24 gestützt
- Primary = erstes `deRecognized`-Ergebnis, sonst erstes Ergebnis

## UID-Land-Check
`usedUidCountry = uidOverride || companyHome` — wenn B eine UID aus dem Land
von A verwendet, kann A nicht steuerfrei fakturieren → Dreiecksgeschäft blockiert.
