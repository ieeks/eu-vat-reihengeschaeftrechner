# Art. 17 MwStSystRL — Verbringen eigener Ware & Lohnveredelung

> Quelle: RL 2006/112/EG Art. 17 i.d.F. 18.07.2025 (Abs. 2 i.d.F. der RL v. 13.7.2010,
> ABl EU Nr. L 189 S. 1, mit Wirkung v. 11.8.2010). Normtext zitiert.
> Pflichtlektüre vor Änderungen an `computeLohn()` / Modus 5.

## Systematik in drei Absätzen

| Absatz | Inhalt |
|---|---|
| **Abs. 1** | Grundregel — das Verbringen eigener Ware in einen anderen MS ist einer **Lieferung gegen Entgelt gleichgestellt** (fiktive ig. Lieferung im Abgangsland + fiktiver ig. Erwerb im Bestimmungsland). |
| **Abs. 2** | Ausnahmekatalog lit. a–h — diese Bewegungen gelten **nicht** als Verbringen. |
| **Abs. 3** | **Zeitpunktregel** — fällt eine Voraussetzung des Abs. 2 später weg, gilt die Verbringung als **zu diesem Zeitpunkt** erfolgt, nicht rückwirkend. |

### Abs. 1 — Wortlaut
> „Einer Lieferung von Gegenständen gegen Entgelt gleichgestellt ist die von einem
> Steuerpflichtigen vorgenommene Verbringung eines Gegenstands seines Unternehmens in
> einen anderen Mitgliedstaat."

### Abs. 2 lit. f — die Lohnveredelungs-Ausnahme (Kernnorm für Modus 5)
> „Erbringung einer Dienstleistung an den Steuerpflichtigen, die in der **Begutachtung von
> oder Arbeiten an** diesem Gegenstand besteht, die im Gebiet des Mitgliedstaats der
> Beendigung der Versendung oder Beförderung des Gegenstands tatsächlich ausgeführt
> werden, **sofern der Gegenstand nach der Begutachtung oder Bearbeitung wieder an den
> Steuerpflichtigen in dem Mitgliedstaat zurückgesandt wird, von dem aus er ursprünglich
> versandt oder befördert worden war**"

**Drei Tatbestandsmerkmale**, alle drei müssen erfüllt sein:

1. Dienstleistung an der Ware — **Begutachtung ODER Arbeiten** (Prüfung/Analyse genügt,
   es muss keine Bearbeitung im engeren Sinn sein).
2. Tatsächliche Ausführung im MS der Beendigung der Versendung.
3. **Rücksendung in genau den MS, aus dem die Ware ursprünglich versandt wurde.**

> ⚠️ Merkmal 3 ist der Grund, warum lit. f bei `sup === con` **nicht** greifen kann:
> Gab es nie eine Versendung aus dem Heimatland, existiert kein Mitgliedstaat, in den
> „zurückgesandt" werden könnte. Der spätere Transport ins eigene Lager ist dann die
> **erste** grenzüberschreitende Bewegung → Verbringen nach Abs. 1.

### Abs. 3 — Wortlaut
> „Liegt eine der Voraussetzungen für die Inanspruchnahme des Absatzes 2 nicht mehr vor,
> gilt der Gegenstand als in einen anderen Mitgliedstaat verbracht. In diesem Fall gilt
> die Verbringung als **zu dem Zeitpunkt erfolgt, zu dem die betreffende Voraussetzung
> nicht mehr vorliegt**."

Praxisfolge: Ware geht zur Veredelung ins Ausland (Rückkehr geplant → lit. f, keine
Meldung). Wird später entschieden, sie ab dem Veredelungsland zu verkaufen, entsteht die
Verbringung **in diesem Moment** — maßgeblich für UVA-/ZM-Periode. Keine Rückwirkung auf
den ursprünglichen Transport, keine Korrektur alter Meldungen.

