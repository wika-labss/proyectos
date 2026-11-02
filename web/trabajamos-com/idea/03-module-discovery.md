---
id: "WEB-MOD-001"
title: "trabajamos.com — Descubrimiento de Módulos"
status: "APROBADO"
version: "0.1.0"
owner: "Vissiuss"
created_at: "2026-11-02"
updated_at: "2026-11-02"
audit_1_passed: true
audit_2_passed: true
---

# [03] Descubrimiento y Especificación de Módulos — trabajamos.com

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y `02-features.md`.  
> **Equivalencia:** Auditoría de Módulos → `docs/auditoria-modulos.md`.  
> `audit_2_passed` se activa **solo en este documento**, no en 01/02/04.

## 1. Identificación y Documentos Base

- **Nombre del Proyecto:** trabajamos.com
- **Especificaciones base:** `01-problem.md` (`WEB-PROB-001`) | `02-features.md` (`WEB-FEAT-001`)
- **site_type:** `cms`
- **Estado de gatekeeping:** `AUDITORIA_MODULOS_APROBADA`

---

## 2. Matriz de Trazabilidad Modular (RTM)

| ID Módulo | ID Feature (`02`) | ID Problema (`01`) | Nombre | Tipo | Responsabilidad |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MOD-DIR` | N/A | N/A | Dirección visual | diseño | Resolver `direction_skill` |
| `MOD-01` | `FEAT-01`, `FEAT-07` | `ERR-01`, `ERR-07` | `mod-perfil` | cms | Perfil público: nombre, botón `Contactar` y redes |
| `MOD-02` | `FEAT-02` | `ERR-02` | `mod-ofertas` | cms | Ofertas de proyecto, servicio u oficio con su `#` |
| `MOD-03` | `FEAT-03` | `ERR-03` | `mod-portafolio` | cms | Imágenes del trabajo en el perfil |
| `MOD-04` | `FEAT-04` | `ERR-04` | `mod-geo` | integración | Resolver y guardar puntos geográficos |
| `MOD-05` | `FEAT-05`, `FEAT-06` | `ERR-05`, `ERR-06` | `mod-buscador` | sección | Barra, coincidencia por `#` y orden por cercanía |
| `MOD-06` | `FEAT-01` | `ERR-01` | `mod-cuenta` | cms | Sesión del emprendedor para editar su perfil |

Cobertura: cada `FEAT-01` … `FEAT-07` tiene módulo. `MOD-01` a `MOD-05` son los módulos destino que fijaron `01` y `02`. `MOD-06` sale de la condición "emprendedor autenticado" de `FEAT-01` y de la restricción de seguridad de `01` §7.

---

## 3. Desglose de Arquitectura Modular

Rutas previstas para la Fase 1 (HTML semántico). El stack de servidor, datos y hosting se fija en `05-build-plan.md`.

### Módulo `MOD-01`: `mod-perfil`

**Ruta prevista:** `iterations/v1/perfil.html` (perfil público) y `iterations/v1/panel/perfil.html` (edición)

#### Contrato

- **Responsabilidad:** publicar la identidad del emprendedor y sus vías de contacto.
- **Entradas:**
  - Nombre visible (obligatorio).
  - Contacto: un teléfono, un correo o una URL.
  - Redes: lista de `{ nombre, url }`.
  - Sesión de `MOD-06` para editar.
- **Salidas:**
  - Perfil público con dirección propia. Contiene ofertas (`MOD-02`), portafolio (`MOD-03`) y localidad (`MOD-04`).
  - Botón `Contactar`: abre `tel:`, `mailto:` o la URL guardada.
  - Un enlace por red, con el nombre de la red como texto.
- **Errores:**
  - Sin sesión o sin nombre: el perfil no se publica y se indica el dato que falta (`FEAT-01` 1.2).
  - Contacto vacío o URL de red inválida: ese dato no se publica y quedan los valores válidos anteriores (`FEAT-07` 7.2).
- **Dependencias:** `MOD-06`. Muestra `MOD-02`, `MOD-03` y `MOD-04`.
- **Límite:** no tiene chat. No muestra el contenido de las redes. No guarda ofertas, imágenes ni puntos.
- **Reutilizable:** Sí (botón de contacto y lista de redes).

---

### Módulo `MOD-02`: `mod-ofertas`

