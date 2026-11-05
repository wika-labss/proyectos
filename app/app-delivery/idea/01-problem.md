---
id: "PROB-001"
title: "app-delivery"
status: "BORRADOR"
version: "1.0.0"
owner: "Negocio / Equipo WIKA"
created_at: "2026-11-05"
updated_at: "2026-11-05"
audit_1_passed: false
solution_type: "mobile_app"
delivery_channels:
  - android
project_mode: "construction"
---

# [01] Definición del Problema, Alcance y Metas

> **Equivalencia de auditoría:** `audit_1_passed: true` requiere aprobación formal en `docs/auditoria-documentacion.md`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `app-delivery`
- **Repositorio de aplicación:** `proyectos/app/app-delivery/`
- **Stakeholders clave:** Negocio (operación que disputa devoluciones de pedidos delivery), personal del negocio (usuario de la app), Arquitecto WIKA (gates)
- **Estado de gatekeeping:** `PENDIENTE_AUDITORIA_DOCUMENTACION`

---

## 2. Definición del Problema y Justificación

- **¿Qué problema se intenta resolver?**  
  El negocio tiene que armar disputas de pedidos delivery y, para pelear la devolución con el cliente, debe subir imágenes del pedido. Hoy no hay una aplicación que sirva de cámara para esa evidencia, que nombre cada imagen con el número de orden y que la guarde en la carpeta, base de datos o repositorio que corresponde al agregador (Uber o PedidosYa).

- **Impacto actual / costo de oportunidad:**  
  Sin esa evidencia nombrada y guardada en el destino del agregador, el negocio no puede sostener la disputa de devolución con fotos del pedido asociadas a la orden.

- **Análisis de brecha (Gap Analysis):**
  - **Estado actual (hoy):** El negocio debe crear la disputa y aportar imágenes del pedido, y no existe una app que capture, nombre con el número de orden y guarde según el agregador.
  - **Estado deseado (mañana):** App Android V1 que funciona como cámara: saca la foto del pedido, la nombra con el número de orden, registra el agregador (Uber o PedidosYa) y guarda la imagen en la carpeta, base de datos o repositorio de ese agregador.

---

## 3. Matriz de Trazabilidad de Requerimientos (RTM Inicial)

