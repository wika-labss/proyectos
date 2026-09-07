---
id: "PROB-001"
title: "Ramon David — Acolchados CD"
status: "EN_REVISION"
version: "1.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-09-07"
updated_at: "2026-09-07"
audit_1_passed: false
excepcion_web: true
iteracion_actual: "v2"
---

# [01] Definición del Problema, Alcance y Metas

> **Equivalencia de auditoría:** `audit_1_passed: true` requiere aprobación formal en `audits/auditoria-documentacion.md`.
>
> **EXCEPCIÓN WIKA-WEB:** Este proyecto es un **sitio web** (Flask + HTML/CSS/JS), no una app Expo/Android. Las reglas de stack móvil (SDK 52, APK, expo-router) **no aplican**. El resto del flujo WIKA (RTM, idea 01–05, audits, `iterations/v{N}/`) sí aplica.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `Ramon David` (marca pública: Acolchados CD)
- **Repositorio de aplicación:** `proyectos/app/ramon-david/`
- **Código V1 (as-built):** `iterations/v1/`
- **Código V2:** `iterations/v2/` — portales usuario/admin + stock
- **Stakeholders clave:** Vissiuss (producto / ingeniería), Acolchados CD, visitante del sitio, personal interno (`user`), administrador de stock (`admin`)
- **Estado de gatekeeping:** `PENDIENTE_AUDITORIA_DOCUMENTACION` (V1 ya construida; docs son retrofit)
- **Sitio de referencia:** https://www.acolchadoscd.cl

---

## 2. Definición del Problema y Justificación

- **¿Qué problema se intenta resolver?**  
  Acolchados CD vende textiles de cama (sábanas, plumones, quilts, toallas, cubre colchón, servicios de bordado/mantelería) con precios **valor neto CLP** por talla. El catálogo PDF no es editable ni navegable; el equipo necesita una vitrina pública y un panel para cambiar precios, medidas e imágenes sin tocar código.

- **Impacto actual / costo de oportunidad:**  
  Cotizar a mano desde el PDF; el visitante no ve tallas/precios en la web; cada cambio de lista implica reeditar archivos o republicar el PDF.

- **Análisis de brecha (Gap Analysis):**
  - **Estado actual (hoy):** V1 en `iterations/v1/` (un solo `/admin` para CRUD, sin stock). Supabase en la raíz del proyecto (no cableado).
  - **Estado deseado (v2):** Sitio público sin login + portal **usuario** (categorías → productos → edición) + portal **admin** (consultas, reportes y +/− stock). JSON local. Supabase sigue siendo `FEAT-08`.

---

## 3. Matriz de Trazabilidad de Requerimientos (RTM Inicial)

