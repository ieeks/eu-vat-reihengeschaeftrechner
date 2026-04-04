# PDF × Tool Abgleich — Reihengeschäftsrechner v4.2

Stand: 04.04.2026  
Quellen:
- Österreichisches BMF-Schulungsunterlagen August 2024 (PDF)
- EU-Mehrwertsteuerrichtlinie 2006/112/EG (Primärrecht, EU.html)
- EU-Kommission Explanatory Notes on 2020 Quick Fixes (DG TAXUD, Dezember 2019, 85 S.) — nicht rechtsverbindlich, aber maßgebliche Auslegungshilfe

---

## ✅ Korrekt implementiert

| Punkt | Tool | Rechtsgrundlage |
|---|---|---|
| Quick-Fix Standardregel: Zwischenhändler transportiert, gibt keine dep-UID | L1 bewegte Lieferung (Lieferung AN den Zwischenhändler) | Art. 36a Abs. 1 RL 2006/112/EG / § 3 Abs. 15 Z1 lit. c UStG |
| Quick-Fix Ausnahme: dep-UID mitgeteilt | L2 bewegte Lieferung (Lieferung DURCH den Zwischenhändler) | Art. 36a Abs. 2 RL 2006/112/EG |
| Quick-Fix: Ansässigkeits-/Ziel-/Sonstige-UID (nicht dep) | L2 bewegte Lieferung — Standardregel bleibt | Art. 36a Abs. 1 RL 2006/112/EG |
| Erster Lieferer / letzter Abnehmer können nicht Zwischenhändler sein | korrekt — Art. 36a gilt nur für mittlere Partei | Art. 36a Abs. 3 RL 2006/112/EG |
| Ruhende Lieferung vor Transport → Lieferort = Abgangsland | korrekt | Art. 31/36 RL 2006/112/EG |
| Ruhende Lieferung nach Transport → Lieferort = Bestimmungsland | korrekt | Art. 31/36 RL 2006/112/EG |
| IG-Erwerbsort = Bestimmungsland (Ankunft der Ware) | korrekt | Art. 40 RL 2006/112/EG |
| IG-Lieferung steuerfrei: Empfänger muss UID in anderem MS haben und mitteilen | korrekt | Art. 138 Abs. 1 lit. b RL 2006/112/EG |
| Abgangsland-UID des Empfängers → Steuerbefreiung verweigert | korrekt — dep-UID des Käufers blockiert Art. 138 | Art. 138 Abs. 1 lit. b / Quick Fixes Exp. Notes S. 71 |
| Art. 41 Doppelerwerb: dep-UID ausgenommen | **korrekt** — dep-UID löst kein ICA aus (Art. 36a Abs. 2 greift), daher kein Art. 41-Fall | Art. 41 / Quick Fixes Exp. Notes S. 63 |
| Art. 41: nur bei „sonstiger" UID (weder dep noch dest) | korrekt — Tool warnt nur bei `usedUidCountry !== dep && !== dest` | Art. 41 RL 2006/112/EG / Exp. Notes S. 63 |
| Transport durch Endabnehmer → kein Dreiecksgeschäft | `_detectTriangle3` line 1187 | Art. 141 lit. e RL 2006/112/EG |
| Dreiecksgeschäft-Bedingungen a–e vollständig geprüft | alle 5 conditions | Art. 141 lit. a–e RL 2006/112/EG |
| RC-Schuldnerschaft beim Käufer (Art. 197) | korrekt | Art. 197 RL 2006/112/EG |
| ZM-Pflicht Dreiecksgeschäft-Kennzeichnung | condition e (met:false als Warnung) | § 18a Abs. 7 UStG / Art. 42 + 265 RL |
| EuGH C-247/21 Luxury Trust: Pflichtangaben materiell | Warnung in Output vorhanden | EuGH C-247/21 |
| EuGH C-430/09 Euro Tyre: UID-Zeitpunkt entscheidend | Hinweis in Quick-Fix-Output | EuGH C-430/09 |
| EuGH C-628/16 Kreuzmayr: mitgeteilte UID entscheidet | Hinweis in Quick-Fix-Output | EuGH C-628/16 |

