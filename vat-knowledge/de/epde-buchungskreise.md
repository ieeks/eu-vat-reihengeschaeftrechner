# EPDE — Buchungskreise: DE + 7 EU-Registrierungen

> EPDE (Europapier Deutschland GmbH) ist in Deutschland ansässig (home='DE')
> und hat UIDs in 8 Ländern: DE, SI, LV, EE, NL, BE, CZ, PL.
> Der SAP-Buchungskreis folgt der **UID auf der Rechnung**, nicht dem physischen Warenfluss.

---

## Übersicht: Wofür stehen die einzelnen UIDs?

| UID-Land | Primäre Funktion | Ausgangs-IG? | Besonderheit |
|---|---|---|---|
| **DE** | Heimatland, alle Geschäftstypen | ✅ DH | Standard-Buchungskreis |
| **SI** | IG-Erwerb SI + ruhende Lieferung in SI | ✅ C1 | RC blockiert (Lieferant SI-registriert) |
| **PL** | IG-Erwerb PL + ruhende Lieferung in PL | ✅ T1 | RC blockiert |
| **CZ** | IG-Erwerb CZ + ruhende Lieferung in CZ | ✅ OB | RC blockiert |
| **NL** | IG-Erwerb NL + ruhende Lieferung in NL | ⚠️ kein Stkz. | RC **erlaubt** (Art. 12 Wet OB) |
| **BE** | IG-Erwerb BE + ruhende Lieferung in BE | ⚠️ kein Stkz. | RC blockiert (Art. 51 §2 WBTW) |
| **LV** | IG-Erwerb LV + ruhende Lieferung in LV | ⚠️ kein Stkz. | RC blockiert |
| **EE** | IG-Erwerb EE + ruhende Lieferung in EE | ⚠️ kein Stkz. | RC blockiert |

⚠️ = kein SAP-Ausgangskennzeichen für IG-Lieferung aus diesem Land vorhanden.
Tritt dieser Fall ein, muss zuerst ein neues SAP-Stkz. angelegt werden.

---

## Vollständige SAP-Matrix EPDE

### DE-Buchungskreis (Hauptbuchungskreis)

| Vorgang | Code Ausgang | Code Eingang | Meldung |
|---|---|---|---|
| IG-Lieferung aus DE | **DH** | — | ZM DE + Intrastat |
| IG-Erwerb in DE | — | **VH** | UStVA DE |
| Ausfuhr DE → CH / Drittland | **G0** | — | Ausfuhrnachweis |
| Reverse Charge DE (§ 13b UStG) | — | **DC** | UStVA DE |
| Inlandslieferung DE (19%) | **DS** | **VD** | UStVA DE |
| Nicht steuerbar DE | **XD** | — | — |
| Vorsteuer 0% DE | — | **P0** | — |

### SI-Buchungskreis

| Vorgang | Code Ausgang | Code Eingang | Meldung |
|---|---|---|---|
| IG-Lieferung aus SI | **C1** | — | ZM SI + Intrastat |
| IG-Erwerb in SI | — | **EC** | SI-UStVA |
| Inlandslieferung SI (22%) | **CB** | **SI** | SI-UStVA |
| RC SI (Lieferant SI-registriert → blockiert) | **CB** | **SI** | SI-UStVA (kein RC) |

### PL-Buchungskreis

| Vorgang | Code Ausgang | Code Eingang | Meldung |
|---|---|---|---|
| IG-Lieferung aus PL | **T1** | — | ZM PL + Intrastat |
| IG-Erwerb in PL | — | **W5** | PL-UStVA |
| Inlandslieferung PL (23%) | **A4** | **B7** | PL-UStVA |
| RC PL (blockiert → EPDE weist 23% aus) | **A4** | **B7** | PL-UStVA (kein RC) |

### CZ-Buchungskreis

| Vorgang | Code Ausgang | Code Eingang | Meldung |
|---|---|---|---|
| IG-Lieferung aus CZ | **OB** | — | ZM CZ + Intrastat |
| IG-Erwerb in CZ | — | **UR** | CZ-UStVA |
| Inlandslieferung CZ (21%) | **AE** | **VC** | CZ-UStVA |
| RC CZ (blockiert → EPDE weist 21% aus) | **AE** | **VC** | CZ-UStVA (kein RC) |

### NL-Buchungskreis

| Vorgang | Code Ausgang | Code Eingang | Meldung |
|---|---|---|---|
| IG-Lieferung aus NL | ⚠️ kein Stkz. | — | Stkz. neu anlegen |
| IG-Erwerb in NL | — | **NP** | NL-BTW-Erklärung |
| Inlandslieferung NL (21%) | — | **NI** | NL-BTW-Erklärung |
| **RC NL (erlaubt!)** | **NC** | **NI** | NL-BTW-Erklärung |

### BE-Buchungskreis

| Vorgang | Code Ausgang | Code Eingang | Meldung |
|---|---|---|---|
| IG-Lieferung aus BE | ⚠️ kein Stkz. | — | Stkz. neu anlegen |
| IG-Erwerb in BE | — | **BP** | BE-UStVA |
| Inlandslieferung BE (21%) | **BS** | **BI** | BE-UStVA |
| RC BE (blockiert → EPDE weist 21% aus) | **BS** | **BI** | BE-UStVA (kein RC) |

### LV-Buchungskreis

| Vorgang | Code Ausgang | Code Eingang | Meldung |
|---|---|---|---|
| IG-Lieferung aus LV | ⚠️ kein Stkz. | — | Stkz. neu anlegen |
| IG-Erwerb in LV | — | **LP** | LV-UStVA |
| Inlandslieferung LV (21%) | **LS** | **LI** | LV-UStVA |
| RC LV (blockiert → EPDE weist 21% aus) | **LS** | **LI** | LV-UStVA (kein RC) |

