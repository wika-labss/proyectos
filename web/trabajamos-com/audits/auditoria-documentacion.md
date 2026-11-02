# Auditoría de Documentación — trabajamos.com

**Proyecto:** `proyectos/web/trabajamos-com/`  
**Fecha de revisión:** 2026-11-02  
**Documentos:** `idea/01-problem.md` v0.1.1, `idea/02-features.md` v0.1.1  
**Checklist:** `web-design/docs/auditoria-documentacion.md`  
**Revisor:** borrador de agente (no es firma de arquitecto)  
**Estado:** `PENDIENTE_ARQUITECTO`

El plan de negocio / SKU A/B no entra en este gate.

Este borrador no activa `audit_1_passed` y no escribe **APROBADO**.

---

## Checklist Gate 1

### Problema

- [x] El problema está claramente definido. Portales de empleo abundan y faltan vitrinas para oficios y emprendedores (`01` §2).
- [x] Existe una necesidad real identificada. El emprendedor no muestra oficio, trabajo, localidad ni contacto; el cliente no encuentra oficios cerca.
- [x] El alcance está documentado. Perfil, ofertas, portafolio, geo, barra con `#`, cercanía, botón `Contactar` y redes (`01` §4 y §5).
- [x] `industry_type: b2b_saas` y `target_audience` están en el frontmatter de `01-problem.md`.

### Usuarios

- [x] Usuarios identificados: emprendedor / oficio y cliente (`01` §4).
- [x] Hay descripción de uso esperado para cada uno, incluido contacto y redes en el perfil público.

### Objetivo

- [x] El objetivo de v1 está escrito (`01` §5).
- [x] El resultado esperado es observable: perfil publicado y cliente que encuentra el oficio cerca y abre contacto o redes.

### Funcionalidades

- [x] Obligatorias definidas, con sección y CTA: `FEAT-01` a `FEAT-07`.
- [x] Opcionales diferenciadas: v1.1+ explícitamente vacía (`02` §4).
- [x] Alcance delimitado y alineado entre `01` §4 y `02` §5.
- [x] `site_type: cms` en `02-features.md`.

### Restricciones

- [x] Técnicas: sitio editable por el emprendedor, un solo origen, barra de cara al cliente, `#` como criterio de búsqueda, cercanía con ubicación autorizada o escrita. Proveedor de hosting no elegido; queda para `05-build-plan.md`.
- [x] Operativas: el emprendedor mantiene perfil, ofertas, imágenes, localidad, contacto y redes.
- [x] Seguridad: auth del emprendedor, cliente sin cuenta, localidad confirmada, contacto y redes públicos solo si él los guarda, sin secretos en el repo.

### Metadatos y trazabilidad

- [x] Frontmatter en `01` y `02` con `id`, `status`, `owner`, `created_at`, `updated_at`.
- [x] RTM de `01`: `ERR-01` … `ERR-07` mapeados a `FEAT-01` … `FEAT-07`.
- [x] RTM de `02`: cada `FEAT-XX` apunta a un módulo destino (`mod-perfil`, `mod-ofertas`, `mod-portafolio`, `mod-geo`, `mod-buscador`). Sin IDs huérfanos.
- [x] BDD Dado / Cuando / Entonces en `01` §6 y en cada feature de `02`, con escenario de error.
- [x] Out of scope explícito: empleo y CV, pagos y reservas, chat dentro del portal, cuenta de cliente, muro de hashtags.

---

## Notas para el arquitecto

No son correcciones de documentación. Son supuestos que la firma acepta o cambia:

1. `brand_tone: claro, cercano, practico` lo propuso el gate; negocio no lo dictó.
2. `industry_type: b2b_saas` es el enum válido más cercano. La matriz no tiene marketplace de oficios. Se puede cambiar en Gate 2.
3. `Contactar` abre teléfono, correo o enlace. negocio no fijó un canal único.
4. El proveedor de hosting no está elegido. No bloquea el descubrimiento de módulos.

---

## Resultado del borrador

- [x] `PENDIENTE_ARQUITECTO` — la checklist oficial está cubierta. Falta la firma.
- [ ] `REQUIERE_CORRECCIONES`
- [ ] **APROBADO** — solo el arquitecto

**Flags:** `audit_1_passed` permanece `false` en `01-problem.md` y `02-features.md`.

**Siguiente, si el arquitecto aprueba:** registrar **APROBADO** en este archivo, poner `audit_1_passed: true` en `01` y `02`, y completar `idea/03-module-discovery.md`.
