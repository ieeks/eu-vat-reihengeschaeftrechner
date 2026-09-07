# VAT-Wissensbasis für den M365-Copilot-Agenten — EPROHA (AT)

> **AUTOMATISCH GENERIERT** von `scripts/gen-m365-knowledge.mjs` —
> nicht direkt bearbeiten. Quelle: `vat-knowledge/` +
> `copilot-m365/firmenkontext-eproha.md`. Neu bauen mit:
> `node scripts/gen-m365-knowledge.mjs`.
>
> Diese Datei nach OneDrive/SharePoint hochladen und im EPROHA (AT)-Agenten
> als Wissensquelle verknüpfen (siehe `copilot-m365/README.md`).

## Inhaltsverzeichnis

1. Firmenkontext EPROHA
2. Kernregeln & Index
3. Referenzfälle (Goldstandard)
4. Grenzfälle
5. Regel · Transportzuordnung
6. Regel · Dreiecksgeschäft
7. Regel · Lieferort
8. Regel · Reverse-Charge-Länder
9. Regel · Registrierungsrisiko
10. Regel · UID-Nutzung
11. Regel · Inlandskette
12. EU · Art. 36a MwStSystRL
13. EU · Art. 138 MwStSystRL
14. EU · Art. 141 Dreieck
15. EU · Art. 141 Länderstand
16. EU · Quick Fixes 2020
17. AT · Reihengeschäft
18. AT · Dreiecksgeschäft
19. DE · § 3 Abs. 6a UStG
20. DE · UStAE Reihengeschäft
21. NL · Wet OB Reihengeschäft
22. CH · Ort der Lieferung
23. CH · Konsignationslager
24. AT · EPROHA-Buchungskreise

---
# 1. Firmenkontext EPROHA
<!-- Quelle: copilot-m365/firmenkontext-eproha.md -->

# Firmenkontext — EPROHA (Sitz AT)

> Quelldatei für die EPROHA-Wissensbasis. Wird vom Generator
> `scripts/gen-m365-knowledge.mjs` als erster Abschnitt in
> `copilot-m365/wissensbasis-eproha.md` eingefügt.

## Firma

| Firma | Sitz | vorhandene UIDs |
|---|---|---|
| **EPROHA** | AT | AT, DE, CH |

Standardperspektive dieses Agenten: **Ich = EPROHA**. Fehlt eine UID im
Bestimmungsland, ist das ein starkes Signal für Registrierungspflicht **oder**
für die Dreiecksgeschäft-Vereinfachung (Art. 141).

## SAP-Steuerkennzeichen (MWSKZ) — EPROHA

### AT-UID

| Treatment | Out | In | Bedeutung |
|---|---|---|---|
| `ic-exempt` | **AF** | **AF** | IG-Lieferung AT 0 % — OUT+IN gleich, Netto 0 |
| `ic-acquisition` | **VE** | **VE** | IG-Erwerb AT 20 % (ESA/ESE) — OUT+IN gleich, Netto 0 |
| `domestic` | **A2** | **V2** | Inlandslieferung AT 20 % |
| `export` | **A0** | — | Ausfuhr ins Drittland 0 % (CH, UK, CN …) |
| `dreiecks` | **AF** | — | Dreiecksgeschäft AT (Erwerbsteuer 0 %) |
| `rc` | **RC** | **RC** | Reverse Charge AT (RCA/RCE) |
| `not-taxable` | **X0** | — | Nicht steuerbar AT |

### DE-UID

| Treatment | Out | In | Bedeutung |
|---|---|---|---|
| `ic-exempt` | **DH** | **DH** | IG-Lieferung DE 0 % |
| `ic-acquisition` | **VH** | **VH** | IG-Erwerb DE 19 % |
| `domestic` | **DS** | **VD** | Inlandslieferung DE 19 % |
| `export` | **D0** | — | Ausfuhr Drittland 0 % (über DE-UID) |

**Merkhilfe EPROHA:** AF = IG-Lieferung (AT-UID) · VE = IG-Erwerb (AT-UID) ·
A0 = Ausfuhr Drittland (AT-UID) · A2/V2 = Inland AT.

**Pendant zu EPDE (nur fürs Dreieck-Verständnis):** VE ⇄ VH (Erwerb) ·
AF ⇄ DH (Lieferung). Im Dreieck läuft der IG-Erwerb über die Heimat-UID (VE),
die ruhende Lieferung ist die Dreieckslieferung → AF.

---

# 2. Kernregeln & Index
<!-- Quelle: vat-knowledge/CLAUDE-vat-knowledge.md -->

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
| SAP-Codes / `_sapEffectiveCountry()` | `rules/uid_usage_rules.md` · `at/eproha-buchungskreise.md` · `de/epde-buchungskreise.md` |
| `buildKurzbeschreibung()` / `summaryItems` | `rules/uid_usage_rules.md` |
| `buildVergleichTab()` | `rules/triangle_conditions.md` + `rules/registration_risk_logic.md` |
| `buildTrafficStatus()` / `analyzeInland()` regBanner | `rules/registration_risk_logic.md` · `rules/inland_chain.md` |
| `analyze2()` / EPROHA AT-Lager | `at/ustg_at_reihengeschaeft.md` |
| `analyzeCH()` / `computeTaxCH()` | `ch/mwst_ch_ort_lieferung.md` |
| `buildKonsiLagerCH()` | `ch/mwst_ch_konsignationslager.md` |
| Dreiecksgeschäft AT | `at/ustg_at_dreieck.md` |
| Dreiecksgeschäft DE | `de/ustae_reihengeschaeft.md` |
| NL-RC / NL-Dreieck (Art. 12 / Art. 37c Wet OB) | `nl/wet_ob_nl_reihengeschaeft.md` |
| `computeLohn()` / Modus 5 Lohnveredelung | `eu/art17_verbringen.md` |
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
| **DE** | § 13b UStG | DE-RC-Prüfung liegt in `computeTax()` (Rendering-Layer), nicht in `_checkRCBlock()` (VATEngine) |

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
- B *besitzt* eine dest-UID (ohne sie zu verwenden) → Tool blockt ebenfalls — das ist **interne Policy (D1)**, nicht in allen MS die Rechtslage. Länderstand: [`eu/art141_dest_registration.md`](eu/art141_dest_registration.md)
- B verwendet UID aus Land von A (s1) → A kann nicht steuerfrei fakturieren → blockiert

---

## Dateiindex

### EU-Recht (`eu/`)
- [`art36a_mwstrl.md`](eu/art36a_mwstrl.md) — Art. 36a MwStSystRL: Zuordnung der Warenbewegung, Quick Fix lit. a/b/c
- [`art138_mwstrl.md`](eu/art138_mwstrl.md) — Art. 138 MwStSystRL: Steuerbefreiung IG-Lieferung, Belegnachweis
- [`art141_triangle.md`](eu/art141_triangle.md) — Art. 141 MwStSystRL: Dreiecksgeschäft, EuGH Luxury Trust, 4-Parteien
- [`art141_dest_registration.md`](eu/art141_dest_registration.md) — **Art. 141 lit. a Länderübersicht**: blockt eine bloße Registrierung im Bestimmungsland? 8 Länder mit UID ohne Niederlassung, Quellenqualität A/B/C, Fragenkatalog für lokale Berater
- [`quick_fixes_2020.md`](eu/quick_fixes_2020.md) — RL 2018/1910/EU: Alle 4 Quick Fixes, Euro Tyre, Kreuzmayr

### Österreich (`at/`)
- [`ustg_at_reihengeschaeft.md`](at/ustg_at_reihengeschaeft.md) — § 3 Abs. 8/15 UStG AT, Art. 6/7 UStG 1994, EPROHA-Kontext
- [`ustg_at_dreieck.md`](at/ustg_at_dreieck.md) — Art. 25 UStG AT, KZ 077, natLaw()-Dispatch AT vs. DE
- [`eproha-buchungskreise.md`](at/eproha-buchungskreise.md) — **AT- vs. DE-Buchungskreis**, A0/AF/DH-Entscheidungslogik, `_sapEffectiveCountry()`, vollständige SAP-Matrix EPROHA

### Deutschland (`de/`)
- [`ustg_de_3_6a.md`](de/ustg_de_3_6a.md) — § 3 Abs. 6a UStG, § 13b RC-Block bei Warenlieferung, EPDE-Kontext
- [`ustae_reihengeschaeft.md`](de/ustae_reihengeschaeft.md) — Abschn. 3.14/25b UStAE, § 14a Abs. 7, BFH XI R 35/22
- [`epde-buchungskreise.md`](de/epde-buchungskreise.md) — **DE- vs. 7 EU-Buchungskreise**, G0/DH-Entscheidungslogik, RC NL-Ausnahme, IT inversione contabile, vollständige SAP-Matrix EPDE (8 UIDs)

### Niederlande (`nl/`)
- [`wet_ob_nl_reihengeschaeft.md`](nl/wet_ob_nl_reihengeschaeft.md) — Art. 5/12/37a/37c Wet OB 1968, **RC-Sonderfall trotz Direktregistrierung** (Art. 12 Abs. 3), Dreiecksgeschäft NL als Bestimmungsland (5 Bedingungen), EPDE NL-UID NL827914052B01

### Schweiz (`ch/`)
- [`mwst_ch_ort_lieferung.md`](ch/mwst_ch_ort_lieferung.md) — Art. 7/23/10/67 MWSTG, computeTaxCH(), Drittland-Routing
- [`mwst_ch_konsignationslager.md`](ch/mwst_ch_konsignationslager.md) — MI06 Ziff. 6.1, Phase 1/2, ZG Art. 50–57, buildKonsiLagerCH()

### Implementierungsregeln (`rules/`)
- [`moving_supply_logic.md`](rules/moving_supply_logic.md) — Entscheidungsbaum transport→movingIndex, lit. a/b/c Automatik
- [`uid_usage_rules.md`](rules/uid_usage_rules.md) — UID-Hierarchie, _sapEffectiveCountry(), Euro Tyre / Kreuzmayr
- [`triangle_conditions.md`](rules/triangle_conditions.md) — Art. 141 lit. a–e Code-Mapping, first3/last3/mid3, NL-Sonderfall
- [`rc_country_rules.md`](rules/rc_country_rules.md) — _checkRCBlock() für BE/PL/CZ/SI/LV/EE/IT; DE-RC-Prüfung liegt in `computeTax()` (Rendering-Layer), nicht in `_checkRCBlock()` (VATEngine). Engine kennt keinen DE-spezifischen RC-Block.
- [`registration_risk_logic.md`](rules/registration_risk_logic.md) — 6 Risk-Types A–F, triangleMitigatesReg, severity-Werte
- [`place_of_supply.md`](rules/place_of_supply.md) — Art. 32/36 MwStSystRL, num-Signal, Inland-Sonderfall, Export-Check
- [`reference-cases.md`](reference-cases.md) — **Referenzfälle mit verifizierten Ergebnissen** (movingIndex, Lieferort, SAP-Stkz.); 14 Fälle aus SMOKE_TESTS, alle Transport-Varianten, Dreiecksgeschäft-Blockierungsgründe, EPROHA + EPDE
- [`edge-cases.md`](edge-cases.md) — **Bekannte Grenzfälle** (dep===dest BG, HU EXW lit. c/b, Sappi DE→EPDE→IT Dreieck-Block); je mit Varianten, Handlungsempfehlung, SMOKE_TEST-Verweis
- [`rules/inland_chain.md`](rules/inland_chain.md) — **Inlands-Reihengeschäft** (dep===dest): meStatus-Logik, SAP-Matrizen EPROHA + EPDE, IT inversione contabile, 4 Referenzfälle, NL/EE-Sonderfälle

---

# 3. Referenzfälle (Goldstandard)
<!-- Quelle: vat-knowledge/reference-cases.md -->

# Referenzfälle — Reihengeschäft: Erwartete Ergebnisse

> Menschenlesbare Fallsammlung mit verifizierten Ausgaben (movingIndex, Lieferort,
> Steuerbehandlung, SAP-Stkz.). Jeder Fall ist durch einen Smoke-Test in `app.js`
> maschinell abgedeckt — Testfall-ID steht am Ende jedes Abschnitts.
>
> Perspektive: immer **Ich = B (Mittler)**, außer in Gruppe C (EPDE als B).

---

## SAP-Stkz.-Kurzreferenz (Schnellzugriff)

| Situation | Vorgang | EPROHA | EPDE |
|---|---|---|---|
| IG-Lieferung aus AT (Ausgang) | steuerfreie IG-Lieferung | **AF** | — |
| IG-Lieferung aus DE (Ausgang) | steuerfreie IG-Lieferung | **DH** | **DH** |
| IG-Erwerb in AT (Eingang) | ig. Erwerb AT 20% | **VE** | — |
| IG-Erwerb in DE (Eingang) | ig. Erwerb DE 19% | **VH** | **VH** |
| Dreiecksgeschäft AT (Ausgang) | Art. 25 UStG AT, ZM | **AF** | — |
| Inlandslieferung AT (Ausgang) | 20% AT-MwSt | **A2** | — |
| Inlandslieferung AT (Eingang) | 20% AT-Vorsteuer | **V2** | — |
| Inlandslieferung DE (Ausgang) | 19% DE-MwSt | **DS** | **DS** |
| Inlandslieferung DE (Eingang) | 19% DE-Vorsteuer | **VD** | **VD** |
| Ausfuhr AT (Ausgang) | 0% § 7 UStG AT | **A0** | — |
| Ausfuhr DE (Ausgang) | 0% § 6 UStG | — | **G0** |
| RC IT inversione (Ausgang) | 0% Art. 17 DPR 633 | **IC** | **IC** |
| RC IT inversione (Eingang) | Vorsteuer IT 22% | **VT** | **VI** |
| IG-Erwerb in NL (Eingang) | ig. Erwerb NL 21% | — | **NP** |
| RC NL (Ausgang) | 0% Art. 12 Abs. 3 Wet OB | — | **NC** |
| RC NL (Eingang Vorsteuer) | Vorsteuer NL 21% | — | **NI** |

---

## Gruppe A — 3P, EPROHA (AT) als Mittler B

### A1 · DE → AT → IT · Transport: Lieferant (A)

**Testfall:** LF-02a, DG-01 · **Quelle:** reihengeschaeft.at Beispiel 2a

```
🇩🇪 DE ──L1──▶ 🇦🇹 AT/EPROHA ──L2──▶ 🇮🇹 IT
         Lieferant fährt
```

**Transportzuordnung:** A transportiert → Art. 36a Abs. 1 Satz 1 → **L1 ist bewegend** (movingIndex=0)

