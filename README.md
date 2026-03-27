# EU VAT Reihengeschäftsrechner v4.2

Internes Compliance-Tool für EPDE und EPROHA.  
Analysiert EU-Reihengeschäfte → SAP-Steuerkennzeichen, Rechtsgrundlagen, Handlungsempfehlungen.

## Modi
| 3P | Standard-Reihengeschäft (inkl. CH/GB Export) |
|---|---|
| 4P | EuG T-646/24 Dreiecksgeschäft |
| 2P | EPROHA Direktlieferung (AT→EU/CH/GB) |
| Lohn | Art. 17 Abs. 2 lit. f MwStSystRL |

## Output
- **Kurzbeschreibung** — Rechtsgrundlage + SAP-Code + UID pro Lieferung
- **Warenfluss-Diagramm** — SVG inkl. Inland + CH/GB Export
- **P0 Warnungen** — Ruhende Lieferung ohne UID → 4 Handlungsoptionen
- **⚖ Vergleich-Tab** — Transport-Szenarien nebeneinander (Supplier/Middle/Customer)
- **Experten-Modus** — 5 Tabs + Perspektivwechsel

## Drittland-Support
- **CH (Schweiz):** 2P und 3P, DAP/DDP, BAZG, EUSt 8,1%, FHA
- **GB (Post-Brexit):** 2P und 3P, DAP/DDP, HMRC, UK VAT, TCA

## Mobile
iPhone-optimiert: Kurzbeschreibung + Diagramm + Warnungen

## Dev Mode
⋯-Menü → 🏷 Dev Mode: Hover-Tooltip zeigt Komponenten-Namen

## Tests
33 Smoke · 13 Render · 8 Output · 12 Invarianten

`Reihengeschaeftsrechner_22.html` — Single-file, direkt im Browser.
