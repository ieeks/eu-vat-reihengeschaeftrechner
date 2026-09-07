# Art. 141 lit. a — Registrierung im Bestimmungsland (Länderübersicht)

**Leitfrage:** Blockiert eine bloße USt-Registrierung **ohne Niederlassung** im
Bestimmungsland die Dreiecksgeschäfts-Vereinfachung?

Diese Datei ist die Landkarte hinter der bewussten Abweichung **D1** in
[`rechtskonformitaet.md`](../../rechtskonformitaet.md) — und zugleich der
**Fragenkatalog** für lokale Berater. Sie enthält **keine Steuerlogik** und ändert
nichts am Code: `_detectTriangle3()` / `_detectTriangle4()` blocken weiterhin bei
vorhandener `vatIds[dest]`.

## Geltungsbereich

Nur die **8 Länder, in denen EPDE/EPROHA eine UID ohne Betriebsstätte halten** —
dort und nur dort greift die D1-Policy. AT ist als Referenzauslegung mitgeführt,
ist aber kein Anwendungsfall (EPROHA ist in AT ansässig).

| Gesellschaft | Sitz (`establishments`) | UID ohne Niederlassung |
|---|---|---|
| EPDE | DE | SI · LV · EE · NL · BE · CZ · PL |
| EPROHA | AT | DE (CH = Drittland, nicht einschlägig) |

## ⚠️ Drei Fragen, die gern verwechselt werden