| Lieferung | Ort | Behandlung | EPROHA-Eingang (Käufer) | EPROHA-Ausgang (Verkäufer) |
|---|---|---|---|---|
| L1 · DE→AT | 🇩🇪 DE | IG-Lieferung 0% | IG-Erwerb AT 20% · **SAP VE** | — |
| L2 · AT→IT | 🇮🇹 IT | Dreiecksgeschäft 0% ¹ | — | Dreiecksgeschäft · **SAP AF** ¹ |

¹ Ohne Dreiecksgeschäft: inversione contabile IT 0% · **SAP IC** (kein Unterschied für EPROHA,
  aber IT-Empfänger führt 22% Erwerbsteuer ab; EPROHA bleibt ohne IT-Registrierung).

**Dreiecksgeschäft:** ✅ möglich
- 3 verschiedene EU-Länder (DE, AT, IT) ✓
- EPROHA hat keine IT-UID ✓ (Art. 141 lit. a: kein Dreiecksgeschäft wenn UID im Bestimmungsland)
- Transport durch A (nicht durch C) ✓ (Art. 141 lit. e)
- EPROHA verwendet AT-UID auf Rechnung, meldet ZM aus AT
- Vorteil: **keine IT-Registrierungspflicht** für EPROHA

**ZM:** EPROHA meldet L2 aus AT (AT-UID, Empfänger-UID: IT-UID des Kunden)

---

### A2 · DE → AT → IT · Transport: B (EPROHA), mit AT-UID (Grundregel Abs. 1)

**Testfall:** LF-02c, DG-02 · **Quelle:** reihengeschaeft.at Beispiel 2c

```
🇩🇪 DE ──L1──▶ 🇦🇹 AT/EPROHA ──L2──▶ 🇮🇹 IT
                  B holt ab
                  AT-UID mitgeteilt (≠ Abgangsland DE) → Grundregel Abs. 1
```

**Transportzuordnung:** B transportiert, uidOverride='AT' (Ansässigkeits-UID ≠ dep DE).
Da NICHT die Abgangsland-UID (DE) mitgeteilt wird, greift Art. 36a Abs. 2 nicht →
**Grundregel Abs. 1 → L1 ist bewegend** (movingIndex=0).

| Lieferung | Ort | Behandlung | EPROHA-Eingang (Käufer) | EPROHA-Ausgang (Verkäufer) |
|---|---|---|---|---|
| L1 · DE→IT | 🇩🇪 DE (Abgang) | IG-Lieferung 0% aus DE | IG-Erwerb (Dreieck) · **SAP VE** ¹ | — |
| L2 · AT→IT | 🇮🇹 IT (ruhend) | Dreiecksgeschäft 0% ¹ | — | Dreiecksgeschäft · **SAP AF** ¹ |

¹ Dreiecksgeschäft DE-AT-IT: EPROHA tritt mit AT-UID auf, meldet ZM aus AT,
  IT-Kunde schuldet die Erwerbsteuer. Keine IT-Registrierung für EPROHA.

**Dreiecksgeschäft:** ✅ möglich (DE, AT, IT verschieden; EPROHA ohne IT-UID).

**ZM:** EPROHA meldet L2 aus AT (AT-UID, Empfänger IT-UID des Kunden).

**Hinweis:** Würde EPROHA die **DE-UID** (= Abgangsland-UID) mitteilen, kippt es nach
Art. 36a Abs. 2 auf L2 bewegend (vgl. LF-02d): L1 ruhend in DE (19 % als Vorsteuer),
L2 IG-Lieferung ab DE. Maßgeblich ist also die mitgeteilte UID.

---

### A3 · AT → AT → DE · Transport: Lieferant (A)

**Testfall:** LF-01a · **Quelle:** reihengeschaeft.at Beispiel 1a

```
🇦🇹 AT ──L1──▶ 🇦🇹 AT/EPROHA ──L2──▶ 🇩🇪 DE
        Lieferant fährt nach DE
```

**Transportzuordnung:** A transportiert → **L1 ist bewegend** (movingIndex=0)

| Lieferung | Ort | Behandlung | EPROHA-Eingang (Käufer) | EPROHA-Ausgang (Verkäufer) |
|---|---|---|---|---|
| L1 · AT→AT | 🇦🇹 AT (Abgang) | IG-Lieferung 0% aus AT → Erwerb in DE | IG-Erwerb DE 19% · **SAP VH** | — |
| L2 · AT→DE | 🇩🇪 DE (ruhend) | Inlandslieferung DE 19% | — | DE-Domestic · **SAP DS** |

**Dreiecksgeschäft:** ❌ nicht möglich — nur 2 verschiedene Länder (AT, DE); Art. 141 erfordert 3 MS.

**Besonderheit:** AT-Lieferant und EPROHA sitzen beide in AT, aber die Ware geht nach DE.
L1 ist trotzdem die IG-Lieferung (Abgangsland AT, Bestimmungsland DE). EPROHA tätigt
IG-Erwerb in DE (Art. 40 MwStSystRL) mit DE-UID. L2 ist ruhende Inlandslieferung in DE.
EPROHA braucht DE-UID für den IG-Erwerb — vorhanden.

---

### A4 · AT → AT → DE · Transport: Kunde (C) oder B

**Testfall:** LF-01c (Transport=C), LF-01b (Transport=B) · **Quelle:** Beispiele 1b/1c

```
🇦🇹 AT ──L1──▶ 🇦🇹 AT/EPROHA ──L2──▶ 🇩🇪 DE
                               ↑ C holt ab (oder B liefert)
```

**Transportzuordnung (beide Varianten):**
- Transport=C: letzte Lieferung bewegend → L2 bewegend (movingIndex=1)
- Transport=B/AT-UID: lit. b → L2 bewegend (movingIndex=1)

| Lieferung | Ort | Behandlung | EPROHA-Eingang (Käufer) | EPROHA-Ausgang (Verkäufer) |
|---|---|---|---|---|
| L1 · AT→AT | 🇦🇹 AT (ruhend) | Inlandslieferung AT 20% | AT-Domestic · **SAP V2** | — |
| L2 · AT→DE | 🇦🇹 AT (Abgang) | IG-Lieferung 0% aus AT | — | IG-Lieferung AT · **SAP AF** |

**Dreiecksgeschäft:** ❌ — nur 2 Länder.

**ZM:** L2 aus AT (AT-UID). Belegnachweis: Gelangensbestätigung oder CMR (§ 7 AT UStR).

---

### A5 · IT → AT → DE · Transport: Lieferant (Dreiecksgeschäft blockiert)

**Testfall:** DG-04 · **Quelle:** Art. 141 lit. a — eigene UID im Bestimmungsland

```
🇮🇹 IT ──L1──▶ 🇦🇹 AT/EPROHA ──L2──▶ 🇩🇪 DE
        Lieferant fährt nach DE
        ⚠️ EPROHA hat DE-UID!
```

**Transportzuordnung:** A transportiert → **L1 bewegend** (movingIndex=0)

| Lieferung | Ort | Behandlung | EPROHA-Eingang (Käufer) | EPROHA-Ausgang (Verkäufer) |
|---|---|---|---|---|
| L1 · IT→AT | 🇮🇹 IT (Abgang) | IG-Lieferung 0% aus IT | IG-Erwerb AT 20% · **SAP VE** | — |
| L2 · AT→DE | 🇩🇪 DE (ruhend) | Inlandslieferung DE 19% (oder RC §13b) | — | DE-Domestic · **SAP DS** |

**Dreiecksgeschäft:** ❌ blockiert — EPROHA hat eigene DE-UID (Art. 141 lit. a: B darf keine UID
im Bestimmungsland haben). Ergebnis: L2 = Inlandslieferung DE, EPROHA muss 19% DE-MwSt ausweisen.

**Registrierungsrisiko:** EPROHA hat DE-UID → bereits registriert → kein zusätzliches Risiko.
Aber: L2 in DE erfordert DE-UVA-Meldung (Ausgangssteuer DS).

---

## Gruppe B — 4P, EPROHA (AT) als U2

### B1 · IT → AT → DE → HU · Transport: Lieferant · Dreiecksgeschäft first3

**Testfall:** LF-04a, DG-07 · **Quelle:** reihengeschaeft.at 4-Parteien Dok 8 · EuG T-646/24

```
🇮🇹 IT(U1) ──L1──▶ 🇦🇹 AT/EPROHA(U2) ──L2──▶ 🇩🇪 DE(U3) ──L3──▶ 🇭🇺 HU(U4)
            Lieferant fährt nach HU
```

**Transportzuordnung:** A (U1) transportiert → **L1 bewegend** (movingIndex=0)

| Lieferung | Ort | Behandlung | EPROHA-Eingang (L1-Käufer) | EPROHA-Ausgang (L2-Verkäufer) |
|---|---|---|---|---|
| L1 · IT→AT | 🇮🇹 IT (Abgang) | IG-Lieferung 0% IT | IG-Erwerb AT 20% · **SAP VE** | — |
| L2 · AT→DE | 🇭🇺 HU (ruhend) | Inlandslieferung HU (27%!) | — | HU-Domestic — Registrierung nötig ¹ |
| L3 · DE→HU | 🇭🇺 HU (ruhend) | Inlandslieferung HU | — (U3 Sache) | — |

¹ Außer Dreiecksgeschäft first3 greift (s.u.)

**Dreiecksgeschäft first3:** ✅ möglich (EuG T-646/24: auch in 4-Parteien-Ketten)
- Dreiecksgeschäft zwischen U1(IT) → U2(AT/EPROHA) → U3(DE) als first3
- L1 ist IG-Lieferung, L2 wird als Dreiecksgeschäft behandelt (U3/DE führt Erwerbsteuer ab)
- **EPROHA Ausgang L2:** 0% Dreiecksgeschäft · **SAP AF**, ZM aus AT
- U3(DE) muss IG-Erwerb in HU abführen (oder selbst Dreiecksgeschäft anwenden)
- EPROHA vermeidet HU-Registrierung

**Ohne Dreiecksgeschäft:** L2 + L3 ruhend in HU → EPROHA braucht HU-Registrierung (27% HU-MwSt).

---

### B2 · IT → AT → DE → HU · Transport: U3 (middle2) · C037m

**Testfall:** C037m-MAIN · **Quelle:** reihengeschaeft.at C037m (Hauptfall)

```
🇮🇹 IT(U1) ──L1──▶ 🇦🇹 AT/EPROHA(U2) ──L2──▶ 🇩🇪 DE(U3) ──L3──▶ 🇭🇺 HU(U4)
                                      U3 holt in IT ab, hat keine IT-UID
                                      → lit. c → L2 bewegend
```

**Transportzuordnung:** U3 transportiert, keine IT-UID (dep) → Quick Fix lit. c
→ chainIndex=2, movingIndex=chainIndex-1=**1** → **L2 bewegend** (movingIndex=1)

| Lieferung | Ort | Behandlung | EPROHA-Eingang (L1-Käufer) | EPROHA-Ausgang (L2-Verkäufer) |
|---|---|---|---|---|
| L1 · IT→AT | 🇮🇹 IT (ruhend) | Inlandslieferung IT 22% | IT-RC · **SAP VT** (inversione) | — |
| L2 · AT→DE | 🇮🇹 IT (Abgang) | IG-Lieferung 0% aus IT | — | IG-Lieferung · **SAP AF** (AT-UID) |
| L3 · DE→HU | 🇭🇺 HU (ruhend) | Inlandslieferung HU | — | — |

**Dreiecksgeschäft last3:** ✅ möglich — U2(AT)→U3(DE)→U4(HU) als last3
- L2 ist die bewegte IG-Lieferung (AT→DE, Abgang IT), L3 ruhend in HU
- Dreiecksgeschäft AT-DE-HU: EPROHA sendet ZM aus AT, U3(DE) führt HU-Erwerbsteuer ab

**Varianten (C037m):**
- **Alt A** (U3 mit IT-UID = Abgangsland → Abs. 2): movingIndex=2 (L3 bewegend), kein Dreiecksgeschäft
- **Alt B** (U3 mit HU-UID = dest, ≠ Abgangsland IT → Grundregel Abs. 1): movingIndex=1 (L2 bewegend), kein Dreiecksgeschäft (U3 hält dest-UID HU)

---

## Gruppe C — 3P, EPDE (DE) als Mittler B

### C1 · FR → DE → IT · Transport: Lieferant · Dreiecksgeschäft möglich

**Testfall:** DG-09 · **Quelle:** Art. 141 MwStSystRL — FR-DE-IT, EPDE ohne IT-UID

```
🇫🇷 FR ──L1──▶ 🇩🇪 DE/EPDE ──L2──▶ 🇮🇹 IT
       Lieferant fährt nach IT
```

**Transportzuordnung:** A transportiert → **L1 bewegend** (movingIndex=0)

| Lieferung | Ort | Behandlung | EPDE-Eingang (Käufer) | EPDE-Ausgang (Verkäufer) |
|---|---|---|---|---|
| L1 · FR→DE | 🇫🇷 FR (Abgang) | IG-Lieferung 0% aus FR | IG-Erwerb DE 19% · **SAP VH** | — |
| L2 · DE→IT | 🇮🇹 IT (ruhend) | Dreiecksgeschäft 0% ¹ | — | Dreiecksgeschäft · **SAP DH** ¹ |

¹ Ohne Dreiecksgeschäft: inversione contabile IT 0% · **SAP IC**

**Dreiecksgeschäft:** ✅ möglich — EPDE hat keine IT-UID, 3 verschiedene Länder (FR, DE, IT).

---

### C2 · FR → DE → NL · Transport: Lieferant · Dreiecksgeschäft blockiert

**Testfall:** DG-10 · **Quelle:** Art. 141 lit. a — EPDE hat NL-UID

```
🇫🇷 FR ──L1──▶ 🇩🇪 DE/EPDE ──L2──▶ 🇳🇱 NL
       ⚠️ EPDE hat NL-UID → Dreiecksgeschäft blockiert
```

| Lieferung | Ort | Behandlung | EPDE-Eingang | EPDE-Ausgang |
|---|---|---|---|---|
| L1 · FR→DE | 🇫🇷 FR | IG-Lieferung 0% | IG-Erwerb DE 19% · **SAP VH** | — |
| L2 · DE→NL | 🇳🇱 NL | RC NL 0% (Art. 12 Wet OB) | — | RC · **SAP NC** |

**Dreiecksgeschäft:** ❌ — EPDE hat NL-UID (Art. 141 lit. a blockiert).
EPDE fakturiert L2 mit NL-UID, NL-Empfänger wendet RC an (sofern steuerpflichtig).

