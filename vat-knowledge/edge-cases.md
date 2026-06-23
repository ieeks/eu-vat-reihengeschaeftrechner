# Bekannte Grenzfälle — Reihengeschäft EPDE / EPROHA

> Fälle aus der Praxis die steuerrechtlich nicht trivial sind.
> Jeder Fall ist durch SMOKE_TESTS in `app.js` verifiziert.

---

## F1 · BG→AT→BG / BG→DE→BG — Inland-Reihengeschäft

```
🇧🇬 BG ──L1──▶ 🇦🇹 AT/EPROHA ──L2──▶ 🇧🇬 BG
🇧🇬 BG ──L1──▶ 🇩🇪 DE/EPDE   ──L2──▶ 🇧🇬 BG
```

**Kritischer Punkt:** dep === dest = BG → kein grenzüberschreitender Transport → kein Reihengeschäft im umsatzsteuerlichen Sinne. Alle Lieferungen sind BG-Inlandslieferungen.

| | EPROHA | EPDE |
|---|---|---|
| BG-UID vorhanden? | ❌ | ❌ |
| meStatus | needsReg | needsReg |
| Dreiecksgeschäft möglich? | ❌ (nie bei dep===dest) | ❌ |
| L1 Behandlung | BG-Inlandslieferung 20% | BG-Inlandslieferung 20% |
| L2 Behandlung | BG-Inlandslieferung 20% | BG-Inlandslieferung 20% |

**Handlungsempfehlung:** Vor erster Lieferung BG-Registrierung einholen — oder Warenfluss unterbrechen: Ware erst ins AT/DE-Lager liefern, dann als separaten Umsatz verkaufen.

**SMOKE_TESTS:** `RC-BG-AT-BG` · `RC-BG-DE-BG`

*Verwandte Dateien:* `rules/inland_chain.md` · `at/eproha-buchungskreise.md`

---

## F2 · HU→DE(EPDE)→DE — EXW-Abholung, UID-Wahl entscheidend

```
🇭🇺 HU ──L1──▶ 🇩🇪 DE/EPDE ──L2──▶ 🇩🇪 DE
         EPDE holt in HU ab (EXW)
```

**Kritischer Punkt:** Welche UID teilt EPDE dem HU-Lieferanten mit? Das bestimmt über Art. 36a MwStSystRL welche Lieferung die bewegende ist — und ob HU-Registrierungspflicht entsteht.

EPDE hat **keine HU-UID** (vatIds: DE/SI/LV/EE/NL/BE/CZ/PL).

### Variante lit. c — EPDE teilt DE-UID mit (Standardfall) ✅

> Art. 36a Abs. 2 MwStSystRL / § 3 Abs. 15 Z 1 lit. c UStG AT

| Lieferung | Ort | Behandlung |
|---|---|---|
| L1 · HU→DE | 🇭🇺 HU (Abgang) | IG-Lieferung 0% — HU-Lieferant fakturiert steuerfrei |
| L2 · DE→DE | 🇩🇪 DE (ruhend) | Inlandslieferung DE 19% |

- movingIndex = **0** (L1 bewegend)
- EPDE tätigt IG-Erwerb in DE mit DE-UID → SAP **VH** Eingang
- **Kein HU-Risiko** für EPDE

**Voraussetzung:** HU-Lieferant benötigt Gelangensbestätigung (Nachweis dass Ware DE erreicht hat) um 0% zu rechtfertigen. Bei EXW verliert der Lieferant die Kontrolle über den Exportnachweis → EPDE muss Gelangensbestätigung aktiv bereitstellen.

### Variante lit. b — EPDE tritt mit HU-UID auf (nur wenn HU-registriert) ⚠️

> Art. 36a Abs. 3 MwStSystRL / § 3 Abs. 15 Z 1 lit. b UStG AT

