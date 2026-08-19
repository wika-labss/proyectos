# Sodoku nuevo — iterations/v3.4

**Visual-expectation aplicada** — capa gráfica alineada a mockups Design System aprobados.

## Objetivo

Acercar la UI a `design-system/visual-expectation/sodoku-nuevo-v3.2/` (~85–90% del mockup):

- Fondos ilustrados (nubes, corazones, ornamentos)
- Emblema winged heart
- Teclas redondas bubble
- Barra estado juego estilo mockup
- Celebración victoria estilo mockup

> **Nota:** Los mockups son referencia estática. La app mantiene datos dinámicos (puntaje, nivel, labels) en código + pack UI V3.2.

## Módulo nuevo

`src/modules/sodoku-visual/` — capa visual V4 sobre tokens DS + sodoku-ui-kit.

## Assets

`assets/recursos/v4/` — fondos y elementos V4  
`assets/recursos/v4/reference/` — PNG mockups DS (referencia)

## Delta vs V3.3

| Área | V3.3 | V3.4 |
|------|------|------|
| Home BG | bg_002 plano | bg_home_v4 ilustrado |
| Game BG | color sólido | bg_game_v4 + status chips |
| NumberPad | tecla rectangular | tecla redonda bubble |
| Victory | texto simple | VictoryCelebration V4 |
| Storage | v3.3:* | v3.4:* |

## Scripts

```bash
npm install
npm run typecheck
npm run smoke:v3
.\scripts\sync-to-windows.ps1   # copia a C:\dev\...
npm run build:apk
```

## Proceso

`idea/PROCESO-V3.4.md`
