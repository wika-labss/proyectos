---
id: "WEB-PROB-001"
title: "trabajamos.com — Definición del Problema"
status: "BORRADOR"
version: "0.1.0"
owner: "Vissiuss"
created_at: "2026-11-02"
updated_at: "2026-11-02"
audit_1_passed: false
industry_type: "b2b_saas"
target_audience: "Emprendedores y oficios que ofrecen trabajo local; clientes que buscan un oficio cerca"
brand_tone: "claro, cercano, practico"
---

# [01] Definición del Problema, Alcance y Metas — trabajamos.com

> **Equivalencia de auditoría:** `audit_1_passed: true` requiere aprobación formal en `docs/auditoria-documentacion.md`.  
> **Ruta del sitio:** `proyectos/web/trabajamos-com/`.  
> El SKU comercial A/B **no** se clasifica aquí. Eso es el consultor (`docs/plan-de-negocio-web/`).

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** trabajamos.com
- **Repositorio de aplicación:** `proyectos/web/trabajamos-com/`
- **Stakeholders clave:** Vissiuss (negocio), emprendedor u oficio, cliente que busca un oficio, Arquitecto WIKA
- **Estado de gatekeeping:** `PENDIENTE_AUDITORIA_DOCUMENTACION`
- **industry_type (MOD-DIR):** `b2b_saas`
- **Nota de industry_type:** el portal es un marketplace de oficios y servicios locales. `standards/direction-matrix.yaml` no tiene un enum de marketplace local. Se usa `b2b_saas` como el valor válido más cercano (producto con perfiles editables y búsqueda). El arquitecto puede cambiarlo en Gate 2.
- **brand_tone:** `claro, cercano, practico`. **Supuesto** de este gate: negocio no definió tono de marca.

---

## 2. Definición del Problema y Justificación

- **¿Qué problema se intenta resolver?**  
  Hay gente sin empleo y muchas páginas para buscar trabajo, pero pocas oportunidades pensadas para oficios y emprendedores. Quien ofrece un proyecto, un servicio o un oficio no tiene un perfil propio donde mostrar qué hace, con imágenes de su trabajo y con su localidad georreferenciada. Quien necesita un oficio no tiene una barra de búsqueda que encuentre esas ofertas cerca de donde está.

- **Impacto actual / costo de oportunidad:**  
  El emprendedor compite en portales de empleo que no muestran su oficio ni su trabajo hecho. El cliente no distingue quién está cerca ni qué oficio se ofrece.

- **Análisis de brecha:**
  - **Estado actual:** muchas páginas de empleo; pocas vitrinas para oficios y emprendedores; sin perfil, portafolio ni localidad georreferenciada; sin buscador de oficios cercanos.
  - **Estado deseado:** un portal donde el emprendedor arma su perfil, publica proyectos, servicios y oficios, gestiona un portafolio con imágenes y georreferencia su localidad. El cliente usa una barra de búsqueda; la búsqueda funciona con `#` de oficio y, según su ubicación, ve oficios cercanos.

---

## 3. Matriz de Trazabilidad de Requerimientos (RTM Inicial)

| ID Problema | Descripción del Dolor | Impacto | ID Feature (`02-features.md`) | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-01` | Hay muchas páginas de empleo y pocas oportunidades para oficios y emprendedores. | `Alto` | `FEAT-01` | `mod-perfil` |
| `ERR-02` | El emprendedor no tiene dónde ofrecer proyectos, servicios y oficios. | `Alto` | `FEAT-02` | `mod-ofertas` |
| `ERR-03` | No puede mostrar imágenes de su trabajo. | `Alto` | `FEAT-03` | `mod-portafolio` |
| `ERR-04` | Su localidad no queda georreferenciada. | `Alto` | `FEAT-04` | `mod-geo` |
| `ERR-05` | El cliente no busca oficios con `#` desde una barra. | `Alto` | `FEAT-05` | `mod-buscador` |
| `ERR-06` | No ve oficios cercanos según su ubicación. | `Alto` | `FEAT-06` | `mod-buscador` |

Los módulos destino son la referencia para `03-module-discovery.md`. Este gate no los diseña.

---

## 4. Audiencia y Casos de Uso Core

- **Usuarios principales:**
  - **Emprendedor / oficio:** arma y mantiene su perfil, publica proyectos, servicios y oficios, carga imágenes de su trabajo y georreferencia su localidad.
  - **Cliente:** escribe en una barra de búsqueda y ve oficios ofrecidos cerca de su ubicación. La consulta se resuelve con `#` de oficio. No administra un perfil en v1.

- **Fuera de alcance (Out of Scope explícito):**
  - Bolsa de empleo, currículum y postulaciones.
  - Pagos, cotizaciones formales, reservas y contratación.
  - Mensajería entre cliente y emprendedor.
  - Cuenta o login del cliente.
  - Un muro o compositor de hashtags: el `#` solo identifica el oficio; la cara del cliente es la barra.

---

## 5. Objetivo y Beneficios Esperados

- **Objetivo:** en v1, un emprendedor publica su perfil con al menos un oficio, imágenes de su trabajo y una localidad georreferenciada, y un cliente, desde una barra, encuentra ese oficio cerca de su ubicación.
- **Beneficios esperados:**
  - El oficio y el emprendedor tienen una vitrina distinta de las páginas de empleo.
  - El cliente encuentra oficios cercanos sin aprender una interfaz de hashtags.

---

## 6. Criterios de Éxito en Formato BDD (Gherkin)

### Escenario 1: El cliente encuentra un oficio cerca

- **Dado que** un emprendedor publicó el oficio `#gasfiter` con localidad georreferenciada
- **Y** el cliente indicó su ubicación
- **Cuando** escribe `gasfiter` o `#gasfiter` en la barra
- **Entonces** ve ofertas de `#gasfiter` ordenadas de la más cercana a la más lejana
- **Y** la interfaz que usa es la barra, no un compositor de hashtags

### Escenario 2: Sin oficio o sin ubicación no hay un listado inventado

- **Dado que** el cliente abre el portal
- **Cuando** busca un texto que no corresponde a ningún `#` de oficio, o no hay ubicación
- **Entonces** no aparecen oficios de otra etiqueta ni un punto inventado
- **Y** el portal pide un oficio reconocible o una ubicación antes de listar cercanos

---

## 7. Restricciones

- **Técnicas:** portal con contenido editable por el emprendedor (`site_type: cms` en `02-features.md`). Un solo origen para perfiles y búsqueda. La cara del cliente es una barra; el criterio de búsqueda es el `#` del oficio. La cercanía usa la ubicación que el cliente autoriza o escribe. HTML de producción queda bloqueado hasta los gates posteriores.
- **Operativas:** el emprendedor publica y mantiene su perfil, sus ofertas, sus imágenes y su localidad. negocio no carga ese contenido por él en v1.
- **Seguridad:** el emprendedor se autentica para crear o editar perfil, ofertas, imágenes y punto geográfico. El cliente busca sin cuenta. La localidad publicada es la que el emprendedor confirma; el portal no publica la posición del dispositivo del emprendedor sin esa confirmación. Imágenes y datos del perfil son PII del emprendedor. No hay secretos en el repositorio. **Supuesto:** el texto alternativo de cada imagen lo escribe el emprendedor al cargarla.