| Lieferung | Ort | Behandlung |
|---|---|---|
| L1 · HU→DE | 🇭🇺 HU (ruhend) | Inlandslieferung HU **27%** — Registrierung in HU nötig |
| L2 · HU→DE | 🇭🇺 HU (Abgang) | IG-Lieferung 0% aus HU — EPDE fakturiert mit HU-UID |

- movingIndex = **1** (L2 bewegend)
- L1: HU-Lieferant stellt 27% HU-Inland-Rechnung — EPDE kann Vorsteuer nur via HU-UVA abziehen
- L2: EPDE ist IG-Lieferant aus HU → ZM + Intrastat HU

**Handlungsempfehlung:** Standardfall ist lit. c (DE-UID). Lit. b nur wenn EPDE bewusst eine HU-Registrierung hält und diese nutzen will. Gelangensbestätigung in beiden Varianten einfordern.

**SMOKE_TESTS:** `RC-HU-DE-LITC` · `RC-HU-DE-LITA`

*Verwandte Dateien:* `eu/art36a_mwstrl.md` · `rules/moving_supply_logic.md`

---

## F3 · DE(Sappi)→DE(EPDE)→IT — Gleicher dep- und companyHome-Staat

```
🇩🇪 DE(Sappi) ──L1──▶ 🇩🇪 DE/EPDE ──L2──▶ 🇮🇹 IT
```

**Kritischer Punkt:** Lieferant und EPDE sitzen beide in DE (dep = DE = companyHome). EPDE's Standard-UID ist DE → diese entspricht dem Abgangsland → **Dreiecksgeschäft standardmäßig blockiert** (Art. 141 lit. b: UID darf nicht aus dep-Land stammen).

EPDE hat **keine IT-UID**.

### Variante 1 — Lieferant transportiert, EPDE mit DE-UID (Default) ❌

| Lieferung | Ort | Behandlung |
|---|---|---|
| L1 · DE→IT | 🇩🇪 DE (Abgang) | IG-Lieferung 0% (Sappi → EPDE) |
| L2 · DE→IT | 🇮🇹 IT (ruhend) | Inlandslieferung IT → **Registrierungspflicht IT** |

- movingIndex = 0, trianglePossible = **false** (DE-UID = dep-Land)
- EPDE tätigt IG-Erwerb in IT ohne IT-UID → **Registrierungspflicht IT**

### Variante 2 — Lieferant transportiert, EPDE mit Nicht-DE-UID (z.B. BE) ✅

> Art. 141 lit. b MwStSystRL: B's UID muss aus anderem MS als dep (DE) und dest (IT) stammen

| Lieferung | Ort | Behandlung |
|---|---|---|
| L1 · DE→IT | 🇩🇪 DE (Abgang) | IG-Lieferung 0% (Sappi → EPDE mit BE-UID) |
| L2 · DE→IT | 🇮🇹 IT (ruhend) | Dreiecksgeschäft 0% → IT-Käufer führt Erwerbsteuer ab |

- movingIndex = 0, trianglePossible = **true** (BE ≠ DE, BE ≠ IT)
- **Kein IT-Risiko** für EPDE
- EPDE fakturiert L2 mit BE-UID, 0%, Pflichttext Dreiecksgeschäft, ZM aus BE

**Welche Nicht-DE-UID verwenden?** EPDE hat: SI / LV / EE / NL / BE / CZ / PL — alle geeignet solange ≠ IT.

### Variante 3 — EPDE holt ab (Fallback wenn kein Dreiecksgeschäft möglich) ✅

> Art. 36a Abs. 3 MwStSystRL: EPDE teilt DE-UID mit (= dep-Land-UID) → L2 bewegend

| Lieferung | Ort | Behandlung |
|---|---|---|
| L1 · DE→IT | 🇩🇪 DE (ruhend) | Inlandslieferung DE **19%** (Sappi → EPDE) |
| L2 · DE→IT | 🇩🇪 DE (Abgang) | IG-Lieferung 0% (EPDE → IT-Käufer) |