---

## ❌ Fehler

### F1 — Dreiecksgeschäft: Registrierung ≠ Niederlassung (VATEngine, nicht anfassbar)

**Fundstelle:** `_detectTriangle3`, Zeile 1159
```js
if (!!vatIds[dest]) return _noTriangle(
  'Art. 141 lit. a: B hat USt-ID in ' + dest + ' → Vereinfachung blockiert.',
  'blocked-by-dest-vat'
);
```

**Was das Tool macht:** Blockiert das Dreiecksgeschäft, sobald B *irgendeine* UID im Bestimmungsland hat.

**Was das Gesetz sagt:** Bedingung ist ausschließlich, dass B **nicht ansässig** (kein Sitz, keine feste Niederlassung) im Bestimmungsland ist. Eine reine Registrierung ohne Niederlassung ist nicht schädlich.

**Belege — vierfach bestätigt:**
1. Art. 141 lit. a RL 2006/112/EG Wortlaut: „nicht in diesem Mitgliedstaat **niedergelassen**"
2. VwGH 15.12.2021, Ro 2020/15/0003: Registrierung allein blockiert nicht
3. Rz 4150 UStR
4. Quick Fixes Exp. Notes Beispiel 8 (S. 66): D ist in MS4 **und** MS5 registriert — Dreiecksgeschäft gilt dennoch, weil D „not established in MS5"

**Auswirkung auf EPDE:** EPDE hat UIDs in SI, LV, EE, NL, BE, CZ, PL ohne dortige Niederlassung → Dreiecksgeschäfte nach diesen 7 Ländern fachlich falsch blockiert.

**Status:** Nicht behebbar (VATEngine IIFE).
**Workaround:** Im Output-Layer bei `blocked-by-dest-vat` Hinweis einblenden: „Automatisch blockiert — fachlich nur schädlich bei Niederlassung (VwGH 15.12.2021, Ro 2020/15/0003)."

---

### F2 — ~~Art. 41 dep-UID-Ausschluss~~ → KORREKTUR: Tool ist richtig

**Ursprünglicher Befund** (aus BMF-PDF / Rz 3777): dep-UID-Ausschluss sei falsch.

**Korrektur nach Quick Fixes Exp. Notes (S. 63):**
Wenn der Zwischenhändler die dep-UID mitteilt, greift Art. 36a Abs. 2 → die Lieferung AN ihn wird zur Inlandslieferung, er tätigt selbst die IG-Lieferung. Es findet kein IG-Erwerb durch ihn statt → Art. 41 hat keinen Anknüpfungspunkt. Die dep-UID aus Art. 41 auszunehmen ist daher **korrekt**.

Widerspruch zu Rz 3777 UStR möglich — österreichische Rz könnte einen anderen Sachverhalt meinen oder eine konservativere nationale Auslegung sein. Vorerst kein Handlungsbedarf.

**Code-Zeile 1281:** `usedUidCountry !== dep && usedUidCountry !== dest` → **korrekt**.

---

### F3 — Quick-Fix: manuell gewählte dep-UID ohne tatsächliche Registrierung (VATEngine, nicht anfassbar)

**Fundstelle:** `_applyQuickFix`, Zeilen 936–952
```js
const overrideIsDepUid = uidOverride === dep && !intermediaryResidentInDep && !hasDepVat;
if (overrideIsDepUid) {
  const movingIndex = Math.max(0, chainIndex - 1); // → L1 moving
```

**Problem:** Wenn User manuell eine dep-Land-UID wählt, aber die Partei dort weder ansässig noch registriert ist (`!hasDepVat`), ordnet das Tool L1 als bewegte Lieferung zu. Art. 36a Abs. 2 kennt keine solche Ausnahme — mitgeteilte dep-UID → immer L2 moving.

