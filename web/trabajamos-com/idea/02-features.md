---
id: "WEB-FEAT-001"
title: "trabajamos.com — Features y Secciones"
status: "APROBADO"
version: "0.1.2"
owner: "Vissiuss"
created_at: "2026-11-02"
updated_at: "2026-11-02"
audit_1_passed: true
site_type: "cms"
---

# [02] Features, Secciones y CTAs — trabajamos.com

> **Gate 1:** este documento se aprueba **junto con** `01-problem.md`.  
> **Equivalencia:** Auditoría de Documentación → `docs/auditoria-documentacion.md`.  
> El Gate 2 (Auditoría de Módulos) **no** se registra aquí; vive en `03-module-discovery.md`.  
> `site_type` es técnico (`landing | multipage | cms`). El SKU comercial A/B lo escribe el consultor, no este gate.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** trabajamos.com
- **Documento base:** `idea/01-problem.md` (ID: `WEB-PROB-001`)
- **site_type:** `cms` — el emprendedor crea y edita perfil, ofertas, imágenes, localidad, contacto y redes. No es una landing fija.
- **Estado de gatekeeping:** `AUDITORIA_DOCUMENTACION_APROBADA`
- **v0.1.2 (2026-11-02):** el contacto es obligatorio para publicar el perfil (`FEAT-01`) y el título es obligatorio en cada oferta (`FEAT-02`). Alinea `02` con las decisiones `D-01` y `D-07` de `04-html-design.md`. Vissiuss aprobó el cambio.

---

## 2. Matriz de Trazabilidad de Requerimientos (RTM 1:1)

| ID Feature | ID Problema (`01-problem.md`) | Nombre | Prioridad | Módulo Destino (`03`) |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-01` | `ERR-01` | Perfil del emprendedor | `Crítica` | `mod-perfil` |
| `FEAT-02` | `ERR-02` | Ofertas de proyectos, servicios y oficios | `Crítica` | `mod-ofertas` |
| `FEAT-03` | `ERR-03` | Portafolio con imágenes del trabajo | `Crítica` | `mod-portafolio` |
| `FEAT-04` | `ERR-04` | Localidad georreferenciada | `Crítica` | `mod-geo` |
| `FEAT-05` | `ERR-05` | Barra de búsqueda de oficios con `#` | `Crítica` | `mod-buscador` |
| `FEAT-06` | `ERR-06` | Oficios cercanos según la ubicación del cliente | `Crítica` | `mod-buscador` |
| `FEAT-07` | `ERR-07` | Botón de contacto y redes sociales del perfil | `Crítica` | `mod-perfil` |

---

## 3. Funcionalidades Obligatorias

### Feature `FEAT-01`: Perfil del emprendedor

**Descripción:** el emprendedor arma un perfil público que lo identifica como quien ofrece trabajo de oficio. Es la vitrina que las páginas de empleo no le dan.

**CTA:** `Crear perfil` / `Editar perfil`.

#### Escenario 1.1: Flujo exitoso

- **Dado que** una persona entra como emprendedor autenticado
- **Cuando** guarda su perfil con nombre visible y un contacto válido (teléfono, correo o enlace)
- **Entonces** el perfil queda publicado y es el lugar donde cuelgan ofertas, portafolio, localidad, contacto y redes

#### Escenario 1.2: Manejo de errores

- **Dado que** el emprendedor no está autenticado, o guarda el perfil sin nombre o sin un contacto válido
- **Cuando** intenta publicarlo
- **Entonces** el perfil no se publica y ve qué dato falta

---

### Feature `FEAT-02`: Ofertas de proyectos, servicios y oficios

**Descripción:** en el perfil, el emprendedor ofrece proyectos, servicios y oficios. Cada oficio lleva un `#` que el buscador usa después. Ejemplos de etiqueta: `#gasfiter`, `#electricista`.

**CTA:** `Agregar oferta`.

#### Escenario 2.1: Flujo exitoso

- **Dado que** el emprendedor tiene perfil publicado
- **Cuando** agrega una oferta de tipo proyecto, servicio u oficio, con título, y le asigna un `#`
- **Entonces** la oferta aparece en su perfil con ese tipo, ese título y ese `#`

#### Escenario 2.2: Manejo de errores

- **Dado que** la oferta no tiene tipo, no tiene título o el `#` está vacío
- **Cuando** intenta guardarla
- **Entonces** la oferta no se publica y el perfil conserva las ofertas anteriores

---

### Feature `FEAT-03`: Portafolio con imágenes del trabajo

**Descripción:** el emprendedor gestiona un portafolio con imágenes de su trabajo, visibles en el perfil.

**CTA:** `Subir imagen`.

#### Escenario 3.1: Flujo exitoso

- **Dado que** el emprendedor está autenticado en su perfil
- **Cuando** sube una imagen de un trabajo
- **Entonces** la imagen queda en el portafolio de ese perfil

#### Escenario 3.2: Manejo de errores

- **Dado que** el archivo no es una imagen o la carga falla
- **Cuando** intenta subirla
- **Entonces** el portafolio no cambia y ve que la imagen no se guardó

---

### Feature `FEAT-04`: Localidad georreferenciada

**Descripción:** el emprendedor marca la localidad desde la que ofrece sus oficios. Ese punto es el que usa la búsqueda de cercanía.

**CTA:** `Marcar localidad`.

