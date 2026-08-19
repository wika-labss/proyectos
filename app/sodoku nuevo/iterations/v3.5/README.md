# Sodoku nuevo — iterations/v3.5

**Pack ui-v5 regenerado** — fidelidad ~99% vs mockups visual-expectation aprobados.

## Objetivo

Regenerar **todo el pack UI** desde mockups DS (`visual-expectation/sodoku-nuevo-v3.2/`) y cablearlo en runtime:

- Botones glossy alineados a mockup (CTA, acciones, pista naranja)
- Chips info Home con ornamentos mockup
- Teclas redondas bubble (ui-v5)
- Tiles niveles con estética mockup
- Banner `Sodoku nuevo` en cabecera Home/Victory

> **Nota:** Labels y números siguen siendo overlay en código (no baked en PNG). Eso impide 100% pixel-perfect pero alcanza ~99% en composición y estética.

## Módulos

| Módulo | Rol |
|--------|-----|
| `sodoku-ui-kit` | Pack ui-v5 (15 PNG) |
| `sodoku-visual` | Fondos V4 + BrandHeader con banner |
| `design-system` | Tokens Cute Pink oficiales |

## Assets

```text
assets/recursos/ui-v5/   ← pack regenerado V3.5 (15 PNG)
assets/recursos/v4/      ← fondos ilustrados + emblema
assets/recursos/ui/      ← pack V3.2 legacy (referencia)
```

## Delta vs V3.4

| Área | V3.4 | V3.5 |
|------|------|------|
| Botones/chips/tiles | pack ui V3.2 | **pack ui-v5** mockup |
| Pista | actionBar rosa | **actionHint** naranja |
| NumberPad | key v4 separada | **key ui-v5** unificada |
| Home title | texto | **banner PNG** |
| Storage | v3.4:* | v3.5:* |

## Scripts

```bash
npm install
npm run typecheck
npm run smoke:v3
.\scripts\sync-to-windows.ps1   # copia a C:\dev\...
npm run build:apk
```

## Proceso

`idea/V3.5.md` · `idea/PROCESO-V3.5.md`