**Quick Fixes Exp. Notes (S. 62–63):** Communication der dep-UID kann sogar informal erfolgen; keine Voraussetzung einer tatsächlichen Registrierung. Sobald mitgeteilt → Derogation greift → L2 moving.

**Auswirkung:** Randszenario (nur bei manueller UID-Wahl ohne tatsächliche dep-Registrierung im COMPANIES-Datensatz).

**Status:** Nicht behebbar (VATEngine IIFE).

---

## ⚠️ Grenzfälle / Verbesserungspotenzial

### G1 — Art. 42 Entlastungsbeweis: ZM-Inhalt nicht spezifiziert

Das Tool warnt bei Art. 41-Risiko (Doppelerwerb), zeigt aber nicht, was konkret in die ZM gehört um Art. 42 zu erfüllen:

> Art. 42 lit. b RL / Quick Fixes Exp. Notes S. 67–68: In die ZM muss die **Folgelieferung an den dest-MS-Abnehmer inkl. dessen dest-MS-UID** eingetragen werden. Fehlt dieser Eintrag, bleibt die Art. 41-Besteuerung in der Ansässigkeits-MS bestehen.

**Priorität:** P2

### G2 — Luxury Trust: kein separater P0-Block

EuGH C-247/21: Fehlende Dreiecksgeschäft-Pflichtangaben in der Rechnung sind ein materieller Mangel (nicht heilbar). Die Warnung ist im Output vorhanden, aber kein eigenständiger Warnblock bei aktivem Dreiecksgeschäft.

**Priorität:** P1

### G3 — Art. 138 Abs. 1a: ZM-Fehler kann Steuerbefreiung rückwirkend entziehen

Seit 2020 kann eine fehlerhafte oder fehlende ZM die IG-Lieferungsbefreiung rückwirkend vernichten (Art. 138 Abs. 1a), außer der Lieferant kann den Fehler gegenüber den Behörden rechtfertigen (z.B. einmalige Versäumnis, im Folgemonat korrigiert). Das Tool zeigt die ZM-Pflicht als Warnung, weist aber nicht auf das Befreiungsrisiko bei ZM-Fehler hin.

**Quick Fixes Exp. Notes S. 74–75:** Akzeptable Ausnahmen: einmalige Auslassung + spätere Korrektur, Umstrukturierung (vorübergehend falsche UID).

**Priorität:** P2

### G4 — Transportnachweis (Art. 45a IR): nicht modelliert

Das Tool prüft nicht, ob ausreichende Transportnachweise vorliegen (CMR, Frachtbrief, Versicherung, Bankbelege etc.). Das ist bewusst außerhalb des Scope — Compliance-Checkliste, kein Berechnungsproblem.

**Priorität:** Backlog / P3

### G5 — Kettenunterbrechung bei Lagereinlagerung ohne bestehenden Weiterverkaufsvertrag

Quick Fixes Exp. Notes S. 57–59: Wenn Ware in einem Lager zwischengelagert wird und zum Zeitpunkt der Einlagerung noch kein Vertrag mit dem nächsten Käufer besteht, liegt eine Kettenunterbrechung vor → zwei separate IG-Transporte. Das Tool modelliert dies nicht (keine Warehouse-Break-Erkennung).

**Priorität:** P3

---

## Offene Entscheidungen

1. **F1 Workaround einbauen?** Hinweis bei `blocked-by-dest-vat` im Output-Layer → (ja/nein)
2. **F1 langfristig:** VATEngine braucht `establishments`-Datenmodell pro Partei (nicht nur für B), um Niederlassung von Registrierung zu trennen
3. **F3:** Praktische Relevanz mit konkretem Szenario testen
4. **G2:** Luxury-Trust-Warnblock bei aktivem Dreiecksgeschäft ergänzen?