- movingIndex = 1 (EPDE transportiert mit DE-UID = dep-Land-UID = lit. b)
- EPDE ist IG-Lieferant aus DE mit DE-UID → kein IT-Risiko
- Nachteil: L1 = 19% DE-Inland-Rechnung (Vorsteuer, Saldo 0 in DE-UVA)
- Sappi liefert in der Regel — Abholung nur als letzter Ausweg

**Entscheidungsbaum:**

```
Lieferant transportiert?
  ├─ JA  → Hat EPDE eine Nicht-DE/Nicht-IT-UID? (SI/LV/EE/NL/BE/CZ/PL)
  │           ├─ JA  → Dreiecksgeschäft mit dieser UID → Variante 2 ✅
  │           └─ NEIN → Registrierungspflicht IT → Variante 3 prüfen
  └─ NEIN (EPDE holt ab) → Variante 3 (lit. b, L2 bewegend) ✅
```

**SMOKE_TESTS:** `RC-SAPPI-1` · `RC-SAPPI-2` · `RC-SAPPI-3`

*Verwandte Dateien:* `eu/art141_triangle.md` · `eu/art36a_mwstrl.md` · `rules/triangle_conditions.md` · `de/epde-buchungskreise.md`

---

## F4 · AT(EPROHA)→CH-Kunde→SK — Drittland-Kunde, Ware bleibt in der EU (Mode 2)

```
🇦🇹 AT/EPROHA ──Rechnung──▶ 🇨🇭 CH-Kunde (Drittland) ──▶ 🇸🇰 SK (Warenempfänger)
        Ware physisch: AT ───────────────────────────────▶ SK   (bleibt in der EU)
```

**Kritischer Punkt:** Der Kunde sitzt im Drittland (CH), aber die Ware verlässt die EU nicht (AT → SK). Es ist **keine Ausfuhr** — sondern ein innergemeinschaftliches Reihengeschäft, in dem der CH-Kunde nur mittlerer Unternehmer (Erwerber) ist. Der naheliegende „CH = Schweiz-Export"-Reflex (A0/Zoll/EUSt/BAZG) ist hier falsch.

| | Behandlung |
|---|---|
| EPROHA = erster Lieferant | bewegte ig. Lieferung AT → SK, **0 %** (SAP **AF**) — **nur** mit gültiger EU-UID des CH-Kunden, sonst **20 % AT** |
| Belegnachweis | Gelangensbestätigung des Warenempfängers in **SK** (nicht CH!) / CMR |
| ZM | mit der vom CH-Kunden mitgeteilten **EU-UID** |
| Dreiecksgeschäft (Art. 141)? | ❌ — CH-Kunde hat keine EU-UID aus drittem MS. Er muss sich in **SK** (oder anderem MS) registrieren und dort den ig. Erwerb (SK-Satz) + Anschlusslieferung abwickeln |

**Handlungsempfehlung:** Gültige EU-UID des CH-Kunden vor Lieferung einholen — sonst 20 % AT-MwSt. Die Vereinfachung Art. 141 entfällt; der CH-Kunde trägt die Registrierungslast im Bestimmungsland.

*Verwandte Dateien:* `at/ustg_at_reihengeschaeft.md` · `eu/art138_mwstrl.md` · `eu/art141_triangle.md`
*Code:* `analyze2()` Branch `euGoodsRecipient` / Sub-Branch `bIsNonEU`

---

*Code:* `analyzeInland()` (F1) · `determineMovingSupply()` / `_applyQuickFix()` (F2) · `_detectTriangle3()` (F3) · `analyze2()` euGoodsRecipient (F4)
*Testfälle:* `RC-BG-AT-BG` · `RC-BG-DE-BG` · `RC-HU-DE-LITC` · `RC-HU-DE-LITA` · `RC-SAPPI-1` · `RC-SAPPI-2` · `RC-SAPPI-3`
