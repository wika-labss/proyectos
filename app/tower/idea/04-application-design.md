# 04 — Diseño de aplicación (V2)

## Estados de partida
```
preparing → playing ⇄ paused
          → waveBreak → playing
          → levelVictory | defeat | campaignVictory
```

## Flujo
1. LevelSelect → Game en **preparing** (oro inicial, sin spawns).
2. Coloca torres → **Iniciar oleadas**.
3. Durante oleada: combate + puede seguir colocando.
4. Wave clear → waveBreak (coloca) → siguiente oleada.
5. Última oleada → victoria / unlock.

## Contrato alcance
`∀ pad: minDist(pad, path) ≤ range(cannon)`.

## UI torres
| Torre | Color | Forma | Tag |
|-------|-------|-------|-----|
| Arquera | verde | ▲ | Arq |
| Cañón | naranja | ■ | Cañ |
| Hielo | cyan | ● | Hie |
| Franco | violeta | ◆ | Fra |