**Ruta prevista:** sección de ofertas en `iterations/v1/perfil.html` y `iterations/v1/panel/ofertas.html`

#### Contrato

- **Responsabilidad:** registrar lo que el emprendedor ofrece y clasificarlo con un `#`.
- **Entradas:**
  - Tipo: `proyecto | servicio | oficio`.
  - Título de la oferta.
  - `#` de oficio, guardado con la regla de normalización de `MOD-05`.
  - Sesión de `MOD-06`.
- **Salidas:**
  - Oferta listada en el perfil con su tipo y su `#`.
  - Índice de `#` por oferta, que lee `MOD-05`.
- **Errores:** sin tipo o con `#` vacío, la oferta no se guarda y el perfil conserva las anteriores (`FEAT-02` 2.2).
- **Dependencias:** `MOD-01` (perfil publicado), `MOD-06`, regla de normalización de `MOD-05`.
- **Límite:** no tiene precios, cotizaciones, reservas ni pagos.
- **Reutilizable:** No.

---

### Módulo `MOD-03`: `mod-portafolio`

**Ruta prevista:** sección de portafolio en `iterations/v1/perfil.html` y `iterations/v1/panel/portafolio.html`

#### Contrato

- **Responsabilidad:** guardar y mostrar imágenes del trabajo del emprendedor.
- **Entradas:**
  - Archivo de imagen.
  - Texto alternativo (NFR de accesibilidad de `02` §6). **Supuesto aceptado en Gate 1:** lo escribe el emprendedor.
  - Sesión de `MOD-06`.
- **Salidas:** imagen visible en el portafolio del perfil, con su texto alternativo.
- **Errores:** si el archivo no es una imagen o la carga falla, el portafolio no cambia y se indica que la imagen no se guardó (`FEAT-03` 3.2).
- **Dependencias:** `MOD-01`, `MOD-06`, almacenamiento de imágenes (proveedor en `05`).
- **Límite:** no edita imágenes. No es una galería general del portal.
- **Reutilizable:** Sí (carga y galería).

---

### Módulo `MOD-04`: `mod-geo`

**Ruta prevista:** `iterations/v1/panel/localidad.html` y servicio de geocodificación que usa `MOD-05`

#### Contrato

- **Responsabilidad:** convertir una localidad en un punto y guardar el punto que el emprendedor confirma.
- **Entradas:**
  - Punto que el emprendedor confirma en un mapa o con una localidad escrita.
  - Localidad escrita por el cliente, cuando `MOD-05` la envía.
  - Sesión de `MOD-06` para guardar el punto del perfil.
- **Salidas:**
  - Punto del perfil. Con punto, las ofertas del perfil entran al listado de cercanos.
  - Punto del cliente para `MOD-05`. Este punto no se guarda.
- **Errores:**
  - Sin punto confirmado, las ofertas del perfil no aparecen como cercanas (`FEAT-04` 4.2).
  - Si una localidad escrita no se resuelve, no devuelve un punto.
- **Dependencias:** `MOD-06`, proveedor de mapa y geocodificación (en `05`).
- **Límite:** no rastrea el dispositivo del emprendedor. No publica un punto sin su confirmación.
- **Reutilizable:** Sí.

---

### Módulo `MOD-05`: `mod-buscador`

**Ruta prevista:** `iterations/v1/index.html` (barra y listado)

#### Contrato

- **Responsabilidad:** responder la búsqueda del cliente con ofertas del `#` pedido, de la más cercana a la más lejana.
- **Entradas:**
  - Texto de la barra.
  - Ubicación del cliente: geolocalización del navegador o localidad escrita (resuelta por `MOD-04`).
- **Regla de normalización de `#`:** minúsculas, sin espacios sobrantes y con `#` si falta. `gasfiter` y `#gasfiter` dan `#gasfiter`. `MOD-02` guarda los `#` con esta misma regla.
- **Salidas:** listado de ofertas de ese `#` con punto, ordenado por distancia ascendente. Cada ítem enlaza al perfil (`MOD-01`).
- **Errores:**
  - Si el `#` no coincide con ninguno publicado, el listado queda vacío, indica que ese oficio no está y no muestra otros `#` (`FEAT-05` 5.2).
  - Sin ubicación del navegador ni localidad escrita, no inventa un punto y pide una ubicación (`FEAT-06` 6.2).
