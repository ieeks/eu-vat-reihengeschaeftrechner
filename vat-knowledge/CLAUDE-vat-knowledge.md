# VAT Knowledge Base — Pflichtlektüre vor VATEngine-Änderungen

> Dieses Dokument ist der zentrale Index der `/vat-knowledge/`-Wissensbasis.
> **Vor jeder Änderung an `docs/assets/scripts/app.js`** die zugehörigen Dateien lesen.

---

## Regel 1: Was vor jeder Änderung zu lesen ist

| Änderungsbereich | Pflichtlektüre |
|---|---|
| `determineMovingSupply()` / `_applyQuickFix()` | `rules/moving_supply_logic.md` + `eu/art36a_mwstrl.md` |
| `_detectTriangle3()` / `_detectTriangle4()` | `rules/triangle_conditions.md` + `eu/art141_triangle.md` |
| `classifySupplies()` / `placeOfSupply` | `rules/place_of_supply.md` |
| `_checkRCBlock()` | `rules/rc_country_rules.md` |
| `detectRegistrationRisk()` | `rules/registration_risk_logic.md` |
| SAP-Codes / `_sapEffectiveCountry()` | `rules/uid_usage_rules.md` |
| `buildKurzbeschreibung()` / `summaryItems` | `rules/uid_usage_rules.md` |
| `buildVergleichTab()` | `rules/triangle_conditions.md` + `rules/registration_risk_logic.md` |
| `buildTrafficStatus()` / `analyzeInland()` regBanner | `rules/registration_risk_logic.md` |
| `analyze2()` / EPROHA AT-Lager | `at/ustg_at_reihengeschaeft.md` |
| `analyzeCH()` / `computeTaxCH()` | `ch/mwst_ch_ort_lieferung.md` |
| `buildKonsiLagerCH()` | `ch/mwst_ch_konsignationslager.md` |
| Dreiecksgeschäft AT | `at/ustg_at_dreieck.md` |
| Dreiecksgeschäft DE | `de/ustae_reihengeschaeft.md` |
| Quick Fix allgemein | `eu/quick_fixes_2020.md` |
| IG-Lieferung / Art. 138 | `eu/art138_mwstrl.md` |
| DE § 3 Abs. 6a / § 13b | `de/ustg_de_3_6a.md` |

---

## Regel 2: NEVER TOUCH ohne Opus 4.6

Gesperrte Funktionen innerhalb der VATEngine IIFE:

```
determineMovingSupply()
_applyQuickFix()
classifySupplies()
_detectTriangle3()
_detectTriangle4()
detectRegistrationRisk()
_checkRCBlock()
```

Diese Funktionen nur anfassen wenn **alle drei Bedingungen** erfüllt sind:

1. Explizit vom User angewiesen
2. Opus 4.6 als Modell aktiv
3. Die zugehörigen `rules/`- und `eu/`-Dateien aus der Tabelle oben **vorher gelesen**

Verstöße gegen diese Regel können steuerlich falsche Ergebnisse produzieren,
die der User ohne Fachkenntnis nicht erkennt.

---

## Regel 3: Testfälle nach Engine-Änderungen

Nach jeder Änderung an den gesperrten Funktionen diese Smoke-Tests ausführen
(SMOKE_TESTS Array in app.js, `npm run check`):

| Test-ID | Prüft |
|---|---|
| LF-02a | Quick Fix lit. a — dep-UID, nicht ansässig |
| LF-02c | Quick Fix lit. c — keine dep-UID, Standardregel |
| LF-02d | Quick Fix lit. b — Ansässigkeits-UID |
| DG-01 bis DG-10 | Dreiecksgeschäft-Suite (3P + 4P, alle Varianten) |
| LF-04a bis LF-04f | 4-Parteien-Ketten mit verschiedenen Transportträgern |
| C037m-MAIN | `transport='middle2'` — 2. Zwischenhändler transportiert |

Wenn ein Test fehlschlägt: **Änderung rückgängig machen**, Ursache analysieren,
zugehörige `rules/`-Datei erneut lesen.

---

## Regel 4: Länder-spezifische RC-Regeln (Kurzreferenz)

Details: `rules/rc_country_rules.md`

