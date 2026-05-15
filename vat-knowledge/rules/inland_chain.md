# Inlands-Reihengeschäft — dep === dest

> Wenn Abgangsland und Bestimmungsland identisch sind, liegt **kein grenzüberschreitendes
> Reihengeschäft** vor. Alle Lieferungen sind Inlandslieferungen im dep/dest-Land.
> Keine IG-Lieferung (0%), kein Dreiecksgeschäft möglich.

---

## Trigger im Code

```
dep === dest
  → VATEngine._depEqDest = true
  → renderResult() → analyzeInland(ctx)
  → Keine movingIndex-Berechnung, kein Quick Fix
```

**Rechtsgrundlage:** § 3 Abs. 6 UStG AT / § 3 Abs. 1 UStG (DE: § 3 Abs. 6 S. 1)
→ Lieferort = Ort, an dem sich die Ware bei Verschaffung der Verfügungsmacht befindet.
Bei dep===dest verbleibt die Ware im Inland → alle Lieferungen = Inlandslieferungen.

---

## Drei Outcomes (`meStatus`)

```js
partyStatus(vatIds[land], meEstablished):
  hasUid || isEstablished  →  'domestic'   → Inlandsrechnung mit eigener UID
  land === 'IT'            →  'itRC'       → Inversione contabile (kein RC-Block da keine IT-UID)
  sonst                   →  'needsReg'   → Registrierungspflicht im dep/dest-Land
```

---

## EPROHA — UIDs: AT · DE · CH

| dep/dest-Land | EPROHA-UID? | meStatus | SAP Ausgang | SAP Eingang | MwSt |
|---|---|---|---|---|---|
| **AT** | ✅ ATU36513402 | domestic | **A2** | **V2** | 20% AT |
| **DE** | ✅ DE248554278 | domestic | **DS** | **VD** | 19% DE |
| **CH** | ✅ CHE-113... | domestic | **B5** | **IB** | 8,1% CH |
| **IT** | ❌ | itRC | **IC** | **VT** | 0% + inversione contabile |
| Alle anderen EU | ❌ | needsReg | — | — | Registrierung erforderlich |

---

## EPDE — UIDs: DE · SI · LV · EE · NL · BE · CZ · PL

| dep/dest-Land | EPDE-UID? | meStatus | SAP Ausgang | SAP Eingang | MwSt |
|---|---|---|---|---|---|
| **DE** | ✅ DE449663039 | domestic | **DS** | **VD** | 19% DE |
| **SI** | ✅ SI66423562 | domestic | **CB** | **SI** | 22% SI |
| **CZ** | ✅ CZ687387072 | domestic | **AE** | **VC** | 21% CZ |
| **PL** | ✅ PL5263841834 | domestic | **A4** | **B7** | 23% PL |
| **BE** | ✅ BE1022245089 | domestic | **BS** | **BI** | 21% BE |
| **LV** | ✅ LV90013367396 | domestic | **LS** | **LI** | 21% LV |
| **EE** | ✅ EE102839441 | domestic | **ES** | **EI** | 22% EE ¹ |
| **NL** | ✅ NL827914052B01 | domestic | ⚠️ null | **NI** | 21% NL ² |
| **IT** | ❌ | itRC | **IC** | **VI** | 0% + inversione contabile |
| Alle anderen EU | ❌ | needsReg | — | — | Registrierung erforderlich |

¹ EE hat den Normalsatz 2025 auf 24% erhöht — SAP_TAX_MAP desc noch auf 22% → Kennzeichen prüfen.

² NL-Sonderfall (Art. 12 Wet OB): In NL gilt RC auch wenn der Lieferant NL-registriert ist.
Für EPDE NL-inland gilt technisch RC (NC/NI), nicht domestic. analyzeInland() unterscheidet
diesen Fall aktuell nicht — zeigt domestic-Behandlung, aber `SAP_TAX_MAP[EPDE][NL].domestic.out = null`.
In der Praxis: EPDE sollte NC (RC-Ausgang) + NI (RC-Eingang) verwenden. Bekannte Code-Lücke.

---

## IT-Sonderfall — Inversione contabile

Gilt für **beide** Unternehmen (EPROHA und EPDE), die keine IT-UID haben:

