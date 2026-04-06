# Quick Fixes 2020 — RL 2018/1910/EU

## Übersicht der 4 Quick Fixes
1. **Art. 36a MwStSystRL** — Zuordnung der Warenbewegung im Reihengeschäft
2. **Art. 138 Abs. 1 Verschärfung** — UID als materiell-rechtliche Voraussetzung
3. **Art. 17a / Art. 45a DVO** — Konsignationslagerregelung (nicht implementiert)
4. **Art. 45a DVO 282/2011** — Vermutungsregel für Belegnachweis

## Fokus: Art. 36a (Reihengeschäft)
Vor 2020: nationale Regelungen divergent (DE § 3 Abs. 6 S. 5 UStG aF).
Seit 2020: EU-weit einheitliche Zuordnung über Art. 36a Abs. 1–2.

## Fokus: Art. 45a (Belegnachweis)
Zwei nicht-widersprüchliche Nachweise → widerlegbare Vermutung der Beförderung.
Im Code über `invIG()` als Hinweis auf Gelangensbestätigung/CMR referenziert.

## EuGH-Rechtsprechung
- **C-430/09 Euro Tyre**: Zeitpunkt der UID-Mitteilung entscheidend — muss VOR
  Transportbeginn gegenüber Vorlieferanten erfolgen. Implementiert als
  `euroTyreNote` in allen `_applyQuickFix()`-Returns
- **C-628/16 Kreuzmayr**: Falsche UID-Angaben entziehen dem Vorlieferanten den
  Vertrauensschutz. Implementiert als `kreuzmayerNote`

## Implementierung
- `_applyQuickFix()`: Prüft `uidOverride`, `intermediaryResidentInDep`,
  `hasDepVat` → bestimmt lit. a / b / c Variante
- `buildVATContext()`: Baut den Kontext inkl. `uidOverride` und
  `vatIds` aus UI-State, wird an `VATEngine.run(ctx)` übergeben
- Quick-Fix-Ergebnis enthält `quickFixApplied: true/false` +
  `quickFixVariant: 'departure-id' | 'dest-or-other-id' | 'lit-c'`

## Zeitpunkt der UID-Mitteilung
Code implementiert keine Zeitprüfung — `uidOverride` wird als „zum Zeitpunkt
des Transports mitgeteilt" angenommen. Euro-Tyre-Hinweis als Warnung im Output.