---

### C3 · SI → DE → DE · Transport: Lieferant · EPDE als Käufer

**Testfall:** PERSP-02 · **Quelle:** Perspektiv-Bug fix v3.0

```
🇸🇮 SI ──L1──▶ 🇩🇪 DE/EPDE ──L2──▶ 🇩🇪 DE (Endkunde)
       Lieferant fährt nach DE
```

**Transportzuordnung:** A transportiert → **L1 bewegend** (movingIndex=0)

| Lieferung | Ort | Behandlung | EPDE-Eingang (L1-Käufer) | EPDE-Ausgang (L2-Verkäufer) |
|---|---|---|---|---|
| L1 · SI→DE | 🇸🇮 SI (Abgang) | IG-Lieferung 0% aus SI | IG-Erwerb DE 19% · **SAP VH** | — |
| L2 · DE→DE | 🇩🇪 DE (ruhend) | Inlandslieferung DE 19% | — | DE-Domestic · **SAP DS** |

**Dreiecksgeschäft:** ❌ — nur 2 Länder (SI, DE).

**EPDE-Perspektive:** EPDE tätigt IG-Erwerb in DE (Saldo 0: VH = Vorsteuer, Erwerbsteuer in UVA).
L2 ist reine DE-Inlandslieferung. Kein RC (§ 13b UStG gilt nicht für Warenlieferungen
zwischen zwei DE-registrierten Unternehmen, wenn kein Grundstücksbezug).

---

### C4 · AT → DE/EPDE (NL-UID) → NL · Transport: Lieferant · NL-RC Sonderfall

**Testfall:** verifizierter Produktionsfall · **Quelle:** EPDE-Praxis · **Analogie:** C2/DG-10 (FR statt AT)

```
🇦🇹 AT ──L1──▶ 🇩🇪 DE/EPDE ──L2──▶ 🇳🇱 NL
       Lieferant fährt direkt nach NL
       EPDE tritt mit NL-UID (NL827914052B01) auf
```

**Transportzuordnung:** A transportiert → **L1 bewegend** (movingIndex=0)

| Lieferung | Ort | Behandlung | EPDE-Eingang (L1-Käufer) | EPDE-Ausgang (L2-Verkäufer) |
|---|---|---|---|---|
| L1 · AT→NL | 🇦🇹 AT (Abgang) | IG-Lieferung 0% aus AT → Erwerb in NL | IG-Erwerb NL 21% · **SAP NP** | — |
| L2 · NL→NL | 🇳🇱 NL (ruhend) | RC NL 0% (Art. 12 Abs. 3 Wet OB) | — | RC NL · **SAP NC** + „BTW verlegd" |

**Dreiecksgeschäft:** ❌ blockiert — EPDE hat NL-UID (Art. 141 lit. a: B darf keine UID im Bestimmungsland haben).
Ergebnis: kein § 25b-Vereinfachungsverfahren, stattdessen NL-RC nach Art. 12 Abs. 3 Wet OB 1968.

**Warum kein lokales NL-MwSt-Ausweisen?** EPDE ist in NL nur direkt registriert (keine NL-Betriebsstätte).
Art. 12 Abs. 3 Wet OB erlaubt RC ausdrücklich auch bei Direktregistrierung — anders als BE/PL/CZ/SI/LV/EE,
wo eine Registrierung den RC blockiert. NL ist der einzige Sonderfall.

**Vergleich der UID-Wahl:**

| EPDE-UID | Rechtsweg | SAP L2 | Meldepflicht |
|---|---|---|---|
| **NL** (dieser Fall) | Art. 12 Abs. 3 Wet OB (RC) | **NC** | NL-ZM monatlich (Art. 37a Wet OB) |
| **DE** | Art. 141 MwStSystRL (Dreieck) | **DH** + § 25b-Pflichttext | DE-ZM mit Dreieck-Kennzeichen |

Wirtschaftlich identisch (kein MwSt-Abfluss). Die NL-UID-Variante ist administrativ aufwendiger
(monatliche NL-ZM), wird aber gewählt, wenn der NL-Kunde NL-UID auf der Rechnung erwartet oder EPDE
für andere NL-Lieferungen ohnehin in NL meldet.

**Belegnachweis:** Gelangensbestätigung oder CMR (§ 7 AT UStR — AT als Abgangsland);
NL-Pflichttext „BTW verlegd" oder „VAT reverse-charged" auf L2-Rechnung (Art. 12 Abs. 3 Wet OB / Art. 194 MwStSystRL).

**ZM:** EPDE meldet aus NL (NL-UID, Empfänger NL-Kunden-UID) monatlich bis letzter Tag Folgemonat (Art. 37a Wet OB).
AT-Lieferant meldet seine IG-Lieferung in der AT-ZM (Empfänger: EPDE NL-UID).

---

## Gruppe D — Dreiecksgeschäft: Systematische Blockierungsgründe

| Grund | Testfall | Beispiel | Ergebnis |
|---|---|---|---|
| 3 verschiedene Länder fehlen | DG-05 | AT→AT→DE | ❌ nur 2 Länder |
| UID im Bestimmungsland | DG-04 | IT→AT→**DE** (EPROHA hat DE-UID) | ❌ Art. 141 lit. a |
| UID im Bestimmungsland 4P | DG-08 | FR→AT→IT→**DE** | ❌ Art. 141 lit. a |
| UID-Land = Lieferant-Land | DG-UID-01 | **DE**→AT(DE-UID)→BE | ❌ UID-Land = Abgang |
| Transport durch C (Endkunde) | DG-03 | DE→AT→IT, Kunde fährt | ❌ Art. 141 lit. e |
| Kunde sitzt nicht im Bestimmungsland | DG-06 | FR→AT→DE, Bestimmung IT | ❌ Art. 141 lit. c |

---

## Gruppe E — Edge Cases

### E1 · Dep = Dest · Inland-Sonderfall

**Testfall:** DEP-DEST-01

```
🇮🇹 IT → 🇦🇹 AT → 🇮🇹 IT  (Abgang = Bestimmung)
```

Ergebnis: Engine setzt `_depEqDest=true` → kein movingIndex, keine IG-Lieferung.
→ `analyzeInland()` greift: Inlandsbeurteilung im Abgangsland.

---

### E2 · Abgangsland-UID vs. übrige UID — Entscheidungsmatrix

Maßgeblich ist allein die dem Vorlieferanten **mitgeteilte UID** (Art. 36a Abs. 1/2):

| Bedingung | Rechtsfolge | movingIndex | Dreiecksgeschäft |
|---|---|---|---|
| B teilt **Abgangsland-UID (dep)** mit | Ausnahme Abs. 2 → Ausgangslieferung | chainIndex (L2) | möglich (kein movingIndex-Erfordernis) |
| B teilt **Ansässigkeits-/dest-/Dritt-UID** mit (≠ dep) | Grundregel Abs. 1 → Eingangslieferung | chainIndex−1 (L1) | möglich wenn sonst Voraussetzungen erfüllt |
| B teilt **keine** dep-UID mit, nicht ansässig (Automatik) | Grundregel Abs. 1 → Eingangslieferung | chainIndex−1 (L1) | möglich wenn sonst Voraussetzungen erfüllt |

**Merkregel:** Nur die **Abgangsland-UID** verschiebt die Bewegung auf die
Ausgangslieferung (L2). Jede andere mitgeteilte UID lässt es bei der Grundregel →
Eingangslieferung (L1). Die Ansässigkeits-UID genügt für die Verschiebung **nicht**,
solange sie ≠ Abgangsland ist.

---

## Hinweise zur Belegführung

| Situation | Belegnachweis |
|---|---|
| IG-Lieferung (L1 oder L2 bewegend, EU→EU) | Gelangensbestätigung oder CMR (§ 7 AT UStR / § 17a UStDV) |
| Dreiecksgeschäft | Pflicht-Wortlaut auf Rechnung (EuGH C-247/21 Luxury Trust); fehlender Vermerk ist **nicht heilbar** |
| Ausfuhr AT→CH oder AT→GB | AT-Ausfuhrbestätigung ATLAS/e-dec; Gelangensbestätigung **reicht nicht** |
| EXW / Abholung durch Kunden | Gelangensbestätigung vom Kunden/Spediteur einfordern; Kontrolle über Ausfuhr geht verloren |

---

*Verknüpfte Dateien:* `eu/art36a_mwstrl.md` · `eu/art141_triangle.md` · `rules/moving_supply_logic.md` · `rules/triangle_conditions.md`
*Testfälle:* `SMOKE_TESTS` in `docs/assets/scripts/app.js` (IDs in Klammern oben)

---

# 4. Grenzfälle
<!-- Quelle: vat-knowledge/edge-cases.md -->

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
| Dreiecksgeschäft (Art. 141)? | hängt von der UID ab (siehe unten) |

**Entscheidend ist, welche EU-UID der CH-Kunde vorlegt** (im Tool über den UID-Picker im Drop-Shipment-Panel, State `mode2CustUid`):

| Vorgelegte UID | Behandlung EPROHA | Kunde | Dreieck? |
|---|---|---|---|
| **keine EU-UID** | 20 % AT (SAP A2) | — | ❌ |
| **AT** (Abgangsland) | 20 % AT (A2); bewegte Lieferung verschiebt sich (Art. 36a) | wäre ig. Lieferant aus AT → AT-Registrierung | ❌ |
| **SK** (Bestimmungsland) | ig. Lieferung 0 % (AF) an SK-UID | ig. Erwerb in SK (SK-Satz) + SK-Inlandslieferung; Registrierung SK nötig | ❌ (Art. 141 lit. a) |
| **Dritt-MS** (≠ AT, ≠ SK), z.B. DE | ig. Lieferung 0 % (AF) an Dritt-MS-UID | deemed acquisition SK + Reverse Charge; **keine** SK-Registrierung | ✅ Art. 141 |

> Der Schweizer Sitz ist für Art. 141 unschädlich — verlangt wird nur „nicht im **Bestimmungsland** niedergelassen" (SK), maßgeblich ist die verwendete UID, nicht der Sitz.

**Handlungsempfehlung:** Günstigster Weg ist die **Dritt-MS-UID** (Dreieck, keine SK-Registrierung). Liegt nur eine SK-UID vor, ist SK-Registrierung nötig; ohne EU-UID 20 % AT.

*Verwandte Dateien:* `at/ustg_at_reihengeschaeft.md` · `eu/art138_mwstrl.md` · `eu/art141_triangle.md` · `rules/triangle_conditions.md`
*Code:* `analyze2()` Branch `euGoodsRecipient` / Sub-Branch `bIsNonEU` (4 Fälle via `custUid`/`mode2CustUid`)

---

*Code:* `analyzeInland()` (F1) · `determineMovingSupply()` / `_applyQuickFix()` (F2) · `_detectTriangle3()` (F3) · `analyze2()` euGoodsRecipient (F4)
*Testfälle:* `RC-BG-AT-BG` · `RC-BG-DE-BG` · `RC-HU-DE-LITC` · `RC-HU-DE-LITA` · `RC-SAPPI-1` · `RC-SAPPI-2` · `RC-SAPPI-3`

---

# 5. Regel · Transportzuordnung
<!-- Quelle: vat-knowledge/rules/moving_supply_logic.md -->

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
!intermediaryResidentInDep
  → Grundregel Abs. 1 → movingIndex = chainIndex - 1
  → quickFixApplied: false, quickFixVariant: 'lit-c'
  → depVatAvailableNotCommunicated: true, wenn dep-UID vorhanden (Hinweistext)

sonst (im Abgangsland ansässig)
  → lit. b → movingIndex = chainIndex
  → _litBVatCountry: dep (wenn hasDepVat), sonst null
