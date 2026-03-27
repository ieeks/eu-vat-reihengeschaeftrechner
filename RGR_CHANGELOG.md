# RGR Changelog — Reihengeschäftsrechner

---

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
