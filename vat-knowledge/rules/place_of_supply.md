# Lieferort (Place of Supply)

## Art. 32 MwStSystRL — Bewegte Lieferung
Lieferort = Ort, wo Beförderung/Versendung beginnt (Abgangsland).
Im Code: `classifySupplies()`: `if (isMoving) placeOfSupply = dep`.

## Art. 36 MwStSystRL — Ruhende Lieferung
- **Vor der Bewegung**: Lieferort = Abgangsland (dep)
  → `if (i < movingIndex) placeOfSupply = dep`
- **Nach der Bewegung**: Lieferort = Bestimmungsland (dest)
  → `else placeOfSupply = dest`

## Implementierung in classifySupplies()
```js
if (isMoving)             placeOfSupply = dep;
else if (i < movingIndex) placeOfSupply = dep;   // ruhend VOR Bewegung
else                      placeOfSupply = dest;   // ruhend NACH Bewegung
```

## num-Signal in computeTax()
Legacy-Interface für Rendering-Funktionen:
| `num` | Bedeutung | `pos` |
|---|---|---|
| `'before'` oder `1` | Ruhend vor Bewegung | `dep` |
| `'after'` oder `2` | Ruhend nach Bewegung | `dest` |
| `'moving'` | Bewegte Lieferung | n/a (eigene Logik) |

```js
const pos = (num === 'before' || num === 1) ? dep
          : (num === 'after'  || num === 2) ? dest
          : dest;
```

## Inland-Sonderfall: dep === dest
Wenn Abgangsland = Bestimmungsland → kein IG-Sachverhalt.
`VATEngine.run()`: Gibt `_depEqDest: true` zurück mit Fehlertext.
→ `analyzeInland(ctx)`: Alle Lieferungen sind Inlandslieferungen
mit lokaler MwSt (`rate(land)`).

## Nicht-EU (Export)
`isExport = isMoving && dep !== dest && !isNonEU(dep) && isNonEU(dest)`
→ `vatTreatment = 'export'`, 0% MwSt, Ausfuhrlieferung.
Drittland-Routing: `hasCH`/`hasGB`-Checks dispatchen vor der EU-Engine
zu `analyzeCH()`, `buildCHExportResult()`, `buildGBExportResult()`.
