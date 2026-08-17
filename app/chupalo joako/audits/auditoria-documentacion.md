# Auditoría de Documentación — V1

## Proyecto
Chupalo joako (Tetris)

## Fecha
2026-08-17

## Objetivo
Validar que la documentación V1 contiene la información necesaria para el descubrimiento de módulos.

## Entradas
- `idea/01-problem.md`
- `idea/02-features.md`

## Referencia
`wika-fundaments` @ `wika-fundaments-v2` → `docs/auditoria-documentacion.md`

---

## Validaciones

### Problema
- [x] Problema claramente definido (Tetris Android offline; colores llamativos; puntos; dificultad por puntaje)
- [x] Necesidad real: falling-blocks clásico, medible por score, ritmo que sube al puntuar, sin red
- [x] Alcance documentado (solo Android, APK Release, sin online, sin marca Tetris®, sin vidas)

### Usuarios
- [x] Usuarios identificados (casual, arcade visual, competitivo local, offline, sesiones cortas)
- [x] Uso esperado: Menú → Jugar → colocar piezas / limpiar líneas → score sube → gravedad sube → top-out → high score

### Objetivo
- [x] Objetivo claro V1
- [x] Resultado esperado: APK jugable con 7 tetrominós, scoring, dificultad por umbrales de puntos, paleta saturada, high score

### Funcionalidades
- [x] Obligatorias definidas (Features 01–17)
- [x] Deseables diferenciadas (18–22)
- [x] Fuera de alcance explícito (iOS, online, vidas, dificultad por líneas, IAP, marca comercial)

### Restricciones
- [x] Técnicas: Expo SDK 52, JDK 17, gradle-build, sin permisos sensibles
- [x] Operativas: offline, package `com.wika.chupalojoako` (plan), portrait
- [x] Seguridad: sin red / sin datos personales en V1

---

## Hallazgos
Ninguno bloqueante. Contrato de producto explícito: Tetris 10×20, score 100/300/500/800 + drops, dificultad `1 + floor(score/500)` cap 10, paleta neón por pieza.

## Resultado

## APROBADO

La documentación permite continuar a descubrimiento / auditoría de módulos.