| ID Problema | Descripción del Dolor | Impacto | ID Feature (`02-features.md`) | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-01` | No hay vitrina pública de marca/colección | `Alto` | `FEAT-01` | `mod-public-site` |
| `ERR-02` | Precios y medidas no se consultan por producto/talla | `Alto` | `FEAT-02` | `mod-catalog-api`, `mod-catalog-ui` |
| `ERR-03` | Editar el catálogo exige tocar JSON a mano | `Alto` | `FEAT-03` | `mod-admin-crud` |
| `ERR-04` | Productos sin foto usable en la ficha | `Medio` | `FEAT-04` | `mod-uploads` |
| `ERR-05` | No hay canal de contacto / historia de marca | `Medio` | `FEAT-05` | `mod-public-site` |
| `ERR-06` | El panel de precios no puede quedar abierto | `Alto` | `FEAT-06` | `mod-admin-auth` |
| `ERR-07` | Un solo login mezcla edición y operación | `Alto` | `FEAT-12` | `mod-roles` |
| `ERR-08` | El personal no navega catálogo por categoría para editar | `Alto` | `FEAT-13` | `mod-portal-user` |
| `ERR-09` | No hay stock, movimientos ni reportes | `Alto` | `FEAT-14` | `mod-stock` |

---

## 4. Audiencia y Casos de Uso Core

- **Usuarios principales:**
  - **Visitante / comprador B2B o hogar:** ver colección, filtrar categoría, abrir medidas y precio neto.
  - **Personal interno (`user`):** login en `/portal`, ver categorías → productos → editar ficha.
  - **Administrador (`admin`):** login en `/admin`, consultas de stock, reportes, sumar/descontar unidades.
- **Fuera de alcance (Out of Scope explícito V2):**
  - App móvil Expo / APK / iOS (excepción web).
  - Pipeline Design System V3+ (`design-system/`).
  - Sync live con Supabase `ramon-david` (`FEAT-08`).
  - Envío real de correo del formulario de contacto.
  - Carrito, pago, multi-sucursal, cuentas de cliente.
  - Publicar portales a internet abierto sin HTTPS ni hash propio.

---

## 5. Objetivo y Beneficios Esperados

- **Objetivo:** Encajar el sitio V1 (público + admin) en el flujo WIKA como **proyecto web**, con RTM y carpeta `iterations/v1/` como fuente de verdad del código.
- **Beneficios esperados:**
  - Una URL para vitrina y otra para precios.
  - Catálogo editable sin redeploy de HTML estático.
  - Iteraciones futuras (v2) con gates, sin romper la excepción de stack.

---

## 6. Criterios de Éxito en Formato BDD (Gherkin)

### Escenario 1: Visitante ve el catálogo

- **Dado que** `el servidor Flask de iterations/v1 está en marcha`
- **Cuando** `abre / y luego /productos.html`
- **Entonces** `ve home de Acolchados CD y un listado con los productos de data/products.json (19 en V1)`

### Escenario 2: Admin edita un precio

- **Dado que** `el administrador inicia sesión en /admin`
- **Cuando** `cambia un valor de tabla y el panel guarda`
- **Entonces** `GET /api/products refleja el cambio y la ficha pública lo muestra`

### Escenario 3: Portal usuario edita por categoría

- **Dado que** `un usuario con rol user inicia sesión en /portal`
- **Cuando** `abre una categoría y luego un producto`
- **Entonces** `puede editar la ficha; no puede abrir /admin ni APIs de stock`

### Escenario 4: Admin mueve stock

- **Dado que** `un admin inicia sesión en /admin`
- **Cuando** `descuenta 2 unidades de una talla con stock suficiente`
- **Entonces** `el saldo baja, queda un movimiento y el reporte lo incluye`

### Escenario 5: Tokens visuales (web)

- **Dado que** `se renderizan páginas públicas`
- **Cuando** `el agente revise estilos`
- **Entonces** `los colores tipográficos salen de tokens en css/main.css :root (documentados en 04), no de hex sueltos nuevos`

---

## 7. Matriz de Restricciones Técnicas y Operativas

| Categoría | Restricción / Límite | Impacto | Estándar asociado |
| :--- | :--- | :--- | :--- |
| **Plataforma V1** | **Web** (navegador desktop + móvil). **No** Android APK | `Bloqueante` | Excepción `WIKA-WEB` |
| **Tecnología** | Python 3.11+ · Flask `~=3.0` · HTML/CSS/JS | `Alto` | `05-build-plan.md` |
| **Datos** | `data/products.json` + `uploads/` en disco | `Alto` | `mod-catalog-store` |
| **Diseño / UX** | Theme local en `css/main.css` (no DS V3+) | `Alto` | `04-application-design.md` |
| **Seguridad** | Login admin + CSRF; cookie Secure solo si `FLASK_ENV=production` | `Alto` | `FEAT-06` |
| **Librerías** | Pin `~=` en `requirements.txt`. Sin Expo/`^` | `Bloqueante` | WIKA-ARCH-02 adaptado a pip |
| **WIKA-ARCH-03/04/05** | DEV=`python app.py`; verify=HTTP smoke. JDK/APK = N/A | `Alto` | Excepción web |

---

## 8. Supuestos y Riesgos

- **Supuestos clave:** Un operador conoce usuario/clave; el catálogo cabe en un JSON; no se requiere auth de visitantes.
- **Riesgos identificados:** Túnel o deploy público con credenciales de prueba (`admin` / `cambiar123`); JSON corrupto; dos fuentes de verdad (JSON vs Supabase).
- **Plan de mitigación:** Hash de password por env; backup de `products.json`; V1.1 elige una sola fuente (JSON o Supabase).

---

## 9. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist de criterios de aceptación

- [x] YAML frontmatter completado (`id`, `status`, `owner`, fechas).
- [x] Problemas `ERR-XX` mapeados a `FEAT-XX` y módulos.
- [x] Criterios de éxito en formato BDD.
- [x] Out-of-scope explícito (incluye excepción web).
- [x] Restricciones técnicas **web** documentadas (no se fuerza Expo).
- [ ] Auditoría registrada en `audits/auditoria-documentacion.md` con resultado `APROBADO`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `________________________`
- **Fecha de aprobación:** `YYYY-MM-DD`
- **audit_1_passed:** `false` → cambiar a `true` al aprobar
