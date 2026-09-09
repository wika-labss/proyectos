# DS-IMPLEMENTATION — Tower v4 → v5

**Expectativa:** `design-system/visual-expectation/tower-v4/` (Gate 1 APROBADO 2026-09-06)  
**Familia:** ember-keep  
**Reformulación:** total de UI sobre el slot `iterations/v5/`; `src/engine/` preservado  
**Gate 2:** no firmado (arquitecto)

## Qué cambió (cierre de fidelidad vs heroes)

| Área | v5 previo (fork) | v5 ahora vs VE |
|------|------------------|----------------|
| CTAs | fill token `ember`/`stone` | placas `chrome_cta_*.png` recortadas de `chrome-plates.png` |
| HUD | barra stone única | `HudPlaques` independientes + pause square |
| Niveles | lista + stripe hex de engine | `MapCard` + thumb de bioma (5 familias) |
| Shop | cards apiladas | armería 2 paneles + medallón + COMPRAR |
| Menú | brand + Continuar | TOWER / Defiende la base. / Nivel n/25 / CAMPAÑA / MODO INFINITO / TIENDA / CÓMO JUGAR |
| Victoria / derrota | plantilla centrada | beat inferior; amanecer ≠ brecha; CONTINUAR / REINTENTAR |
| How-to | solo towers roster | keep + ambos rosters |
| Playfield | path ocre + pads square | pads circulares, portón ember, wash de bioma (sin hex de `mapCatalog`) |
| Pausa | scrim + CTAs | icono `chrome_pause.png` + StoneButton |

## Preservado

- Engine: mapas, oleadas, fusión, venta 70%, infinito, shop catalog
- Persistencia `tower:v4:campaign` (no reset de progreso)
- Rutas expo-router · Stack `animation: 'fade'`
- Motion: pressed opacity `0.88` (`motion.pressOpacity`); sin VFX extra

## Assets

`assets/recursos/` = manifest `generated-assets/tower/` **más** recortes de `chrome-plates.png` (CTA ember/stone, plaques, pause, medallón). Labels en RN.

## Verify

- `npm run typecheck` — a correr en esta entrega
- `npm run smoke` — a correr en esta entrega
- `npm run verify` / APK — no ejecutado aquí (mismo pending de toolchain Android)

## Honestidad vs 100%

Se implementó 1:1 de **layout, copy VE, chrome pintado, sprites y dual-layer**. No hay 25 mapas pintados (biomas). Tipografía = `System` (token DS). Gate 2 lo firma el arquitecto.