#### Escenario 4.1: Flujo exitoso

- **Dado que** el emprendedor está autenticado
- **Cuando** confirma una localidad en el mapa o equivalente geográfico
- **Entonces** el perfil guarda ese punto y las ofertas de ese perfil pueden entrar al listado de cercanos

#### Escenario 4.2: Manejo de errores

- **Dado que** el emprendedor no confirma una localidad
- **Cuando** deja el perfil sin punto
- **Entonces** sus ofertas no aparecen como oficios cercanos

**Supuesto:** la localidad publicada es un punto que el emprendedor confirma (lugar de trabajo), no la posición silenciosa de su dispositivo.

---

### Feature `FEAT-05`: Barra de búsqueda de oficios con `#`

**Descripción:** de cara al cliente hay una barra de búsqueda. La búsqueda funciona con `#`: el texto de la barra se normaliza a un `#` de oficio (minúsculas; si falta `#`, se agrega; los espacios sobrantes se quitan). El cliente no usa un compositor de hashtags.

**CTA:** la barra, con acción `Buscar`.

#### Escenario 5.1: Flujo exitoso

- **Dado que** existe al menos una oferta etiquetada `#gasfiter`
- **Cuando** el cliente escribe `gasfiter` o `#gasfiter` en la barra y busca
- **Entonces** el resultado corresponde solo a `#gasfiter`

#### Escenario 5.2: Manejo de errores

- **Dado que** el cliente escribe un texto que no coincide con ningún `#` publicado
- **Cuando** busca
- **Entonces** el listado queda vacío e indica que ese oficio no está
- **Y** no muestra ofertas de otro `#`

---

### Feature `FEAT-06`: Oficios cercanos según la ubicación del cliente

**Descripción:** con un `#` reconocido, el portal muestra oficios ofrecidos cerca de la ubicación del cliente, del más cercano al más lejano. Entran solo ofertas con localidad georreferenciada (`FEAT-04`).

**CTA:** el mismo `Buscar` de la barra. La cercanía es el orden del resultado, no una segunda pantalla.

#### Escenario 6.1: Flujo exitoso

- **Dado que** el cliente autorizó su ubicación o escribió una localidad
- **Y** hay ofertas de ese `#` con punto geográfico
- **Cuando** busca
- **Entonces** ve esas ofertas ordenadas por cercanía a su ubicación

#### Escenario 6.2: Manejo de errores

- **Dado que** el cliente niega la ubicación del dispositivo y no escribe una localidad
- **Cuando** busca un `#` válido
- **Entonces** el portal no inventa un punto y le pide una ubicación antes de listar cercanos

**Supuesto:** si el navegador no entrega ubicación, la barra acepta una localidad escrita por el cliente y esa localidad es el origen de la cercanía.

---

### Feature `FEAT-07`: Botón de contacto y redes sociales del perfil

**Descripción:** el perfil público del emprendedor muestra un botón de contacto y los enlaces a sus redes sociales. El emprendedor los carga. El cliente los usa sin cuenta. El botón abre el destino guardado y sale del portal. Las redes son enlaces, no un muro dentro de trabajamos.com.

**CTA:** `Contactar` en el perfil público. Cada red es un enlace con el nombre de la red.

**Supuesto:** negocio no fijó un canal único. El destino del botón es un teléfono, un correo o un enlace que el emprendedor guarda.

El contacto es obligatorio para publicar el perfil (`FEAT-01` 1.1). Las redes son opcionales.

#### Escenario 7.1: Flujo exitoso

- **Dado que** el emprendedor autenticado guardó un teléfono, un correo o un enlace, y al menos una red con nombre y URL
- **Cuando** publica el perfil
- **Entonces** el cliente ve el botón `Contactar` y los enlaces de esas redes
- **Y** al activar `Contactar` se abre ese destino
- **Y** al activar una red se abre esa URL

#### Escenario 7.2: Manejo de errores

- **Dado que** el contacto está vacío o la URL de una red no es válida
- **Cuando** el emprendedor intenta guardarlos
- **Entonces** ese contacto o esa red no se publican
- **Y** el perfil conserva el contacto y las redes que ya eran válidos

---

## 4. Funcionalidades Deseables (v1.1+)

| ID Feature | Nombre | Prioridad | Notas |
| :--- | :--- | :--- | :--- |
| — | Ninguna solicitada en este gate | — | negocio no pidió una v1.1 |

---

## 5. Fuera de Alcance

- Bolsa de empleo, currículum y postulaciones.
- Pagos, cotizaciones formales, reservas y contratación.
- Chat dentro del portal. El contacto es el botón `Contactar` del perfil.
- Cuenta o login del cliente.
- Muro o compositor de hashtags. El `#` solo clasifica el oficio dentro de la barra.

---

## 6. NFRs

- **Performance:** la barra permanece usable en un teléfono. Si la ubicación tarda, la búsqueda espera el punto y no muestra un listado con un origen falso.
- **SEO mínimo:** el portal tiene `title` y descripción propios de trabajamos.com. Cada perfil público tiene título identificable.
- **Accesibilidad:** la barra tiene etiqueta visible o nombre accesible. Los controles `Crear perfil`, `Agregar oferta`, `Subir imagen`, `Marcar localidad` y `Contactar` tienen nombre. Cada red anuncia el nombre de la red. Cada imagen del portafolio lleva texto alternativo escrito por el emprendedor.
