# Auditoría de Módulos — trabajamos.com

**Proyecto:** `proyectos/web/trabajamos-com/`  
**Fecha de revisión:** 2026-11-02  
**Documentos:** `idea/01-problem.md` v0.1.1, `idea/02-features.md` v0.1.1, `idea/03-module-discovery.md` v0.1.0  
**Checklist:** `web-design/docs/auditoria-modulos.md`  
**Checklist preparado por:** agente (borrador)  
**Arquitecto:** Vissiuss  
**Estado:** **APROBADO**

El plan de negocio / SKU A/B no entra en este gate.

El arquitecto aprobó el Gate 2 el 2026-11-02 a las 17:30 (UTC-3) con el mensaje "aprobado lo que me dijiste". El agente transcribió esa decisión en este archivo y en `03-module-discovery.md`.

---

## Checklist Gate 2

### Cobertura

- [x] Toda funcionalidad tiene módulo: `FEAT-01` y `FEAT-07` en `MOD-01`, `FEAT-02` en `MOD-02`, `FEAT-03` en `MOD-03`, `FEAT-04` en `MOD-04`, `FEAT-05` y `FEAT-06` en `MOD-05`. `MOD-06` cubre la autenticación de `FEAT-01` (`03` §2).
- [x] No hay funcionalidades sin representación. Los módulos destino de `01` y `02` existen con el mismo nombre.

### Responsabilidad

- [x] Cada módulo tiene una responsabilidad principal escrita en su contrato (`03` §3).
- [x] Cada módulo tiene un límite funcional escrito (línea **Límite**).

### Duplicidad

- [x] La geocodificación vive solo en `MOD-04`. `MOD-05` la usa para la localidad del cliente.
- [x] La regla de normalización de `#` vive solo en `MOD-05`. `MOD-02` guarda con esa regla.
- [x] El contacto vive solo en `MOD-01`. No hay chat.

### Dependencias

- [x] Dependencias en cada contrato y grafo sin ciclos (`03` §4).
- [x] Integraciones identificadas: CMS y datos, autenticación, imágenes, mapa y geocodificación, geolocalización del navegador, enlaces `tel:` / `mailto:` / URL.
- [x] Riesgos identificados (`03` §4, siete riesgos).

### MOD-DIR

- [x] Bloque YAML `mod_id: MOD-DIR` presente (`03` §5).
- [x] `industry_type: b2b_saas` coincide con `01-problem.md`.
- [x] `direction_skill: minimalist-ui` es un valor permitido.
- [x] Resuelto con `mappings.b2b_saas` de `standards/direction-matrix.yaml`.
- [x] `direction_rationale` no está vacío.
- [x] `direction_locked: true` al aprobar.
- [x] `forbidden_phase2_skills` incluye `image-to-code`.

### Metadatos y trazabilidad

- [x] Frontmatter de `03` con `audit_1_passed: true` y `audit_2_passed: false`.
- [x] RTM modular: cada `MOD-XX` vinculado a `FEAT-XX` y `ERR-XX`.
- [x] Contratos con entradas, salidas, errores, dependencias y límite.

---

## Decisiones para el arquitecto

No son gaps de documentación. El arquitecto aprobó lo propuesto, así que cada punto queda como se indica:

1. **Tildes en `#`:** ¿`#gásfiter` y `#gasfiter` son el mismo oficio? Sin decisión, son distintos.
2. **Oficios de varias palabras:** ¿`maestro chasquilla` conserva el espacio interno? Sin decisión, sí.
3. **Distancia:** línea recta entre puntos (supuesto).
4. **URL de redes:** URL `https://` completa (supuesto).
5. **Privacidad del punto y moderación:** quedan como riesgos de v1. No agregan funcionalidades.
6. **`MOD-06 mod-cuenta`:** módulo nuevo frente a `01` y `02`, derivado de "emprendedor autenticado".

---

## Resultado

- [ ] `PENDIENTE_ARQUITECTO`
- [ ] `REQUIERE_REVISIÓN`
- [x] **APROBADO** — Vissiuss (arquitecto), 2026-11-02

Los módulos pueden avanzar al HTML estructural.

**Flags:** `audit_2_passed: true` en `03-module-discovery.md` y `direction_locked: true` en MOD-DIR.

**Siguiente:** `idea/04-html-design.md` (vistas del cliente y del panel del emprendedor) y Gate 3A.
