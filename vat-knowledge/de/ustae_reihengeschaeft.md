# UStAE / UStG DE — Reihengeschäft & Dreiecksgeschäft

## Abschn. 3.14 UStAE — Reihengeschäft
Verwaltungsanweisung zur Zuordnung der Warenbewegung nach § 3 Abs. 6a UStG.
Verweist auf Art. 36a MwStSystRL und die Quick-Fix-Regelung ab 2020.
Im Code als Teil der `legalBasis`-Strings in `_applyQuickFix()` (Z. 946 ff.).

## § 25b UStG — Dreiecksgeschäft (DE-Umsetzung Art. 141)
Vereinfachungsregel: B muss sich nicht im Bestimmungsland registrieren.
`natLaw('dreiecks')` bei `isDE` → `'§ 25b UStG / Art. 141 MwStSystRL'` (Z. 1792).

## Abschn. 25b UStAE — Verwaltungsanweisung Dreiecksgeschäft
Erläutert Voraussetzungen und Pflichtangaben der B→C-Rechnung.

## § 14a Abs. 7 UStG — Pflichtangaben B→C Rechnung
Rechnung muss enthalten: Hinweis auf Dreiecksgeschäft + Steuerschuldnerschaft C.
Im Code: `natLaw('dreiecks.rc')` bei `isDE` → `'§ 25b Abs. 2 / § 14a Abs. 7 UStG'`.
`invTriangle(uidCode)` generiert die Pflichtangaben-Checkliste (Z. 3314).

## BFH XI R 35/22
Keine Rückwirkung bei fehlendem RC-Hinweis auf der Rechnung — materieller Mangel.
Bestätigt EuGH C-247/21 Luxury Trust im deutschen Kontext.
Im Code: `luxuryTrustWarning` im Triangle-Return (Z. 1180).

## Implementierung
- `_detectTriangle3()` / `_detectTriangle4()`: Prüfung der 5 Bedingungen
- `invTriangle(uidCode)`: B→C-Rechnungshinweise mit DE-spezifischem Wortlaut
- `buildDreiecks3Result()` (Z. 3282): Rendert Dreiecks-Ergebnis, ZM-Pflicht
  als Hinweis: `'§ 18a Abs. 7 S. 1 Nr. 4 UStG'`
- `RC_WORDING['DE']` (Z. 1843): Pflicht-Wortlaut `„Steuerschuldnerschaft des
  Leistungsempfängers"` — § 14a Abs. 5 UStG, `mandatory: true`
