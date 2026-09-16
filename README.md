# EU VAT Reihengeschäftsrechner v4.3

Internes Compliance-Tool für EPDE und EPROHA.  
Analysiert EU-Reihengeschäfte → SAP-Steuerkennzeichen, Rechtsgrundlagen, Handlungsempfehlungen.

## Projektstart lokal
- `npm run dev`
- Browser: `http://localhost:4173`
- Einstieg über `index.html` → leitet auf `docs/` weiter

## Projektstruktur
- `docs/index.html` — deploybare Multi-File-App für Browser und statisches Hosting
- `docs/assets/styles/app.css` — ausgelagerte Styles
- `docs/assets/scripts/app.js` — ausgelagerte App-Logik
- `Reihengeschaeftsrechner_22.html` — Legacy-Snapshot der früheren Single-File-App
- `index.html` — schlanker Einstiegspunkt/Redirect auf `docs/`
- `scripts/serve.mjs` — dependency-freier lokaler Static-Server + Strukturcheck
- `scripts/export-matrix.mjs` — exportiert die gesamte Konstellationsfläche als CSV (liest nur)
- `scripts/matrix-diff.mjs` — vergleicht zwei Exporte, gruppiert nach Abweichungsmuster
- `tests/matrix-baseline.csv` — eingecheckte Regressions-Baseline
- `.github/workflows/pages.yml` — GitHub-Pages-Deployment per Actions
- `vat-knowledge/` — 16 Markdown-Dateien + Index (EU/AT/DE/CH Steuerrecht ↔ Code)
- `rechtskonformitaet.md` — Rechtsabgleich + bewusste Abweichungen (konservative Auslegung)
- `CLAUDE.md` — Entwicklerregeln und Architekturhinweise
- `RGR_CHANGELOG.md` — Session-Änderungen
- `RGR_TODO.md` — offener Backlog

## Hosting
- Zielplattform: GitHub Pages
- Deployment-Artefakt: `docs/`
- Workflow: `.github/workflows/pages.yml`
- Live-URL: `https://ieeks.github.io/eu-vat-reihengeschaeftrechner/`

## Modi
| 3P | Standard-Reihengeschäft (inkl. CH/GB Export) |
|---|---|
| 4P | EuG T-646/24 Dreiecksgeschäft |
| 2P | EPROHA Direktlieferung (AT→EU/CH/GB) · Drop-Shipment an Endkunden des Kunden (Reihengeschäft/Dreiecksgeschäft) |
| Lohn | Art. 17 Abs. 2 lit. f MwStSystRL |

## Output
- **Top-Status** — `ACHTUNG GEHT NICHT`, `Dreiecksgeschäft angewendet`, `Dreiecksgeschäft möglich (mit UID-Anpassung)` oder `Dreiecksgeschäft nicht anwendbar`
- **Executive Summary** — kompakte 3er-Zusammenfassung zu Struktur, Transport und UID-Einsatz
- **Decision Flow** — strukturierte 4-Schritt-Begründung zu Transportzuordnung, bewegter Lieferung, steuerlicher Behandlung und restlicher Lieferung
- **Eigene Lieferhinweise** — SAP-Code + UID pro eigener Lieferung in der Begründungsbox
- **Warenfluss-Diagramm** — SVG inkl. Inland + CH/GB Export
- **P0 Warnungen** — Ruhende Lieferung ohne UID → 4 Handlungsoptionen
- **Weitere Hinweise** — sekundäre Hints werden auf Desktop in ein einklappbares Panel verschoben
- **🟢 Quick Check Tab** — Schnellansicht im Full-Width-Modus (linke Spalte hidden); zeigt bewegte Lieferung, SAP-Codes, Registrierungsrisiken; Toggle-Button im Header mit `✕`-Indikator
- **⚖ Vergleich-Tab** — Transport-Szenarien nebeneinander (Supplier/Middle/Customer)
- **Experten-Modus** — 5 Tabs + Perspektivwechsel

