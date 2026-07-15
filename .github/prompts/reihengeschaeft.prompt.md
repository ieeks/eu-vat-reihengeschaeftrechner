---
mode: agent
description: Reihengeschäft steuerlich bewerten — wer liefert wohin, welche Behandlung + SAP-Kennzeichen
---

# Reihengeschäft-Bewertung

Du bewertest ein EU-Reihengeschäft für **EPDE** (DE) oder **EPROHA** (AT).
Folge den Instruktionen aus [`.github/copilot-instructions.md`](../copilot-instructions.md)
und der Wissensbasis unter `vat-knowledge/`.

## Was ich dir gebe

Ich beschreibe die Lieferkette in Alltagssprache, z.B.:

> „EPROHA kauft in DE ein, die Ware geht direkt zum Kunden nach IT,
>  der deutsche Lieferant transportiert."

Fehlt eine der folgenden Angaben, **frag genau danach** (nicht raten):

- Parteien und Reihenfolge (A → B → C, ggf. → D)
- Abgangsland (`dep`) und Bestimmungsland (`dest`)
- **Wer veranlasst den Transport?** (Lieferant / Mittler / Kunde)
- Welche Firma bin ich (EPDE / EPROHA) und welche UID lege ich vor?

## Was du zurückgibst

Genau das Antwortformat aus den Copilot-Instruktionen:

1. **Kette** als Diagramm mit Transport-Veranlasser
2. **Bewegte Lieferung** (movingIndex) + kurze Begründung (Art. 36a)
3. **Tabelle** je Lieferung: Ort · Behandlung · SAP Eingang · SAP Ausgang
4. **Dreiecksgeschäft** ✅/❌ mit Art.-141-Begründung (inkl. Blocker-Prüfung)
5. **Registrierung** nötig / nicht nötig + wo
6. **Rechtsgrundlage** als kurze Chips

## Leitplanken

- Ergebnisse gegen `vat-knowledge/reference-cases.md` und `edge-cases.md` plausibilisieren.
- Keine erfundenen SAP-Kennzeichen, Steuersätze oder Rechtsnormen.
- Sprache Deutsch. AT „Art.", DE „§".
- Bei Unsicherheit konservativ + Annahme kennzeichnen.