- **Dependencias:** `MOD-02` (índice de `#`), `MOD-04` (puntos y geocodificación), `MOD-01` (enlace al perfil).
- **Límite:** el cliente no tiene cuenta. No hay compositor ni muro de hashtags. Las ofertas sin punto no entran al listado de cercanos.
- **Reutilizable:** No.

---

### Módulo `MOD-06`: `mod-cuenta`

**Ruta prevista:** `iterations/v1/panel/entrar.html` y protección de `iterations/v1/panel/`

#### Contrato

- **Responsabilidad:** autenticar al emprendedor y limitar cada edición a su propio perfil.
- **Entradas:** credencial del emprendedor (método en `05`).
- **Salidas:** sesión que autoriza escribir en `MOD-01`, `MOD-02`, `MOD-03` y `MOD-04` del perfil propio.
- **Errores:** sin sesión válida, nada se publica ni se edita (`FEAT-01` 1.2).
- **Dependencias:** proveedor de autenticación (en `05`).
- **Límite:** solo para emprendedores. El cliente navega y busca sin cuenta.
- **Reutilizable:** Sí.

---

## 4. Dependencias, integraciones y riesgos

### Grafo de dependencias

```text
MOD-06 mod-cuenta ──▶ MOD-01 mod-perfil, MOD-02 mod-ofertas, MOD-03 mod-portafolio, MOD-04 mod-geo
MOD-01 mod-perfil ──▶ muestra MOD-02, MOD-03, MOD-04
MOD-05 mod-buscador ──▶ lee MOD-02 (índice #), usa MOD-04 (puntos), enlaza MOD-01
```

No hay ciclos. `MOD-02` usa la regla de normalización de `MOD-05` como contrato compartido, no como llamada.

### Integraciones

| Integración | Módulos | Estado |
| :--- | :--- | :--- |
| CMS / datos del portal (un solo origen) | `MOD-01` … `MOD-06` | Proveedor en `05` |
| Autenticación del emprendedor | `MOD-06` | Método en `05` |
| Almacenamiento de imágenes | `MOD-03` | Proveedor en `05` |
| Mapa y geocodificación | `MOD-04`, `MOD-05` | Proveedor en `05` |
| Geolocalización del navegador | `MOD-05` | Permiso del cliente |
| Enlaces salientes `tel:`, `mailto:` y URL | `MOD-01` | Sin proveedor |

### Riesgos

1. **Tildes en `#`.** Decisión del Gate 2: `#gásfiter` y `#gasfiter` son oficios distintos.
2. **Oficios de varias palabras.** Decisión del Gate 2: el espacio interno se conserva (`#maestro chasquilla`).
3. **Privacidad del punto.** Quien trabaja desde su casa puede publicar la ubicación de su casa. El punto es el que él confirma; `01` no pide un punto aproximado.
4. **Distancia.** `02` pide orden por cercanía sin definir la medida. **Supuesto:** distancia en línea recta entre puntos.
5. **URL válida de redes.** **Supuesto:** se acepta una URL `https://` completa.
6. **Perfiles falsos o abusivos.** v1 no tiene moderación ni denuncias, y `01` y `02` no las piden.
7. **Proveedores sin elegir.** Datos, autenticación, imágenes y mapa se fijan en `05`. No bloquean este gate.

---

## 5. Resolución de dirección visual (taste-skill) — MOD-DIR

Resuelto con `standards/direction-matrix.yaml`: `mappings.b2b_saas` da `minimalist-ui`. El tono `claro` de `01` cae en el desempate de `minimalist-ui`.

```yaml
mod_id: MOD-DIR
industry_type: b2b_saas
business_model: marketplace_oficios_local
direction_skill: minimalist-ui
direction_rationale: "Portal de búsqueda y perfiles: barra y listado primero, perfiles legibles en el teléfono, tono claro, cercano y práctico. b2b_saas mapea a minimalist-ui y 'claro' confirma el desempate."
direction_locked: true
allowed_phase2_skills:
  - design-taste-frontend
  - redesign-existing-projects
forbidden_phase2_skills:
  - image-to-code
```

`direction_locked: true` desde la aprobación del Gate 2. Cambiar de dirección exige reabrir la auditoría de módulos.