### Weitere Ausnahmen des Abs. 2 (nicht in Modus 5 modelliert)
| lit. | Fall |
|---|---|
| a | Fernverkauf, Art. 33 |
| b | Lieferung mit Installation/Montage, Art. 36 |
| c | Lieferung an Bord Schiff/Flugzeug/Bahn, Art. 37 |
| d | Gas/Elektrizität/Wärme/Kälte über Netze, Art. 38–39 |
| **e** | Lieferung im Gebiet des MS unter den Bedingungen der **Art. 138**, 146, 147, 148, 151, 152 |
| g | Vorübergehende Verwendung zur Erbringung von Dienstleistungen |
| h | Vorübergehende Verwendung, max. **24 Monate**, Analogie zur vorübergehenden Einfuhr |

> **lit. e** ist die einzige praktisch relevante Alternativargumentation zur Behandlung im
> Rechner — siehe `rechtskonformitaet.md` § D3 (bewusst konservative Auslegung).

---

## Mapping auf den Code (`computeLohn()` in `docs/assets/scripts/app.js`)

Das Feld `verbringen` bildet Abs. 1/2 ab:

```js
verbringen = { from, to, meldepflichtig, reason } | null
```

| Konstellation | `verbringen` | Norm |
|---|---|---|
| `supIsHome && homeHandover`, Ware kommt zurück | `{home→con, meldepflichtig:false, reason:null}` | Abs. 2 lit. f greift |
| dieselbe, Ware bleibt im Veredelungsland | `{home→con, meldepflichtig:true, reason:'no-return'}` | lit. f entfällt → Abs. 1, **Zeitpunkt nach Abs. 3** |
| `!lvDirect` (Ware läuft über mich), analog | wie oben | wie oben |
| `inland` (`sup === con`), Ware kommt ins eigene Lager | `{con→home, meldepflichtig:true, reason:'not-dispatched'}` | lit. f **nie** anwendbar (Merkmal 3) → Abs. 1 |
| `lvDirect` + Rückkehr | `null` (Rückbewegung von lit. f gedeckt) | Abs. 2 lit. f |
| `con === myHome` (keine Grenze) | `null` (Guard `from !== to`) | Abs. 1 setzt anderen MS voraus |

**`reason` steuert die Begründung im Output:**
- `'no-return'` → „Ware kommt nicht zurück" + **Zeitpunkthinweis Abs. 3**
- `'not-dispatched'` → „nie aus dem Heimatland versandt" (Abs. 3 **nicht** einschlägig,
  weil Abs. 2 nie in Anspruch genommen wurde — die Verbringung entsteht mit der Bewegung)

## SAP-Kennzeichen des Verbringens
`verbringenSapHint(from, to)` → fiktive ig. Lieferung im Abgangsland (`ic-exempt`,
`seller`) + fiktiver ig. Erwerb im Bestimmungsland (`ic-acquisition`, `buyer`).

| Richtung | Ausgang | Eingang |
|---|---|---|
| AT → DE (EPROHA) | **AF** | **VH** |
| DE → AT (EPROHA) | **DH** | **VE** |

Fehlt für ein Land ein Kennzeichen, wird **keines** ausgegeben (kein erfundener Code) —
stattdessen greift das Registrierungsrisiko (`regRisks`).

## Abgrenzung zur Werkleistung (Art. 44/196)
Art. 17 betrifft **nur die Warenbewegung**. Die Veredelungsleistung selbst ist eine
sonstige Leistung: Leistungsort Art. 44 (Sitz des Empfängers), Reverse Charge nach
Art. 196 **nur bei im Ausland ansässigem Leistenden** → im Code `conIsHome`.
Beide Fragen sind unabhängig voneinander zu beantworten.

## Testfälle
| ID | Fall | Erwartung |
|---|---|---|
| `LV-06` | AT→DE→AT EPROHA, Rückkehr | `verbr: 'AT→DE'` (lit. f) |
| `LV-10` | AT→DE→AT EPROHA, bleibt | `verbr: 'AT→DE!'`, Schritt 3 = DH |
| `LV-14` | DE→DE→AT EPROHA, Rückkehr ins Lager | `verbr: 'DE→AT!'`, Verkauf separat |
| `LV-15` | PL→PL→AT EPROHA, Rückkehr | `verbr: 'PL→AT!'` + PL-Registrierung |
| `LV-16` | DE→DE→AT EPDE (alles Heimat) | `verbr: null` |

Zusätzlich `scripts/test-lohn-tabs.mjs` (15 Konstellationen, DOM-Ebene).
