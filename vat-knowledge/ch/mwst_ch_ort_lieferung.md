# MWSTG CH — Ort der Lieferung & Reihengeschäft

## Art. 7 MWSTG — Lieferort
Abs. 1 Bst. b: Lieferort bei Beförderung = Ort des Beförderungsbeginns.
Im Code: `analyzeCHInland()` (Z. 2260): „Lieferort: Schweiz (Art. 7 Abs. 1 Bst. b MWSTG)".
`natLaw('ch.place')` → `'Art. 7 Abs. 1 Bst. b MWSTG (SR 641.20)'` (Z. 1801).

## Art. 23 Abs. 2 Ziff. 1 MWSTG — Ausfuhr steuerfrei
Lieferungen ins Ausland sind von der Steuer befreit wenn Ausfuhr nachgewiesen.
`natLaw('ch.export')` → `'Art. 23 Abs. 2 Ziff. 1 MWSTG (SR 641.20)'` (Z. 1796).

## Art. 10 MWSTG — Steuerpflicht / CHF 100.000 Schwelle
Abs. 2 Bst. a: Obligatorische Steuerpflicht ab CHF 100.000 Jahresumsatz.
`natLaw('ch.threshold')` → `'Art. 10 Abs. 2 Bst. a MWSTG: CHF 100\'000/Jahr'`.
Im Code: `analyzeCHInland()` (Z. 2234) warnt bei fehlender CH-UID.

## Art. 67 MWSTG — Steuervertreter
Ausländische Unternehmen mit CH-Steuerpflicht brauchen Vertreter mit CH-Sitz.
`natLaw('ch.agent')` → `'Art. 67 Abs. 1 MWSTG (SR 641.20)'` (Z. 1799).

## Implementierung
- `computeTaxCH(direction, from, to, myCode)` (Z. 2328): Berechnet MwSt pro
  Lieferung — `export`, `export-l2`, `import`, `domestic-l1`, `domestic-l2-ch`
- `analyzeCH(supplier, me, customer, dep, dest)` (Z. 2829): Vollanalyse EU↔CH,
  Case 1 (EU→CH) mit DAP/DDP-Grid, Case 2 (CH→EU) mit Import-Logik
- `analyzeCHInland(ctx)` (Z. 2188): CH-Inland (dep=dest=CH), 8.1% auf alles

## Drittland-Routing in analyze()
```
hasCH + dep===CH + dest===CH → analyzeCHInland()
hasCH + dep!==CH + dest===CH → buildCHExportResult()  // EU→CH
hasCH + dep===CH + dest!==CH → analyzeCH()            // CH→EU
```
`hasCH`-Checks steuern den Dispatch bevor die EU-Engine läuft.
