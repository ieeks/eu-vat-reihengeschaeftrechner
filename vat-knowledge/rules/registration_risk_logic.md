# Registrierungsrisiken — detectRegistrationRisk()

## Funktion
```js
detectRegistrationRisk(ctx, classifiedSupplies, triangleResult)
```
Iteriert über alle Supplies, prüft 6 Risikotypen, gibt `{ hasErrors, hasWarnings, risks[] }`.

## 6 Risk-Types

### (A) registration-required — severity: 'error'
Ruhende Lieferung in fremdem Land, ich bin Verkäufer, keine UID dort.
```js
needsRegistration && iAmTheSeller && !isMoving && !triangleMitigatesReg
```
`triangleMitigatesReg`: Dreiecksgeschäft befreit wenn `placeOfSupply === dest`.

### (B) ic-acquisition-no-reg — severity: 'error'
Bewegte Lieferung, ich bin Käufer, IG-Erwerb in dest, keine dest-UID.
```js
isMoving && iAmTheBuyer && dep !== dest && dest !== companyHome && !vatIds[dest]
```
Dreiecksgeschäft kann mitigieren: `triangleResult.beneficiary === companyHome`.
`triangleMitigates` prüft:
`triangleResult.primary?.beneficiary === companyHome`
OR `triangleResult.beneficiary === companyHome`
(beide Felder, nicht nur `beneficiary`)

### (C) double-acquisition — severity: 'warning'
Art. 41 MwStSystRL: Andere UID als dest verwendet → Doppelerwerb-Risiko.
```js
isMoving && iAmTheBuyer && dep !== dest
&& usedUidCountry !== dest && usedUidCountry !== dep && vatIds[usedUidCountry]
```
`usedUidCountry` wird NUR bei `transport=middle` + `uidOverride`
aus `ctx.uidOverride` bestimmt. In allen anderen Fällen = `companyHome`.
`uidOverride` außerhalb von `transport=middle` hat keinen Einfluss
auf Risk-Type C.

### (D) rc-blocked — severity: 'warning'
`_checkRCBlock()` positiv (blocked:true) + ich bin Verkäufer.

### (E) rc-country-specific — severity: 'info'
Positiver RC-Hinweis (z.B. IT inversione contabile), nicht blockiert.
```js
rcApplicable && rcBlockReason && !rcBlocked && iAmTheSeller
```

### (F) resting-buyer-no-uid — severity: 'error'
Ruhende Lieferung, ich bin Käufer, fremdes Land, keine UID dort.
→ Lieferant fakturiert lokale MwSt, kein Vorsteuerabzug möglich.
Bietet Optionen: Incoterm ändern, Warenfluss unterbrechen, Registrierung,
Dreiecksgeschäft (wenn ≥ 3 verschiedene MS beteiligt).

## triangleMitigatesReg
```js
triangleResult?.possible && placeOfSupply === dest
```
Dreiecksgeschäft neutralisiert Registrierungspflicht nur wenn der Lieferort
im Bestimmungsland liegt (= ruhende Lieferung nach der Warenbewegung).

## Risk-Type Strings (Code-Mapping)
Die Labels A–F entsprechen diesen `type`-Strings im `risks[]`-Array:

| Label | `type` String | severity |
|---|---|---|
| (A) | `'registration-required'` | `'error'` |
| (B) | `'ic-acquisition-no-reg'` | `'error'` |
| (C) | `'double-acquisition'` | `'warning'` |
| (D) | `'rc-blocked'` | `'warning'` |
| (E) | `'rc-country-specific'` | `'info'` |
| (F) | `'resting-buyer-no-uid'` | `'error'` |

## severity-Werte
| Wert | Bedeutung | UI-Darstellung |
|---|---|---|
| `'error'` | Registrierungspflicht oder Kostenfaktor | 🚨 rot |
| `'warning'` | RC-Block oder Doppelerwerb-Risiko | ⚠️ gelb |
| `'info'` | Positiver Hinweis (z.B. IT RC möglich) | ℹ️ blau |
