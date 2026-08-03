# Revisión — Sodoku v1

## Versión evaluada

**v1** — Primera iteración generada por IA

## Evaluador

Arquitecto WIKA

## Fecha

2026-08-03

---

## Diagnóstico de compilación

### Resumen

La iteración v1 **no compiló en Android Studio** ni generó APK de forma reproducible. El código TypeScript y la lógica del juego están implementados, pero la **infraestructura de build nativo** quedó incompleta e inconsistente.

**Causa raíz:** huecos en la documentación WIKA (templates), no en la lógica del Sudoku ni en el dispositivo de prueba.

---

### Causas identificadas

#### 1. Dependencias Expo incompletas

El `package.json` generado no incluía paquetes implícitos requeridos por Expo SDK 52:

| Paquete | Estado v1 | Impacto |
|---------|-----------|---------|
| `expo-asset` | ❌ Faltante | Error al arrancar Metro |
| `expo-build-properties` | ❌ Faltante | Sin control de Kotlin/JDK |
| `react-native-screens` | ⚠️ 4.1.0 (esperado ~4.4.0) | Incompatibilidad SDK 52 |

**Lección WIKA:** el manifiesto de dependencias debe estar en `06-build-environment.md` antes de generar código.

#### 2. Toolchain nativo no documentado

La arquitectura v1 mencionaba EAS Build pero no documentaba el pipeline local:

```text
Documentado:     npx expo start        (Expo Go)
No documentado:  prebuild → android/ → Gradle → APK
```

Al compilar en Android Studio sin guía clara, aparecieron errores en `:expo-modules-core:compileDebugKotlin` por incompatibilidad Kotlin ↔ Compose Compiler.

#### 3. Conflicto Kotlin / Compose Compiler

`expo-modules-core` exige pares de versiones estrictos:

| Kotlin | Compose Compiler |
|--------|------------------|
| 1.9.24 | 1.5.14 |
| 1.9.25 | 1.5.15 |

Los arreglos manuales alternaron entre 1.9.24 y 1.9.25, empeorando el problema. **Solución WIKA:** fijar Kotlin 1.9.25 via `expo-build-properties` desde el inicio.

#### 4. Perfiles DEV y BUILD mezclados

| Perfil | Complejidad | v1 |
|--------|-------------|-----|
| Expo Go | Baja | Parcialmente funcional |
| Build nativo (APK) | Alta | Falló |

El objetivo real era APK en dispositivo físico, pero los criterios de aceptación solo exigían `npx expo start`.

#### 5. Criterios de aceptación insuficientes

`05-prompt-ia.md` v1 no incluía:

- `npx expo-doctor`
- `npx expo prebuild`
- `./gradlew assembleDebug`
- Manifiesto de dependencias obligatorio

---

### Qué NO causó el fallo

- ❌ Versión de Android del teléfono Samsung
- ❌ Lógica del juego Sudoku
- ❌ Estructura de código TypeScript (compila con `tsc`)

---

## Funcionalidad

- [x] Tablero 9×9 interactivo implementado
- [x] Motor de puzzles (generador, solucionador, validador)
- [x] 20 niveles definidos con progresión
- [x] Stores con persistencia AsyncStorage
- [x] Pantallas: inicio, niveles, juego, ajustes, estadísticas
- [ ] **Verificado en dispositivo físico** — bloqueado por fallo de build

**Observaciones:** La funcionalidad está implementada en código pero no validada end-to-end por fallo de compilación nativa.

---

## Calidad

- [x] TypeScript strict — compila sin errores
- [x] Estructura modular (engine, stores, components, screens)
- [ ] Dependencias pinneadas según estándar WIKA
- [ ] Build reproducible

**Observaciones:** Calidad de código aceptable. Calidad de entrega (build) insuficiente.

---

## Diseño

- [x] Paleta de colores definida e implementada
- [x] Modo oscuro
- [x] Layout móvil (tablero arriba, teclado abajo)
- [ ] Validado en dispositivo real

**Observaciones:** Diseño implementado según `04-design.md`, pendiente validación en hardware.

---

## Build y dependencias

- [ ] `npx expo-doctor` → 0 errores (falló inicialmente)
- [x] `npx tsc --noEmit` → exit 0
- [ ] `expo-asset` presente desde v1 inicial (añadido post-review)
- [ ] `expo-build-properties` configurado desde v1 inicial
- [ ] Kotlin 1.9.25 fijado desde v1 inicial
- [ ] `./gradlew assembleDebug` → BUILD SUCCESSFUL

**Observaciones:** Build nativo no completado en v1. Correcciones aplicadas iterativamente fuera del flujo WIKA.

---

## Cumplimiento de requerimientos

- [x] Offline-first
- [x] Sin backend
- [x] 20 niveles progresivos
- [x] React Native + Expo SDK 52
- [ ] APK funcional en Android — **no cumplido**

---

## Veredicto

- [ ] Aprobado — generar versión final en `final/`
- [x] **Requiere refinamiento — generar v2**

---

## Acciones requeridas para v2

1. **Partir de starter WIKA** con dependencias y build pre-validados (no regenerar infra desde cero)
2. **Completar `06-build-environment.md`** con manifiesto Expo SDK 52
3. **Perfil BUILD explícito** — target APK en dispositivo físico
4. **Incluir `expo-build-properties`** con Kotlin 1.9.25 desde el inicio
5. **Ejecutar gates WIKA** antes de cerrar v2:
   - `npx expo-doctor`
   - `npx expo prebuild --platform android`
   - `./gradlew assembleDebug`
6. **Actualizar templates WIKA** para futuros proyectos (completado en este review)

---

## Mejoras aplicadas a templates WIKA (post v1)

| Template | Cambio |
|----------|--------|
| `06-build-environment.md` | **Nuevo** — manifiesto deps, toolchain, gates |
| `03-architecture.md` | Sección dependencias técnicas y perfil build |
| `05-prompt-ia.md` | Gates de verificación bloqueantes |
| `review.md` | Checklist build y dependencias |
| `README` | Referencia a templates/ y estándares WIKA |
