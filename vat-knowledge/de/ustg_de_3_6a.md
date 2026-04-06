# § 3 Abs. 6a UStG — Quick Fix DE-Umsetzung

## Rechtsgrundlage
§ 3 Abs. 6a UStG setzt Art. 36a MwStSystRL in deutsches Recht um (ab 01.01.2020).

## Satz 4 Nr. 1 (entspricht lit. a)
Zwischenhändler teilt Abgangsland-UID mit, nicht dort ansässig/registriert →
Lieferung an den ZH ist die bewegte Lieferung.
Im Code: `quickFixVariant: 'departure-id'`, `legalBasis` enthält
`'§ 3 Abs. 6a S. 4 Nr. 1 UStG'`.

## Satz 4 Nr. 2 (entspricht lit. b)
Andere UID mitgeteilt → Lieferung ab dem ZH ist die bewegte Lieferung.
Im Code: `quickFixVariant: 'dest-or-other-id'`, `legalBasis` enthält
`'§ 3 Abs. 6a S. 4 Nr. 2 UStG'`.

## § 4 Nr. 1b iVm. § 6a UStG — IG-Lieferung DE
Steuerbefreiung der innergemeinschaftlichen Lieferung.
`natLaw('ig.exempt')` bei `isDE` → `'§ 4 Nr. 1 lit. b iVm. § 6a UStG'`.

## § 13b UStG — Reverse Charge nur Werklieferungen
**Kritisch**: § 13b gilt in DE nur für Werklieferungen und sonstige Leistungen,
NICHT für reine Warenlieferungen (§ 13b Abs. 2 Nr. 1; UStAE Abschn. 13b.1).

## Implementierung — DE-RC-Prüfung
DE-RC-Prüfung liegt in `computeTax()` (Rendering-Layer), nicht in `_checkRCBlock()` (VATEngine).
Engine kennt keinen DE-spezifischen RC-Block.

## COMPANIES['EPDE']
```js
{ home: 'DE', establishments: ['DE'],
  vatIds: { SI, LV, EE, NL, BE, DE, CZ, PL } }
```
8 UID-Registrierungen, aber nur DE als Betriebsstätte — alle anderen sind
Direktregistrierungen (relevant für BE RC-Block, Art. 51 §2 5° WBTW).
