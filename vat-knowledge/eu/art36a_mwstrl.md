# Art. 36a MwStSystRL — Reihengeschäft / Zuordnung der Warenbewegung

## Rechtsgrundlage
Art. 36a MwStSystRL (eingefügt durch Quick Fix RL 2018/1910/EU, ab 01.01.2020).
Regelt die Zuordnung der bewegten Lieferung in einer Lieferkette mit einem Transport.

## Absatz 1 — Grundregel
Transport durch Lieferant → L1 bewegend. Transport durch Endabnehmer → letzte Lieferung.

## Absatz 2 — Zwischenhändler transportiert (lit. a / b / c)
- **lit. a**: ZH teilt dem Vorlieferanten die dep-UID mit, ist aber dort weder ansässig
  noch registriert → Lieferung VOR dem ZH ist bewegend (`movingIndex = chainIndex - 1`)
- **lit. b**: ZH teilt eine andere UID mit (Ansässigkeits-UID, dest-UID) →
  Lieferung AB dem ZH ist bewegend (`movingIndex = chainIndex`)
- **lit. c** (Umkehrschluss): ZH hat keine dep-UID, nicht ansässig in dep →
  Standardregel greift, L vor ZH bewegend (`quickFixVariant: 'lit-c'`)

## Implementierung
- `determineMovingSupply()` (Z. 884): Dispatch auf `transport`-Wert
- `_applyQuickFix(ctx, chainIndex, label)` (Z. 922): Kernlogik lit. a/b/c

## Schlüsselvariablen
| Variable | Bedeutung |
|---|---|
| `intermediaryResidentInDep` | `companyHome === dep` — Ansässigkeit im Abgangsland |
| `hasDepVat` | `!!vatIds[dep]` — UID-Registrierung im Abgangsland |
| `uidOverride` | Manuell gewählte UID aus UI, übersteuert Automatik |
| `chainIndex` | 1 bei `transport='middle'`, 2 bei `transport='middle2'` |

## Edge Cases
- **Manuelle Logik** (`uidOverride` gesetzt): `overrideIsDepUid` prüft ob dep-UID
  gewählt + nicht ansässig + nicht registriert → lit. a; sonst lit. b
- **Automatik** (kein Override): `!intermediaryResidentInDep && !hasDepVat` → lit. c;
  sonst lit. b mit `_litBVatCountry`-Fallback-Kette
- Return-Objekt enthält immer: `movingIndex`, `rationale`, `legalBasis`,
  `quickFixApplied`, `quickFixVariant`, `euroTyreNote`, `kreuzmayerNote`