### EE-Buchungskreis

| Vorgang | Code Ausgang | Code Eingang | Meldung |
|---|---|---|---|
| IG-Lieferung aus EE | ⚠️ kein Stkz. | — | Stkz. neu anlegen |
| IG-Erwerb in EE | — | **EP** | EE-UStVA |
| Inlandslieferung EE (22%) | **ES** | **EI** | EE-UStVA |
| RC EE (blockiert → EPDE weist 22% aus) | **ES** | **EI** | EE-UStVA (kein RC) |

---

## G0 vs. DH — wann welcher Code?

Analog zu A0/AF bei EPROHA — beide sind 0%, aber unterschiedliche Vorgänge:

| | **G0** | **DH** |
|---|---|---|
| Bedeutung | Ausfuhrlieferung Drittland 0% | IG-Lieferung EU 0% |
| Rechtsgrundlage | § 6 UStG / Art. 146 MwStSystRL | § 6a UStG / Art. 138 MwStSystRL |
| Bestimmungsland | Drittland (CH, GB, …) | EU-Mitgliedstaat |
| Belegnachweis | Ausfuhrbestätigung (ATLAS); Gelangensbestätigung **reicht nicht** | Gelangensbestätigung oder CMR (§ 17a UStDV) |
| ZM | **Nein** | **Ja** |
| Intrastat | **Nein** | **Ja** (Versendung) |

**Merksatz:** Ware verlässt EU → **G0**. Ware bleibt in EU → **DH**.

---

## RC-Sonderfall NL — der einzige erlaubte RC bei EPDE

In allen anderen Ländern ist RC für EPDE **blockiert**, weil EPDE dort
registriert ist. NL ist die Ausnahme:

```
Art. 12 Abs. 3 Wet OB (NL):
RC gilt auch wenn der Lieferant NL-registriert ist
→ EPDE kann NL-Reverse-Charge anwenden → SAP NC / NI
```

Alle anderen Länder (BE, PL, CZ, SI, LV, EE): EPDE ist registriert
→ RC blockiert → EPDE muss lokale MwSt ausweisen (BS, A4, AE, CB, LS, ES).
Details: `rules/rc_country_rules.md`

---

## IT-Sonderfall — Umkehrlogik RC

EPDE hat **keine** IT-UID. IT hat eine Umkehrlogik:
RC ist möglich wenn EPDE **nicht** in IT registriert ist.

| Vorgang | Code Ausgang | Code Eingang |
|---|---|---|
| RC IT inversione contabile (ruhende L2 in IT) | **IC** | — |
| IG-Erwerb IT (EPDE kauft, Ware kommt nach IT) | — | **IP** |
| Eingangsrechnung IT (Vorsteuer) | — | **VI** |

EPDE fakturiert 0% + Pflichttext „inversione contabile", IT-Empfänger führt
22% IT-MwSt selbst ab. Keine IT-Registrierung für EPDE erforderlich.

---

## Wann wird ein non-DE Buchungskreis aktiv?

```
EPDE tätigt Lieferung
  → Lieferort (placeOfSupply) = DE?
      → DE-UID → DE-Buchungskreis (DH/DS/G0/VH/VD)
  → Lieferort = SI/PL/CZ?
      → EPDE hat UID dort → jeweiliger Buchungskreis (C1/T1/OB + CB/A4/AE)
  → Lieferort = NL/BE/LV/EE?
      → EPDE hat UID dort → Buchungskreis (NC | BS | LS | ES)
      → IG-Lieferung AUS diesen Ländern: ⚠️ kein SAP-Stkz. → erst anlegen!
  → Lieferort = IT?
      → Kein IT-Buchungskreis → inversione contabile (IC)
```

**Praktisch:** Der non-DE Buchungskreis greift fast immer nur wenn L2 (ruhende
Lieferung) im Zielland liegt — also wenn EPDE in diesem Land als lokaler Verkäufer
auftritt. Bei IG-Lieferungen ab DE bleibt der DE-Buchungskreis (DH) der Standard.

---

## Häufige Konstellationen (EPDE-spezifisch)

| Konstellation | UID | SAP Ausgang | SAP Eingang |
|---|---|---|---|
| FR→DE(EPDE)→IT, L1 moving (IG-Erwerb DE) | DE | — | **VH** |
| FR→DE(EPDE)→IT, L2 ruhend IT, Dreiecksgeschäft | DE | **DH** (ZM) | — |
| FR→DE(EPDE)→IT, L2 ruhend IT, ohne Dreieck | DE | **IC** (inversione) | — |
| SI→DE(EPDE)→DE, L1 moving (IG-Erwerb DE) | DE | — | **VH** |
| SI→DE(EPDE)→DE, L1 ruhend SI | SI | — | **EC** (IG-Erwerb SI) |
| EPDE → CH (Ausfuhr ab DE) | DE | **G0** | — |
| EPDE liefert inland in PL | PL | **A4** | — |
| EPDE kauft in PL (ruhend, IG-Erwerb PL) | PL | — | **W5** |
| EPDE liefert NL-Kunde, NL-Lieferort, RC | NL | **NC** | — |
| EPDE liefert BE-Kunde, BE-Lieferort | BE | **BS** (21%, RC blockiert) | — |

---

*Verwandte Dateien:* `rules/uid_usage_rules.md` · `rules/rc_country_rules.md` · `de/ustg_de_3_6a.md` · `reference-cases.md`
*Analogie EPROHA:* `at/eproha-buchungskreise.md`
*Code:* `_sapEffectiveCountry()` · `SAP_TAX_MAP` · `_checkRCBlock()` in `docs/assets/scripts/app.js`
