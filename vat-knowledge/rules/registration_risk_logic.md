# Registrierungsrisiken — detectRegistrationRisk()

## Funktion (Z. 1239)
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

### (C) double-acquisition — severity: 'warning'
Art. 41 MwStSystRL: Andere UID als dest verwendet → Doppelerwerb-Risiko.
```js
isMoving && iAmTheBuyer && dep !== dest
&& usedUidCountry !== dest && usedUidCountry !== dep && vatIds[usedUidCountry]
```

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

## severity-Werte
| Wert | Bedeutung | UI-Darstellung |
|---|---|---|
| `'error'` | Registrierungspflicht oder Kostenfaktor | 🚨 rot |
| `'warning'` | RC-Block oder Doppelerwerb-Risiko | ⚠️ gelb |
| `'info'` | Positiver Hinweis (z.B. IT RC möglich) | ℹ️ blau |
