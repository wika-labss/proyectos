# Plan de Construcción

## Alcance de la V1

Implementar todas las funcionalidades **obligatorias** (Features 01–10):

- Tablero Sudoku 9×9
- 20 niveles progresivos
- Aviso de errores en rojo
- Puntaje
- 100% offline
- Reinicio de nivel
- Pantalla de inicio con marca VISSIUSS
- Mensaje de ganador `muy bien culiaitoo` + `!`×nivel
- Identidad visual blanco/negro/rojo-errores
- Persistencia local

Funcionalidades deseables (11–14) quedan fuera de la V1 obligatoria.

**Entregable:** APK Android instalable (sideload) jugable sin Metro.

---

## Módulos incluidos

- sudoku-engine
- sudoku-board
- level-progression
- scoring
- local-storage
- home-branding
- victory-feedback
- app-theme

---

## Orden de implementación

1. **app-theme** + **local-storage** — base visual y persistencia.
2. **sudoku-engine** — reglas y generación (testeable sin UI).
3. **scoring** + **level-progression** — progreso y puntaje.
4. **sudoku-board** — interacción del tablero + errores en rojo.
5. **home-branding** — inicio con logo VISSIUSS (`idea/assets/vissiuss-logo.png`).
6. **victory-feedback** — mensaje por nivel.
7. Ensamble de pantallas/navegación y gates de build APK.

Justificación: dominio y persistencia primero; UI después; marca y victoria al cerrar el flujo de usuario.

---

## Dependencias externas

- Runtime Android (dispositivo o emulador).
- Framework móvil del stack WIKA vigente para apps Android offline (sin backend).
- Almacenamiento local del dispositivo.
- Asset de marca: `idea/assets/vissiuss-logo.png`.
- Sin dependencias de red, autenticación ni APIs de puzzles.

---

## Riesgos

- Complejidad del generador de Sudoku (solución única) → pruebas unitarias del engine.
- Build nativo Android frágil → gates de compilación/APK antes de cerrar V1.
- Incumplir paleta visual → checklist UI en pruebas.
- Mensaje de victoria mal formado → prueba parametrizada niveles 1–20.

---

## Estrategia de pruebas

- Unitarias: `sudoku-engine` (validación, unicidad), `victory-feedback` (cantidad de `!`), `scoring`, `level-progression` (desbloqueo).
- Manuales: flujo inicio → nivel 1 → error en rojo → reinicio → victoria con `muy bien culiaitoo!`.
- Visual: fondo blanco, texto/números negros, bordes negros, errores solo en rojo, watermark VISSIUSS.
- Offline: modo avión durante partida completa.
- Entrega: APK instalable en dispositivo físico.

---

## Criterios de aprobación

- [ ] Features 01–10 cumplidas.
- [ ] 20 niveles jugables con desbloqueo secuencial.
- [ ] Errores visibles en rojo.
- [ ] Puntaje funcional y persistente.
- [ ] Reinicio de nivel operativo.
- [ ] Home con marca VISSIUSS.
- [ ] Mensaje de victoria correcto para cada nivel (1–20).
- [ ] App 100% offline.
- [ ] APK Android instalable y usable sin Metro.
- [ ] Auditoría de Ensamblado aprobada antes de generar código; Auditoría de Release tras V1.
