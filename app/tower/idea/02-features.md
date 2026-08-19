# Funcionalidades

## Funcionalidades obligatorias

### Feature 01 — Campo de juego (mapa + camino)

Cada nivel carga un **mapa** con:

- **Camino** (path) que los enemigos siguen desde spawn hasta la **base**.
- **Zonas de construcción** (build tiles / pads) donde se pueden colocar torres.
- **Terreno bloqueado** (no construible, no camino).
- Identidad visual propia del nivel (paleta, silueta del path, composición).

V1: exactamente **15** mapas; **ninguno** reutiliza el mismo layout ni la misma atmósfera visual.

### Feature 02 — Cuatro tipos de torres

Exactamente **4** torres colocables en V1:

| ID | Nombre | Rol | Comportamiento V1 |
|----|--------|-----|-------------------|
| T1 | **Arquera** | DPS single-target | Daño medio, cadencia media, alcance medio |
| T2 | **Cañón** | Splash / área | Daño en radio al impacto; cadencia baja; alcance medio-corto |
| T3 | **Hielo** | Control | Daño bajo; aplica **ralentización** temporal al objetivo |
| T4 | **Francotirador** | Long range | Daño alto; cadencia baja; **alcance largo**; single-target |

Reglas comunes:

- Se colocan solo en zonas de construcción libres.
- Consumen **oro** al colocar (costos distintos por tipo).
- Atacan automáticamente al enemigo válido en alcance (prioridad V1: el más avanzado en el path).
- V1: **sin** upgrades de torre (deseable post-V1).
- V1: **sin** venta con reembolso completo (opcional deseable: demoler sin oro).

### Feature 03 — Enemigos y oleadas

- Enemigos spawnean en el inicio del path y avanzan hacia la base.
- Tipos V1 mínimos:
  - **Grunt** — HP bajo, velocidad media.
  - **Runner** — HP muy bajo, velocidad alta.
  - **Tank** — HP alto, velocidad baja.
  - **Boss** (niveles ≥ 5, oleada final del nivel) — HP muy alto; aparece 1 por oleada boss.
- Cada nivel define una secuencia de **oleadas** (`wave 1..N`).
- Entre oleadas: breve pausa + CTA **Siguiente oleada** (o auto-start opcional tras countdown).
- Al superar la última oleada del nivel → **victoria de nivel**.

### Feature 04 — Escalado de dificultad (15 niveles)

Contrato de progresión V1 (orientativo, fijado en datos de nivel):

| Niveles | Oleadas | HP enemigo (mult) | Oro inicial | Notas |
|---------|---------|-------------------|-------------|--------|
| 1–3 | 4–5 | 1.0–1.2 | alto | Tutorial implícito; path simple |
| 4–7 | 6–7 | 1.3–1.6 | medio-alto | Runners + Tanks mezclados |
| 8–11 | 8–9 | 1.7–2.1 | medio | Paths más largos / bifurcación visual (un solo path lógico V1) |
| 12–14 | 10–11 | 2.2–2.6 | medio-bajo | Boss en oleada final |
| 15 | 12 | 2.8+ | bajo | Campaña final; boss reforzado |

La **cantidad de enemigos por oleada** y la **mezcla de tipos** también aumentan con el nivel.

### Feature 05 — Mapas con diseño distinto

Catálogo V1 (nombre + identidad; layout path/zonas único por nivel):

| # | Nombre mapa | Atmósfera / silueta |
|---|-------------|---------------------|
| 1 | Pradera | Path recto suave; verdes; zonas laterales amplias |
| 2 | Bosque | Path en S; árboles bloquean construcción |
| 3 | Puente | Path estrecho central; zonas solo en orillas |
| 4 | Cañón | Path en U; paredes rocosas |
| 5 | Aldea | Path en L; casas decorativas |
| 6 | Costa | Path costero en C; arena / agua decorativa |
| 7 | Desierto | Path en zigzag; pads escasos |
| 8 | Montaña | Switchbacks; zonas en terrazas |
| 9 | Pantano | Path irregular; pads aislados |
| 10 | Volcán | Path angular; paleta roja/naranja |
| 11 | Ciudadela | Path en anillo parcial; muros |
| 12 | Puerto | Path muelle; grúas decorativas |
| 13 | Ruinas | Path quebrado; columnas |
| 14 | Isla | Path espiral suave; agua alrededor |
| 15 | Fortaleza | Path largo multi-curva; atmósfera final oscura |

