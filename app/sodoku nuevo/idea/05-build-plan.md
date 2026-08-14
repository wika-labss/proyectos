# Plan de Construcción

## Alcance de la V2

Corregir el motor de puzzles y completar Features V2 obligatorias:

- Feature 11 — Motor con solución única + validación de 20 niveles
- Feature 12 — 3 pistas por nivel
- Feature 13 — Home con iconos de puntaje, histórico local y niveles completados
- Mantener Features 01–10 de V1
- Entregable: código en `iterations/v2/` + gates de validación; APK Release sin Metro

---

## Módulos incluidos

Todos los de V1 + **hints**; refuerzo de **sudoku-engine** y **home-branding**.

---

## Orden de implementación

1. **Documentar** idea/ (este plan + features/módulos/diseño V2).
2. **Corregir sudoku-engine** — eliminar fallbacks inválidos; `validatePuzzle`.
3. **Gate `validate:levels`** — generar/validar niveles 1–20 (solución única) **antes** de UI nueva.
4. **hints** — 3 pistas/nivel en game store + UI.
5. **home-branding** — iconos puntaje / histórico / completados + pantalla histórico.
6. Persistencia de histórico en **local-storage**.
7. Typecheck + documentar generation-report V2.

Justificación: no implementar UI de pistas/home sobre un motor que aún entregue puzzles inválidos.

---

## Dependencias externas

- Android SDK, JDK 17, Expo SDK 52 (igual V1).
- Sin red / sin APIs de puzzles.

---

## Riesgos

- Generación lenta en niveles difíciles → más intentos + aceptar más clues si unicidad OK.
- Histórico inconsistente → escribir solo en victoria confirmada.
- APK/SDK path en Windows → `local.properties` / `ANDROID_HOME` (ver `BUILD-APK.md`).

---

## Estrategia de pruebas

- `npm run validate:levels` — 20 niveles, cada uno `countSolutions === 1`.
- Unitarias: `validatePuzzle`, `buildVictoryMessage`, hints decremento 3→0.
- Manual: home iconos; pista×3; reinicio restaura pistas; victoria + histórico.
- APK Release sin Metro (cuando toolchain local disponible).

---

## Criterios de aprobación V2

- [ ] Motor no entrega puzzles sin solución única.
- [ ] `validate:levels` pasa para 1–20.
- [ ] 3 pistas por nivel funcionales.
- [ ] Home muestra puntaje, histórico y completados.
- [ ] Features 01–10 siguen OK.
- [ ] Documentación idea/ actualizada a V2.
- [ ] TypeScript OK.
