# Art. 138 MwStSystRL — Steuerbefreiung der IG-Lieferung

## Rechtsgrundlage
Art. 138 Abs. 1 MwStSystRL: Steuerbefreiung für Lieferungen an UID-registrierten
Erwerber, wenn Ware in anderen EU-MS gelangt. Seit Quick Fix 2020 materiell-rechtliche
Voraussetzung (nicht mehr nur formell).

## Voraussetzungen
1. Lieferant und Erwerber in verschiedenen MS umsatzsteuerlich registriert
2. Erwerber teilt gültige UID eines anderen MS mit (VIES-Prüfung)
3. Ware gelangt physisch in anderen MS (Belegnachweis)
4. Zusammenfassende Meldung (ZM) — Art. 262 MwStSystRL

## Art. 45a DVO 282/2011 — Vermutungsregel Belegnachweis
Zwei nicht-widersprüchliche Nachweise (CMR, Versicherung, Bankbeleg etc.)
begründen Vermutung der Beförderung. Widerlegbar durch Finanzverwaltung.

## Implementierung
- `classifySupplies()` (Z. 1015): `isICMoving`-Branch setzt `vatTreatment = 'ic-exempt'`
- Bedingung: `isMoving && isCrossEU` (Z. 1034) — beide Länder EU, dep ≠ dest
- `invIG(mc, acquisitionCountry, depCountry)` (Z. 1809): Rechnungspflichtangaben
  für steuerfreie IG-Lieferung — UID beider Parteien, Befreiungshinweis, Belegnachweis

## Variablen in classifySupplies
| Variable | Berechnung |
|---|---|
| `isCrossEU` | `dep !== dest && !isNonEU(dep) && !isNonEU(dest)` |
| `isICMoving` | `isMoving && isCrossEU` |
| `vatTreatment` | `'ic-exempt'` bei IG, `'export'` bei Drittland |

## Belegnachweis-Hinweise
- `invIG()` liefert: Lieferanten-UID, Erwerber-UID (Pflicht!), Befreiungshinweis,
  Rechtsgrundlage via `natLaw('ig.exempt')`, Gelangensbestätigung/CMR via `natLaw('proof')`
- Kein gesetzlich fixierter Wortlaut — „sinngemäß ausreichend" (Z. 1817)
