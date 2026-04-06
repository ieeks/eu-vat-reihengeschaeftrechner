# Entscheidungsbaum — Zuordnung der bewegten Lieferung

## Grundregel (Art. 36a Abs. 1 / § 3 Abs. 6a S. 2 UStG)
| `transport` | Bewegte Lieferung | movingIndex |
|---|---|---|
| `'supplier'` | L1 (Lieferant→ZH) | `0` |
| `'customer'` | Letzte Lieferung | `parties.length - 2` |
| `'middle'` | Quick Fix mit `chainIndex=1` | via `_applyQuickFix()` |
| `'middle2'` | Quick Fix mit `chainIndex=2` | via `_applyQuickFix()` |

## _applyQuickFix() — Entscheidungslogik

### Manuelle Logik (uidOverride gesetzt)
```
uidOverride && vatIds[uidOverride] !== undefined
  → overrideIsDepUid = (uidOverride === dep && !resident && !hasDepVat)
    → true:  lit. a → movingIndex = chainIndex - 1
    → false: lit. b → movingIndex = chainIndex
```

### Automatische Logik (kein Override)
```
!intermediaryResidentInDep && !hasDepVat
  → lit. c (Umkehrschluss) → movingIndex = chainIndex - 1
  → quickFixApplied: false, quickFixVariant: 'lit-c'

sonst (ansässig ODER dep-UID vorhanden)
  → lit. b → movingIndex = chainIndex
  → _litBVatCountry: uidOverride > dep(wenn resident+hasDepVat) > dest > null
```

## Return-Objekte
Jedes Ergebnis enthält exakt:
```js
{ movingIndex, rationale, legalBasis, quickFixApplied,
  quickFixVariant,    // 'departure-id' | 'dest-or-other-id' | 'lit-c'
  vatIdUsed,          // konkrete UID-Nummer oder null
  vatIdCountry,       // ISO-Code der verwendeten UID
  manualOverride,     // true bei uidOverride
  euroTyreNote,       // EuGH C-430/09 Hinweis
  kreuzmayerNote }    // EuGH C-628/16 Hinweis (nicht bei lit. c)
```

## transport='middle' — chainIndex nach Mode
`chainIndex` wird in `determineMovingSupply()` transport==='middle' Branch gesetzt:

| Mode | chainIndex | Formel | Beispiel |
|---|---|---|---|
| Mode 3 (3P) | immer `1` | konstant | B transportiert → L1 oder L2 |
| Mode 4 (4P) | `ctx.mePosition - 1` | variabel | mePosition=2 → chainIndex=1; mePosition=3 → chainIndex=2 |

`mePosition`: 1-basierter Index der eigenen Position in der Kette (1=Lieferant, 2=erster ZH, 3=zweiter ZH, 4=Endabnehmer).

## transport='middle2' — 4-Parteien Sonderfall
2. Zwischenhändler (C/U3) transportiert → `chainIndex=2`.
lit. c Standard: keine dep-UID → L2 bewegend (`chainIndex-1=1`).
lit. b: dep-UID mitgeteilt → L3 bewegend (`chainIndex=2`).