| ID Problema | Descripción del Dolor | Impacto | ID Feature (`02-features.md`) | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-01` | No hay una cámara de la app para fotografiar el pedido que se disputa | `Alto` | `FEAT-01` | `mod-camera` |
| `ERR-02` | La imagen no queda nombrada con el número de orden | `Alto` | `FEAT-02` | `mod-order-name` |
| `ERR-03` | No se registra el agregador del pedido (Uber o PedidosYa) | `Alto` | `FEAT-03` | `mod-aggregator` |
| `ERR-04` | La imagen no se guarda en la carpeta, base de datos o repositorio según el agregador | `Alto` | `FEAT-04` | `mod-evidence-store` |

Los módulos de la columna destino son sugeridos para el descubrimiento posterior. `03-module-discovery.md` sigue vacío hasta que el Arquitecto apruebe el Gate 1.

---

## 4. Audiencia y Casos de Uso Core

- **Usuarios principales:**
  - **Personal del negocio:** ante una disputa de devolución, fotografiar el pedido, indicar el número de orden y el agregador, y guardar la imagen en el destino de ese agregador.

- **Fuera de alcance (Out of Scope explícito):**
  - Redactar la disputa, el motivo de la devolución o enviarla al portal o a la API de Uber o PedidosYa.
  - Importar el listado de pedidos desde el agregador.
  - iOS y web en V1.
  - Cuentas de usuario de la app, recorte, filtros o anotaciones sobre la foto.
  - Agregadores distintos de Uber y PedidosYa.

---

## 5. Objetivo y Beneficios Esperados

- **Objetivo:** Entregar una app Android (APK Release) con la que el personal del negocio saque la foto del pedido, la nombre con el número de orden, elija el agregador (Uber o PedidosYa) y la guarde en la carpeta, base de datos o repositorio de ese agregador.
- **Beneficios esperados:**
  - Evidencia fotográfica del pedido tomada en el momento de la disputa.
  - Cada imagen queda identificada con su número de orden.
  - El destino del archivo sigue al agregador del pedido.

---

## 6. Criterios de Éxito en Formato BDD (Gherkin)

### Escenario 1: Evidencia del pedido lista para la disputa

- **Dado que** el personal del negocio abre la app en Android con un pedido en disputa de devolución
- **Cuando** elige el agregador, ingresa el número de orden, saca la foto del pedido y guarda
- **Entonces** la imagen queda nombrada con ese número de orden y almacenada en el destino configurado para ese agregador (carpeta, base de datos o repositorio)

### Escenario 2: Validación de estándares

- **Dado que** se renderizan la cámara, el campo de número de orden, el selector de agregador y la acción de guardar
- **Cuando** el agente compile la interfaz
- **Entonces** los estilos consumen tokens de `standards/design-system.md` o el theme documentado en `04-application-design.md`

---

## 7. Matriz de Restricciones Técnicas y Operativas

| Categoría | Restricción / Límite | Impacto | Estándar asociado |
| :--- | :--- | :--- | :--- |
| **Tiempo** | Sin fecha límite informada por Negocio | `Medio` | `ROADMAP.md` |
| **Tecnología** | `Expo SDK 52, RN 0.76.x, TypeScript` | `Alto` | `standards/coding-standards.md` |
| **Plataforma V1** | `Android APK release sin Metro` | `Alto` | WIKA-ARCH-03 |
| **Diseño / UX** | Tokens base; mockup pendiente en `04-application-design.md` | `Alto` | `standards/design-system.md` |
| **Seguridad** | Las fotos son evidencia del negocio y solo se escriben en el destino del agregador. Credenciales de base de datos o repositorio: pendientes de Negocio | `Alto` | `standards/coding-standards.md` |
| **Librerías prohibidas** | Versiones flotantes `^` en expo y react-native | `Bloqueante` | WIKA-ARCH-02 |
| **Destino** | Carpeta, base de datos o repositorio, uno según el agregador. La tabla agregador → destino está pendiente de Negocio | `Bloqueante` | WIKA-ARCH-01 |
| **Red** | Carpeta puede ser local. Base de datos y repositorio requieren conectividad al guardar | `Alto` | `standards/coding-standards.md` |

---

## 8. Supuestos y Riesgos

- **Supuestos clave:**
  - «pedya» del pedido de Negocio se lee como **PedidosYa**.
  - El número de orden lo escribe el operador. No hay lectura de código ni consulta al agregador en V1.
  - Puede haber más de una foto del mismo pedido. Cada guardado conserva el número de orden y no pisa una imagen ya guardada de esa misma orden y agregador.
  - El patrón exacto del nombre (separadores, código de agregador, índice) y la tabla agregador → destino (carpeta, base de datos o repositorio), con su ruta o credenciales, **no los definió Negocio**. Quedan pendientes y no son contrato de build hasta confirmarlos.
- **Riesgos identificados:** Sin el destino de cada agregador y sin el patrón de nombre, el guardado no se puede construir. Permiso de cámara denegado o destino inaccesible deja la evidencia sin guardar.
- **Plan de mitigación:** Mantener `audit_1_passed: false` hasta que Negocio confirme la tabla de destinos y el patrón de nombre. La app no declara éxito de guardado si el destino no recibió la imagen.

### Decisiones pendientes de Negocio

| ID | Decisión | Estado |
| :--- | :--- | :--- |
| `DEC-01` | Para Uber, el destino es carpeta, base de datos o repositorio, y cuál es la ubicación o credencial | `PENDIENTE` |
| `DEC-02` | Para PedidosYa, el destino es carpeta, base de datos o repositorio, y cuál es la ubicación o credencial | `PENDIENTE` |
| `DEC-03` | Patrón exacto del nombre de archivo, además de incluir el número de orden | `PENDIENTE` |

---

## 9. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist de criterios de aceptación

- [x] YAML frontmatter completado (`id`, `status`, `owner`, fechas).
- [x] Problemas `ERR-XX` mapeados a `FEAT-XX` y módulos sugeridos en RTM.
- [x] Criterios de éxito en formato BDD (Dado / Cuando / Entonces).
- [x] Out-of-scope explícito documentado.
- [x] Restricciones técnicas alineadas a `standards/coding-standards.md`.
- [ ] Auditoría registrada en `audits/auditoria-documentacion.md` con resultado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `________________________`
- **Fecha de aprobación:** `YYYY-MM-DD`
- **audit_1_passed:** `false` → cambiar a `true` al aprobar