| Land | Regel | Effekt |
|---|---|---|
| **BE** | Art. 51 §2 5° WBTW | RC blockiert ohne Betriebsstätte → immer 21% ausweisen |
| **PL** | Art. 17 Abs. 1 Nr. 5 | RC blockiert wenn Lieferant PL-registriert |
| **CZ** | § 92a ZDPH | RC blockiert wenn Lieferant CZ-registriert |
| **SI** | čl. 76 Abs. 3 ZDDV-1 | RC blockiert wenn Lieferant SI-registriert |
| **LV** | Art. 141 PVN likums | RC blockiert wenn Lieferant LV-registriert |
| **EE** | KMSS § 41¹ | RC blockiert wenn Lieferant EE-registriert |
| **IT** | Art. 17 Abs. 2 DPR 633/1972 | **Umkehrlogik**: RC möglich wenn NICHT registriert |
| **DE** | § 13b UStG | RC gilt NICHT für Warenlieferungen (nur Werklieferungen) |

---

## Regel 5: UID-Logik (Kurzreferenz)

Details: `rules/uid_usage_rules.md`

**Override-Hierarchie:**
```
uidOverride > selectedUidOverride > companyHome
```

**Welche UID verwenden:**

| Rolle | Situation | UID |
|---|---|---|
| Käufer | Bewegte IG-Lieferung (Erwerb) | dest-UID |
| Verkäufer | Bewegte IG-Lieferung | dep-UID |
| Mittlerer (Dreiecksgeschäft) | Art. 141 | Ansässigkeits-UID (home), **NICHT** dest-UID |
| Ruhende Lieferung | Lieferort-UID | UID des `placeOfSupply`-Landes |
| Fallback | Keine passende UID | `companyHome`-UID |

**Dreiecksgeschäft-Blocker:**
- B verwendet dest-UID → Art. 141 lit. a verletzt → kein Dreiecksgeschäft
- B verwendet UID aus Land von A (s1) → A kann nicht steuerfrei fakturieren → blockiert

---

## Dateiindex

### EU-Recht (`eu/`)
- [`art36a_mwstrl.md`](eu/art36a_mwstrl.md) — Art. 36a MwStSystRL: Zuordnung der Warenbewegung, Quick Fix lit. a/b/c
- [`art138_mwstrl.md`](eu/art138_mwstrl.md) — Art. 138 MwStSystRL: Steuerbefreiung IG-Lieferung, Belegnachweis
- [`art141_triangle.md`](eu/art141_triangle.md) — Art. 141 MwStSystRL: Dreiecksgeschäft, EuGH Luxury Trust, 4-Parteien
- [`quick_fixes_2020.md`](eu/quick_fixes_2020.md) — RL 2018/1910/EU: Alle 4 Quick Fixes, Euro Tyre, Kreuzmayr

### Österreich (`at/`)
- [`ustg_at_reihengeschaeft.md`](at/ustg_at_reihengeschaeft.md) — § 3 Abs. 8/15 UStG AT, Art. 6/7 UStG 1994, EPROHA-Kontext
- [`ustg_at_dreieck.md`](at/ustg_at_dreieck.md) — Art. 25 UStG AT, KZ 077, natLaw()-Dispatch AT vs. DE

### Deutschland (`de/`)
- [`ustg_de_3_6a.md`](de/ustg_de_3_6a.md) — § 3 Abs. 6a UStG, § 13b RC-Block bei Warenlieferung, EPDE-Kontext
- [`ustae_reihengeschaeft.md`](de/ustae_reihengeschaeft.md) — Abschn. 3.14/25b UStAE, § 14a Abs. 7, BFH XI R 35/22

### Schweiz (`ch/`)
- [`mwst_ch_ort_lieferung.md`](ch/mwst_ch_ort_lieferung.md) — Art. 7/23/10/67 MWSTG, computeTaxCH(), Drittland-Routing
- [`mwst_ch_konsignationslager.md`](ch/mwst_ch_konsignationslager.md) — MI06 Ziff. 6.1, Phase 1/2, ZG Art. 50–57, buildKonsiLagerCH()

### Implementierungsregeln (`rules/`)
- [`moving_supply_logic.md`](rules/moving_supply_logic.md) — Entscheidungsbaum transport→movingIndex, lit. a/b/c Automatik
- [`uid_usage_rules.md`](rules/uid_usage_rules.md) — UID-Hierarchie, _sapEffectiveCountry(), Euro Tyre / Kreuzmayr
- [`triangle_conditions.md`](rules/triangle_conditions.md) — Art. 141 lit. a–e Code-Mapping, first3/last3/mid3, NL-Sonderfall
- [`rc_country_rules.md`](rules/rc_country_rules.md) — _checkRCBlock() für BE/PL/CZ/SI/LV/EE/IT/DE mit Return-Objekten
- [`registration_risk_logic.md`](rules/registration_risk_logic.md) — 6 Risk-Types A–F, triangleMitigatesReg, severity-Werte
- [`place_of_supply.md`](rules/place_of_supply.md) — Art. 32/36 MwStSystRL, num-Signal, Inland-Sonderfall, Export-Check
