# UID-Verwendungsregeln

## UID-Hierarchie
```
uidOverride > selectedUidOverride > companyHome
```
- `uidOverride`: Aus UI manuell gewählte UID, in `buildVATContext()`
  als `selectedUidOverride` aus globalem State übernommen
- `selectedUidOverride`: Globale Variable, gesetzt durch UID-Selector oder
  Dreiecksgeschäft-Opportunity-Button
- `companyHome`: `COMPANIES[currentCompany].home` — Fallback

## _sapEffectiveCountry()
Bei `treatment ∈ ['ic-exempt','ic-acquisition','dreiecks','export']`:
→ UID-Land statt Lieferort für SAP-Lookup verwenden.
```js
uidLand = uidCountry || selectedUidOverride || home
return SAP_TAX_MAP[company]?.[uidLand]?.[treatment] ? uidLand : country
```

## selectedUidOverride — globale Variable
```js
let selectedUidOverride = null;  // globaler Scope
```
- **Definiert**: globaler Scope in app.js
- **Gesetzt durch**: `setUidOverride(country)` im UI-Layer
- **Resettet bei**: `setT()`, `onCC()`, `setCompany()`, `resetAll()`
- **Durchgereicht via**: `buildVATContext()` → `ctx.uidOverride`
- **Verwendet in**: `_applyQuickFix()`, `_detectTriangle3()`, `_detectTriangle4()`,
  `buildKurzbeschreibung()`, `buildNormal3Result()`

## EuGH-Rechtsprechung
- **C-430/09 Euro Tyre**: Zeitpunkt der UID-Mitteilung entscheidend — muss vor
  Transportbeginn erfolgen. Code prüft Zeitpunkt nicht, gibt Warnung als
  `euroTyreNote` im Return-Objekt
- **C-628/16 Kreuzmayr**: Falsche UID-Angabe → Vertrauensschutz des Vorlieferanten
  entfällt. Als `kreuzmayerNote` in `_applyQuickFix()`-Returns

## Implementierung in buildKurzbeschreibung()
`formatOwnUidCode(s)`: Bestimmt aktive UID pro Supply:
```
selectedUidOverride → iAmTheBuyer+moving: dest → iAmTheSeller+moving: dep
→ myVat(pos) ? pos : companyHome
```

## summaryItems 'Aktive UID'
| Bedingung | Anzeige |
|---|---|
| `selectedUidOverride` gesetzt | `flag(override) + vatId` |
| `dreiecksPossible && !override` | „Geeignete UID auswählen" |
| Fallback | `companyHome`-UID oder erste verfügbare |
