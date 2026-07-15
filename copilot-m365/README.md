# M365-Copilot-Agenten — Reihengeschäft-Assistent (EPROHA & EPDE)

Dieser Ordner enthält alles, um in **Microsoft 365 Copilot** zwei getrennte
Agenten zu bauen — **einen für EPROHA, einen für EPDE** (unterschiedliche
Mitarbeiter). Jeder Agent gibt auf die Frage „wer liefert wohin?" die korrekte
umsatzsteuerliche Behandlung eines Reihengeschäfts aus (Transportzuordnung,
Dreiecksgeschäft, Registrierung, SAP-Kennzeichen) — jeweils aus fester
Firmen-Perspektive.

> **Wichtig:** M365 Copilot ist **nicht** GitHub Copilot. Die Dateien unter
> `.github/` (GitHub-Copilot-Agent) werden von M365 Copilot **nicht** gelesen.
> M365 Copilot kann auch nicht direkt auf GitHub zugreifen — Wissen muss in
> **OneDrive/SharePoint** liegen.

## Warum zwei Agenten?

Der fachliche Kern (EU-Recht, Regeln, Referenzfälle) ist identisch. Getrennt
sind nur **Firmenkontext + SAP-Buchungskreise** und die **feste Perspektive** in
den Anweisungen. So sieht ein EPROHA-Mitarbeiter nur EPROHA-UIDs/-SAP-Codes und
umgekehrt — keine Verwechslung.

## Dateien in diesem Ordner

| Datei | Für | Zweck |
|---|---|---|
| `wissensbasis-eproha.md` | EPROHA | **Generiert.** Nach OneDrive/SharePoint hochladen, als Wissensquelle verknüpfen. |
| `agent-anweisungen-eproha.md` | EPROHA | Text ins „Anweisungen"-Feld des EPROHA-Agenten. |
| `firmenkontext-eproha.md` | EPROHA | Quelldatei (EPROHA + SAP) für den Generator — **nicht** hochladen. |
| `wissensbasis-epde.md` | EPDE | **Generiert.** Hochladen + verknüpfen. |
| `agent-anweisungen-epde.md` | EPDE | Text ins „Anweisungen"-Feld des EPDE-Agenten. |
| `firmenkontext-epde.md` | EPDE | Quelldatei (EPDE + SAP) für den Generator — **nicht** hochladen. |

## Einrichtung (pro Agent einmalig)

Für **EPROHA** die `-eproha`-Dateien, für **EPDE** die `-epde`-Dateien nehmen:

1. **Wissen hochladen:** `wissensbasis-<firma>.md` in einen OneDrive- oder
   SharePoint-Ordner legen. (Optional als PDF/Word speichern, falls dein Tenant
   `.md`-Upload nicht direkt akzeptiert — Inhalt bleibt gleich.)
2. **Agent anlegen:** In M365 Copilot Business Chat auf **„Agent erstellen"**
   (oder Copilot Studio → Agenten → Neu).
3. **Name:** z. B. „Reihengeschäft-Assistent EPROHA" bzw. „… EPDE".
4. **Anweisungen:** kompletten Text aus `agent-anweisungen-<firma>.md` (ohne die
   Zitat-Kopfzeilen) einfügen.
5. **Wissen verknüpfen:** die hochgeladene `wissensbasis-<firma>.md` hinzufügen.
6. **Speichern & testen** mit einem Beispiel unten.
7. Bei Bedarf nur für die jeweiligen Mitarbeiter **freigeben**.

Danach das Ganze mit den `-epde`-Dateien für den zweiten Agenten wiederholen.

## Beispiel-Eingaben

EPROHA:
- „EPROHA kauft in DE ein, die Ware geht direkt nach IT, der deutsche Lieferant
  transportiert."
- „Wir verkaufen an einen CH-Kunden, Ware ab AT, Lieferbedingung DDP."

EPDE:
- „EPDE kauft in NL, Ware geht direkt nach IT, wir holen selbst ab."
- „Drei Parteien, alle in der EU, aber wir legen unsere Bestimmungsland-UID vor."

Erwartete Antwort: Kette-Diagramm → bewegte Lieferung → Behandlungstabelle mit
SAP-Codes → Dreieck-Status → Registrierungshinweis → Rechtsgrundlagen.

## Wissensbasen aktualisieren

Single Source of Truth ist `vat-knowledge/` (+ die `firmenkontext-*.md`). Nach
inhaltlichen Änderungen dort **beide** Wissensbasen neu bauen:

```bash
npm run gen:m365        # baut wissensbasis-eproha.md UND wissensbasis-epde.md
npm run check:m365      # prüft, ob beide aktuell sind (Exit 1 wenn veraltet)
```

Danach die neuen `wissensbasis-<firma>.md` erneut nach OneDrive/SharePoint
hochladen (gleiche Datei überschreiben) — der jeweilige Agent nutzt dann
automatisch den neuen Stand.
