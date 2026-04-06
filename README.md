# EU VAT Reihengeschäftsrechner v4.2

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
| 2P | EPROHA Direktlieferung (AT→EU/CH/GB) |
| Lohn | Art. 17 Abs. 2 lit. f MwStSystRL |

## Output
- **Top-Status** — `ACHTUNG GEHT NICHT`, `Dreiecksgeschäft angewendet`, `Dreiecksgeschäft möglich (mit UID-Anpassung)` oder `Dreiecksgeschäft nicht anwendbar`
- **Executive Summary** — kompakte 3er-Zusammenfassung zu Struktur, Transport und UID-Einsatz
- **Decision Flow** — strukturierte 4-Schritt-Begründung zu Transportzuordnung, bewegter Lieferung, steuerlicher Behandlung und restlicher Lieferung
- **Eigene Lieferhinweise** — SAP-Code + UID pro eigener Lieferung in der Begründungsbox
- **Warenfluss-Diagramm** — SVG inkl. Inland + CH/GB Export
- **P0 Warnungen** — Ruhende Lieferung ohne UID → 4 Handlungsoptionen
- **Weitere Hinweise** — sekundäre Hints werden auf Desktop in ein einklappbares Panel verschoben
- **⚖ Vergleich-Tab** — Transport-Szenarien nebeneinander (Supplier/Middle/Customer)
- **Experten-Modus** — 5 Tabs + Perspektivwechsel

## Aktueller Fokus
- `⚖ Vergleich-Tab` ist fachlich harmonisiert (Session 17) — finale Browserabnahme offen
- `/vat-knowledge/` Wissensbasis: 16 Markdown-Dateien (EU/AT/DE/CH Recht ↔ Code-Mapping)
- Drop-Shipment EU: prominenter UID-Pflicht-Block vor Diagramm (Mobile-first)

## Drittland-Support
- **CH (Schweiz):** 2P und 3P, DAP/DDP, BAZG, EUSt 8,1%, FHA
- **GB (Post-Brexit):** 2P und 3P, DAP/DDP, HMRC, UK VAT, TCA

## Mobile
iPhone-optimiert: Warnungen + Diagramm + primäre Kurzbeschreibung, sekundäre Inhalte weitgehend ausgeblendet

## Dev Mode
⋯-Menü → 🏷 Dev Mode: Hover-Tooltip zeigt Komponenten-Namen

## Tests
33 Smoke · 13 Render · 8 Output · 12 Invarianten

`Reihengeschaeftsrechner_22.html` — Single-file, direkt im Browser.
