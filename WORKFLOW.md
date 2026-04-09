# WORKFLOW.md – Dual Repo Workflow

## REPOS

| Role | Name | URL |
|---|---|---|
| PRIMARY (source of truth) | `eu-vat-reihengeschaeftrechner` | https://ieeks.github.io/eu-vat-reihengeschaeftrechner/ |
| DEPLOY (read-only copy, subfolder) | `ieeks.github.io/eu-vat-reihengeschaeftrechner/` | https://manuel-app.dev/eu-vat-reihengeschaeftrechner/ |

---

## HARD RULES

- PRIMARY is the ONLY source of truth
- DEPLOY must NEVER be edited directly
- ALL changes flow PRIMARY → DEPLOY, never the other way
- Task is NOT done until PRIMARY updated, DEPLOY synced, DEPLOY pushed

---

## REQUIRED WORKFLOW

After ANY change:

1. Make changes in PRIMARY only
2. Commit in PRIMARY → sync runs automatically via post-commit hook
3. Decide redirect state and run toggle script if needed

---

## CLOUDFLARE REDIRECT

`manuel-app.dev` → `ieeks.github.io` (temporary fallback)

- Domain should be LIVE → `./toggle-cloudflare-redirect.sh disable`
- Fallback mode → `./toggle-cloudflare-redirect.sh enable`

---

## SYNC EXCLUSIONS

Never copy from PRIMARY to DEPLOY:

- `.git/`
- `CNAME`
- Domain/deployment configs

---

## COMPLETION CHECKLIST

Always report at end of task:

```
Primary repo updated:  yes/no
Deploy repo updated:   yes/no
Deploy repo pushed:    yes/no
Redirect state:        enabled/disabled
```
