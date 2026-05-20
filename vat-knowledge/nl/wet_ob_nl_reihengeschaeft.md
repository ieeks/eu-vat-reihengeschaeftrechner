# Wet OB 1968 NL — Reihengeschäft & RC-Sonderfall

> EPDE ist in den Niederlanden direkt registriert (NL-UID **NL827914052B01**),
> **ohne** NL-Betriebsstätte. NL ist der einzige EPDE-Buchungskreis, in dem
> Reverse Charge trotz Direktregistrierung möglich ist (Art. 12 Abs. 3 Wet OB).

---

## Art. 5 Wet OB 1968 — Lieferort
Abs. 1 Bst. a: Lieferort bei Beförderung/Versendung = Ort des Beginns
der Beförderung. Entspricht Art. 32 MwStSystRL.
Im Code: `placeOfSupply = dep` bei `isMoving` (gemeinsame Engine-Logik,
kein NL-Sonderpfad).

## Art. 12 Abs. 3 Wet OB 1968 — Reverse Charge bei Direktregistrierung
**Kern-Sonderfall NL.** Anders als BE/PL/CZ/SI/LV/EE blockiert NL den RC
**nicht**, wenn der Lieferant zwar NL-registriert, aber dort nicht ansässig
ist. Damit kann EPDE eine ruhende Lieferung in NL als RC-Lieferung
fakturieren (0%, „BTW verlegd").

Im Code:
- `_checkRCBlock()` enthält **keinen** NL-Block — RC läuft regulär durch
  (`rules/rc_country_rules.md`)
- `SAP_TAX_MAP['EPDE']['NL']['rc'] = { out:'NC', in:'NI' }` (app.js Zeile 89)
- `SAP_TAX_MAP['EPDE']['NL']['domestic'] = { out:null, in:'NI' }` —
  bewusst kein `out` für lokale Steuer; Fallback in
  `_qcRate()`/`computeTax()` greift auf `rc`-Entry zurück
  (app.js Zeile 11612 ff., Kommentar: „NL: EPDE hat keine Betriebsstätte
  → RC-Pflicht")
- `RC_WORDING['NL']` setzt Pflichttext „BTW verlegd" / „VAT reverse-charged"
  (app.js Zeile 1738) mit Rechtsverweis Art. 12 Abs. 3 Wet OB 1968 /
  Art. 194 MwStSystRL
- Pflichttext-Sprache: Englisch oder Niederländisch akzeptiert

## Art. 37c Wet OB 1968 — Dreiecksgeschäft (NL als Bestimmungsland)
NL-Umsetzung Art. 141 MwStSystRL. Fünf Bedingungen — alle materiell
erforderlich:

| Bed. | Inhalt | Code-Check |
|---|---|---|
| (1) | Zwischenhändler nicht in NL ansässig | `establishments` enthält NL nicht |
| (2) | Direktlieferung an NL-Abnehmer | `s4 === dest === 'NL'` |
| (3) | Ware kommt **nicht** aus dem MS, der dem ZH die NL-UID erteilt hat | `_detectTriangle3()` Zeile 1089: `dest === 'NL' && s1 === 'NL'` → `_noTriangle(...)` |
| (4) | NL-Abnehmer schuldet Steuer per RC (Art. 197) | implizit über `rcCountry: dest` |
| (5) | ZM-Pflicht nach Art. 37a Wet OB erfüllt | wird auf Rechnungs-/Meldepflichten-Ebene gerendert |

**Praxisfolge:** Wenn EPDE die DE-UID nutzt (nicht NL-UID) und Ware aus DE
nach NL geht, ist Bed. (3) eingehalten → Dreiecksgeschäft möglich. Setzt
EPDE die NL-UID, blockiert Art. 141 lit. a die Vereinfachung schon vorher
(`!!vatIds[dest]` in `_detectTriangle3()`).

## Art. 37a Wet OB 1968 — ZM-Pflicht NL
Monatlich, spätestens letzter Tag des Folgemonats. **Materielle Voraussetzung**
der Dreiecksgeschäft-Vereinfachung nach Art. 37c. Längere Frist als z.B.
DE (vierteljährlich möglich). Im Code als Legal-Reference `nl37a` registriert
(app.js Zeile 1946).

## Art. 9 Abs. 1 Wet OB 1968 — Steuersatz
Allgemeiner Satz: **21 %**. Im Code: `COUNTRIES['NL'].std = 21` (Zeile 167).

---

## Implementierung

| Funktion / Konstante | Datei / Zeile | NL-Verhalten |
|---|---|---|
| `SAP_TAX_MAP['EPDE']['NL']` | app.js ~85 | NC/NI (rc) · NP (ic-acq) · NI (domestic-input) · kein ic-exempt-out |
| `_checkRCBlock()` | app.js | **kein** NL-Branch → RC läuft durch |
| `_detectTriangle3()` | app.js ~1085 | Bed. (3) Wet OB als Edge-Case: `dest==='NL' && s1==='NL'` → kein Dreieck |
| `RC_WORDING['NL']` | app.js 1738 | „BTW verlegd" + Art. 12 Abs. 3 Wet OB |
| `LEGAL_REFS.nl37c` / `.nl37a` | app.js 1945/1946 | Legal-Chips für Begründungs-Tab |
| `computeTax()` RC-Fallback | app.js ~11612 | wenn `domestic.out===null` → `rc.out` greift |

## COMPANIES['EPDE']
```js
vatIds: { DE, SI, LV, EE, NL:'NL827914052B01', BE, CZ, PL }
establishments: ['DE']
```
NL ist Direktregistrierung — keine NL-Betriebsstätte, keine fiskale Vertretung
erforderlich (NL erlaubt Direktregistrierung formlos).

---

## Wann greift der NL-Buchungskreis?

```
EPDE-Lieferung mit Lieferort = NL?
  → ruhende Lieferung in NL (L2 in 3P, oder L2/L3 in 4P)
      → Kunde = nl-registrierter Unternehmer?
          → RC anwendbar → SAP NC (out) / NI (in), „BTW verlegd"
      → Kunde nicht NL-registriert / kein RC-Voraussetzung?
          → ⚠️ kein domestic.out im SAP-Map → Fallback rc.out (NC)
            → praktisch: EPDE muss klären ob RC zulässig; B2C wäre
              Tatbestand für lokale Reg.-Pflicht (außerhalb des Tools)
```

**Praxis:** Der NL-Buchungskreis greift fast immer als RC-Variante.
Echte 21%-Inlandslieferung NL aus EPDE-Sicht ist im SAP-Map bewusst
nicht abgebildet (`out:null`), weil EPDE in NL keine Betriebsstätte hat
und der Standardfall RC ist.

## Häufige Konstellationen (EPDE-spezifisch)

| Konstellation | UID | SAP Ausgang | SAP Eingang | Hinweis |
|---|---|---|---|---|
| DE→EPDE→NL, L2 ruhend NL, Dreieck | DE | **DH** (ZM) | — | klassisches Dreiecksgeschäft, NL = RC-Land |
| DE→EPDE→NL, L2 ruhend NL, kein Dreieck | NL | **NC** | — | RC nach Art. 12 Abs. 3 Wet OB |
| FR→EPDE→NL, L2 ruhend NL | DE/NL | **DH** oder **NC** | — | DE-UID → Dreieck; NL-UID → RC, kein Dreieck |
| NL→EPDE→DE, L1 ruhend NL (IG-Erwerb) | NL | — | **NP** | EPDE kauft mit NL-UID ein |
| NL→NL→NL Inlandskette mit EPDE | NL | **NC** | **NI** | Inlands-RC NL |

---

## Praxisbeispiel (verifizierter EPDE-Produktionsfall)

**Konstellation:** `AT → EPDE (NL-UID) → NL-Kunde`, Transport durch AT-Lieferant
(Warenfluss direkt von AT zum NL-Kunden).

```
🇦🇹 AT ──L1──▶ 🇩🇪 DE/EPDE ──L2──▶ 🇳🇱 NL
       Lieferant fährt direkt nach NL
       EPDE tritt mit NL-UID auf
```

**Ablauf:**

| Lieferung | Behandlung | EPDE-Buchung | Pflichttext / Meldung |
|---|---|---|---|
| L1 AT→EPDE | IG-Lieferung AT → NL (0 %) | IG-Erwerb NL · **SAP NP** | AT-Lieferant in AT-ZM (Empfänger: EPDE NL-UID) |
| L2 EPDE→NL-Kunde | RC NL (0 %) Art. 12 Abs. 3 Wet OB | **SAP NC** | „BTW verlegd" + NL-ZM monatlich (Art. 37a Wet OB) |

**Kernpunkt:** Dreiecksgeschäft ist blockiert (Art. 141 lit. a — EPDE hat NL-UID
im Bestimmungsland), trotzdem fällt **kein lokales NL-MwSt-Ausweisen** an, weil
Art. 12 Abs. 3 Wet OB den RC trotz NL-Direktregistrierung erlaubt. Wäre EPDE
in NL ansässig (Betriebsstätte), wäre dieser RC-Weg versperrt und EPDE müsste
21 % NL-MwSt auf der L2-Rechnung ausweisen.

**Alternative UID-Wahl:** Hätte EPDE die DE-UID statt der NL-UID verwendet,
wäre Art. 141 MwStSystRL (Dreiecksgeschäft) anwendbar gewesen — wirtschaftlich
identisches Ergebnis, aber Buchung **DH** statt NC und DE-ZM mit Dreieck-Kennzeichen
statt monatlicher NL-ZM. Die NL-UID-Variante ist administrativ aufwendiger, wird
aber gewählt, wenn der NL-Kunde NL-UID auf der Rechnung erwartet oder EPDE
ohnehin in NL meldet.

Vollständige Tabelle inkl. Belegnachweis: `reference-cases.md` · Fall **C4**.

---

## Abgrenzung zu BE / PL / CZ / SI / LV / EE

Alle 6 anderen EPDE-Direktregistrierungen **blockieren** RC, sobald EPDE
dort registriert ist (`_checkRCBlock()` greift). NL ist die einzige
Ausnahme. Praktische Folge: EPDE muss in BE/PL/CZ/SI/LV/EE den lokalen
Steuersatz ausweisen (BS/A4/AE/CB/LS/ES), in NL hingegen RC mit 0% (NC).

Details: `rules/rc_country_rules.md` · `de/epde-buchungskreise.md`

---

*Verwandte Dateien:* `rules/rc_country_rules.md` · `rules/uid_usage_rules.md` ·
`de/epde-buchungskreise.md` · `eu/art141_triangle.md` · `eu/art138_mwstrl.md`
*Code:* `_checkRCBlock()` · `_detectTriangle3()` · `SAP_TAX_MAP['EPDE']['NL']` ·
`RC_WORDING['NL']` in `docs/assets/scripts/app.js`
