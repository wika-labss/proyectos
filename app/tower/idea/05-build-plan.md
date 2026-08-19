# 05 — Plan de construcción

## Proyecto
Tower — Tower Defense Android (Expo / React Native)

## Versión
V1

## Objetivo
Construir la iteración `iterations/v1` siguiendo el flujo WIKA: documentación aprobada → módulos → ensamblado → código → APK Release.

---

## Alcance de la V1

| Incluido | No incluido |
|----------|-------------|
| 15 niveles / mapas distintos | Upgrades de torre |
| 4 torres (Arquera, Cañón, Hielo, Francotirador) | Venta con reembolso |
| Oleadas escaladas por nivel | Path dual / bifurcaciones |
| Enemigos Grunt / Runner / Tank / Boss | Online / leaderboards |
| Economía oro + 20 vidas de base | iOS |
| Campaña con desbloqueo local | Editor de niveles |
| Menú + selector + pausa + victoria/derrota | Sonidos complejos (opcional) |
| APK Release sin Metro | EAS Store submit |

---

## Módulos incluidos

1. `map-catalog`
2. `path-system`
3. `build-zones`
4. `tower-types`
5. `tower-combat`
6. `enemy-types`
7. `wave-system`
8. `economy`
9. `base-lives`
10. `level-campaign`
11. `td-engine`
12. `game-loop`
13. `offline-progress`
14. `tower-placement-ui`
15. `battlefield-view`
16. `tower-screens`
17. `android-release`

---

## Stack y entorno (WIKA)

| Ítem | Valor |
|------|-------|
| Framework | Expo SDK **52** + React Native |
| Navegación | `expo-router` |
| Persistencia | `@react-native-async-storage/async-storage` |
| Render juego | React Native Views / Animated (sin deps nativas extra en V1) |
| Node | 20 LTS |
| JDK | **17** (no 21/26) |
| Android | minSdk 24, compileSdk 35, targetSdk 34 |
| Kotlin | 1.9.25 vía `expo-build-properties` |
| Perfil target | **BUILD** → APK Release |
| Package sugerido | `com.wika.tower` |

Regla WIKA: instalar `expo-*` / `react-native-*` con `npx expo install`; versiones `~` (nunca `^` en expo/RN).

---

## Orden de implementación

### Fase A — Bootstrap
1. Crear `iterations/v1/` (Expo SDK 52 + Router + TypeScript).
2. Configurar `app.json` / `expo-build-properties` (JDK/Kotlin/SDK).
3. Scripts: `start`, `typecheck`, `verify-build`, `build:apk` (patrón WIKA).

### Fase B — Datos y motor puro
1. `map-catalog`: definir 15 mapas (path, pads, palette, motif) — checklist anti-clon.
2. `path-system` + `build-zones`.
3. `enemy-types` + `wave-system` (tablas de escalado Feature 04).
4. `tower-types` (4) + `tower-combat` + `economy` + `base-lives`.
5. `td-engine` + tests unitarios:
   - enemigo sigue path y leak resta vidas
   - kill otorga oro; place cobra costo
   - cannon splash / frost slow / sniper range
   - wave clear → level win; lives 0 → defeat
   - 15 mapas cargan definiciones distintas

### Fase C — Campaña + loop
1. `level-campaign` + `offline-progress`.
2. `game-loop` con estados documentados.

### Fase D — UI
1. `battlefield-view` + HUD.
2. `tower-placement-ui` (barra 4 torres + pads).
3. `tower-screens` (Menú marca Tower, selector 15, victoria/derrota/campaña, HowTo, Pausa).

### Fase E — Release
1. `tsc` / typecheck limpio.
2. Gate `verify-build` WIKA.
3. Generar APK Release; validar sideload sin Metro.
4. `generation-report.md` en `iterations/v1/`.

---

## Dependencias externas

- Expo SDK 52 ecosystem
- AsyncStorage
- Dispositivo Android físico o emulador para smoke (V1 sin hardware especial)

---

## Riesgos

| Riesgo | Plan |
|--------|------|
| Mapas visualmente similares | Review checklist motif/palette/path en PR de datos |
| Balance olas/torres | Multipliers centralizados; smoke niveles 1, 8, 15 |
| Performance oleadas densas | Caps de spawn; profiling en nivel 15 |
| Build Android JDK incorrecto | Documentar JDK 17; fallar early en scripts |

---

## Estrategia de pruebas

| Tipo | Qué |
|------|-----|
| Unitarias | Path progress + leak |
| Unitarias | Economy spend/reward |
| Unitarias | Combat: 4 torres (single, splash, slow, long range) |
| Unitarias | Waves: level 1 vs 15 (counts/mult distintos) |
| Unitarias | Campaign unlock 1→15 |
| Datos | 15 mapas: path/pads/palette únicos |
| Manual | Partida nivel 1; colocación; derrota; victoria; persistencia |
| Build | typecheck + verify-build + APK instalable |

---

## Criterios de aprobación (DoD V1)

- [x] Documentación 01–05 completa
- [x] Auditoría de documentación APROBADA
- [x] Auditoría de módulos APROBADA
- [x] Auditoría de ensamblado APROBADA
- [x] 15 mapas distintos jugables
- [x] 4 torres colocables con roles distintos
- [x] Oleadas/dificultad escalan con el nivel
- [x] Campaña + persistencia local
- [ ] APK Release instalable sin Metro
- [x] `generation-report.md` generado

---

## Orden WIKA (estado)

```
Idea → Preparación (01–05) ✓
     → Auditoría Documentación ✓
     → Auditoría Módulos ✓
     → Auditoría Ensamblado ✓
     → Construcción iterations/v1 ✓
     → Auditoría Release (smoke/typecheck/export ✓ · APK pendiente) ← SIGUIENTE
```

**Estado actual:** `iterations/v1` construido; release audit requiere APK local.  
**Siguiente:** `npm run apk` (JDK 17 + SDK) → sideload → re-auditoría → `final/`.
