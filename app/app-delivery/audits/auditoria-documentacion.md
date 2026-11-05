# Auditoría de Documentación — V1

## Proyecto
app-delivery

## Fecha
2026-11-05

## Objetivo
Borrador de Gate 1, revisión tras la decisión de Supabase. Contrasta `idea/01-problem.md` y `idea/02-features.md` con `docs/auditoria-documentacion.md`. No aprueba.

## Entradas
- `idea/01-problem.md` (v1.1.0)
- `idea/02-features.md` (v1.1.0)

## Referencia
`wika-fundaments` @ `wika-fundaments-v2` → `docs/auditoria-documentacion.md`

## Autor del borrador
wika-auditor (IA). El veredicto **APROBADO** lo escribe solo el Arquitecto.

---

## Validaciones

### Problema
- [x] Problema claramente definido: disputas de devolución que necesitan fotos del pedido, enviables y recuperables
- [x] Necesidad real: cámara, clave agregador + número de orden, API y base Supabase de prueba
- [x] Alcance documentado: `DEC-01`, `DEC-02` y `DEC-03` cerradas. `DEC-04` (id del proyecto Supabase) queda para la construcción

### Usuarios
- [x] Usuario identificado: personal del negocio que prepara y recupera la evidencia
- [x] Uso esperado: elegir agregador, ingresar número de orden, sacar foto, enviar, pedir

### Objetivo
- [x] Objetivo claro de la prueba
- [x] Resultado esperado: APK Android más API que confirma el guardado y devuelve la imagen de esa clave

### Funcionalidades
- [x] Obligatorias definidas (`FEAT-01` a `FEAT-05`)
- [x] Deseables diferenciadas (`FEAT-06`, `FEAT-07`)
- [x] Fuera de alcance explícito (disputa en el agregador, carpeta, repositorio git, iOS, web, cuentas, otros proyectos Supabase)

### Restricciones
- [x] Técnicas: Expo SDK 52, RN 0.76.x, TypeScript, APK release sin Metro, sin `^`, Supabase
- [x] Operativas: catálogo `uber` | `pedidosya`; número de orden manual; una sola base
- [x] Seguridad: sin `service_role` en el cliente; RLS en tablas expuestas; la app habla con la API

### Metadatos y trazabilidad (v2.1)
- [x] Frontmatter YAML en 01 y 02 (`id`, `status`, `owner`, fechas, `audit_1_passed: false`)
- [x] RTM `ERR-01`–`ERR-05` → `FEAT-01`–`FEAT-05` → módulos sugeridos
- [x] BDD Dado / Cuando / Entonces en 01 y en cada feature obligatoria
- [x] Out-of-scope explícito
- [x] Alineación a `standards/coding-standards.md`

---

## Hallazgos

1. `DEC-01`, `DEC-02` y `DEC-03` quedaron cerradas por Negocio el 2026-11-05: base Supabase única, API de enviar / guardar / pedir, clave agregador + número de orden.
2. `DEC-04` sigue abierto: no existe un proyecto Supabase llamado app-delivery. Los proyectos visibles (`mercado-publico`, `geo-empresa`, `ramon-david`, `memin-clothes`, `vissiusscomp's Project`) son de otros productos y quedan fuera.
3. Supuesto explícito, no pedido palabra por palabra: metadatos en Postgres y archivo en Storage del mismo proyecto. El Arquitecto puede aceptarlo al pasar el Gate 1.
4. «pedya» sigue leído como PedidosYa.

Flags YAML: se mantienen en `false`. Este borrador no los activa. No hay código en `iterations/`.

## Resultado

PENDIENTE_ARQUITECTO

La documentación de la prueba ya alcanza para que el Arquitecto decida el Gate 1. Con `audit_1_passed: true`, el siguiente agente es `wika-scribe` para `03-module-discovery.md`.
