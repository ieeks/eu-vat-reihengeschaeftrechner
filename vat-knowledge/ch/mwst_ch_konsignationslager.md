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

## Implementierung — buildKonsiLagerCH(myCHVat, myCode) (Z. 2742)
- Baut 2-Phasen-Grid (Phase 1: Einlagerung, Phase 2: Lieferung)
- `myCHVat`: CH-UID von EPROHA — wenn vorhanden, grünes ✅; sonst ⚠️-Warnung
- `invoiceP2`: Rechnungspflichtangaben Phase 2 (CH-UID, CHF, 8.1%)
- UID-Status: `chVat || null` — steuert Warnungen und Pflichtangaben
- Zolllager-Hinweis, Lagervertrag-Hinweis, Bestandsführung-Hinweis als `rH()`

## Aufruf
- `analyzeCH()` (Z. 2908): Wird bei EU→CH nach dem DAP/DDP-Grid angehängt
- `analyze2()` (Z. 4223): Wird bei AT→CH nach den Incoterms-Karten angehängt
