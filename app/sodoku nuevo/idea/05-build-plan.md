# 05 — Plan de construcción

## Proyecto
Sodoku nuevo — Android (Expo / React Native)

## Versión
V3

## Objetivo
Construir la iteración `iterations/v3` siguiendo el flujo WIKA, reutilizando V2 como base y agregando: 100 niveles, rewards, inventory, home V3, paleta Pinki Cute.

---

## Prerrequisitos

- [x] `01-problem.md` V3
- [x] `02-features.md` V3
- [x] `03-module-discovery.md` V3 (módulos nuevos `rewards`, `inventory`)
- [x] `04-application-design.md` V3
- [x] Auditoría documentación V3 **APROBADO** (`audits/auditoria-documentacion-v3.md`)
- [x] Auditoría módulos V3 **APROBADO** (`audits/auditoria-modulos-v3.md`)
- [x] Auditoría ensamblado V3 **APROBADO** (`audits/auditoria-ensamblado-v3.md`)
- Base de código: copiar/partir de `iterations/v2`

---

## Fases de construcción

### Fase A — Bootstrap V3
1. Crear `iterations/v3/` desde `iterations/v2/`
2. Actualizar `README` / version label a V3
3. Preparar claves de storage `sodoku:v3:*`

### Fase B — Niveles (100)
1. Extender generador / pack a niveles 1–100
2. Regla interna: impar → easy, par → medium
3. **No** exponer dificultad en UI ni en strings de jugador
4. Gate: `npm run validate:levels` → **100/100 PASSED**

### Fase C — Módulo `rewards`
1. Implementar `rollReward()` → `"regalo 1"` … `"regalo 8"`
2. Hook en victoria de nivel
3. Mostrar nombre del regalo en pantalla de victoria

### Fase D — Módulo `inventory`
1. Store en memoria + persistencia
2. `addGift` / `listGifts` / `countGifts`
3. Pantalla Inventario (solo visualización)
4. Empty state

### Fase E — Home + score
1. Botones acción: **Jugar**, **Inventario**
2. Botones info: **Puntaje**, **Histórico**, **Regalos** (count)
3. Aplicar tokens Pinki Cute (`imagenes/PALETA.md`)

### Fase F — Persistencia y regresión
1. Guardar progreso 100 + inventario + score
2. Smoke: completar nivel → regalo → aparece en inventario → count++
3. Regresión: hints, errores en rojo, reset, watermark VISSIUSS

### Fase G — Release
1. `npm run validate:levels`
2. `cmd /c "scripts\verify-build.bat"` (Windows) → APK Release
3. Actualizar `BUILD-APK.md` si cambian pasos
4. Documentar en `idea/V3.md` el resultado

---

## Checklist de definición de terminado (DoD)

| Ítem | Hecho |
|------|-------|
| 100 niveles jugables | ☐ |
| Dificultad interna alternada, oculta | ☐ |
| Reward aleatorio con nombres literales | ☐ |
| Inventario solo visualiza | ☐ |
| Home: Jugar, Inventario, Puntaje, Histórico, Regalos | ☐ |
| Paleta Pinki Cute aplicada | ☐ |
| `validate:levels` 100/100 | ☐ |
| APK Release generado en máquina local | ☐ |
| Docs idea/ + audits actualizados | ☐ |

---

## Fuera de alcance (no construir en V3)

- Canje / uso de regalos
- Mostrar dificultad
- Niveles hard
- Online / cuentas / ads / IAP

---

## Orden WIKA (recordatorio)

```
Idea → Preparación → Auditoría Documentación
     → Descubrimiento Módulos → Auditoría Módulos
     → Diseño → Auditoría Ensamblado
     → Construcción (iterations/v3) → Auditoría Release
```

**Estado actual del proceso:** documentación + módulos + diseño + auditorías APROBADO → **construcción `iterations/v3` en curso / completa**.  
**Siguiente:** `npm run validate:levels` (100/100) + typecheck + Auditoría Release V3.
