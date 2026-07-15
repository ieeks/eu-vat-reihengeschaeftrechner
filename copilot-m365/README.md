# M365-Copilot-Agent — Reihengeschäft-Assistent

Dieser Ordner enthält alles, um in **Microsoft 365 Copilot** einen Agenten zu
bauen, der auf die Frage „wer liefert wohin?" die korrekte umsatzsteuerliche
Behandlung eines Reihengeschäfts ausgibt (Transportzuordnung, Dreiecksgeschäft,
Registrierung, SAP-Kennzeichen).

> **Wichtig:** M365 Copilot ist **nicht** GitHub Copilot. Die Dateien unter
> `.github/` (GitHub-Copilot-Agent) werden von M365 Copilot **nicht** gelesen.
> M365 Copilot kann auch nicht direkt auf GitHub zugreifen — Wissen muss in
> **OneDrive/SharePoint** liegen.

## Dateien in diesem Ordner

| Datei | Zweck |
|---|---|
| `wissensbasis.md` | **Generiert.** Alle 24 `vat-knowledge`-Dateien + Firmenkontext in einer Datei → nach OneDrive/SharePoint hochladen und als Wissensquelle verknüpfen. |
| `agent-anweisungen.md` | Text zum Einfügen ins „Anweisungen/Instructions"-Feld des Agenten. |
| `firmenkontext.md` | Quelldatei (EPDE/EPROHA + SAP-Matrix) für den Generator — nicht hochladen, wird in `wissensbasis.md` gebündelt. |

## Einrichtung (einmalig)

1. **Wissen hochladen:** `wissensbasis.md` in einen OneDrive- oder
   SharePoint-Ordner legen, auf den du Zugriff hast. (Optional als PDF/Word
   speichern, falls dein Tenant `.md`-Upload nicht direkt akzeptiert — der Inhalt
   bleibt gleich.)
2. **Agent anlegen:** In M365 Copilot Business Chat auf **„Agent erstellen"**
   (oder in **Copilot Studio → Agenten → Neu**).
3. **Name & Beschreibung:** z. B. „Reihengeschäft-Assistent (EPDE/EPROHA)".
4. **Anweisungen:** kompletten Text aus `agent-anweisungen.md` (ohne die
   Zitat-Kopfzeilen) in das Anweisungen-Feld einfügen.
5. **Wissen verknüpfen:** unter „Wissen/Knowledge" die hochgeladene
   `wissensbasis.md` (bzw. den OneDrive/SharePoint-Ordner) hinzufügen.
6. **Speichern & testen** mit einem der Beispiele unten.
7. Bei Bedarf für Kolleg:innen **freigeben** (Teilen-Funktion des Agenten).

## Beispiel-Eingaben

- „EPROHA kauft in DE ein, die Ware geht direkt nach IT, der deutsche Lieferant
  transportiert."
- „Wir (EPDE) verkaufen an einen CH-Kunden, Ware ab DE, Lieferbedingung DDP."
- „Drei Parteien, alle in der EU, aber der mittlere legt seine
  Bestimmungsland-UID vor."

Erwartete Antwort: Kette-Diagramm → bewegte Lieferung → Behandlungstabelle mit
SAP-Codes → Dreieck-Status → Registrierungshinweis → Rechtsgrundlagen.

## Wissensbasis aktualisieren

Single Source of Truth ist der Ordner `vat-knowledge/` (+ `firmenkontext.md`).
Nach inhaltlichen Änderungen dort:

```bash
node scripts/gen-m365-knowledge.mjs        # baut wissensbasis.md neu
node scripts/gen-m365-knowledge.mjs --check # prüft, ob wissensbasis.md aktuell ist
```

Danach die neue `wissensbasis.md` erneut nach OneDrive/SharePoint hochladen
(gleiche Datei überschreiben) — der Agent nutzt dann automatisch den neuen Stand.
