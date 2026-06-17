# Art. 36a MwStSystRL — Reihengeschäft / Zuordnung der Warenbewegung

## Rechtsgrundlage
Art. 36a MwStSystRL (eingefügt durch Quick Fix RL 2018/1910/EU, ab 01.01.2020).
Regelt die Zuordnung der bewegten Lieferung in einer Lieferkette mit einem Transport.

## Absatz 1 — Grundregel
Transport durch Lieferant → L1 bewegend. Transport durch Endabnehmer → letzte Lieferung.

## Zwischenhändler transportiert — Grundregel (Abs. 1) vs. Ausnahme (Abs. 2)

Maßgeblich ist allein die dem Vorlieferanten **mitgeteilte UID**:

- **Abgangsland-UID (dep) mitgeteilt → Ausnahme Abs. 2**: Die Beförderung wird der
  Lieferung **DURCH** den ZH zugeordnet → **Ausgangslieferung bewegend**
  (`movingIndex = chainIndex`, `quickFixVariant: 'departure-id'`).
- **Jede andere UID** (Ansässigkeits-/dest-/Dritt-UID) oder **keine UID** → es bleibt
  bei der **Grundregel Abs. 1**: Beförderung wird der Lieferung **AN** den ZH
  zugeordnet → **Eingangslieferung bewegend** (`movingIndex = chainIndex - 1`,
  `quickFixVariant: 'lit-c'`). Keine Registrierungspflicht im Abgangsland.

> **Wichtig (Art. 36a Abs. 2 / § 3 Abs. 6a S. 5 UStG):** Nur die UID des
> **Abgangsmitgliedstaats** löst die Verschiebung auf die Ausgangslieferung aus.
> Die Ansässigkeits-UID des ZH (sofern ≠ Abgangsland) genügt **nicht** — sie führt
> zur Grundregel (Eingangslieferung bewegend).

## Implementierung
- `determineMovingSupply()`: Dispatch auf `transport`-Wert
- `_applyQuickFix(ctx, chainIndex, label)`: Kernlogik lit. a/b/c

## Schlüsselvariablen
| Variable | Bedeutung |
|---|---|
| `intermediaryResidentInDep` | `companyHome === dep` — Ansässigkeit im Abgangsland |
| `hasDepVat` | `!!vatIds[dep]` — UID-Registrierung im Abgangsland |
| `uidOverride` | Manuell gewählte UID aus UI, übersteuert Automatik |
| `chainIndex` | 1 bei `transport='middle'`, 2 bei `transport='middle2'` |

## Edge Cases
- **Manuelle Logik** (`uidOverride` gesetzt): `uidOverride === dep` → Ausnahme Abs. 2
  → `movingIndex = chainIndex`; jede andere gehaltene UID → Grundregel Abs. 1
  → `movingIndex = chainIndex - 1`.
- **Automatik** (kein Override): `!intermediaryResidentInDep && !hasDepVat` → Grundregel
  (`'lit-c'`, Eingangslieferung); sonst (ansässig ODER dep-UID vorhanden) → Abs. 2
  (`'dest-or-other-id'`, Ausgangslieferung) mit `_litBVatCountry`-Fallback-Kette.
- **Guard-Limitation:** Eine bewusst gewählte dep-UID wirkt nur, wenn sie in `vatIds`
  vorhanden ist (`vatIds[uidOverride] !== undefined`). Hält die Entity die dep-UID
  nicht, fällt der Override in die Automatik (→ Grundregel). Vgl. SMOKE_TEST `LIT-C-02`.
- Return-Objekt enthält immer: `movingIndex`, `rationale`, `legalBasis`,
  `quickFixApplied`, `quickFixVariant`, `euroTyreNote`, `kreuzmayerNote`
- **`euroTyreNote`**: gesetzt bei lit. a, lit. b UND lit. c — immer vorhanden
- **`kreuzmayerNote`**: gesetzt bei lit. a und lit. b — NICHT bei lit. c
  (lit. c = kein uidOverride → kein Vertrauensschutz-Risiko durch falsche UID)
