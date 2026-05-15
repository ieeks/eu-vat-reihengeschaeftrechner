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

---

*Verwandte Dateien:* `rules/uid_usage_rules.md` · `reference-cases.md` · `at/ustg_at_reihengeschaeft.md`
*Code:* `_sapEffectiveCountry()` · `SAP_TAX_MAP` · `sapBadge()` in `docs/assets/scripts/app.js`
