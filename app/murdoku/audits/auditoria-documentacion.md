# Auditoría de Documentación — V1

## Proyecto
Murdoku

## Fecha
2026-08-24

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
- [x] Problema claramente definido (Sudoku reinventado con víctima/sospechosos/asesino; habitaciones; offline Android)
- [x] Necesidad real: no hay título WIKA de puzzle narrativo detectivesco; Sodoku cubre solo números
- [x] Alcance documentado (Android APK, offline, 4 habitaciones mín., 4×4/6×6/9×9; sin coartadas V1)

### Usuarios
- [x] Usuarios identificados (casual, fan de lógica, progresión, offline)
- [x] Uso esperado: Home → mapa habitaciones → intro → tablero → victoria → unlock

### Objetivo
- [x] Objetivo claro V1
- [x] Resultado esperado: APK con motor de unicidad fila/columna/región, piezas de crimen, campaña de habitaciones

### Funcionalidades
- [x] Obligatorias definidas (`FEAT-01`–`FEAT-09`)
- [x] Deseables diferenciadas (`FEAT-10`–`FEAT-16`, coartadas en V1.1+)
- [x] Fuera de alcance explícito (iOS, backend, novela visual, gore, editor de puzzles)

### Restricciones
- [x] Técnicas: Expo SDK 52, RN 0.76.x, TypeScript, motor puro, versiones `~`
- [x] Operativas: package `com.wika.murdoku`, portrait, &lt; 40 MB, ≥4 habitaciones
- [x] Seguridad: offline-first; sin red / sin cuentas / sin permisos sensibles

### Metadatos y trazabilidad (v2.1)
- [x] Frontmatter YAML en 01 y 02 (`id`, `status`, `owner`, fechas)
- [x] RTM `ERR-01`–`ERR-09` → `FEAT-01`–`FEAT-09` → módulos destino
- [x] BDD Dado/Cuando/Entonces (problema + features)
- [x] Out-of-scope explícito
- [x] Alineación a `standards/coding-standards.md` (WIKA-ARCH, APK sin Metro)

---

## Hallazgos
Ninguno bloqueante. Contrato de producto explícito:

| Contrato | Valor V1 |
| :--- | :--- |
| Piezas | `victim` ×1, `killer` ×1, `suspect` ×(N−2); set size = N |
| Reglas | Unicidad fila + columna + región |
| Tamaños | 4×4 (box 2×2), 6×6 (box 2×3), 9×9 (box 3×3) |
| Habitaciones | Biblioteca → Cocina → Sótano → Jardín |
| Puzzles | Catálogo fijo; solución única |
| Coartadas | Fuera de V1 (`FEAT-10`) |

Nota: `03`–`05` ya existen en borrador; esta auditoría **solo** habilita Gate 1.

---

## Resultado

## APROBADO

La documentación permite continuar a descubrimiento / auditoría de módulos.

### Activación de gate
- [x] Resultado registrado en `audits/auditoria-documentacion.md`
- [x] `audit_1_passed: true` en frontmatter de `01-problem.md` y `02-features.md`
