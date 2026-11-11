# WORKFLOW.md – GitHub Pages

Stand: 11.11.2026. Der Rechner wird als eigene GitHub-Project-Page veröffentlicht.
`ieeks.github.io` enthält laut dessen aktuellem README nur die Startseite und verlinkt
die Tools in ihren eigenen Repositories; dort liegt keine Kopie dieses Rechners.

| Rolle | Repository / Artefakt | URL |
|---|---|---|
| Quelle und Deployment | `eu-vat-reihengeschaeftrechner`, Artefakt `docs/` | https://manuel.tools/eu-vat-reihengeschaeftrechner/ |
| Startseite | `ieeks.github.io` | https://manuel.tools/ |

---

## Workflow

1. Änderungen in diesem Repository auf dem aktuellen `origin/main` aufbauen.
2. Relevante Tests und `matrix:check` ausführen; Baseline nur bei erklärten Änderungen neu setzen.
3. Änderung nach `main` bringen. `.github/workflows/pages.yml` prüft die Matrix und deployt `docs/`.
4. Pages-Workflow und die ausgelieferte App prüfen.

---

Keine Kopie nach `ieeks.github.io` anlegen und dessen Domain-/Startseiten-Dateien
bei einer Rechnerkorrektur nicht verändern.

## Historischer lokaler Sync

`sync-repos.sh`, `hooks/post-commit` und `toggle-cloudflare-redirect.sh` dokumentieren
den früheren Mac-/Dual-Repo-Workflow mit `manuel-app.dev`. Sie sind kein Bestandteil
des aktuellen GitHub-Actions-Deployments und werden dafür nicht ausgeführt.

---

Zum Abschluss den Commit/PR und den tatsächlichen Pages-Status nennen.
