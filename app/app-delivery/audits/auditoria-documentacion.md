# Auditoría de Documentación — V1

## Proyecto
app-delivery

## Fecha
2026-11-05

## Objetivo
Borrador de Gate 1. Contrasta `idea/01-problem.md` y `idea/02-features.md` con `docs/auditoria-documentacion.md`. No aprueba.

## Entradas
- `idea/01-problem.md`
- `idea/02-features.md`

## Referencia
`wika-fundaments` @ `wika-fundaments-v2` → `docs/auditoria-documentacion.md`

## Autor del borrador
wika-auditor (IA). El veredicto **APROBADO** lo escribe solo el Arquitecto.

---

## Validaciones

### Problema
- [x] Problema claramente definido: disputas de devolución de pedidos delivery que necesitan fotos del pedido
- [x] Necesidad real: cámara, nombre con número de orden y guardado según agregador (Uber, PedidosYa)
- [ ] Alcance documentado de punta a punta: falta la tabla agregador → destino y el patrón de nombre (`DEC-01`, `DEC-02`, `DEC-03`)

### Usuarios
- [x] Usuario identificado: personal del negocio que prepara la evidencia
- [x] Uso esperado: elegir agregador, ingresar número de orden, sacar foto, guardar

### Objetivo
- [x] Objetivo claro V1
- [x] Resultado esperado: APK Android que confirma el guardado solo cuando el destino del agregador recibió la imagen nombrada

### Funcionalidades
- [x] Obligatorias definidas (`FEAT-01` Sacar foto, `FEAT-02` Renombrar la imagen, `FEAT-03` Definir agregador, `FEAT-04` Guardar imagen)
- [x] Deseables diferenciadas (`FEAT-05`, `FEAT-06`)
- [x] Fuera de alcance explícito (texto de la disputa, API del agregador, iOS, web, cuentas, edición de foto)

### Restricciones
- [x] Técnicas: Expo SDK 52, RN 0.76.x, TypeScript, APK release sin Metro, sin `^`
- [x] Operativas: catálogo `uber` | `pedidosya`; número de orden manual; carpeta local o destino remoto según agregador
- [x] Seguridad: la imagen solo se escribe en el destino del agregador; credenciales concretas siguen pendientes

### Metadatos y trazabilidad (v2.1)
- [x] Frontmatter YAML en 01 y 02 (`id`, `status`, `owner`, fechas, `audit_1_passed: false`)
- [x] RTM `ERR-01`–`ERR-04` → `FEAT-01`–`FEAT-04` → módulos sugeridos
- [x] BDD Dado / Cuando / Entonces en 01 y en cada feature obligatoria
- [x] Out-of-scope explícito
- [x] Alineación a `standards/coding-standards.md`

---

## Hallazgos

1. `DEC-01` y `DEC-02`: Negocio no dijo si Uber y PedidosYa guardan en carpeta, base de datos o repositorio, ni la ruta o credencial. `FEAT-04` no se puede construir con ese hueco.
2. `DEC-03`: el nombre debe incluir el número de orden; el patrón completo del archivo no está confirmado.
3. «pedya» quedó leído como PedidosYa. Si era otro agregador, hay que corregir el catálogo de `FEAT-03`.

Flags YAML: se mantienen en `false`. Este borrador no los activa.

## Resultado

REQUIERE_CORRECCIONES

Falta que Negocio cierre `DEC-01`, `DEC-02` y `DEC-03`. Con eso, el Arquitecto puede revisar de nuevo este Gate 1. Siguiente agente si corrige el texto: `wika-scribe`. Descubrimiento de módulos (`03`) queda detenido.
