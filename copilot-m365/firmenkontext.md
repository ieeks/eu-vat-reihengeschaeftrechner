# Firmenkontext — EPDE & EPROHA

> Quelldatei für die M365-Wissensbasis. Wird vom Generator
> `scripts/gen-m365-knowledge.mjs` als erster Abschnitt in
> `copilot-m365/wissensbasis.md` eingefügt. Inhaltlich abgestimmt mit dem
> Abschnitt „Entities" und „SAP-Steuerkennzeichen (MWSKZ)" in `CLAUDE.md`.

## Firmen (Entities)

| Firma | Sitz | vorhandene UIDs |
|---|---|---|
| **EPDE** | DE | DE, SI, LV, EE, NL, BE, CZ, PL |
| **EPROHA** | AT | AT, DE, CH |

Fehlt eine UID im Bestimmungsland, ist das ein starkes Signal für
Registrierungspflicht **oder** für die Dreiecksgeschäft-Vereinfachung (Art. 141).

## SAP-Steuerkennzeichen (MWSKZ)

### EPROHA — AT-UID

| Treatment | Out | In | Bedeutung |
|---|---|---|---|
| `ic-exempt` | **AF** | **AF** | IG-Lieferung AT 0 % — OUT+IN gleich, Netto 0 |
| `ic-acquisition` | **VE** | **VE** | IG-Erwerb AT 20 % (ESA/ESE) — OUT+IN gleich, Netto 0 |
| `domestic` | **A2** | **V2** | Inlandslieferung AT 20 % |
| `export` | **A0** | — | Ausfuhr ins Drittland 0 % (CH, UK, CN …) |
| `dreiecks` | **AF** | — | Dreiecksgeschäft AT (Erwerbsteuer 0 %) |
| `rc` | **RC** | **RC** | Reverse Charge AT (RCA/RCE) |
| `not-taxable` | **X0** | — | Nicht steuerbar AT |

### EPROHA — DE-UID

| Treatment | Out | In | Bedeutung |
|---|---|---|---|
| `ic-exempt` | **DH** | **DH** | IG-Lieferung DE 0 % |
| `ic-acquisition` | **VH** | **VH** | IG-Erwerb DE 19 % |
| `domestic` | **DS** | **VD** | Inlandslieferung DE 19 % |
| `export` | **D0** | — | Ausfuhr Drittland 0 % (über DE-UID) |

### EPDE — DE-UID

| Treatment | Out | In | Bedeutung |
|---|---|---|---|
| `ic-exempt` | **DH** | **DH** | IG-Lieferung DE 0 % |
| `ic-acquisition` | **VH** | **VH** | IG-Erwerb DE 19 % |
| `domestic` | **DS** | **VD** | Inlandslieferung DE 19 % |
| `export` | **G0** | — | Ausfuhrlieferung DE 0 % (§ 6 UStG; auch DE→CH) |
| `rc` | — | **DC** | Reverse Charge DE 19 % (§ 13b UStG) |

### EPDE — weitere UIDs

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
| IT | `ic-acquisition` | **IP** | **IP** |
| IT | `rc` | **IC** | **VI** |

**Pendant-Beziehung EPROHA ⇄ EPDE:** VE ⇄ VH (IG-Erwerb, Eingang) · AF ⇄ DH
(IG-Lieferung, Ausgang). EPDE braucht kein eigenes `dreiecks`-Kennzeichen — im
Dreieck greift `ic-exempt[DE] = DH` korrekt.

**Merkhilfe:** AF = IG-Lieferung (EPROHA-AT) · A0 = Ausfuhr Drittland
(EPROHA-AT) · DH = IG-Lieferung (DE-UID) · G0 = Ausfuhr Drittland (EPDE-DE).
