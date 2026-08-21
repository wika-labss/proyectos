# Funcionalidades

## Versión
V2 (refina V1)

## Funcionalidades obligatorias

### Feature 01 — Campo / mapas (25)
Exactamente **25** mapas con path, pads y atmósfera distintos.

### Feature 02 — Cuatro torres
| ID | Nombre | Rol |
|----|--------|-----|
| T1 | Arquera | DPS single |
| T2 | Cañón | Splash |
| T3 | Hielo | Slow |
| T4 | Francotirador | Largo alcance / alto daño |

### Feature 03 — Contrato de alcance (FIX V1)
Para **todo** pad de **todo** mapa: distancia mínima al path ≤ rango del Cañón (torre de menor rango). Así las 4 torres siempre pueden golpear enemigos en el camino.

### Feature 04 — Fase preparación
Al entrar a un nivel: estado `preparing`. El jugador coloca torres con oro inicial. CTA **Iniciar oleadas** arranca la wave 1. Sin enemigos hasta entonces.

### Feature 05 — Colocación continua
Se pueden colocar torres:
1. En preparación (antes de oleadas).
2. Entre oleadas (`waveBreak`).
3. Durante la oleada activa (`playing`).

### Feature 06 — Identidad visual de torres
Cada torre se distingue por color + forma/símbolo + etiqueta corta (Arq / Cañ / Hie / Fra).

### Feature 07 — Enemigos y oleadas
Grunt / Runner / Tank / Boss. Oleadas y HP escalan con nivel (1–25).

### Feature 08 — Economía / vidas / campaña
Oro, 20 vidas/nivel, desbloqueo 1→25, persistencia `tower:v2:campaign`.

### Feature 09 — Pantallas
Menú · Selector 25 · Game (prep/play/break) · Victoria · Derrota · Campaña · Cómo jugar · Pausa.

### Feature 10 — Offline + APK Release
Sin red; APK Release sin Metro.

---

## Fuera de alcance (V2)
Upgrades, venta con reembolso, path dual, iOS, online, editor in-game.
