# Firmenkontext — EPDE (Sitz DE)

> Quelldatei für die EPDE-Wissensbasis. Wird vom Generator
> `scripts/gen-m365-knowledge.mjs` als erster Abschnitt in
> `copilot-m365/wissensbasis-epde.md` eingefügt.

## Firma

| Firma | Sitz | vorhandene UIDs |
|---|---|---|
| **EPDE** | DE | DE, SI, LV, EE, NL, BE, CZ, PL |

Standardperspektive dieses Agenten: **Ich = EPDE**. Fehlt eine UID im
Bestimmungsland, ist das ein starkes Signal für Registrierungspflicht **oder**
für die Dreiecksgeschäft-Vereinfachung (Art. 141).

## SAP-Steuerkennzeichen (MWSKZ) — EPDE

### DE-UID

| Treatment | Out | In | Bedeutung |
|---|---|---|---|
| `ic-exempt` | **DH** | **DH** | IG-Lieferung DE 0 % |
| `ic-acquisition` | **VH** | **VH** | IG-Erwerb DE 19 % |
| `domestic` | **DS** | **VD** | Inlandslieferung DE 19 % |
| `export` | **G0** | — | Ausfuhrlieferung DE 0 % (§ 6 UStG; auch DE→CH) |
| `rc` | — | **DC** | Reverse Charge DE 19 % (§ 13b UStG) |

### Weitere UIDs

| UID-Land | Treatment | Out | In |
|---|---|---|---|
| CZ | `ic-exempt` | **OB** | **OB** |
| CZ | `ic-acquisition` | **UR** | **UR** |
| SI | `ic-exempt` | **C1** | **C1** |
| SI | `ic-acquisition` | **EC** | **EC** |
| PL | `ic-exempt` | **T1** | **T1** |
| PL | `ic-acquisition` | **W5** | **W5** |
| BE | `ic-acquisition` | **BP** | **BP** |
| BE | `domestic` | **BS** | **BI** |
| NL | `ic-acquisition` | **NP** | **NP** |
| NL | `rc` | **NC** | **NI** |
| IT | `ic-acquisition` | **IP** | **IP** |
| IT | `rc` | **IC** | **VI** |

**Merkhilfe EPDE:** DH = IG-Lieferung (DE-UID) · VH = IG-Erwerb (DE-UID) ·
G0 = Ausfuhr Drittland (DE-UID) · DS/VD = Inland DE.

**Pendant zu EPROHA (nur fürs Dreieck-Verständnis):** VH ⇄ VE (Erwerb) ·
DH ⇄ AF (Lieferung). EPDE braucht **kein** eigenes `dreiecks`-Kennzeichen — im
Dreieck greift `ic-exempt[DE] = DH` korrekt (DH ist das Pendant zu AF).