```

> **Besitz ≠ Mitteilung.** Art. 36a Abs. 2 verlangt, dass der Zwischenhändler dem
> Lieferanten die Abgangsland-UID **tatsächlich mitgeteilt** hat. Das bloße
> Vorhandensein einer dep-UID in den Stammdaten löst die Ausnahme daher NICHT aus —
> die Mitteilung ist eine Tatsache, die nur über `uidOverride` (UI: „UID-Wahl
> Art. 36a") eingegeben werden kann. Ohne Wahl gilt die Grundregel Abs. 1.
>
> Entsprechend gibt es **keine Vorauswahl** in `renderUidOverrideBlock()`; die
> Optionsliste startet zwar mit der dep-UID (sie ist die rechtlich bemerkenswerte),
> aktiv ist aber keine, bis der Anwender klickt.
>
> Die im lit.-b-Text genannte UID muss die Zuordnung auch tragen: benannt wird nur
> die dep-/Ansässigkeits-UID, keine Ersatz-UID aus dem Bestimmungsland.
>
> Regressionstests: `RC-HU-DE-LITC` (keine dep-UID) · `RC-HU-DE-BESITZ` (dep-UID
> vorhanden, nicht mitgeteilt → Abs. 1) · `RC-HU-DE-LITA` (mitgeteilt → Abs. 2).

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
Wörtlich gegengeprüft (UStR Rz 474g/474i + WKO-Leitfaden); inhaltsgleich zu DE, da beide
Art. 36a MwStSystRL (Quick Fixes, ab 1.1.2020) umsetzen.
| Aussage | Fundstelle (AT) |
|---|---|
| „Befördert/versendet der **erste Lieferer** die Gegenstände selbst, gilt **seine** Lieferung als bewegte Lieferung" | § 3 Abs. 15 **Z 1 lit. a** UStG 1994 (UStR Rz 474g) |
| „nur die bewegte Lieferung … als … Ausfuhrlieferung … steuerfrei"; Drittland-Bsp.: Ausfuhr 0 % nur der bewegten Lieferung, vorgelagerte ruhende Lieferung in AT steuerbar | UStR Rz 474g + **Rz 474i**; § 6 Abs. 1 Z 1 iVm **§ 7 Abs. 1 Z 1** UStG 1994 |
| Ruhende Lieferung **nach** der Bewegung gilt dort als ausgeführt, „wo die Beförderung/Versendung **endet**" (Bestimmungsland) | § 3 Abs. 15 **Z 4** UStG 1994 (vorgelagert: Z 3) |

> Quelle DE: UStH 2023, Abschn. 3.14 (BMF). Quelle AT: UStR 2000 Rz 474g–474j (findok.bmf.gv.at / Linde) · WKO „Reihengeschäfte in der Umsatzsteuer" · RIS § 3 Abs. 15 / § 7 UStG 1994. Beide Seiten am 23.06.2026 am Wortlaut verifiziert.
> Code-agnostisch: bewegte Lieferung kommt aus `determineMovingSupply()` (Art. 36a), Heimat-MWSKZ aus `getSapCode` (EPROHA A0/A2/AF · EPDE G0/DS/VD). Regressions-Tests: `OT-GBX-01`/`OT-GBX-02`.

---

# 6. Regel · Dreiecksgeschäft
<!-- Quelle: vat-knowledge/rules/triangle_conditions.md -->

# Dreiecksgeschäft — Bedingungen & Code-Mapping

## Art. 141 lit. a–e — Code-Mapping
| Bedingung | Prüfung in _detectTriangle3() | Blockiert wenn |
|---|---|---|
| (a) B nicht in dest registriert | `!!vatIds[dest]` | `vatIds[dest]` vorhanden → `'blocked-by-dest-vat'` |
| (b) Erwerb für Weiterlieferung | implizit angenommen | — |
| (c) C sitzt in dest | `s4 !== dest` | C nicht im Bestimmungsland |
| (d) RC auf C (Art. 197) | implizit gesetzt | — |
| (e) Transport durch A oder B | `transport === 'customer'` | Transport durch C → sofort false |

## UID-Land-Check
`usedUidCountry = uidOverride || companyHome`
Wenn `usedUidCountry === s1` → Lieferant müsste L1 als Inlandslieferung behandeln
→ keine steuerfreie IG-Lieferung möglich → Dreiecksgeschäft blockiert.

## _detectTriangle4() — 4-Parteien-Varianten
| Variante | Parteien | Bedingung | deRecognized |
|---|---|---|---|
| **last3** | U2→U3→U4 | `movingIndex===1 && s4===dest && !bHasDestVat` | `true` |
| **first3** | U1→U2→U3 | `movingIndex===0 && !bHasDestVat` | `false` (eugExtended) |

- `last3`: Alle 3 Parteien in verschiedenen MS, U4 im dest
- `first3`: U3 muss NICHT in dest sitzen (registriert sich erst dort)
- Primary = erstes `deRecognized`-Ergebnis || erstes Ergebnis überhaupt

## dreiecksOpportunity
Berechnet in `buildKurzbeschreibung()`:
```js
!eng.trianglePossible && !vatIds[dest] && s2!==s4 && s1!==s4
&& movIdx===0 && s4===dest && hasAnyNonDestId && alle EU
```
Zeigt „Dreiecksgeschäft möglich"-Banner in `buildDreiecksOpportunity()`.
Wird aktiv wenn User eine UID auswählt (`selectedUidOverride`).
In `buildVergleichTab()` pro Transport-Szenario einzeln berechnet.

## NL-Sonderfall
`dest === 'NL' && s1 === 'NL'` → Art. 37c Wet OB 1968 Bedingung (3):
Ware darf nicht aus dem MS kommen, der B die NL-UID erteilt hat.
Da B die NL-UID von NL hat und Ware aus NL kommt → blockiert.

---

## Bewusste Design-Entscheidung: UID = Blockierung (konservative Auslegung)

### Was der Code macht
```js
// _detectTriangle3()
if (!!vatIds[dest]) return _noTriangle(
  'Art. 141 lit. a: B hat USt-ID in ' + dest + ' → Vereinfachung blockiert.',
  'blocked-by-dest-vat'
);