Ningún nivel reutiliza el mismo conjunto path+pads ni la misma paleta dominante.

### Feature 06 — Economía (oro)

- Oro inicial por nivel (tabla Feature 04).
- Recompensa de oro al eliminar enemigos (Grunt < Runner? / Tank > Grunt; Boss mayor).
- Colocar torre resta costo; si no hay oro suficiente, no se coloca.
- HUD muestra oro actual.

### Feature 07 — Vidas de base

- Cada nivel inicia con **vidas de base** (V1: **20**).
- Cada enemigo que llega a la base resta vidas (Grunt/Runner/Tank = 1; Boss = 3).
- A **0 vidas** → **Derrota** del nivel (reintentar / menú).
- Las vidas **no** se arrastran entre niveles (cada nivel resetea a 20).

### Feature 08 — Progresión de campaña (15 niveles)

- Niveles bloqueados hasta completar el anterior (persistencia local).
- Nivel 1 siempre desbloqueado.
- Completar nivel N desbloquea N+1.
- Completar nivel 15 → **Victoria de campaña** (pantalla dedicada).
- Selector de nivel desde menú / mapa de campaña.

### Feature 09 — Colocación de torres (UX)

1. Jugador selecciona tipo de torre en barra inferior.
2. Toca una zona de construcción libre y asequible → torre colocada.
3. Feedback: highlight de pads válidos al tener torre seleccionada.
4. Torretas muestran rango al seleccionar (círculo sutil).

### Feature 10 — Combate automático

- Torres disparan / aplican efecto según tipo mientras hay enemigos en rango.
- Proyectiles V1 simples (línea o sprite pequeño); splash del Cañón aplica daño en radio al impacto.
- Hielo aplica multiplicador de velocidad < 1 durante T ms (no stack infinito abusivo: refresh duración).

### Feature 11 — Menú y pantallas

1. **Menú** — marca **Tower** hero, CTA **Jugar** / **Continuar**, acceso a selector de nivel.
2. **Selector de niveles** — 15 nodos; bloqueados vs desbloqueados.
3. **Game** — mapa, HUD (vidas, oro, oleada i/N, nivel), barra de 4 torres, pausa.
4. **Oleada clear** — breve; countdown o botón siguiente.
5. **Victoria de nivel** — desbloqueo siguiente; CTA Continuar / Selector.
6. **Derrota** — Reintentar nivel / Selector / Menú.
7. **Victoria campaña** — al completar nivel 15.
8. **Cómo jugar** — reglas en pocas líneas.
9. **Pausa** — Reanudar / Menú (confirma abandono).

### Feature 12 — Pausa

El juego no avanza enemigos ni ataques en pausa.

### Feature 13 — 100% offline

Sin red, sin cuentas, sin analytics remotos, sin anuncios.

### Feature 14 — Persistencia local

Guardar al menos:

- `maxUnlockedLevel` (1..15)
- `campaignComplete` (bool)
- Opcional V1: mejor estrellas o tiempo — **no obligatorio**

### Feature 15 — Feedback básico

- Enemigo eliminado: desaparición / flash.
- Daño a base: flash / vidas −N.
- Torre colocada: confirmación visual.
- HUD claro: vidas · oro · oleada · nivel.

### Feature 16 — APK Release (BUILD)

App nativa Android generada con pipeline WIKA (Expo prebuild + release), instalable sin Metro.

---

## Funcionalidades deseables

### Feature 17 — Upgrades de torre (★ / niveles 1–3)

Mejorar daño/alcance a cambio de oro.

### Feature 18 — Venta de torres

Demoler con reembolso parcial.

### Feature 19 — Path dual / bifurcaciones reales

Enemigos eligen rama (post-V1; V1 = un path por mapa).

### Feature 20 — Sonidos / hápticos

Disparo, hit, llegada a base, victoria.

### Feature 21 — Más tipos de enemigo

Flying / shield / healer.

---

## Fuera de alcance (V1)

- iOS
- Multijugador / online / leaderboards cloud
- Editor de niveles in-game
- Más de 4 torres o menos de 4
- Menos o más de 15 niveles
- Upgrades / skills / héroes
- Tienda, IAP, anuncios
- Cuentas de usuario
- Landscape obligatorio
- Motor 3D / tileset comercial de terceros con licencia restrictiva
