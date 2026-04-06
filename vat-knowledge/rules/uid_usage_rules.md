# UID-Verwendungsregeln

## UID-Hierarchie
```
uidOverride > selectedUidOverride > companyHome
```
- `uidOverride`: Aus UI manuell gewählte UID, in `buildVATContext()` (Z. 3833)
  als `selectedUidOverride` aus globalem State übernommen
- `selectedUidOverride`: Globale Variable, gesetzt durch UID-Selector oder
  Dreiecksgeschäft-Opportunity-Button
- `companyHome`: `COMPANIES[currentCompany].home` — Fallback

## _sapEffectiveCountry() (Z. 241 / 789)
Bei `treatment ∈ ['ic-exempt','ic-acquisition','dreiecks','export']`:
→ UID-Land statt Lieferort für SAP-Lookup verwenden.
```js
uidLand = uidCountry || selectedUidOverride || home
return SAP_TAX_MAP[company]?.[uidLand]?.[treatment] ? uidLand : country
```

## selectedUidOverride — Wann setzen, wie durchreichen
- Gesetzt in: `applyDreiecksUid()` → `setState({ uidOverride })` → `renderResult()`
- Gelesen in: `buildVATContext()` → `uidOverride: selectedUidOverride`
- Weitergereicht an: `VATEngine.run(ctx)` → alle Engine-Funktionen

## EuGH-Rechtsprechung
- **C-430/09 Euro Tyre**: Zeitpunkt der UID-Mitteilung entscheidend — muss vor
  Transportbeginn erfolgen. Code prüft Zeitpunkt nicht, gibt Warnung als
  `euroTyreNote` im Return-Objekt
- **C-628/16 Kreuzmayr**: Falsche UID-Angabe → Vertrauensschutz des Vorlieferanten
  entfällt. Als `kreuzmayerNote` in `_applyQuickFix()`-Returns

## Implementierung in buildKurzbeschreibung() (Z. 5342)
`formatOwnUidCode(s)` (Z. 5391): Bestimmt aktive UID pro Supply:
```
selectedUidOverride → iAmTheBuyer+moving: dest → iAmTheSeller+moving: dep
→ myVat(pos) ? pos : companyHome
```

## summaryItems 'Aktive UID' (Z. 5510–5529)
| Bedingung | Anzeige |
|---|---|
| `selectedUidOverride` gesetzt | `flag(override) + vatId` |
| `dreiecksPossible && !override` | „Geeignete UID auswählen" |
| Fallback | `companyHome`-UID oder erste verfügbare |