// _detectTriangle4()
const bHasDestVat = !!vatIds[dest];
```

### Warum das so bleibt — NICHT ÄNDERN

Art. 141 lit. a MwStSystRL sagt dem Wortlaut nach "nicht niedergelassen"
(kein Sitz, keine feste Niederlassung) — nicht "keine UID".

Es gibt daher eine liberalere Rechtsauffassung (VwGH 15.12.2021
Ro 2020/15/0003, UStR Rz 4150, Quick Fixes Explanatory Notes
Beispiel 8 S. 66) die besagt: eine bloße Registrierung ohne
Niederlassung blockiert Art. 141 nicht.

**Diese liberale Auslegung wird bewusst NICHT implementiert.**

Grund: Steuerrechtliche Beratung (2024) hat explizit bestätigt dass
die bestehende SI-Registrierung von EPDE dazu führt dass
verpflichtend mit slowenischer MwSt fakturiert werden muss.
Die nationalen Finanzbehörden (insb. SI, PL, CZ) folgen
mehrheitlich der strengen Auslegung. Bei Betriebsprüfung
würde die liberale Position ein erhebliches Nachforderungsrisiko
bedeuten.

**Das Tool wählt bewusst die compliance-sichere Option.**

> Welches Land diese Frage wie beantwortet — inkl. Quellenqualität und offener
> Punkte — steht in [`../eu/art141_dest_registration.md`](../eu/art141_dest_registration.md).
> Für DE (§ 25b Abs. 2 Nr. 2 UStG) und AT (VwGH Ro 2020/15/0003) ist die strenge
> Lesart nachweislich **nicht** die Rechtslage; für SI/NL/BE/CZ/PL/LV/EE ist sie ungeprüft.

### Betroffene Länder für EPDE
SI, LV, EE, NL, BE, CZ, PL — alle mit UID aber ohne Niederlassung.
In diesen 7 Ländern blockiert die UID das Dreiecksgeschäft,
auch wenn Art. 141 lit. a dem Wortlaut nach nur "niedergelassen"
verlangt.

### Betroffene Länder für EPROHA
DE, CH — UID ohne Niederlassung (echter Sitz nur AT).

### Wenn diese Entscheidung revidiert werden soll
Nur nach erneuter steuerrechtlicher Beratung und expliziter
Freigabe. Dann establishments-Array in COMPANIES verwenden:
- EPDE: establishments = ['DE']
- EPROHA: establishments = ['AT']
Und vatIds[dest]-Check durch establishments.includes(dest) ersetzen
in _detectTriangle3() und _detectTriangle4().

**Aktueller Stand**: `establishments`-Array existiert in COMPANIES-Objekten,
wird aber in `_detectTriangle3()` und `_detectTriangle4()` **nie verwendet** —
dort gilt weiterhin `vatIds[dest]`.
`establishments` aktiv verwendet in:
1. `_checkRCBlock()` → BE-Branch (hasEstablishment('BE'))
2. `classifySupplies()` → sellerEstablished-Check:
   `establishments.includes(pos) || (from===companyHome && companyHome===pos)`
   → beeinflusst RC, Inlandslieferung, Registrierungspflicht

---

# 7. Regel · Lieferort
<!-- Quelle: vat-knowledge/rules/place_of_supply.md -->

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

---

# 8. Regel · Reverse-Charge-Länder
<!-- Quelle: vat-knowledge/rules/rc_country_rules.md -->

# Reverse Charge — Länderspezifische Regeln

## _checkRCBlock(pos, ctx, iAmTheSeller)
Prüft ob RC im Land `pos` blockiert oder speziell geregelt ist.
Return: `{ blocked, reason, rcEligible, rcNote }`

## 7 Länder-Checks mit Rechtsgrundlage

### BE — Art. 51 §2 5° WBTW
```js
pos==='BE' && vatIds['BE'] && iAmTheSeller && !establishments.includes('BE')
```
→ `blocked:true` — Direktregistrierung ohne Betriebsstätte reicht nicht.
EPDE hat BE-UID aber keine BE-Betriebsstätte → RC dauerhaft blockiert.

### PL — Art. 17 Abs. 1 Nr. 5 ustawa o VAT
```js
pos==='PL' && vatIds['PL'] && iAmTheSeller
```
→ `blocked:true` — PL-registrierter Lieferant muss PL-MwSt ausweisen.

### CZ — § 92a ZDPH
Gleiche Logik wie PL. RC nur für bestimmte Warenkategorien (VO 361/2014).

### SI — čl. 76 Abs. 3 ZDDV-1
SI-registrierter Lieferant → SI-MwSt ausweisen, kein RC.

### LV — Art. 141 PVN likums
LV-registrierter Lieferant → PVN ausweisen, kein RC.

### EE — KMSS § 41¹
EE-registrierter Lieferant → KM ausweisen, kein RC.

### IT — Art. 17 Abs. 2 DPR 633/1972 (inversione contabile)
**Umgekehrte Logik**:
```js
if (vatIds['IT']) → blocked:true (Lieferant IT-registriert → IVA ausweisen)
else → { blocked:false, rcEligible:true, rcNote:... }
```
Keine IT-UID = RC möglich, keine Registrierungspflicht für Lieferant.

### DE — § 13b UStG
DE-RC-Prüfung liegt in `computeTax()` (Rendering-Layer), nicht in `_checkRCBlock()` (VATEngine).
Engine kennt keinen DE-spezifischen RC-Block.

## Return-Objekte
| Feld | Typ | Bedeutung |
|---|---|---|
| `blocked` | boolean | RC nicht anwendbar, lokale MwSt ausweisen |
| `reason` | string | Begründung mit Paragraf und MwSt-Satz |
| `rcEligible` | boolean | RC positiv möglich (IT inversione contabile) |
| `rcNote` | string | Hinweistext bei positivem RC |

---

# 9. Regel · Registrierungsrisiko
<!-- Quelle: vat-knowledge/rules/registration_risk_logic.md -->

# Registrierungsrisiken — detectRegistrationRisk()

## Funktion
```js
detectRegistrationRisk(ctx, classifiedSupplies, triangleResult)
```
Iteriert über alle Supplies, prüft 6 Risikotypen, gibt `{ hasErrors, hasWarnings, risks[] }`.

## 6 Risk-Types

### (A) registration-required — severity: 'error'
Ruhende Lieferung in fremdem Land, ich bin Verkäufer, keine UID dort.
```js
needsRegistration && iAmTheSeller && !isMoving && !triangleMitigatesReg
```
`triangleMitigatesReg`: Dreiecksgeschäft befreit wenn `placeOfSupply === dest`.

### (B) ic-acquisition-no-reg — severity: 'error'
Bewegte Lieferung, ich bin Käufer, IG-Erwerb in dest, keine dest-UID.
```js
isMoving && iAmTheBuyer && dep !== dest && dest !== companyHome && !vatIds[dest]
```
Dreiecksgeschäft kann mitigieren: `triangleResult.beneficiary === companyHome`.
`triangleMitigates` prüft:
`triangleResult.primary?.beneficiary === companyHome`
OR `triangleResult.beneficiary === companyHome`
(beide Felder, nicht nur `beneficiary`)

### (C) double-acquisition — severity: 'warning'
Art. 41 MwStSystRL: Andere UID als dest verwendet → Doppelerwerb-Risiko.
```js
isMoving && iAmTheBuyer && dep !== dest
&& usedUidCountry !== dest && usedUidCountry !== dep && vatIds[usedUidCountry]
```
`usedUidCountry` wird NUR bei `transport=middle` + `uidOverride`
aus `ctx.uidOverride` bestimmt. In allen anderen Fällen = `companyHome`.
`uidOverride` außerhalb von `transport=middle` hat keinen Einfluss
auf Risk-Type C.

### (D) rc-blocked — severity: 'warning'
`_checkRCBlock()` positiv (blocked:true) + ich bin Verkäufer.

### (E) rc-country-specific — severity: 'info'
Positiver RC-Hinweis (z.B. IT inversione contabile), nicht blockiert.
```js
rcApplicable && rcBlockReason && !rcBlocked && iAmTheSeller
```

### (F) resting-buyer-no-uid — severity: 'error'
Ruhende Lieferung, ich bin Käufer, fremdes Land, keine UID dort.
→ Lieferant fakturiert lokale MwSt, kein Vorsteuerabzug möglich.
Bietet Optionen: Transportorganisation ändern, Warenfluss unterbrechen,
Registrierung, Dreiecksgeschäft (wenn ≥ 3 verschiedene MS beteiligt).

> **Kein Incoterm-Wechsel als Gestaltungstipp.** Art. 36a Abs. 3 stellt darauf ab,
> wer die Ware selbst oder **auf seine Rechnung** versendet — nicht auf die
> vereinbarte Klausel. Der frühere Text („auf DAP/DDP umstellen → Transport liegt
> rechtlich beim Lieferanten, auch wenn du die Spedition koordinierst") war
> irreführend und stützte sich zudem auf eine Fehlzitierung von EuGH C-245/04
> (EMAG entschied, dass in der Kette nur EINE Lieferung bewegt sein kann, nicht
> dass Incoterms die Zuordnung bestimmen). Die Option verlangt jetzt die
> tatsächliche Änderung der Transportveranlassung und wird nur noch angezeigt,
> wenn wir aktuell selbst veranlassen (`ctx.transport === 'middle'`).

## triangleMitigatesReg
```js
triangleResult?.possible && placeOfSupply === dest
```
Dreiecksgeschäft neutralisiert Registrierungspflicht nur wenn der Lieferort
im Bestimmungsland liegt (= ruhende Lieferung nach der Warenbewegung).

## Risk-Type Strings (Code-Mapping)
Die Labels A–F entsprechen diesen `type`-Strings im `risks[]`-Array:

| Label | `type` String | severity |
|---|---|---|
| (A) | `'registration-required'` | `'error'` |
| (B) | `'ic-acquisition-no-reg'` | `'error'` |
| (C) | `'double-acquisition'` | `'warning'` |
| (D) | `'rc-blocked'` | `'warning'` |
| (E) | `'rc-country-specific'` | `'info'` |
| (F) | `'resting-buyer-no-uid'` | `'error'` |

## severity-Werte
| Wert | Bedeutung | UI-Darstellung |
|---|---|---|
| `'error'` | Registrierungspflicht oder Kostenfaktor | 🚨 rot |
| `'warning'` | RC-Block oder Doppelerwerb-Risiko | ⚠️ gelb |
| `'info'` | Positiver Hinweis (z.B. IT RC möglich) | ℹ️ blau |

---

# 10. Regel · UID-Nutzung
<!-- Quelle: vat-knowledge/rules/uid_usage_rules.md -->

# UID-Verwendungsregeln

## UID-Hierarchie
```
uidOverride > selectedUidOverride > companyHome
```
- `uidOverride`: Aus UI manuell gewählte UID, in `buildVATContext()`
  als `selectedUidOverride` aus globalem State übernommen
- `selectedUidOverride`: Globale Variable, gesetzt durch UID-Selector oder
  Dreiecksgeschäft-Opportunity-Button
- `companyHome`: `COMPANIES[currentCompany].home` — Fallback

## _sapEffectiveCountry()
Bei `treatment ∈ ['ic-exempt','ic-acquisition','dreiecks','export']`:
→ UID-Land statt Lieferort für SAP-Lookup verwenden.
```js
uidLand = uidCountry || selectedUidOverride || home
return SAP_TAX_MAP[company]?.[uidLand]?.[treatment] ? uidLand : country
```

## selectedUidOverride — globale Variable
```js
let selectedUidOverride = null;  // globaler Scope
```
- **Definiert**: globaler Scope in app.js
- **Gesetzt durch**: `setUidOverride(country)` im UI-Layer
- **Resettet bei**: `setT()`, `onCC()`, `setCompany()`, `resetAll()`
- **Durchgereicht via**: `buildVATContext()` → `ctx.uidOverride`
- **Verwendet in**: `_applyQuickFix()`, `_detectTriangle3()`, `_detectTriangle4()`,
  `buildKurzbeschreibung()`, `buildNormal3Result()`

## EuGH-Rechtsprechung
- **C-430/09 Euro Tyre**: Zeitpunkt der UID-Mitteilung entscheidend — muss vor
  Transportbeginn erfolgen. Code prüft Zeitpunkt nicht, gibt Warnung als
  `euroTyreNote` im Return-Objekt
- **C-628/16 Kreuzmayr**: Falsche UID-Angabe → Vertrauensschutz des Vorlieferanten
  entfällt. Als `kreuzmayerNote` in `_applyQuickFix()`-Returns

## Implementierung in buildKurzbeschreibung()
`formatOwnUidCode(s)`: Bestimmt aktive UID pro Supply:
```
selectedUidOverride → iAmTheBuyer+moving: dest → iAmTheSeller+moving: dep
→ myVat(pos) ? pos : companyHome
```

## summaryItems 'Aktive UID'
| Bedingung | Anzeige |
|---|---|
| `selectedUidOverride` gesetzt | `flag(override) + vatId` |
| `dreiecksPossible && !override` | „Geeignete UID auswählen" |
| Fallback | `companyHome`-UID oder erste verfügbare |

---

# 11. Regel · Inlandskette
<!-- Quelle: vat-knowledge/rules/inland_chain.md -->

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

---

# 12. EU · Art. 36a MwStSystRL
<!-- Quelle: vat-knowledge/eu/art36a_mwstrl.md -->

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

---

# 13. EU · Art. 138 MwStSystRL
<!-- Quelle: vat-knowledge/eu/art138_mwstrl.md -->

# Art. 138 MwStSystRL — Steuerbefreiung der IG-Lieferung

## Rechtsgrundlage
Art. 138 Abs. 1 MwStSystRL: Steuerbefreiung für Lieferungen an UID-registrierten
Erwerber, wenn Ware in anderen EU-MS gelangt. Seit Quick Fix 2020 materiell-rechtliche
Voraussetzung (nicht mehr nur formell).

## Voraussetzungen
1. Lieferant und Erwerber in verschiedenen MS umsatzsteuerlich registriert
2. Erwerber teilt gültige UID eines anderen MS mit (VIES-Prüfung)
3. Ware gelangt physisch in anderen MS (Belegnachweis)
4. Zusammenfassende Meldung (ZM) — Art. 262 MwStSystRL

## Art. 45a DVO 282/2011 — Vermutungsregel Belegnachweis
Zwei nicht-widersprüchliche Nachweise (CMR, Versicherung, Bankbeleg etc.)
begründen Vermutung der Beförderung. Widerlegbar durch Finanzverwaltung.

## Implementierung
- `classifySupplies()`: `isICMoving`-Branch setzt `vatTreatment = 'ic-exempt'`
- Bedingung: `isMoving && isCrossEU` — beide Länder EU, dep ≠ dest
- `invIG(mc, acquisitionCountry, depCountry)`: Rechnungspflichtangaben
  für steuerfreie IG-Lieferung — UID beider Parteien, Befreiungshinweis, Belegnachweis

## Variablen in classifySupplies
| Variable | Berechnung |
|---|---|
| `isCrossEU` | `dep !== dest && !isNonEU(dep) && !isNonEU(dest)` |
| `isICMoving` | `isMoving && isCrossEU` |
| `vatTreatment` | `'ic-exempt'` bei IG, `'export'` bei Drittland |

## Belegnachweis-Hinweise
- `invIG()` liefert: Lieferanten-UID, Erwerber-UID (Pflicht!), Befreiungshinweis,
  Rechtsgrundlage via `natLaw('ig.exempt')`, Gelangensbestätigung/CMR via `natLaw('proof')`
- Kein gesetzlich fixierter Wortlaut — „sinngemäß ausreichend"

---

# 14. EU · Art. 141 Dreieck
<!-- Quelle: vat-knowledge/eu/art141_triangle.md -->

# Art. 141 MwStSystRL — Dreiecksgeschäft

## Rechtsgrundlage
Art. 141 lit. a–e MwStSystRL: Vereinfachungsregel für innergemeinschaftliche
Dreiecksgeschäfte. Ergänzt durch Art. 42 (Erwerb gilt als besteuert) und
Art. 197 (Steuerschuld geht auf C über, Reverse Charge).

## 5 Bedingungen (lit. a–e)
- **(a)** B (Erwerber) ist NICHT im Bestimmungsland (dest) registriert
  > Richtlinienwortlaut ist „nicht **niedergelassen**". Dass das Tool schon die
  > bloße Registrierung blocken lässt, ist bewusste Policy (D1) — Länderstand und
  > Belege: [`art141_dest_registration.md`](art141_dest_registration.md)
- **(b)** Erwerb erfolgt zum Zweck der anschließenden Weiterlieferung
- **(c)** C (Empfänger) sitzt im Bestimmungsland
- **(d)** C wird als Steuerschuldner benannt (RC, Art. 197)
- **(e)** Transport durch A oder B (nicht durch C)

## EuGH-Rechtsprechung
- **C-247/21 Luxury Trust**: Fehlende Pflichtangaben auf Rechnung = materieller
  Mangel, nicht rückwirkend heilbar → `luxuryTrustWarning` im Return-Objekt
- **EuG T-646/24**: Dreiecksgeschäft auch in 4-Parteien-Ketten anwendbar →
  `_detectTriangle4()` implementiert first3/last3

## Implementierung — _detectTriangle3()
1. `transport === 'customer'` → sofort `_noTriangle()` (lit. e verletzt)
2. `usedUidCountry === s1` → blockiert (B nutzt UID aus Land des Lieferanten)
3. `vatIds[dest]` → `'blocked-by-dest-vat'` (lit. a verletzt)
4. `s4 !== dest` → blockiert (lit. c verletzt)
5. NL-Sonderfall: `dest === 'NL' && s1 === 'NL'` → Art. 37c Wet OB 1968

## Implementierung — _detectTriangle4()
- **last3**: `s2→s3→s4`, Bedingung: `movingIndex===1 && s4===dest && !bHasDestVat`
  → `deRecognized:true`, klassisch anerkannt
- **first3**: `s1→s2→s3`, Bedingung: `movingIndex===0 && !bHasDestVat`
  → `eugExtended:true`, auf EuG T-646/24 gestützt
- Primary = erstes `deRecognized`-Ergebnis, sonst erstes Ergebnis

## UID-Land-Check
`usedUidCountry = uidOverride || companyHome` — wenn B eine UID aus dem Land
von A verwendet, kann A nicht steuerfrei fakturieren → Dreiecksgeschäft blockiert.

---

# 15. EU · Art. 141 Länderstand
<!-- Quelle: vat-knowledge/eu/art141_dest_registration.md -->

# Art. 141 lit. a — Registrierung im Bestimmungsland (Länderübersicht)

**Leitfrage:** Blockiert eine bloße USt-Registrierung **ohne Niederlassung** im
Bestimmungsland die Dreiecksgeschäfts-Vereinfachung?

Diese Datei ist die Landkarte hinter der bewussten Abweichung **D1** in
[`rechtskonformitaet.md`](../../rechtskonformitaet.md) — und zugleich der
**Fragenkatalog** für lokale Berater. Sie enthält **keine Steuerlogik** und ändert
nichts am Code: `_detectTriangle3()` / `_detectTriangle4()` blocken weiterhin bei
vorhandener `vatIds[dest]`.

## Geltungsbereich

Nur die **8 Länder, in denen EPDE/EPROHA eine UID ohne Betriebsstätte halten** —
dort und nur dort greift die D1-Policy. AT ist als Referenzauslegung mitgeführt,
ist aber kein Anwendungsfall (EPROHA ist in AT ansässig).

| Gesellschaft | Sitz (`establishments`) | UID ohne Niederlassung |
|---|---|---|
| EPDE | DE | SI · LV · EE · NL · BE · CZ · PL |
| EPROHA | AT | DE (CH = Drittland, nicht einschlägig) |

## ⚠️ Drei Fragen, die gern verwechselt werden

| # | Frage | Fundstelle |
|---|---|---|
| 1 | **B** im Bestimmungsland registriert → Dreieck blockiert? | **diese Datei** |
| 2 | Inlands-RC trotz Direktregistrierung des Lieferanten (Art. 194)? | [`rules/rc_country_rules.md`](../rules/rc_country_rules.md) |
| 3 | Muss **C** im Bestimmungsland *ansässig* sein (NL: „gevestigd")? | `rechtskonformitaet.md` § D2 |

Die vorhandene Ländertabelle in `CLAUDE-vat-knowledge.md` („Regel 4") beantwortet
**Frage 2**, nicht Frage 1. Sie darf für diese Datei **nicht** als Vorarbeit
verbucht werden.

## EU-Ebene — der gemeinsame Ausgangspunkt

- **Wortlaut Art. 141 lit. a MwStSystRL:** Erwerb durch einen „**nicht in diesem
  Mitgliedstaat niedergelassenen**, jedoch in einem anderen Mitgliedstaat für
  Mehrwertsteuerzwecke erfassten Steuerpflichtigen". Der Text stellt auf
  **Niederlassung** ab, nicht auf Registrierung.
- **Explanatory Notes Quick Fixes 2020, Beispiel 8 (S. 66):** der mittlere
  Unternehmer ist in zwei MS registriert — die Vereinfachung gilt dennoch.
  Nicht bindend, aber Kommissionsauffassung.
- **EuGH C-580/16 „Firma Hans Bühler KG" (19.04.2018):** betrifft die Registrierung
  im **Abgangs**mitgliedstaat (lit. c), nicht im Bestimmungsland. Kernaussage,
  die hierher übertragen wird: maßgeblich ist die für den konkreten Erwerb
  **verwendete** UID, nicht der bloße Besitz weiterer UIDs. Zweck des Art. 141
  laut Gerichtshof: dem mittleren Unternehmer die Registrierung im Bestimmungsland
  **ersparen**.
- **Kein EuGH-Urteil direkt zur Bestimmungsland-Registrierung** (Stand 09/2026).
  Die einzige einschlägige Höchstgerichtsentscheidung ist national (AT, s. u.)
  und bindet ausschließlich Österreich.

**Zweites, unabhängiges Tor — gilt in *jedem* Land:** Selbst wo die Registrierung
unschädlich ist, muss gegenüber Lieferant **und** Kunde **dieselbe** UID verwendet
werden, erteilt von einem MS, der weder Abgangs- noch Bestimmungsland ist
(Art. 141 lit. c; DE: § 25b Abs. 2 Nr. 2 UStG). Die Bestimmungsland-UID auch nur
gegenüber einer Seite zu verwenden, kippt den Fall in jeder Auslegung.

## Quellenqualität

| Stufe | Bedeutung |
|---|---|
| **A** | Primärquelle (Gesetzestext / Judikatur / verbindliche Auskunft) im Original geprüft |
| **B** | Sekundärliteratur oder Verwaltungsanweisung, Primärtext nicht selbst eingesehen |
| **C** | Ungeprüft / nur interne Annahme — **nicht als Rechtsauskunft verwenden** |

## Matrix

| Land | Nationale Norm (Art.-141-Umsetzung) | Wortlaut | Verwaltungspraxis / Judikatur | Blockt bloße Registrierung? | Q |
|---|---|---|---|---|---|
| **DE** (EPROHA) | § 25b Abs. 2 Nr. 2 UStG | „nicht **ansässig**" | — | **nein** | **B** |
| **SI** (EPDE) | ZDDV-1 — Artikel ⟶ offen | ⟶ offen | Steuerberatung 2024: SI-Registrierung ⇒ mit SI-MwSt fakturieren | **ja** (angenommen) | **C** |
| **NL** (EPDE) | Art. 37c Wet OB 1968 | ⟶ offen *für lit. a* | Belastingdienst richtlinienkonform-mild (belegt nur für Bedingung zu **C**) | ⟶ offen | **C** |
| **BE** (EPDE) | ⟶ offen | ⟶ offen | ⟶ offen | ⟶ offen | **C** |
| **CZ** (EPDE) | ⟶ offen | ⟶ offen | ⟶ offen | ⟶ offen | **C** |
| **PL** (EPDE) | ⟶ offen | ⟶ offen | ⟶ offen | ⟶ offen | **C** |
| **LV** (EPDE) | ⟶ offen | ⟶ offen | ⟶ offen | ⟶ offen | **C** |
| **EE** (EPDE) | ⟶ offen | ⟶ offen | ⟶ offen | ⟶ offen | **C** |
| *AT (Referenz)* | Art. 25 UStG 1994 | ansässig | VwGH Ro 2020/15/0003; UStR Rz 4150 | **nein** | **B** |

## Länderdetails

### DE — § 25b Abs. 2 Nr. 2 UStG · Q=B
Verlangt, dass der erste Abnehmer im Mitgliedstaat des Beförderungsendes „nicht
**ansässig**" ist, und dass er gegenüber erstem Lieferer und letztem Abnehmer
dieselbe UID verwendet, die ihm von einem anderen MS als dem des Beginns oder
Endes der Beförderung erteilt wurde. Eine Registrierung im Bestimmungsland ist
danach **unschädlich**.
**Relevanz:** EPROHA mit DE-UID; EPDE-Ausgangsseite in jeder Dreieckskette.
**Offen:** Primärtext nicht selbst eingesehen (egress-blockiert, 07.09.2026) —
nur über Sekundärquellen bestätigt. Für Q=A: § 25b UStG + Abschn. 25b.1 UStAE
im Original nachziehen.

### SI — Q=C · **derzeit der teuerste Fall**
Die interne Steuerberatung (2024) hat bestätigt, dass die SI-Registrierung von
EPDE dazu führt, dass mit slowenischer MwSt fakturiert werden muss. Ob diese
Aussage eine ausdrückliche Analyse von Art. 141 lit. a war oder aus der
Registrierung heraus verallgemeinert wurde, ist **nicht dokumentiert**.
**Offen:** (1) einschlägiger ZDDV-1-Artikel; (2) Wortlaut ansässig vs. erfasst;
(3) FURS-Praxis; (4) ob eine verbindliche Auskunft eingeholt werden kann.
**Wirtschaftliche Relevanz:** hoch — 22 % Vorfinanzierung bei jedem Strom mit
SI als Bestimmungsland. Ein Inlands-RC steht nicht zur Verfügung
(čl. 76 ZDDV-1, s. `rules/rc_country_rules.md`), die Umstellung auf ein Dreieck
ist also der einzige Hebel — neben der Aufgabe der SI-Registrierung.

### NL — Art. 37c Wet OB 1968 · Q=C für diese Frage
`nl/wet_ob_nl_reihengeschaeft.md` ist gegen Primärquellen verifiziert, betrifft
aber die **Ansässigkeit von C** (Art. 37c onderdeel b i.V.m. Art. 12 lid 3), nicht
die Registrierung von **B**. Die dort belegte milde Belastingdienst-Praxis lässt
sich **nicht** ohne Weiteres auf lit. a übertragen.
**Offen:** Umsetzung von Art. 141 lit. a im Wet OB und die Praxis dazu.

### BE · CZ · PL · LV · EE — Q=C, vollständig offen
Für diese fünf Länder existiert im Repo **keine** Aussage zu Art. 141 lit. a.
Die vorhandenen Einträge (Art. 51 §2 5° WBTW, § 92a ZDPH, Art. 17 Abs. 1 Nr. 5
ustawa o VAT, Art. 141 PVN likums, KMSS § 41¹) betreffen ausschließlich das
Inlands-RC (Frage 2 oben) und sagen nichts über die Dreiecksvereinfachung.

### AT — Referenz, bindet nur Österreich
**VwGH 15.12.2021, Ro 2020/15/0003:** eine Registrierung im Bestimmungsland ohne
Sitz/Betriebsstätte ist unschädlich, solange für den konkreten Erwerb die UID
eines anderen MS verwendet wird; UStR Rz 4150 wurde angepasst.
**Offen:** Datum in der Literatur teils mit 17.12.2021 angegeben — am Original
(RIS) abgleichen.

## Fragenkatalog für lokale Berater

Pro offenem Land wortgleich stellen, damit die Antworten vergleichbar bleiben:

1. Wie setzt das nationale Recht Art. 141 lit. a um — „**nicht ansässig**" oder
   „nicht für MwSt-Zwecke **erfasst**"? Bitte Norm mit Artikel-/Paragrafenangabe.
2. Ist die Vereinfachung anwendbar, wenn der mittlere Unternehmer im
   Bestimmungsland **registriert, aber nicht ansässig** ist und für den konkreten
   Umsatz durchgängig die UID eines dritten MS verwendet?
3. Falls nein: stützt sich das auf Gesetzeswortlaut, Verwaltungsanweisung oder
   Prüfungspraxis? Gibt es dazu veröffentlichte Entscheidungen?
4. Gibt es die Möglichkeit einer **verbindlichen Auskunft**, und mit welcher
   Bearbeitungsdauer?
5. Wie ist die Rechtsfolge bei Nichtanerkennung — nur Nachversteuerung im
   Bestimmungsland, oder zusätzlich Erwerbsbesteuerung nach Art. 41 MwStSystRL
   (DE: § 3d Satz 2 UStG) ohne Vorsteuerabzug?

## Was das für das Tool bedeutet

**Nichts — vorerst.** D1 bleibt: solange eine Zeile auf Q=C steht, ist die
konservative Blockade die compliance-sichere Wahl. Eine Lockerung kommt
frühestens infrage, wenn eine Länderzeile **Q=A** *und* „blockt: nein" trägt —
und dann pro Land, nicht global. Der technische Revisionspfad (Umstellung von
`vatIds[dest]` auf `establishments.includes(dest)`) ist in
[`rules/triangle_conditions.md`](../rules/triangle_conditions.md) beschrieben und
setzt eine erneute steuerrechtliche Freigabe voraus.

Offener UI-Punkt dazu: **VAT-H03** in `RGR_TODO.md` — die Oberfläche formuliert die
interne Policy derzeit als zwingendes Gesetz („Art. 141 lit. a → Vereinfachung
blockiert"), obwohl sie in mindestens zwei der neun Zeilen (DE, AT) nachweislich
nicht der Rechtslage entspricht.

---

**Quellen / Stand 07.09.2026**
- Art. 141 MwStSystRL (RL 2006/112/EG) — Wortlaut aus Sekundärquellen, Primärtext
  in dieser Session nicht abrufbar (eur-lex egress-blockiert)
- § 25b UStG — [gesetze-im-internet.de](https://www.gesetze-im-internet.de/ustg_1980/__25b.html) ·
  [dejure.org](https://dejure.org/gesetze/UStG/25b.html) (über Sekundärquellen bestätigt)
- EuGH 19.04.2018, C-580/16 „Firma Hans Bühler KG"
- VwGH 15.12.2021, Ro 2020/15/0003 —
  [amtliche Entscheidungsübersicht](https://www.vwgh.gv.at/rechtsprechung/aktuelle_entscheidungen/2022/ro_2020150003.html)
- Explanatory Notes zu den Quick Fixes 2020, Beispiel 8, S. 66
- Interne Steuerberatung 2024 (SI), dokumentiert in `rechtskonformitaet.md` § D1

---

# 16. EU · Quick Fixes 2020
<!-- Quelle: vat-knowledge/eu/quick_fixes_2020.md -->

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

---

# 17. AT · Reihengeschäft
<!-- Quelle: vat-knowledge/at/ustg_at_reihengeschaeft.md -->

# UStG AT — Reihengeschäft

## § 3 Abs. 8 UStG AT — Lieferort der bewegten Lieferung
Ort der Lieferung bei Beförderung/Versendung = Ort, wo Beförderung beginnt.
Entspricht Art. 32 MwStSystRL. Im Code: `placeOfSupply = dep` bei `isMoving`.

## § 3 Abs. 15 Z 1 UStG AT — Zuordnung (Quick-Fix-Umsetzung)
- **lit. a**: Zwischenhändler teilt dep-UID mit, nicht ansässig → L vor ZH bewegend
- **lit. b**: Andere UID oder Ansässigkeits-UID → L ab ZH bewegend
- **lit. c**: Keine dep-UID, nicht ansässig → Standardregel (L vor ZH)
Entspricht Art. 36a Abs. 2 MwStSystRL. In `_applyQuickFix()` als
`legalBasis` referenziert.

## Art. 6 Abs. 1 iVm. Art. 7 UStG 1994 — IG-Lieferung AT
Steuerbefreiung der innergemeinschaftlichen Lieferung bei Nachweis.
Im Code: `natLaw('ig.exempt')` gibt bei `isAT` diesen Verweis zurück.

## § 27 Abs. 4 UStG AT — Haftung AT-Inlandskette
Haftungsregel bei Inlandslieferungen in AT. Relevant wenn `dep === dest === 'AT'`.

## Implementierung
- `analyze2()`: Mode-2-Analyse für EPROHA (Sitz AT), liest `dest`
  aus UI, unterscheidet AT→CH, AT→EU, AT→AT, Drop-Shipment
- `analyzeInland(ctx)`: Greift wenn `dep === dest` (kein IG-Sachverhalt),
  alle Lieferungen sind Inlandslieferungen mit lokaler MwSt
- `COMPANIES['EPROHA']`: `home='AT'`, `establishments=['AT']`,
  `vatIds: { AT:'ATU36513402', DE:'DE248554278', CH:'CHE-113.857.016 MWST' }`

## AT-spezifische Notation
Im Code: `isAT`-Check in `natLaw()` — AT verwendet „Art." statt „§"
für UStG-Verweise (z.B. Art. 6, Art. 7, Art. 25 UStG 1994).

---

# 18. AT · Dreiecksgeschäft
<!-- Quelle: vat-knowledge/at/ustg_at_dreieck.md -->

# UStG AT — Dreiecksgeschäft

## Art. 25 UStG AT
AT-Umsetzung von Art. 141 MwStSystRL. Vereinfachung: Mittlerer Unternehmer (B)
muss sich nicht im Bestimmungsland registrieren; Steuerschuld geht auf C über.

## KZ 077 in UVA
Dreiecksgeschäfte werden in der UVA unter Kennzahl 077 gemeldet.
Im Code nicht als eigenes Feld, aber in ZM-/Meldepflicht-Hinweisen referenziert.

## § 21 Abs. 3 UStG AT — ZM-Pflicht
Zusammenfassende Meldung: IG-Lieferungen + Dreiecksgeschäfte melden.
`natLaw('zm')` → `'§ 21 Abs. 3 UStG AT'` bei `isAT`.

## natLaw('dreiecks') für AT vs. DE
| Schlüssel | AT | DE |
|---|---|---|
| `dreiecks` | `Art. 25 UStG AT / Art. 141 MwStSystRL` | `§ 25b UStG / Art. 141 MwStSystRL` |
| `dreiecks.rc` | `§ 25 Abs. 4 UStG AT` | `§ 25b Abs. 2 / § 14a Abs. 7 UStG` |
| `dreiecks.hint` | `„...gem. Art. 25 UStG AT"` | `„...gem. § 25b UStG"` |

## Implementierung
- `_detectTriangle3()`: Prüft 5 Bedingungen, gibt `possible:true`
  mit `legalBasis: 'Art. 141 lit. a–e, Art. 42, Art. 197 MwStSystRL / § 25b UStG'`
- `buildDreiecks3Result()`: Rendert Dreiecks-Banner + L1/L2-Boxen,
  verwendet `selectedUidOverride || me` als aktiven UID-Code
- `invTriangle(uidCode)`: Rechnungspflichtangaben für B→C-Rechnung,
  nutzt `natLaw('dreiecks.rc')` für AT-/DE-spezifischen RC-Hinweis

## isAT-Checks
- `invTriangle()`: AT = `§ 25 Abs. 4 UStG AT`, DE = `§ 25b Abs. 2 UStG`
- `invIG()`: AT = `Art. 6 Abs. 1 iVm. Art. 7 UStG 1994`
- `natLaw()`: Gesamter Dispatch über `isAT = country === 'AT'`
- `buildDreiecks3Result()`: RC-Hinweis AT vs. DE

---

# 19. DE · § 3 Abs. 6a UStG
<!-- Quelle: vat-knowledge/de/ustg_de_3_6a.md -->

# § 3 Abs. 6a UStG — Quick Fix DE-Umsetzung

## Rechtsgrundlage
§ 3 Abs. 6a UStG setzt Art. 36a MwStSystRL in deutsches Recht um (ab 01.01.2020).

## Satz 4 Nr. 1 (entspricht lit. a)
Zwischenhändler teilt Abgangsland-UID mit, nicht dort ansässig/registriert →
Lieferung an den ZH ist die bewegte Lieferung.
Im Code: `quickFixVariant: 'departure-id'`, `legalBasis` enthält
`'§ 3 Abs. 6a S. 4 Nr. 1 UStG'`.

## Satz 4 Nr. 2 (entspricht lit. b)
Andere UID mitgeteilt → Lieferung ab dem ZH ist die bewegte Lieferung.
Im Code: `quickFixVariant: 'dest-or-other-id'`, `legalBasis` enthält
`'§ 3 Abs. 6a S. 4 Nr. 2 UStG'`.

## § 4 Nr. 1b iVm. § 6a UStG — IG-Lieferung DE
Steuerbefreiung der innergemeinschaftlichen Lieferung.
`natLaw('ig.exempt')` bei `isDE` → `'§ 4 Nr. 1 lit. b iVm. § 6a UStG'`.

## § 13b UStG — Reverse Charge nur Werklieferungen
**Kritisch**: § 13b gilt in DE nur für Werklieferungen und sonstige Leistungen,
NICHT für reine Warenlieferungen (§ 13b Abs. 2 Nr. 1; UStAE Abschn. 13b.1).

## Implementierung — DE-RC-Prüfung
DE-RC-Prüfung liegt in `computeTax()` (Rendering-Layer), nicht in `_checkRCBlock()` (VATEngine).
Engine kennt keinen DE-spezifischen RC-Block.

## COMPANIES['EPDE']
```js
{ home: 'DE', establishments: ['DE'],
  vatIds: { SI, LV, EE, NL, BE, DE, CZ, PL } }