| # | Frage | Fundstelle |
|---|---|---|
| 1 | **B** im Bestimmungsland registriert → Dreieck blockiert? | **diese Datei** |
| 2 | Inlands-RC trotz Direktregistrierung des Lieferanten (Art. 194)? | [`rules/rc_country_rules.md`](../rules/rc_country_rules.md) |
| 3 | Muss **C** im Bestimmungsland *ansässig* sein (NL: „gevestigd")? | `rechtskonformitaet.md` § D2 |

Die vorhandene Ländertabelle in `CLAUDE-vat-knowledge.md` („Regel 4") beantwortet
**Frage 2**, nicht Frage 1. Sie darf für diese Datei **nicht** als Vorarbeit
verbucht werden.

## EU-Ebene — der gemeinsame Ausgangspunkt

- **Wortlaut Art. 141 lit. a MwStSystRL:** Erwerb durch einen „**nicht in diesem
  Mitgliedstaat niedergelassenen**, jedoch in einem anderen Mitgliedstaat für
  Mehrwertsteuerzwecke erfassten Steuerpflichtigen". Der Text stellt auf
  **Niederlassung** ab, nicht auf Registrierung.
- **Explanatory Notes Quick Fixes 2020, Beispiel 8 (S. 66):** der mittlere
  Unternehmer ist in zwei MS registriert — die Vereinfachung gilt dennoch.
  Nicht bindend, aber Kommissionsauffassung.
- **EuGH C-580/16 „Firma Hans Bühler KG" (19.04.2018):** betrifft die Registrierung
  im **Abgangs**mitgliedstaat (lit. c), nicht im Bestimmungsland. Kernaussage,
  die hierher übertragen wird: maßgeblich ist die für den konkreten Erwerb
  **verwendete** UID, nicht der bloße Besitz weiterer UIDs. Zweck des Art. 141
  laut Gerichtshof: dem mittleren Unternehmer die Registrierung im Bestimmungsland
  **ersparen**.
- **Kein EuGH-Urteil direkt zur Bestimmungsland-Registrierung** (Stand 09/2026).
  Die einzige einschlägige Höchstgerichtsentscheidung ist national (AT, s. u.)
  und bindet ausschließlich Österreich.

**Zweites, unabhängiges Tor — gilt in *jedem* Land:** Selbst wo die Registrierung
unschädlich ist, muss gegenüber Lieferant **und** Kunde **dieselbe** UID verwendet
werden, erteilt von einem MS, der weder Abgangs- noch Bestimmungsland ist
(Art. 141 lit. c; DE: § 25b Abs. 2 Nr. 2 UStG). Die Bestimmungsland-UID auch nur
gegenüber einer Seite zu verwenden, kippt den Fall in jeder Auslegung.

## Quellenqualität

| Stufe | Bedeutung |
|---|---|
| **A** | Primärquelle (Gesetzestext / Judikatur / verbindliche Auskunft) im Original geprüft |
| **B** | Sekundärliteratur oder Verwaltungsanweisung, Primärtext nicht selbst eingesehen |
| **C** | Ungeprüft / nur interne Annahme — **nicht als Rechtsauskunft verwenden** |

## Matrix

| Land | Nationale Norm (Art.-141-Umsetzung) | Wortlaut | Verwaltungspraxis / Judikatur | Blockt bloße Registrierung? | Q |
|---|---|---|---|---|---|
| **DE** (EPROHA) | § 25b Abs. 2 Nr. 2 UStG | „nicht **ansässig**" | — | **nein** | **B** |
| **SI** (EPDE) | ZDDV-1 — Artikel ⟶ offen | ⟶ offen | Steuerberatung 2024: SI-Registrierung ⇒ mit SI-MwSt fakturieren | **ja** (angenommen) | **C** |
| **NL** (EPDE) | Art. 37c Wet OB 1968 | ⟶ offen *für lit. a* | Belastingdienst richtlinienkonform-mild (belegt nur für Bedingung zu **C**) | ⟶ offen | **C** |
| **BE** (EPDE) | ⟶ offen | ⟶ offen | ⟶ offen | ⟶ offen | **C** |
| **CZ** (EPDE) | ⟶ offen | ⟶ offen | ⟶ offen | ⟶ offen | **C** |
| **PL** (EPDE) | ⟶ offen | ⟶ offen | ⟶ offen | ⟶ offen | **C** |
| **LV** (EPDE) | ⟶ offen | ⟶ offen | ⟶ offen | ⟶ offen | **C** |
| **EE** (EPDE) | ⟶ offen | ⟶ offen | ⟶ offen | ⟶ offen | **C** |
| *AT (Referenz)* | Art. 25 UStG 1994 | ansässig | VwGH Ro 2020/15/0003; UStR Rz 4150 | **nein** | **B** |

## Länderdetails

### DE — § 25b Abs. 2 Nr. 2 UStG · Q=B
Verlangt, dass der erste Abnehmer im Mitgliedstaat des Beförderungsendes „nicht
**ansässig**" ist, und dass er gegenüber erstem Lieferer und letztem Abnehmer
dieselbe UID verwendet, die ihm von einem anderen MS als dem des Beginns oder
Endes der Beförderung erteilt wurde. Eine Registrierung im Bestimmungsland ist
danach **unschädlich**.
**Relevanz:** EPROHA mit DE-UID; EPDE-Ausgangsseite in jeder Dreieckskette.
**Offen:** Primärtext nicht selbst eingesehen (egress-blockiert, 07.09.2026) —
nur über Sekundärquellen bestätigt. Für Q=A: § 25b UStG + Abschn. 25b.1 UStAE
im Original nachziehen.

### SI — Q=C · **derzeit der teuerste Fall**
Die interne Steuerberatung (2024) hat bestätigt, dass die SI-Registrierung von
EPDE dazu führt, dass mit slowenischer MwSt fakturiert werden muss. Ob diese
Aussage eine ausdrückliche Analyse von Art. 141 lit. a war oder aus der
Registrierung heraus verallgemeinert wurde, ist **nicht dokumentiert**.
**Offen:** (1) einschlägiger ZDDV-1-Artikel; (2) Wortlaut ansässig vs. erfasst;
(3) FURS-Praxis; (4) ob eine verbindliche Auskunft eingeholt werden kann.
**Wirtschaftliche Relevanz:** hoch — 22 % Vorfinanzierung bei jedem Strom mit
SI als Bestimmungsland. Ein Inlands-RC steht nicht zur Verfügung
(čl. 76 ZDDV-1, s. `rules/rc_country_rules.md`), die Umstellung auf ein Dreieck
ist also der einzige Hebel — neben der Aufgabe der SI-Registrierung.

### NL — Art. 37c Wet OB 1968 · Q=C für diese Frage
`nl/wet_ob_nl_reihengeschaeft.md` ist gegen Primärquellen verifiziert, betrifft
aber die **Ansässigkeit von C** (Art. 37c onderdeel b i.V.m. Art. 12 lid 3), nicht
die Registrierung von **B**. Die dort belegte milde Belastingdienst-Praxis lässt
sich **nicht** ohne Weiteres auf lit. a übertragen.
**Offen:** Umsetzung von Art. 141 lit. a im Wet OB und die Praxis dazu.

### BE · CZ · PL · LV · EE — Q=C, vollständig offen
Für diese fünf Länder existiert im Repo **keine** Aussage zu Art. 141 lit. a.
Die vorhandenen Einträge (Art. 51 §2 5° WBTW, § 92a ZDPH, Art. 17 Abs. 1 Nr. 5
ustawa o VAT, Art. 141 PVN likums, KMSS § 41¹) betreffen ausschließlich das
Inlands-RC (Frage 2 oben) und sagen nichts über die Dreiecksvereinfachung.

### AT — Referenz, bindet nur Österreich
**VwGH 15.12.2021, Ro 2020/15/0003:** eine Registrierung im Bestimmungsland ohne
Sitz/Betriebsstätte ist unschädlich, solange für den konkreten Erwerb die UID
eines anderen MS verwendet wird; UStR Rz 4150 wurde angepasst.
**Offen:** Datum in der Literatur teils mit 17.12.2021 angegeben — am Original
(RIS) abgleichen.

## Fragenkatalog für lokale Berater

Pro offenem Land wortgleich stellen, damit die Antworten vergleichbar bleiben:

1. Wie setzt das nationale Recht Art. 141 lit. a um — „**nicht ansässig**" oder
   „nicht für MwSt-Zwecke **erfasst**"? Bitte Norm mit Artikel-/Paragrafenangabe.
2. Ist die Vereinfachung anwendbar, wenn der mittlere Unternehmer im
   Bestimmungsland **registriert, aber nicht ansässig** ist und für den konkreten
   Umsatz durchgängig die UID eines dritten MS verwendet?
3. Falls nein: stützt sich das auf Gesetzeswortlaut, Verwaltungsanweisung oder
   Prüfungspraxis? Gibt es dazu veröffentlichte Entscheidungen?
4. Gibt es die Möglichkeit einer **verbindlichen Auskunft**, und mit welcher
   Bearbeitungsdauer?
5. Wie ist die Rechtsfolge bei Nichtanerkennung — nur Nachversteuerung im
   Bestimmungsland, oder zusätzlich Erwerbsbesteuerung nach Art. 41 MwStSystRL
   (DE: § 3d Satz 2 UStG) ohne Vorsteuerabzug?

## Was das für das Tool bedeutet

**Nichts — vorerst.** D1 bleibt: solange eine Zeile auf Q=C steht, ist die
konservative Blockade die compliance-sichere Wahl. Eine Lockerung kommt
frühestens infrage, wenn eine Länderzeile **Q=A** *und* „blockt: nein" trägt —
und dann pro Land, nicht global. Der technische Revisionspfad (Umstellung von
`vatIds[dest]` auf `establishments.includes(dest)`) ist in
[`rules/triangle_conditions.md`](../rules/triangle_conditions.md) beschrieben und
setzt eine erneute steuerrechtliche Freigabe voraus.

Offener UI-Punkt dazu: **VAT-H03** in `RGR_TODO.md` — die Oberfläche formuliert die
interne Policy derzeit als zwingendes Gesetz („Art. 141 lit. a → Vereinfachung
blockiert"), obwohl sie in mindestens zwei der neun Zeilen (DE, AT) nachweislich
nicht der Rechtslage entspricht.

---

**Quellen / Stand 07.09.2026**
- Art. 141 MwStSystRL (RL 2006/112/EG) — Wortlaut aus Sekundärquellen, Primärtext
  in dieser Session nicht abrufbar (eur-lex egress-blockiert)
- § 25b UStG — [gesetze-im-internet.de](https://www.gesetze-im-internet.de/ustg_1980/__25b.html) ·
  [dejure.org](https://dejure.org/gesetze/UStG/25b.html) (über Sekundärquellen bestätigt)
- EuGH 19.04.2018, C-580/16 „Firma Hans Bühler KG"
- VwGH 15.12.2021, Ro 2020/15/0003 —
  [amtliche Entscheidungsübersicht](https://www.vwgh.gv.at/rechtsprechung/aktuelle_entscheidungen/2022/ro_2020150003.html)
- Explanatory Notes zu den Quick Fixes 2020, Beispiel 8, S. 66
- Interne Steuerberatung 2024 (SI), dokumentiert in `rechtskonformitaet.md` § D1
