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

### A2 · DE → AT → IT · Transport: B (EPROHA), mit AT-UID (lit. b)

**Testfall:** LF-02c, DG-02 · **Quelle:** reihengeschaeft.at Beispiel 2c

```
🇩🇪 DE ──L1──▶ 🇦🇹 AT/EPROHA ──L2──▶ 🇮🇹 IT
                  B holt ab
                  AT-UID mitgeteilt → lit. b
```

**Transportzuordnung:** B transportiert, uidOverride='AT' (Ansässigkeits-UID ≠ dep DE)
→ Quick Fix lit. b → **L2 ist bewegend** (movingIndex=1)

| Lieferung | Ort | Behandlung | EPROHA-Eingang (Käufer) | EPROHA-Ausgang (Verkäufer) |
|---|---|---|---|---|
| L1 · DE→AT | 🇩🇪 DE (ruhend) | Inlandslieferung DE 19% | DE-Domestic · **SAP VD** | — |
| L2 · AT→IT | 🇩🇪 DE (Abgang) | IG-Lieferung 0% aus DE | — | IG-Lieferung DE · **SAP DH** |

**Dreiecksgeschäft:** ✅ möglich (auch bei movingIndex=1 — Fix v2.6, Art. 141 kein movingIndex-Erfordernis)

**ZM:** EPROHA meldet L2 aus DE (DE-UID)

**Hinweis:** Lieferort L1 = DE (ruhend vor Bewegung). EPROHA kauft in DE zum Netto-Preis
(19% DE-MwSt als Vorsteuer VD), liefert IG ab DE. AT-MwSt fällt auf L1 nicht an.

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
- **Alt A** (U3 mit IT-UID → lit. b): movingIndex=2 (L3 bewegend), kein Dreiecksgeschäft
- **Alt B** (U3 mit HU-UID → lit. b): movingIndex=2 (L3 bewegend), kein Dreiecksgeschäft

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

### E2 · Quick Fix lit. a vs. lit. b vs. lit. c — Entscheidungsmatrix

| Bedingung | Variante | movingIndex | Dreiecksgeschäft |
|---|---|---|---|
| B hat dep-UID, ist NICHT ansässig in dep, tritt mit dep-UID auf | **lit. a** | chainIndex−1 (L1) | möglich wenn sonst Voraussetzungen erfüllt |
| B hat Ansässigkeits-UID oder andere UID, tritt damit auf | **lit. b** | chainIndex (L2) | möglich (auch bei movingIndex=1) |
| B hat keine dep-UID, ist nicht ansässig in dep (Automatik) | **lit. c** | chainIndex−1 (L1) | möglich wenn sonst Voraussetzungen erfüllt |

**Merkregel:** lit. a und lit. c → L1 moving (Lieferant effektiv als Transporteur bewertet).
lit. b → L2 moving (Mittler trägt volle umsatzsteuerliche Verantwortung ab Abhol-Land).

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
