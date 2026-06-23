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
  → uidOverride === dep  → Ausnahme Abs. 2 → movingIndex = chainIndex
                            (Abgangsland-UID → Ausgangslieferung bewegend)
  → sonst                → Grundregel Abs. 1 → movingIndex = chainIndex - 1
                            (Nicht-Abgangsland-UID → Eingangslieferung bewegend)
```
> Maßgeblich ist NUR, ob die mitgeteilte UID die Abgangsland-UID (dep) ist.
> Die Ansässigkeits-UID (sofern ≠ dep) führt zur Grundregel (Eingangslieferung).

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
- Grundregel (keine/Nicht-Abgangsland-UID): L2 bewegend (`movingIndex = chainIndex-1 = 1`).
  Beispiel `C037m-ALTB` (HU-UID = dest, ≠ dep IT) → L2 bewegend.
- Ausnahme Abs. 2 (Abgangsland-UID mitgeteilt): L3 bewegend (`movingIndex = chainIndex = 2`).
  Beispiel `C037m-ALTA` (IT-UID = dep) → L3 bewegend.

## Externe Verifikation — Erlass-Abgleich (Drittland-Export-Reihengeschäft)

Geprüft am 23.06.2026 gegen den amtlichen Wortlaut (EPDE/DE) + EU-/AT-Pendant (EPROHA/AT).
Belegt den GB/CH-Export-Fix (`isIExporter` parteibasiert; Eingangs-/Ausgangs-MWSKZ je `movingL1`).

**Deutschland (EPDE) — UStAE Abschn. 3.14 (zu § 3 Abs. 6a UStG):**
| Aussage | Fundstelle |
|---|---|
| Erster Lieferant befördert/versendet → Warenbewegung **seiner** Lieferung (L1) zugeordnet → er ist Exporteur | Abs. 8 Satz 1 (§ 3 Abs. 6a Satz 2 UStG) |
| Nur **eine** Ausfuhrlieferung (§ 6 UStG); Steuerbefreiung **nur** bei der bewegten Lieferung | Abs. 14 Satz 1–2 |
| Ruhende Lieferung **nach** der Bewegung gilt am **Ende der Beförderung** als ausgeführt (Bestimmungsland/Drittland) | Abs. 6 Satz 2 (§ 3 Abs. 7 Satz 2 Nr. 2 UStG); Türkei-Bsp. „Lieferort … in der Türkei" |
| Im anderen MS/Drittland ansässiger Unternehmer muss sich wegen der dort steuerbaren Lieferung registrieren | Abs. 12 Satz 2 |

**Österreich (EPROHA) — § 3 Abs. 15 UStG 1994 + UStR 2000 Abschn. 3.14 (Rz 474g–474j):**
Inhaltsgleich, da beide Art. 36a MwStSystRL (Quick Fixes, ab 1.1.2020) umsetzen.
| Aussage | Fundstelle (AT) |
|---|---|
| Erster Lieferant befördert → seine Lieferung (L1) ist die bewegte | § 3 Abs. 15 Z 1 UStG 1994 |
| Lieferort ruhender Lieferungen (vor/nach der Bewegung) | § 3 Abs. 15 Z 3 und Z 4 UStG 1994 |
| Ausfuhr 0 %: § 7 UStG 1994 / Art. 146 MwStSystRL (nur bewegte Lieferung) | UStR 2000 Rz 474g ff. |

> Quelle DE: UStH 2023, Abschn. 3.14 (BMF). Quelle AT: findok.bmf.gv.at (UStR 2000) · RIS § 3 UStG 1994.
> Code-agnostisch: bewegte Lieferung kommt aus `determineMovingSupply()` (Art. 36a), Heimat-MWSKZ aus `getSapCode` (EPROHA A0/A2/AF · EPDE G0/DS/VD). Regressions-Tests: `OT-GBX-01`/`OT-GBX-02`.

