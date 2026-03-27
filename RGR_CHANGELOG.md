# RGR Changelog — Reihengeschäftsrechner

---

## v4.2 · 27.03.2026 — Session 12

### Multi-File / Hosting
- Statische Multi-File-App unter `docs/` angelegt (`index.html`, `assets/styles/app.css`, `assets/scripts/app.js`)
- Root-`index.html` auf Redirect nach `docs/` umgestellt
- `Reihengeschaeftsrechner_22.html` als Legacy-Snapshot beibehalten
- `netlify.toml` für statisches Hosting mit Publish-Ordner `docs/` ergänzt
- `npm run check:pages` ergänzt und `scripts/serve.mjs` um Pages-Strukturcheck erweitert

### Doku
- README + CLAUDE auf neue Multi-File-/Pages-Struktur aktualisiert

### Hosting-Status
- GitHub Pages für das aktuelle private Repo per API versucht, aber von GitHub mit Plan-Hinweis abgelehnt
- Repo daher auf providerneutrales Static-Hosting mit Netlify-Vorbereitung ausgerichtet

### Nicht angefasst
- VATEngine IIFE
- analyze()
- analyze2()

## v4.2 · 27.03.2026 — Session 11

### Decision Flow / UI
- `buildKurzbeschreibung()` von Bullet-/Debug-Stil auf professionellen `Decision Flow` umgestellt
- Neue 4-Schritt-Struktur: Transportzuordnung, bewegte Lieferung, steuerliche Behandlung, restliche Lieferung
- Eigene Lieferungen zusätzlich als kompakte SAP-/UID-Hinweise unterhalb des Decision Flow
- Rechtsgrundlagen im Output nur noch subtil als Referenz-Chips

### Dreiecksgeschäft Opportunity
- Opportunity-Banner sprachlich und visuell auf praktische UID-Auswahl / Registrierungsvermeidung ausgerichtet
- Banner erscheint weiterhin nur bei bestehender Opportunity-Erkennung
- Keine Änderung an der zugrunde liegenden Steuer- oder Dreieckslogik

### Minimaler UI-State-Refactor
- Neue Helper `getState()`, `setState()`, `getCanonicalTransport()`, `getTransportLetter()`
- Transport-Normalisierung aus `renderResult()` herausgezogen
- Bestehende UI-Workflows auf kompatible State-Helper umgelegt

### Nicht angefasst
- VATEngine IIFE
- analyze()
- analyze2()

## v4.2 · 27.03.2026 — Session 10

### Projektstruktur / Repo-Rahmen
- Neues GitHub-Repo `ieeks/eu-vat-reihengeschaeftrechner` angelegt und `main` gepusht
- Lokaler Einstiegspunkt `index.html` ergänzt → Redirect auf `Reihengeschaeftsrechner_22.html`
- `package.json` ergänzt mit `npm run dev`, `npm run start`, `npm run check`
- `scripts/serve.mjs` ergänzt als dependency-freier lokaler Static-Server
- README + CLAUDE auf neue Start- und Strukturinfos aktualisiert

### Nicht angefasst
- VATEngine IIFE
- analyze()
- analyze2()

## v4.2 · 26.03.2026 — Session 9

### Dev-Overlay (P2)
- Toggle im ⋯-Menü: "🏷 Dev Mode" → setzt data-dev="true" auf <html>
- JS-Tooltip (#dev-tooltip, position:fixed im body) folgt der Maus — nie geclippt
- composedPath() + instanceof Element + parentElement-Fallback für robustes Element-Walking
- Getaggte Komponenten: buildKurzbeschreibung, buildDeliveryBox, buildFlowDiagram (alle 3 Pfade: 2P/3P/4P), buildLegalRefs, buildPerspektivwechsel, buildMeldepflichten, buildVergleichTab, reg-warnings, resultContextBar, quickFix (Art. 36a)

### Bugfixes GB/CH Export-Reihengeschäft (3P)
- buildGBExportResult: computeTaxCH → computeTaxGB (neue Funktion mit UK-spezifischen Texten)
- computeTaxGB: badge-export statt badge-ig → SAP-Treatment korrekt auf 'export' gemapped
- buildDeliveryBox SAP-Ableitung: badge-export → treatment='export' → A0 statt AF
- Delivery-Titel: "Ausfuhr, Ware grenzüberschreitend" statt "IG-Lieferung" bei Export
- buildCHExportResult + buildGBExportResult: SVG-Diagramm + buildKurzbeschreibung + Delivery-Boxen
- computeTaxCH erweitert: domestic-l1, domestic-l2-ch

### Bugfixes 2P (EPROHA AT-Lager)
- AT→GB: eigener Drittland-Zweig (war ig. Lieferung), DAP/DDP, ATLAS, UK VAT/HMRC
- SAP AT→GB: A0 (Ausfuhr) statt AF (ig. Lieferung)
- Zoll GB (Einfuhr) entfernt — nicht EPROHA-relevant
- TCA/REX nur noch im Experten-Modus

### Vergleich-Tab (P1)
- Neuer Tab ⚖ Vergleich nach Berechnung (3P, dep≠dest)
- 3 Spalten (Supplier/Middle/Customer), 5 Dimensionen
- Modal-Wechsel, hideVergleichTab() in alle 6 Early-Returns

### P0 Fix: analyzeLohn() Inland
- sup===con → reiner Inland-Pfad, kein RC, kein ig. Erwerb

---

## v4.0 · 24.03.2026 — Session 8

- Kurzbeschreibung als Primary Output, SAP+UID pro Lieferung
- P0 resting-buyer-no-uid (4 Optionen)
- Inlandslieferung Diagramm, noMoving SVG
- Mobile komplett, Header Overflow, Tabs 6→4
- BMF-Pill, Keyboard Nav WCAG 2.2 AA
- Tests: 33 Smoke ✅ · 13 Render ✅ · 8 Output ✅