```
8 UID-Registrierungen, aber nur DE als Betriebsstätte — alle anderen sind
Direktregistrierungen (relevant für BE RC-Block, Art. 51 §2 5° WBTW).

---

# 20. DE · UStAE Reihengeschäft
<!-- Quelle: vat-knowledge/de/ustae_reihengeschaeft.md -->

# UStAE / UStG DE — Reihengeschäft & Dreiecksgeschäft

## Abschn. 3.14 UStAE — Reihengeschäft
Verwaltungsanweisung zur Zuordnung der Warenbewegung nach § 3 Abs. 6a UStG.
Verweist auf Art. 36a MwStSystRL und die Quick-Fix-Regelung ab 2020.
Im Code als Teil der `legalBasis`-Strings in `_applyQuickFix()`.

## § 25b UStG — Dreiecksgeschäft (DE-Umsetzung Art. 141)
Vereinfachungsregel: B muss sich nicht im Bestimmungsland registrieren.
`natLaw('dreiecks')` bei `isDE` → `'§ 25b UStG / Art. 141 MwStSystRL'`.

## Abschn. 25b UStAE — Verwaltungsanweisung Dreiecksgeschäft
Erläutert Voraussetzungen und Pflichtangaben der B→C-Rechnung.

## § 14a Abs. 7 UStG — Pflichtangaben B→C Rechnung
Rechnung muss enthalten: Hinweis auf Dreiecksgeschäft + Steuerschuldnerschaft C.
Im Code: `natLaw('dreiecks.rc')` bei `isDE` → `'§ 25b Abs. 2 / § 14a Abs. 7 UStG'`.
`invTriangle(uidCode)` generiert die Pflichtangaben-Checkliste.

## BFH XI R 35/22
Keine Rückwirkung bei fehlendem RC-Hinweis auf der Rechnung — materieller Mangel.
Bestätigt EuGH C-247/21 Luxury Trust im deutschen Kontext.
Im Code: `luxuryTrustWarning` im Triangle-Return.

## Implementierung
- `_detectTriangle3()` / `_detectTriangle4()`: Prüfung der 5 Bedingungen
- `invTriangle(uidCode)`: B→C-Rechnungshinweise mit DE-spezifischem Wortlaut
- `buildDreiecks3Result()`: Rendert Dreiecks-Ergebnis, ZM-Pflicht
  als Hinweis: `'§ 18a Abs. 7 S. 1 Nr. 4 UStG'`
- `RC_WORDING['DE']`: Pflicht-Wortlaut `„Steuerschuldnerschaft des
  Leistungsempfängers"` — § 14a Abs. 5 UStG, `mandatory: true`