```
EPROHA/EPDE hat keine IT-UID
  → Art. 17 Abs. 2 DPR 633/1972 (Umkehrlogik)
  → RC möglich wenn Lieferant NICHT IT-registriert ist
  → EPROHA/EPDE fakturiert L2 mit 0% + Pflichttext "inversione contabile"
  → IT-Käufer schuldet IVA 22% selbst (führt in eigener UVA ab, zieht als Vorsteuer ab)
  → Voraussetzung: IT-Käufer ist B2B + steuerpflichtig in IT
  → Risiko bei Privatkunden oder nicht-IT-registrierten Käufern → Registrierungspflicht prüfen
```

**SAP EPROHA:** Ausgang **IC**, kein Eingang (L2-Verkäufer)
**SAP EPDE:** Ausgang **IC**, Eingang **VI** (wenn L1-Eingangsrechnung von IT-Lieferanten)

**Pflichttext auf Rechnung:** "inversione contabile – Art. 17 DPR 633/1972"

---

## Referenzfälle

### R1 · IT → AT → IT · EPROHA, Transport A

```
🇮🇹 IT ──L1──▶ 🇦🇹 AT/EPROHA ──L2──▶ 🇮🇹 IT
```

- dep=IT === dest=IT → analyzeInland()
- EPROHA hat keine IT-UID → meStatus = itRC
- L1: U1 (IT) fakturiert IT-Inlandslieferung 22% IVA an EPROHA → **SAP VT** Eingang
- L2: EPROHA fakturiert 0% + "inversione contabile" an IT-Kunden → **SAP IC** Ausgang
- Dreiecksgeschäft: ❌ nicht anwendbar (keine grenzüberschreitende Beförderung)
- Kein ZM, keine Intrastat

### R2 · BG → AT → BG · EPROHA, Transport A

```
🇧🇬 BG ──L1──▶ 🇦🇹 AT/EPROHA ──L2──▶ 🇧🇬 BG
```

- dep=BG === dest=BG → analyzeInland()
- EPROHA hat keine BG-UID, nicht ansässig → meStatus = needsReg
- Ergebnis: EPROHA muss sich **in BG registrieren** (20% BG-MwSt) bevor Lieferung möglich
- Keine SAP-Codes bis Registrierung erfolgt
- Alternativ: Warenfluss unterbrechen (erst ins AT-Lager, dann separater Verkauf)

### R3 · DE → AT → DE · EPROHA, Transport C

```
🇩🇪 DE ──L1──▶ 🇦🇹 AT/EPROHA ──L2──▶ 🇩🇪 DE
```

- dep=DE === dest=DE → analyzeInland()
- EPROHA hat DE-UID DE248554278 → meStatus = domestic
- L1: DE-Lieferant fakturiert 19% DE-MwSt → **SAP VD** Eingang
- L2: EPROHA fakturiert 19% DE-MwSt mit DE-UID → **SAP DS** Ausgang
- Dreiecksgeschäft: ❌ nicht anwendbar

### R4 · IT → DE → IT · EPDE, Transport A

```
🇮🇹 IT ──L1──▶ 🇩🇪 DE/EPDE ──L2──▶ 🇮🇹 IT
```

- dep=IT === dest=IT → analyzeInland()
- EPDE hat keine IT-UID → meStatus = itRC
- L1: IT-Lieferant fakturiert IT-Inlandslieferung 22% IVA an EPDE → **SAP VI** Eingang
- L2: EPDE fakturiert 0% + "inversione contabile" → **SAP IC** Ausgang
- Identisch zu R1, aber EPDE statt EPROHA (Eingang VI statt VT)

---

## Abgrenzung: Inlands-Reihengeschäft vs. normales Reihengeschäft

| | Inlands-RG (dep===dest) | Normales RG (dep≠dest) |
|---|---|---|
| Grenzüberschreitung | ❌ keine | ✅ vorhanden |
| IG-Lieferung (0%) | ❌ | ✅ (wenn EU→EU) |
| Dreiecksgeschäft | ❌ nie möglich | ✅ unter Voraussetzungen |
| Quick Fix (Art. 36a) | ❌ nicht anwendbar | ✅ bei transport=middle |
| ZM / Intrastat | ❌ | ✅ bei IG-Lieferung |
| Lieferort | dep/dest-Land | Art. 32 MwStSystRL |

---

*Code:* `analyzeInland()` · `partyStatus()` · `buildInlandCard()` in `docs/assets/scripts/app.js`
*Verwandte Dateien:* `at/eproha-buchungskreise.md` · `de/epde-buchungskreise.md` · `reference-cases.md` · `rules/place_of_supply.md`
