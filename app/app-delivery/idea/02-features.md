---
id: "FEAT-001"
title: "Especificación de Requerimientos — app-delivery"
status: "BORRADOR"
version: "1.0.0"
owner: "Negocio / Equipo WIKA"
created_at: "2026-11-05"
updated_at: "2026-11-05"
audit_1_passed: false
---

# [02] Especificación de Características y Requerimientos Funcionales

> **Gate 1:** este documento se aprueba **junto con** `01-problem.md`.  
> **Equivalencia:** Auditoría de Documentación → `docs/auditoria-documentacion.md`.  
> El Gate 2 (Auditoría de Módulos) no se registra en este documento; vive en `03-module-discovery.md`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `app-delivery`
- **Documento base:** `idea/01-problem.md` (ID: `PROB-001`)
- **Estado de gatekeeping:** `PENDIENTE_AUDITORIA_DOCUMENTACION`

---

## 2. Matriz de Trazabilidad de Requerimientos (RTM 1:1)

| ID Feature | ID Problema (`01-problem.md`) | Nombre de la Característica | Prioridad | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-01` | `ERR-01` | Sacar foto | `Crítica` | `mod-camera` |
| `FEAT-02` | `ERR-02` | Renombrar la imagen | `Crítica` | `mod-order-name` |
| `FEAT-03` | `ERR-03` | Definir agregador | `Crítica` | `mod-aggregator` |
| `FEAT-04` | `ERR-04` | Guardar imagen | `Crítica` | `mod-evidence-store` |

---

## 3. Funcionalidades Obligatorias

### Feature `FEAT-01`: Sacar foto

**Descripción:** La app abre la cámara del dispositivo y captura una foto del pedido. Esa foto es la evidencia para pelear la disputa de devolución.

#### Escenario 1.1: Flujo exitoso (Happy Path)

- **Dado que** la app tiene permiso de cámara y hay un pedido que el negocio va a disputar
- **Cuando** el operador toma la foto del pedido
- **Entonces** la app conserva esa imagen en la sesión, lista para nombrarla y guardarla

#### Escenario 1.2: Manejo de errores

- **Dado que** el permiso de cámara está denegado o la cámara no está disponible
- **Cuando** el operador intenta sacar la foto
- **Entonces** la app no se cierra, informa que no pudo capturar y no guarda una imagen vacía

---

### Feature `FEAT-02`: Renombrar la imagen

**Descripción:** Al guardar, la imagen queda con un nombre que contiene el número de orden escrito por el operador.

**Regla V1:** el nombre incluye el número de orden, sin espacios al inicio ni al final. Una foto nueva del mismo número de orden y el mismo agregador no reemplaza a una imagen ya guardada: ambas quedan identificables.

**Pendiente (`DEC-03`):** el patrón exacto (código de agregador, separadores, índice) lo confirma Negocio. Hasta entonces no es contrato de build.

#### Escenario 2.1: Flujo exitoso

- **Dado que** el operador ingresó un número de orden y ya sacó la foto
- **Cuando** guarda la imagen
- **Entonces** el nombre con el que queda almacenada contiene ese número de orden

#### Escenario 2.2: Validación de entrada

- **Dado que** el número de orden está vacío
- **Cuando** el operador confirma el guardado
- **Entonces** la app no guarda y señala que falta el número de orden

---

### Feature `FEAT-03`: Definir agregador

**Descripción:** El operador indica el agregador del pedido antes de guardar. El catálogo V1 es cerrado.

**Catálogo V1:** `uber` | `pedidosya`.  
**Lectura del pedido de Negocio:** «pedya» se documenta como PedidosYa.

#### Escenario 3.1: Flujo exitoso

- **Dado que** el pedido pertenece a Uber o a PedidosYa
- **Cuando** el operador elige ese agregador
- **Entonces** el guardado usa el destino configurado para esa opción

#### Escenario 3.2: Validación de entrada

- **Dado que** no hay agregador elegido
- **Cuando** el operador confirma el guardado
- **Entonces** la app no guarda y señala que falta el agregador

---

### Feature `FEAT-04`: Guardar imagen

**Descripción:** La app escribe la imagen ya nombrada en el destino del agregador elegido: una carpeta, una base de datos o un repositorio.

**Pendiente (`DEC-01`, `DEC-02`):** Negocio todavía no asignó cuál de esos tres destinos usa Uber, cuál usa PedidosYa, ni la ruta o las credenciales. Sin esa tabla el guardado no se construye.

#### Escenario 4.1: Flujo exitoso

- **Dado que** hay foto, número de orden, agregador elegido y un destino configurado para ese agregador
- **Cuando** el operador guarda
- **Entonces** la imagen queda en ese destino (carpeta, base de datos o repositorio) con el número de orden en el nombre, y la app confirma el guardado

#### Escenario 4.2: Manejo de errores

- **Dado que** el destino de ese agregador no está configurado, o no se puede escribir en él
- **Cuando** el operador guarda
- **Entonces** la app no confirma el guardado, conserva la foto de la sesión y explica que el destino no recibió la imagen

---

## 4. Funcionalidades Deseables (V1.1+)

| ID Feature | Nombre | Prioridad | Notas |
| :--- | :--- | :--- | :--- |
| `FEAT-05` | Leer el número de orden desde un código o QR | `Media` | V1 el número se escribe a mano |
| `FEAT-06` | Consultar las evidencias ya guardadas | `Media` | Fuera del flujo V1 de capturar y guardar |

---

## 5. Fuera de Alcance

- Crear, redactar o enviar la disputa en Uber o PedidosYa.
- Traer pedidos desde el agregador.
- iOS, web, cuentas de la app y edición de la foto.
- Agregadores fuera de Uber y PedidosYa.

---

## 6. Requerimientos No Funcionales (NFRs) Medibles

| ID NFR | Categoría | Criterio aceptable | Método de validación |
| :--- | :--- | :--- | :--- |
| `NFR-01` | **Captura** | Con permiso de cámara, una toma deja una imagen en la sesión y la app sigue abierta | Prueba manual en dispositivo |
| `NFR-02` | **Nombre** | Toda imagen confirmada como guardada contiene el número de orden ingresado | Inspección del destino |
| `NFR-03` | **Destino** | La confirmación de guardado aparece solo si el destino del agregador recibió la imagen | Prueba por agregador con destino configurado |
| `NFR-04` | **Build** | APK release compila sin Metro | `scripts/build-apk.sh` |
| `NFR-05` | **Permiso** | Sin permiso de cámara no hay captura y no hay crash | Prueba manual con permiso denegado |
| `NFR-06` | **Fidelidad visual** | 100% tokens documentados en la UI de captura | Revisión en `04-application-design.md` |

La carpeta puede resolverse en el dispositivo. Base de datos y repositorio se validan con red disponible hacia ese destino.

---

## 7. Mapeo de UI y Componentes (si aplica)

| Componente UI | Pantalla / Vista | Tokens (`standards/design-system.md`) | Estado mockup |
| :--- | :--- | :--- | :--- |
| `CameraCapture` | Captura | `surface`, `spacing.md` | `PENDIENTE` |
| `OrderNumberField` | Captura | `surface`, `spacing.sm` | `PENDIENTE` |
| `AggregatorPicker` | Captura | `accent`, `spacing.sm` | `PENDIENTE` |
| `SaveEvidenceButton` | Captura | `accent`, `spacing.md` | `PENDIENTE` |

---

## 8. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist

- [x] Frontmatter YAML vinculado a `PROB-001`.
- [x] RTM 1:1 con IDs `ERR-XX` de `01-problem.md`.
- [x] Escenarios BDD por feature obligatoria.
- [x] NFRs con métricas verificables.
- [x] Deseables y fuera de alcance diferenciados.
- [ ] `audits/auditoria-documentacion.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `________________________`
- **Fecha:** `YYYY-MM-DD`
- **audit_1_passed:** `false` → `true` al aprobar