---

# 21. NL · Wet OB Reihengeschäft
<!-- Quelle: vat-knowledge/nl/wet_ob_nl_reihengeschaeft.md -->

# Wet OB 1968 NL — Reihengeschäft & RC-Sonderfall

> EPDE ist in den Niederlanden direkt registriert (NL-UID **NL827914052B01**),
> **ohne** NL-Betriebsstätte. NL ist der einzige EPDE-Buchungskreis, in dem
> Reverse Charge trotz Direktregistrierung möglich ist (Art. 12 Abs. 3 Wet OB).

---

## Art. 5 lid 1 letter a Wet OB 1968 — Lieferort
„De plaats waar een levering wordt verricht is […] ingeval het goed in
verband met de levering wordt verzonden of vervoerd, de plaats waar de
verzending of het vervoer aanvangt." Entspricht Art. 32 MwStSystRL.
Im Code: `placeOfSupply = dep` bei `isMoving` (gemeinsame Engine-Logik,
kein NL-Sonderpfad).

## Art. 12 Abs. 3 Wet OB 1968 — Reverse Charge bei Direktregistrierung
**Kern-Sonderfall NL.** Anders als BE/PL/CZ/SI/LV/EE blockiert NL den RC
**nicht**, wenn der Lieferant zwar NL-registriert, aber dort nicht ansässig
ist. Damit kann EPDE eine ruhende Lieferung in NL als RC-Lieferung
fakturieren (0%, „BTW verlegd").

Im Code:
- `_checkRCBlock()` enthält **keinen** NL-Block — RC läuft regulär durch
  (`rules/rc_country_rules.md`)
- `SAP_TAX_MAP['EPDE']['NL']['rc'] = { out:'NC', in:'NI' }` (app.js Zeile 89)
- `SAP_TAX_MAP['EPDE']['NL']['domestic'] = { out:null, in:'NI' }` —
  bewusst kein `out` für lokale Steuer; Fallback in
  `_qcRate()`/`computeTax()` greift auf `rc`-Entry zurück
  (app.js Zeile 11612 ff., Kommentar: „NL: EPDE hat keine Betriebsstätte
  → RC-Pflicht")
- `RC_WORDING['NL']` setzt Pflichttext „BTW verlegd" / „VAT reverse-charged"
  (app.js Zeile 1738) mit Rechtsverweis Art. 12 Abs. 3 Wet OB 1968 /
  Art. 194 MwStSystRL
- Pflichttext-Sprache: Englisch oder Niederländisch akzeptiert

## Art. 37c Wet OB 1968 — Dreiecksgeschäft (NL als Bestimmungsland)
NL-Umsetzung Art. 141 MwStSystRL. Titel im Wet OB:
„Achterwege blijven heffing; voorwaarden; driehoekstransactie".
**Gesetzlich drei onderdelen (a/b/c)**, in der Praxis erweitert durch
verschränkte Verweise auf Art. 12 lid 3 (RC) und Art. 37a (ICP-Meldung).

Materielle Bedingungen kombiniert (5-Bedingungen-Lesart, wie im Code
hinterlegt):

| Bed. | Inhalt | Rechtsgrundlage NL | Code-Check |
|---|---|---|---|
| (1) | Zwischenhändler nicht in NL ansässig | Art. 37c onderdeel a | `establishments` enthält NL nicht |
| (2) | Direktlieferung an NL-Abnehmer | Art. 37c onderdeel b | `s4 === dest === 'NL'` |
| (3) | Ware kommt **nicht** aus dem MS, der dem ZH die NL-UID erteilt hat | Art. 37c onderdeel c | `_detectTriangle3()` Zeile 1089: `dest === 'NL' && s1 === 'NL'` → `_noTriangle(...)` |
| (4) | NL-Abnehmer schuldet Steuer per RC | Art. 37c onderdeel b juncto Art. 12 lid 3 / Art. 197 MwStSystRL | implizit über `rcCountry: dest` |
| (5) | ICP-Pflicht nach Art. 37a Wet OB erfüllt | Art. 37a | wird auf Rechnungs-/Meldepflichten-Ebene gerendert |

**Strenge NL-Bedingung (Art. 37c onderdeel b iVm. Art. 12 lid 3):**
Wortlaut verlangt, dass Partij C in NL **gevestigd** (= ansässig, mit
Betriebsstätte) ist — nicht nur registriert. Damit ist die NL-Umsetzung
strenger als Art. 141 MwStSystRL. Die **Belastingdienst** wendet jedoch
seit dem EuGH-Urteil zu Art. 141 eine richtlinienkonforme (mildere)
Auslegung an — bloße NL-Registrierung des C reicht in der Praxis.
Quelle: PwC „Ruimere toepassing vereenvoudigde ABC-regeling".

**Praxisfolge:** Wenn EPDE die DE-UID nutzt (nicht NL-UID) und Ware aus DE
nach NL geht, ist Bed. (3) eingehalten → Dreiecksgeschäft möglich. Setzt
EPDE die NL-UID, blockiert Art. 141 lit. a die Vereinfachung schon vorher
(`!!vatIds[dest]` in `_detectTriangle3()`).

## Art. 37a Wet OB 1968 — ICP-Meldung (ZM-Pflicht NL)
Standard: **monatlich**, spätestens letzter Tag des Folgemonats — elektronisch
bei der Belastingdienst (Opgaaf intracommunautaire prestaties, „ICP").
**Quartalsoption:** zulässig, wenn IG-Warenlieferungen sowohl im laufenden
Quartal **als auch in jedem der 4 vorhergehenden Quartale** EUR 50.000
nicht übersteigen; wird die Schwelle überschritten, ab diesem Quartal
monatlich. **Materielle Voraussetzung** der Dreiecksgeschäft-Vereinfachung
nach Art. 37c. Im Code als Legal-Reference `nl37a` registriert
(app.js Zeile 1946).

## Art. 9 lid 1 Wet OB 1968 — Steuersatz
Wortlaut: „De belasting bedraagt 21 percent." Allgemeiner Satz für
Lieferungen und Dienstleistungen. Im Code: `COUNTRIES['NL'].std = 21`
(Zeile 167). Reduzierter Satz (Tabel I): 9 %. Nullsatz (Tabel II): 0 %.

---

## Implementierung

| Funktion / Konstante | Datei / Zeile | NL-Verhalten |
|---|---|---|
| `SAP_TAX_MAP['EPDE']['NL']` | app.js ~85 | NC/NI (rc) · NP (ic-acq) · NI (domestic-input) · kein ic-exempt-out |
| `_checkRCBlock()` | app.js | **kein** NL-Branch → RC läuft durch |
| `_detectTriangle3()` | app.js ~1085 | Bed. (3) Wet OB als Edge-Case: `dest==='NL' && s1==='NL'` → kein Dreieck |
| `RC_WORDING['NL']` | app.js 1738 | „BTW verlegd" + Art. 12 Abs. 3 Wet OB |
| `LEGAL_REFS.nl37c` / `.nl37a` | app.js 1945/1946 | Legal-Chips für Begründungs-Tab |
| `computeTax()` RC-Fallback | app.js ~11612 | wenn `domestic.out===null` → `rc.out` greift |

## COMPANIES['EPDE']
```js
vatIds: { DE, SI, LV, EE, NL:'NL827914052B01', BE, CZ, PL }
establishments: ['DE']
```
NL ist Direktregistrierung — keine NL-Betriebsstätte, keine fiskale Vertretung
erforderlich (NL erlaubt Direktregistrierung formlos).

---

## Wann greift der NL-Buchungskreis?

```
EPDE-Lieferung mit Lieferort = NL?
  → ruhende Lieferung in NL (L2 in 3P, oder L2/L3 in 4P)
      → Kunde = nl-registrierter Unternehmer?
          → RC anwendbar → SAP NC (out) / NI (in), „BTW verlegd"
      → Kunde nicht NL-registriert / kein RC-Voraussetzung?
          → ⚠️ kein domestic.out im SAP-Map → Fallback rc.out (NC)
            → praktisch: EPDE muss klären ob RC zulässig; B2C wäre
              Tatbestand für lokale Reg.-Pflicht (außerhalb des Tools)
```

**Praxis:** Der NL-Buchungskreis greift fast immer als RC-Variante.
Echte 21%-Inlandslieferung NL aus EPDE-Sicht ist im SAP-Map bewusst
nicht abgebildet (`out:null`), weil EPDE in NL keine Betriebsstätte hat
und der Standardfall RC ist.

## Häufige Konstellationen (EPDE-spezifisch)

| Konstellation | UID | SAP Ausgang | SAP Eingang | Hinweis |
|---|---|---|---|---|
| DE→EPDE→NL, L2 ruhend NL, Dreieck | DE | **DH** (ZM) | — | klassisches Dreiecksgeschäft, NL = RC-Land |
| DE→EPDE→NL, L2 ruhend NL, kein Dreieck | NL | **NC** | — | RC nach Art. 12 Abs. 3 Wet OB |
| FR→EPDE→NL, L2 ruhend NL | DE/NL | **DH** oder **NC** | — | DE-UID → Dreieck; NL-UID → RC, kein Dreieck |
| NL→EPDE→DE, L1 ruhend NL (IG-Erwerb) | NL | — | **NP** | EPDE kauft mit NL-UID ein |
| NL→NL→NL Inlandskette mit EPDE | NL | **NC** | **NI** | Inlands-RC NL |

---

## Praxisbeispiel (verifizierter EPDE-Produktionsfall)

**Konstellation:** `AT → EPDE (NL-UID) → NL-Kunde`, Transport durch AT-Lieferant
(Warenfluss direkt von AT zum NL-Kunden).

```
🇦🇹 AT ──L1──▶ 🇩🇪 DE/EPDE ──L2──▶ 🇳🇱 NL
       Lieferant fährt direkt nach NL
       EPDE tritt mit NL-UID auf
```

**Ablauf:**

| Lieferung | Behandlung | EPDE-Buchung | Pflichttext / Meldung |
|---|---|---|---|
| L1 AT→EPDE | IG-Lieferung AT → NL (0 %) | IG-Erwerb NL · **SAP NP** | AT-Lieferant in AT-ZM (Empfänger: EPDE NL-UID) |
| L2 EPDE→NL-Kunde | RC NL (0 %) Art. 12 Abs. 3 Wet OB | **SAP NC** | „BTW verlegd" + NL-ZM monatlich (Art. 37a Wet OB) |

**Kernpunkt:** Dreiecksgeschäft ist blockiert (Art. 141 lit. a — EPDE hat NL-UID
im Bestimmungsland), trotzdem fällt **kein lokales NL-MwSt-Ausweisen** an, weil
Art. 12 Abs. 3 Wet OB den RC trotz NL-Direktregistrierung erlaubt. Wäre EPDE
in NL ansässig (Betriebsstätte), wäre dieser RC-Weg versperrt und EPDE müsste
21 % NL-MwSt auf der L2-Rechnung ausweisen.

**Alternative UID-Wahl:** Hätte EPDE die DE-UID statt der NL-UID verwendet,
wäre Art. 141 MwStSystRL (Dreiecksgeschäft) anwendbar gewesen — wirtschaftlich
identisches Ergebnis, aber Buchung **DH** statt NC und DE-ZM mit Dreieck-Kennzeichen
statt monatlicher NL-ZM. Die NL-UID-Variante ist administrativ aufwendiger, wird
aber gewählt, wenn der NL-Kunde NL-UID auf der Rechnung erwartet oder EPDE
ohnehin in NL meldet.

Vollständige Tabelle inkl. Belegnachweis: `reference-cases.md` · Fall **C4**.

---

## Abgrenzung zu BE / PL / CZ / SI / LV / EE

Alle 6 anderen EPDE-Direktregistrierungen **blockieren** RC, sobald EPDE
dort registriert ist (`_checkRCBlock()` greift). NL ist die einzige
Ausnahme. Praktische Folge: EPDE muss in BE/PL/CZ/SI/LV/EE den lokalen
Steuersatz ausweisen (BS/A4/AE/CB/LS/ES), in NL hingegen RC mit 0% (NC).

Details: `rules/rc_country_rules.md` · `de/epde-buchungskreise.md`

---

*Verwandte Dateien:* `rules/rc_country_rules.md` · `rules/uid_usage_rules.md` ·
`de/epde-buchungskreise.md` · `eu/art141_triangle.md` · `eu/art138_mwstrl.md`
*Code:* `_checkRCBlock()` · `_detectTriangle3()` · `SAP_TAX_MAP['EPDE']['NL']` ·
`RC_WORDING['NL']` in `docs/assets/scripts/app.js`

*Quellen (verifiziert Mai 2026):* wetten.overheid.nl (BWBR0002629) ·
Belastingdienst „Vereenvoudigde ABC-levering" · Fiscale Encyclopedie
De Vakstudie Art. 37c · PwC „Ruimere toepassing vereenvoudigde
ABC-regeling" · belastingdienst.nl „Opgaaf intracommunautaire prestaties"

---

# 22. CH · Ort der Lieferung
<!-- Quelle: vat-knowledge/ch/mwst_ch_ort_lieferung.md -->

# MWSTG CH — Ort der Lieferung & Reihengeschäft

## Art. 7 MWSTG — Lieferort
Abs. 1 Bst. b: Lieferort bei Beförderung = Ort des Beförderungsbeginns.
Im Code: `analyzeCHInland()`: „Lieferort: Schweiz (Art. 7 Abs. 1 Bst. b MWSTG)".
`natLaw('ch.place')` → `'Art. 7 Abs. 1 Bst. b MWSTG (SR 641.20)'`.

## Art. 23 Abs. 2 Ziff. 1 MWSTG — Ausfuhr steuerfrei
Lieferungen ins Ausland sind von der Steuer befreit wenn Ausfuhr nachgewiesen.
`natLaw('ch.export')` → `'Art. 23 Abs. 2 Ziff. 1 MWSTG (SR 641.20)'`.

## Art. 10 MWSTG — Steuerpflicht / CHF 100.000 Schwelle
Abs. 2 Bst. a: Obligatorische Steuerpflicht ab CHF 100.000 Jahresumsatz.
`natLaw('ch.threshold')` → `'Art. 10 Abs. 2 Bst. a MWSTG: CHF 100\'000/Jahr'`.
Im Code: `analyzeCHInland()` warnt bei fehlender CH-UID.

## Art. 67 MWSTG — Steuervertreter
Ausländische Unternehmen mit CH-Steuerpflicht brauchen Vertreter mit CH-Sitz.
`natLaw('ch.agent')` → `'Art. 67 Abs. 1 MWSTG (SR 641.20)'`.

## Implementierung
- `computeTaxCH(direction, from, to, myCode)`: Berechnet MwSt pro
  Lieferung — `export`, `export-l2`, `import`, `domestic-l1`, `domestic-l2-ch`
- `analyzeCH(supplier, me, customer, dep, dest)`: Vollanalyse EU↔CH,
  Case 1 (EU→CH) mit DAP/DDP-Grid, Case 2 (CH→EU) mit Import-Logik
- `analyzeCHInland(ctx)`: CH-Inland (dep=dest=CH), 8.1% auf alles

## Drittland-Routing in analyze()
```
hasCH + dep===CH + dest===CH → analyzeCHInland()
hasCH + dep!==CH + dest===CH → buildCHExportResult()  // EU→CH
hasCH + dep===CH + dest!==CH → analyzeCH()            // CH→EU
```
`hasCH`-Checks steuern den Dispatch bevor die EU-Engine läuft.

---

# 23. CH · Konsignationslager
<!-- Quelle: vat-knowledge/ch/mwst_ch_konsignationslager.md -->

# MWSTG CH — Konsignationslager

## MI06 Ziff. 6.1 (ESTV Merkblatt)
Konsignationslager in der Schweiz: Lieferant lagert Ware in CH ein,
Eigentumswechsel erst bei Entnahme durch Kunden. Zwei steuerliche Phasen.

## Phase 1 — Einlagerung (AT→CH Konsilager)
- Kein Eigentumswechsel → keine Lieferung iSd Art. 3 Bst. d MWSTG
- AT-seitig: steuerfreie Ausfuhr (§ 7 UStG AT, 0% MwSt)
- CH-seitig: Einfuhr durch EPROHA als Einführer → 8.1% EUSt
- EUSt als CH-Vorsteuer abziehbar (Art. 28 MWSTG)
- Zolllagerverfahren möglich: EUSt-Aussetzung bis Entnahme (ZG Art. 50–57)

## Phase 2 — Lieferung an Kunden (Konsilager→Endkunde)
- Eigentumsübergang bei Entnahme → Lieferung iSd Art. 3 Bst. d MWSTG
- Lieferort: CH (Art. 7 Abs. 1 Bst. a MWSTG — Ort der Ware bei Übergabe)
- EPROHA fakturiert 8.1% CH-MWST mit CH-UID
- ESTV-Abrechnung: Ausgangssteuer Ziff. 200, steuerbarer Umsatz Ziff. 302

## ZG Art. 50–57 — Zolllagerverfahren
Einlagerung unter Zollaufsicht setzt EUSt aus bis zur Entnahme.
Liquiditätsvorteil bei großen Lagerbeständen. BAZG-Bewilligung erforderlich.

## Implementierung — buildKonsiLagerCH(myCHVat, myCode)
- `myCHVat = COMPANIES['EPROHA'].vatIds['CH']` — wird vom Aufrufer als Parameter
  übergeben. `null` wenn EPROHA keine CH-Registrierung hat.
- Baut 2-Phasen-Grid (Phase 1: Einlagerung, Phase 2: Lieferung)
- `myCHVat`: wenn vorhanden, grünes ✅; sonst ⚠️-Warnung
- `invoiceP2`: Rechnungspflichtangaben Phase 2 (CH-UID, CHF, 8.1%)
- UID-Status: `chVat || null` — steuert Warnungen und Pflichtangaben
- Zolllager-Hinweis, Lagervertrag-Hinweis, Bestandsführung-Hinweis als `rH()`

## Aufruf
- `analyzeCH()`: Wird bei EU→CH nach dem DAP/DDP-Grid angehängt
- `analyze2()`: Wird bei AT→CH nach den Incoterms-Karten angehängt

---

# 24. AT · EPROHA-Buchungskreise
<!-- Quelle: vat-knowledge/at/eproha-buchungskreise.md -->

# EPROHA — AT-Buchungskreis vs. DE-Buchungskreis

> EPROHA ist in Österreich ansässig (home='AT') und hat UIDs in AT, DE und CH.
> Die SAP-Buchung hängt davon ab, **welche UID auf der Rechnung steht** — nicht davon,
> wo die Ware körperlich ist. Diese Datei erklärt die Entscheidungslogik.

---

## Grundprinzip: UID bestimmt Buchungskreis

Für Vorgänge mit grenzüberschreitendem Bezug (IG-Lieferung, IG-Erwerb, Ausfuhr,
Dreiecksgeschäft) gilt:

```
Welche UID steht auf der Rechnung?
  → AT-UID  → AT-Buchungskreis → AT-UVA → SAP: AF / A0 / VE / A2
  → DE-UID  → DE-Buchungskreis → DE-UStVA → SAP: DH / D0 / VH / DS
  → CH-UID  → CH-Buchungskreis → CH-MWST-Abrechnung → SAP: B5 / IB
```

Für **Inlandslieferungen und RC** gilt abweichend: der Buchungskreis ist das
Land des Lieferorts (transaction country), unabhängig von der UID.

---

## Vollständige SAP-Matrix EPROHA

### AT-Buchungskreis (AT-UID auf Rechnung)

| Vorgang | Code Ausgang | Code Eingang | Meldung |
|---|---|---|---|
| IG-Lieferung AT (steuerfreie IGL) | **AF** | — | ZM AT + Intrastat |
| IG-Erwerb AT (wir kaufen, Ware kommt nach AT) | — | **VE** | UVA AT |
| Dreiecksgeschäft AT (mittlerer Erwerber) | **AF** | — | ZM AT (KZ 077) |
| Ausfuhr AT → Drittland (CH, GB, …) | **A0** | — | Ausfuhrnachweis ATLAS |
| Inlandslieferung AT (20% MwSt) | **A2** | **V2** | UVA AT |
| Nicht steuerbar AT | **X0** | — | — |

### DE-Buchungskreis (DE-UID auf Rechnung)

| Vorgang | Code Ausgang | Code Eingang | Meldung |
|---|---|---|---|
| IG-Lieferung DE (steuerfreie IGL) | **DH** | — | ZM DE + Intrastat |
| IG-Erwerb DE (wir kaufen, Ware kommt nach DE) | — | **VH** | UStVA DE |
| Ausfuhr DE → CH (§ 6 UStG) | **D0** | — | Ausfuhrnachweis |
| Inlandslieferung DE (19% MwSt) | **DS** | **VD** | UStVA DE |

### CH-Buchungskreis (CH-UID auf Rechnung)

| Vorgang | Code Ausgang | Code Eingang | Meldung |
|---|---|---|---|
| CH-Inlandslieferung (8,1% CH-MWST) | **B5** | **IB** | CH-MWST-Abrechnung |
| Ausfuhr AT → CH (aus AT heraus) | **A0** | — | AT-Buchungskreis! |

### IT-Sonderfall (kein IT-Buchungskreis, keine IT-UID)

EPROHA hat keine IT-UID. IT hat Umkehrlogik: RC ist möglich wenn der Lieferant
**nicht** IT-registriert ist (Art. 17 Abs. 2 DPR 633/1972).

| Vorgang | Code Ausgang | Code Eingang | Meldung |
|---|---|---|---|
| L2 ruhend IT — inversione contabile | **IC** | — | AT-UVA (steuerfreie Lieferung) |
| Eingangsrechnung IT-Lieferant (Vorsteuer) | — | **VT** | AT-UVA |

EPROHA fakturiert 0% + Pflichttext „inversione contabile". IT-Empfänger führt
22% IT-MwSt selbst ab. Kein IT-Buchungskreis erforderlich.

---

## A0 vs. AF — wann welcher Code?

| | **A0** | **AF** |
|---|---|---|
| Bedeutung | Ausfuhrlieferung (Drittland) 0% | IG-Lieferung (EU-Mitgliedstaat) 0% |
| Rechtsgrundlage | § 7 UStG AT / Art. 146 MwStSystRL | Art. 6 Abs. 1 iVm. Art. 7 UStG 1994 / Art. 138 MwStSystRL |
| Bestimmungsland | Drittland (CH, GB, US, …) | EU-Mitgliedstaat (DE, IT, FR, …) |
| Belegnachweis | AT-Ausfuhrbestätigung (ATLAS/e-dec); Gelangensbestätigung **reicht nicht** | Gelangensbestätigung oder CMR |
| ZM-Meldung | **Nein** | **Ja** (bis 25. des Folgemonats) |
| Intrastat | **Nein** | **Ja** (Versendung) |

**Merksatz:** Geht die Ware aus der EU heraus → **A0**. Bleibt sie in der EU → **AF**.

**Grenzfall CH:** Die Schweiz ist kein EU-Mitglied → immer **A0** (auch wenn das
Feeling „innereuropäisch" ist). Mode 2 AT→CH zeigt dies explizit.

---

## DH vs. AF — wann welcher Code?

Beide bedeuten steuerfreie IG-Lieferung 0%. Der Unterschied ist **ausschließlich
der Buchungskreis** — also welche UID auf der Rechnung steht:

| | **AF** (AT-Buchungskreis) | **DH** (DE-Buchungskreis) |
|---|---|---|
| UID auf Rechnung | ATU… (AT-UID) | DE… (DE-UID) |
| Meldung | ZM AT · Intrastat AT | ZM DE · Intrastat DE |
| UVA/UStVA | Österreichische UVA | Deutsche UStVA |
| Typischer Fall | L2 ruhend in AT, EPROHA liefert IG ab AT | L2 ruhend in DE, EPROHA liefert IG ab DE (z.B. Lager DE) |

**Entscheidungsbaum:**
```
EPROHA tätigt IG-Lieferung
  → Lieferort / Abgangsland = AT?
      → AT-UID auf Rechnung → SAP AF
  → Lieferort / Abgangsland = DE?
      → DE-UID auf Rechnung → SAP DH
```

**Praktisches Beispiel:**
- DE→AT(EPROHA)→IT, Transport B mit AT-UID: L2 startet in DE (Abgangsland DE),
  EPROHA verwendet **DE-UID** → **SAP DH** (Testfall LF-02c)
- DE→AT(EPROHA)→IT, Transport A: EPROHA verkauft L2 ruhend in IT,
  Dreiecksgeschäft mit AT-UID → **SAP AF** (Testfall LF-02a)

---

## `_sapEffectiveCountry()` — Implementierung

```js
function _sapEffectiveCountry(company, country, treatment, uidCountry) {
  const uidTreatments = ['ic-exempt', 'ic-acquisition', 'dreiecks', 'export'];
  if (!uidTreatments.includes(treatment)) return country;
  const home = COMPANIES[company]?.home || country;
  const uidLand = uidCountry || selectedUidOverride || home;
  return SAP_TAX_MAP[company]?.[uidLand]?.[treatment] ? uidLand : country;
}
```

**Zwei Pfade:**

1. **Domestic / RC / not-taxable** (nicht in `uidTreatments`):
   → Effektives Land = `country` (Lieferort/Transaktionsland).
   Buchungskreis folgt dem Land des Umsatzes, UID irrelevant.

2. **IG-Lieferung / IG-Erwerb / Dreiecksgeschäft / Ausfuhr** (in `uidTreatments`):
   → Effektives Land = UID-Land (`uidCountry` → `selectedUidOverride` → `home`).
   Wenn kein SAP-Eintrag für dieses UID-Land existiert: Fallback auf `country`.

**Konsequenz:** Wählt der Nutzer im UI eine DE-UID als Override →
wird automatisch der DE-Buchungskreis für die IG-Buchung verwendet.

---

## Häufige Konstellationen (EPROHA-spezifisch)

| Konstellation | UID | SAP Ausgang | SAP Eingang | Buchungskreis |
|---|---|---|---|---|
| AT-Lieferant → EPROHA → EU-Empfänger, L1 moving | AT | — | **VE** (IG-Erwerb AT) | AT |
| AT-Lieferant → EPROHA → EU-Empfänger, L2 ruhend EU | AT | **AF** (IG-Lieferung) | — | AT |
| AT-Lieferant → EPROHA → DE, L1 moving, Erwerb in DE | DE | — | **VH** (IG-Erwerb DE) | DE |
| DE-Lieferant → EPROHA → EU, L1 ruhend DE, L2 moving | DE | **DH** (IG-Lieferung ab DE) | — | DE |
| EPROHA → CH (Ausfuhr) | AT | **A0** (Ausfuhr) | — | AT |
| EPROHA → CH (Ausfuhr), DE-UID verwendet | DE | **D0** (Ausfuhr DE) | — | DE |
| EPROHA → AT-Inlandskunde | AT | **A2** (20% AT) | — | AT |
| EPROHA → DE-Inlandskunde (Lager DE) | DE | **DS** (19% DE) | — | DE |
| Dreiecksgeschäft (EPROHA als mittlerer Erwerber) | AT | **AF** | — | AT (ZM KZ 077) |
| L2 ruhend IT (inversione contabile) | AT | **IC** | — | AT (kein IT-Buchungskreis) |
| Eingangsrechnung IT-Lieferant | AT | — | **VT** | AT |

---

## Offene Fälle / bekannte Lücken

- **EPROHA als Dreieck-Erwerber mit DE-UID:** theoretisch möglich (dreiecks in DE),
  aber kein SAP_TAX_MAP-Eintrag für `EPROHA DE dreiecks` — würde auf AT-Buchungskreis
  zurückfallen. Bisher kein Praxisfall bekannt.

## Produktiv-Abgleich SAP VK12 — 05.07.2026

Abgang **AT** (Schema `TAXAT`), Konditionstabellen A002/A011 → KONP → T007A.
**Bestätigt (deckungsgleich):** `A2` (AT-Inland 20 %) · `AF` (IG-Lieferung/Dreieck 0 %) ·
`A0` (Ausfuhr Drittland 0 %) · `DS` (Strecke DE 19 %) · `B5` (CH-Inland 8,1 %, EPROHA Importeur) ·
`D0` (Ausfuhr über DE-UID) · `IC` (IT inversione) · `X0` (nicht steuerbar).
Steuerklasse Kunde (SAP TAXK1) 1 + Zielland DE → **`DS` 19 %** (Strecke DE). Details + LT-Offenpunkt: `de/epde-buchungskreise.md`.

---

*Verwandte Dateien:* `rules/uid_usage_rules.md` · `reference-cases.md` · `at/ustg_at_reihengeschaeft.md`
*Code:* `_sapEffectiveCountry()` · `SAP_TAX_MAP` · `sapBadge()` in `docs/assets/scripts/app.js`

---
