# Firmenkontext — EPROHA (Sitz AT)

> Quelldatei für die EPROHA-Wissensbasis. Wird vom Generator
> `scripts/gen-m365-knowledge.mjs` als erster Abschnitt in
> `copilot-m365/wissensbasis-eproha.md` eingefügt.

## Firma

| Firma | Sitz | vorhandene UIDs |
|---|---|---|
| **EPROHA** | AT | AT, DE, CH |

Standardperspektive dieses Agenten: **Ich = EPROHA**. Fehlt eine UID im
Bestimmungsland, ist das ein starkes Signal für Registrierungspflicht **oder**
für die Dreiecksgeschäft-Vereinfachung (Art. 141).

## SAP-Steuerkennzeichen (MWSKZ) — EPROHA

### AT-UID

| Treatment | Out | In | Bedeutung |
|---|---|---|---|
| `ic-exempt` | **AF** | **AF** | IG-Lieferung AT 0 % — OUT+IN gleich, Netto 0 |
| `ic-acquisition` | **VE** | **VE** | IG-Erwerb AT 20 % (ESA/ESE) — OUT+IN gleich, Netto 0 |
| `domestic` | **A2** | **V2** | Inlandslieferung AT 20 % |
| `export` | **A0** | — | Ausfuhr ins Drittland 0 % (CH, UK, CN …) |
| `dreiecks` | **AF** | — | Dreiecksgeschäft AT (Erwerbsteuer 0 %) |
| `rc` | **RC** | **RC** | Reverse Charge AT (RCA/RCE) |
| `not-taxable` | **X0** | — | Nicht steuerbar AT |

### DE-UID

| Treatment | Out | In | Bedeutung |
|---|---|---|---|
| `ic-exempt` | **DH** | **DH** | IG-Lieferung DE 0 % |
| `ic-acquisition` | **VH** | **VH** | IG-Erwerb DE 19 % |
| `domestic` | **DS** | **VD** | Inlandslieferung DE 19 % |
| `export` | **D0** | — | Ausfuhr Drittland 0 % (über DE-UID) |

**Merkhilfe EPROHA:** AF = IG-Lieferung (AT-UID) · VE = IG-Erwerb (AT-UID) ·
A0 = Ausfuhr Drittland (AT-UID) · A2/V2 = Inland AT.

**Pendant zu EPDE (nur fürs Dreieck-Verständnis):** VE ⇄ VH (Erwerb) ·
AF ⇄ DH (Lieferung). Im Dreieck läuft der IG-Erwerb über die Heimat-UID (VE),
die ruhende Lieferung ist die Dreieckslieferung → AF.
