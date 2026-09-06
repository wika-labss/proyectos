# DS-IMPLEMENTATION — Tower v4 → v5

**Expectativa:** `design-system/visual-expectation/tower-v4/` (Gate 1 APROBADO 2026-09-06)  
**Familia:** ember-keep  
**Reformulación:** total de UI; `src/engine/` preservado

## Qué cambió

| Área | v4 | v5 |
|------|----|----|
| Theme | `theme.ts` night/ember suelto | `src/design-system/tokens.ts` + JSON sync |
| Torres | glifos ▲■●◆ | sprites `tower_*.png` |
| Enemigos | círculos hex | sprites `enemy_*.png` |
| Menú / shop / how-to | fill plano | `KeepBackdrop` + keep pintado |
| Victoria / derrota | misma plantilla | amanecer vs brecha |
| CTAs | Pressable ad-hoc | `StoneButton` 4 variantes |
| HUD / niveles | views sueltas | `HudPlaques` / `MapCard` |

## Preservado

- Engine: mapas, oleadas, fusión, venta 70%, infinito, shop catalog
- Persistencia `tower:v4:campaign` (no reset de progreso)
- Rutas expo-router

## Assets

`assets/recursos/` según `generated-assets/tower/manifest.md`. Labels en RN.

## Verify

`npm run smoke` + `npm run typecheck`. APK local igual que v4 (sideload pendiente).
