# Auditoría de Documentación — V1

## Proyecto
Match-3 América

## Fecha
2026-08-21

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
- [x] Problema claramente definido (Match-3 Android offline; tablero 8×10; viaje por países de América; hint 5s; pánico; inventario)
- [x] Necesidad real: no existe título Match-3 en el portafolio WIKA; jugadores casuales necesitan progresión continental y ayudas anti-bloqueo
- [x] Alcance documentado (solo Android, APK Release, offline, 5 países × 10 niveles, sin boosters/IAP/backend)

### Usuarios
- [x] Usuarios identificados (casual Android, progresión/colección, jugador bloqueado)
- [x] Uso esperado: Home → Mapa países → Niveles → Partida 8×10 → victoria/recompensa → Inventario; hint idle / pánico

### Objetivo
- [x] Objetivo claro V1
- [x] Resultado esperado: app documentada y construible con motor TS, 50 niveles, umbrales de puntos, ≥3 recompensas para país, hint 5s, pánico 1×/nivel

### Funcionalidades
- [x] Obligatorias definidas (`FEAT-01`–`FEAT-07`)
- [x] Deseables diferenciadas (`FEAT-08`–`FEAT-10`)
- [x] Fuera de alcance explícito (Unity/Godot, iOS, backend, ads, IAP, boosters, más de 5 países)

### Restricciones
- [x] Técnicas: Expo SDK 52, RN 0.76.x, TypeScript, motor puro en `src/engine/`, versiones `~`
- [x] Operativas: offline; tablero 8×10; 5 gemas; 5 países ordenados; fácil/media oculta; umbrales `minScore` y ≥3 recompensas
- [x] Seguridad: offline-first; sin datos sensibles; sin red / sin cuentas

### Metadatos y trazabilidad (v2.1)
- [x] Frontmatter YAML en 01 y 02 (`id`, `status`, `owner`, fechas)
- [x] RTM `ERR-01`–`ERR-07` → `FEAT-01`–`FEAT-07` → módulos destino
- [x] BDD Dado/Cuando/Entonces (problema + features)
- [x] Out-of-scope explícito
- [x] Alineación a `standards/coding-standards.md` (WIKA-ARCH, Expo, sin Metro en release)

---

## Hallazgos
Ninguno bloqueante. Contrato de producto explícito:

| Contrato | Valor V1 |
| :--- | :--- |
| Tablero | 8×10; 5 gemas; match ≥3 |
| Mundo | México → Colombia → Perú → Brasil → Argentina |
| Niveles | 10/país (50); impar=fácil, par=media (oculta) |
| Puntos | Match3/4/5+; combo ×1.5; victoria si `score >= minScore` |
| minScore fácil | `800 + i×50` (i=0..9) |
| minScore media | `1200 + i×75` |
| Movimientos | Fácil 25 / Media 20 |
| Recompensas | Pool `recompensa 1`–`8`; 1 al ganar nivel |
| Unlock país | 10 niveles del actual + ≥3 ítems inventario |
| Hint | Idle 5 s → swap sugerido |
| Pánico | Reshuffle; 1 uso/nivel |

Nota: `03-module-discovery.md`, `04` y `05` ya existen en borrador; esta auditoría **solo** habilita Gate 1. Gate 2 (módulos) requiere `audits/auditoria-modulos.md` aparte.

---

## Resultado

## APROBADO

La documentación permite continuar a descubrimiento / auditoría de módulos.

### Activación de gate
- [x] Resultado registrado en `audits/auditoria-documentacion.md`
- [x] `audit_1_passed: true` en frontmatter de `01-problem.md` y `02-features.md`