## Aktueller Fokus
- **Mode 2 Drop-Shipment für Drittland-Kunde mit EU-Warenempfänger** — Fall EPROHA(AT) → CH-Kunde → Warenempfänger SK: Ware bleibt in der EU → innergemeinschaftliches Reihengeschäft (ig. Lieferung 0% nur mit EU-UID des Kunden) statt Schweiz-Export; Dreiecksgeschäft gesperrt (Drittland-Kunde ohne EU-UID)
- **Mode 2 Drop-Shipment für EU-Kunden** — EPROHA als erster Lieferant an einen EU-Kunden mit abweichendem Warenempfänger-Land (z.B. DE-Kunde, Ware nach IT) → Dreiecksgeschäft (AF/Reverse Charge) bzw. Ausfuhr bei Drittland-Empfänger (Session 28)
- **Warenfluss-Diagramme vereinheitlicht** — Transport-Veranlasser-Label + Chip-Stil in 3P/4P/Drop-Shipment, größere SVGs (Session 28)
- **v4.3 live** — Light Theme, Header-Modus-Tabs, Self-hosted Fonts, PDF-Export (Sessions 22–23)
- `/vat-knowledge/` Wissensbasis: 19 Markdown-Dateien (EU/AT/DE/CH Recht ↔ Code-Mapping), inkl. Referenzfälle + EPROHA/EPDE Buchungskreis-Doku

## Drittland-Support
- **CH (Schweiz):** 2P und 3P, DAP/DDP, BAZG, EUSt 8,1%, FHA
- **LI (Liechtenstein):** gemeinsamer Schweizer MWST-Raum (Zollvertrag 1923) → wie CH behandelt (Ausfuhr A0/G0 · CH/LI-Inland B5 8,1%; CH-Registrierung deckt LI ab), als Zielland wählbar
- **GB (Post-Brexit):** 2P und 3P, DAP/DDP, HMRC, UK VAT, TCA

## Mobile
iPhone-optimiert: Warnungen + Diagramm + primäre Kurzbeschreibung, sekundäre Inhalte weitgehend ausgeblendet

## Dev Mode
⋯-Menü → 🏷 Dev Mode: Hover-Tooltip zeigt Komponenten-Namen

## Tests
44 Smoke · 13 Render · 8 Output · 12 Invarianten

| Befehl | Prüft |
|---|---|
| `npm test` | Output-Tests + Lohnveredelungs-Tabs |
| `npm run check:matrix` | SAP-Findungsmatrix „Plants Abroad" (V1) gegen feste Sollwerte |
| `npm run matrix:check` | **Regressions-Baseline** über die gesamte Konstellationsfläche |
| `npm run matrix:baseline` | Baseline neu setzen (siehe unten) |

### Regressions-Baseline

`npm run matrix:check` exportiert alle Konstellationen (Gesellschaft × Abgangsland ×
Bestimmungsland × Transportveranlasser × verwendete UID — 27 EU-Länder, 12.642 Fälle)
nach `tests/matrix-current.csv` und vergleicht sie gegen die eingecheckte
`tests/matrix-baseline.csv`. Exit 0 = deckungsgleich, Exit 1 = Abweichung; der Report
gruppiert nach Muster (`sap_out: 19× DH → XX`) statt Zeilen zu spucken. Läuft im
Pages-Workflow vor dem Deployment.

Laufzeit voller Satz ca. 6 Minuten. Für einen schnellen lokalen Durchlauf:

```bash
node scripts/export-matrix.mjs --countries DE,AT,IT,SI,PL,CZ --skip-same --out tests/x.csv
```

**Eine gewollte fachliche Änderung bedeutet eine neu committete Baseline.** Schlägt
`matrix:check` nach einer bewussten Änderung an der Steuerlogik fehl, wird der Report
geprüft — und wenn die Abweichungen genau die beabsichtigten sind:

```bash
npm run matrix:baseline    # schreibt tests/matrix-baseline.csv neu
git add tests/matrix-baseline.csv
```

Die neue Baseline gehört in denselben Commit wie die Logikänderung — der Diff macht
sichtbar, was sich fachlich geändert hat. `tests/matrix-current.csv` ist Arbeitsstand
und in `.gitignore`.

`Reihengeschaeftsrechner_22.html` — Single-file, direkt im Browser.
