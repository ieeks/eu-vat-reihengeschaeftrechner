# Reverse Charge — Länderspezifische Regeln

## _checkRCBlock(pos, ctx, iAmTheSeller)
Prüft ob RC im Land `pos` blockiert oder speziell geregelt ist.
Return: `{ blocked, reason, rcEligible, rcNote }`

## 7 Länder-Checks mit Rechtsgrundlage

### BE — Art. 51 §2 5° WBTW
```js
pos==='BE' && vatIds['BE'] && iAmTheSeller && !establishments.includes('BE')
```
→ `blocked:true` — Direktregistrierung ohne Betriebsstätte reicht nicht.
EPDE hat BE-UID aber keine BE-Betriebsstätte → RC dauerhaft blockiert.

### PL — Art. 17 Abs. 1 Nr. 5 ustawa o VAT
```js
pos==='PL' && vatIds['PL'] && iAmTheSeller
```
→ `blocked:true` — PL-registrierter Lieferant muss PL-MwSt ausweisen.

### CZ — § 92a ZDPH
Gleiche Logik wie PL. RC nur für bestimmte Warenkategorien (VO 361/2014).

### SI — čl. 76 Abs. 3 ZDDV-1
SI-registrierter Lieferant → SI-MwSt ausweisen, kein RC.

### LV — Art. 141 PVN likums
LV-registrierter Lieferant → PVN ausweisen, kein RC.

### EE — KMSS § 41¹
EE-registrierter Lieferant → KM ausweisen, kein RC.

### IT — Art. 17 Abs. 2 DPR 633/1972 (inversione contabile)
**Umgekehrte Logik**:
```js
if (vatIds['IT']) → blocked:true (Lieferant IT-registriert → IVA ausweisen)
else → { blocked:false, rcEligible:true, rcNote:... }
```
Keine IT-UID = RC möglich, keine Registrierungspflicht für Lieferant.

### DE — § 13b UStG
```js
const deReg = pos === 'DE' && hasVat('DE') && iAmTheSeller;
```
`deReg`-Check in `_checkRCBlock()`: DE-UID + Lieferant → `blocked:true`.
DE-UID + Warenlieferung → 19% MwSt, RC nur bei Werklieferungen (§ 13b Abs. 2 Nr. 1).

## Return-Objekte
| Feld | Typ | Bedeutung |
|---|---|---|
| `blocked` | boolean | RC nicht anwendbar, lokale MwSt ausweisen |
| `reason` | string | Begründung mit Paragraf und MwSt-Satz |
| `rcEligible` | boolean | RC positiv möglich (IT inversione contabile) |
| `rcNote` | string | Hinweistext bei positivem RC |
