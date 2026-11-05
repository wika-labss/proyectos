# Auditoría de Módulos — V1

## Proyecto
app-delivery

## Fecha
2026-11-05

## Objetivo
Borrador de Gate 2. Contrasta `idea/03-module-discovery.md` con `docs/auditoria-modulos.md`. No aprueba.

## Entradas
- `idea/01-problem.md` (v1.1.0, Gate 1 APROBADO)
- `idea/02-features.md` (v1.1.0, Gate 1 APROBADO)
- `idea/03-module-discovery.md` (v1.0.0)

## Referencia
`wika-fundaments` @ `wika-fundaments-v2` → `docs/auditoria-modulos.md`

## Autor del borrador
wika-auditor (IA). El veredicto **APROBADO** lo escribe solo el Arquitecto. Este borrador no activa `audit_2_passed`.

---

## Validaciones

### Cobertura
- [x] Toda funcionalidad obligatoria tiene módulo: `FEAT-01` → `MOD-01`, `FEAT-02` → `MOD-02`, `FEAT-03` → `MOD-03`, `FEAT-04` y `FEAT-05` → `MOD-04`
- [x] No hay features obligatorias sin representación. `FEAT-06` y `FEAT-07` están marcadas como deseables y quedan fuera de V1

### Responsabilidad
- [x] Cada módulo tiene una responsabilidad principal
- [x] Objetivo claro: captura, número de orden, agregador, o la API de evidencia
- [x] Límite definido. Solo `MOD-04` habla con Supabase. La UI no persiste

### Duplicidad
- [x] No hay dos módulos para la misma feature
- [x] `MOD-04` concentra enviar, guardar y pedir. `MOD-02` y `MOD-03` validan la clave y no escriben en la base

### Dependencias
- [x] Dependencias identificadas (permiso de cámara, catálogo, HTTP, proyecto `nfryurrhgaeepdwqtswo`)
- [x] Integraciones identificadas: Postgres `public.evidencia` y bucket `evidencia`
- [x] Riesgos identificados, incluido no borrar fotos anteriores y no poner `service_role` en el cliente

### Reutilización
- [x] Se evaluó `expo-camera` en `app/bby app` (torch, no evidencia de orden) y se descartó como módulo equivalente
- [x] No hay componente reutilizable de número de orden ni de agregador
- [x] No se reutiliza un proyecto Supabase de otro producto. Theme local V1; `design-system/` diferido a V3+

### Metadatos y trazabilidad (v2.1)
- [x] Frontmatter YAML en `03-module-discovery.md` con `audit_1_passed: true` y `audit_2_passed: false`
- [x] RTM modular: cada `MOD-XX` vinculado a `FEAT-XX` y `ERR-XX`
- [x] Contratos de módulo documentados (entradas, salidas, aislamiento)
- [x] Grafo de dependencias sin ciclos
- [x] Matriz de riesgos arquitectónicos presente
- [x] Evaluación de reutilización WIKA completada

---

## Hallazgos

1. El contrato de datos coincide con 01 y 02: varias filas por (`agregador`, `numero_orden`), bytes en el bucket `evidencia`, API como único camino de la app, RLS activo y `service_role` solo en el servidor.
2. El runtime del proceso servidor (Edge Function u otro) no está elegido. Negocio no lo fijó. `03` lo deja para `05-build-plan.md`. No es un módulo extra ni un cambio de alcance. El Arquitecto puede aceptarlo al pasar el Gate 2 o pedir que `05` lo cierre antes de construir.
3. `04-application-design.md` y `05-build-plan.md` siguen en plantilla. Este borrador no los llena y no pone `audit_2_passed` en `true`.

## Resultado

PENDIENTE_ARQUITECTO

Los módulos están listos para que el Arquitecto decida el Gate 2. Este borrador no es **APROBADO**. `audit_2_passed` permanece en `false`.
