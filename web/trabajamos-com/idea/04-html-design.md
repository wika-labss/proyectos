---
id: "WEB-HTML-001"
title: "trabajamos.com — Diseño HTML y Aprobación Visual"
status: "APROBADO"
version: "0.2.2"
owner: "Vissiuss"
created_at: "2026-11-02"
updated_at: "2026-11-02"
visual_approval_passed: true
audit_3_passed: true
construction_phase_complete: true
direction_skill: "minimalist-ui"
---

# [04] HTML Estructural, Wireframes y Aprobación Visual — trabajamos.com

> **Pre-requisito:** `audit_2_passed: true` en `03-module-discovery.md`.  
> **Gate visual:** `visual_approval_passed: true` requiere visto bueno del arquitecto/stakeholder.  
> **Equivalencia:** Auditoría de Ensamblado → `docs/auditoria-ensamblado.md`.  
> El flag `audit_2_passed` **no** vive aquí (es el Gate 2 de módulos).  
> `ready_for_construction` vive en `05-build-plan.md`, no aquí.

## 1. Identificación y Antecedentes

- **Nombre del Proyecto:** trabajamos.com
- **Documentos base:** `01-problem.md` (`WEB-PROB-001`) | `02-features.md` (`WEB-FEAT-001`) | `03-module-discovery.md` (`WEB-MOD-001`) | `05-build-plan.md`
- **Estado de gatekeeping:** `CONSTRUCTION_PHASE_COMPLETE`
- **Decisiones del arquitecto:** Vissiuss respondió las nueve preguntas de la versión `0.1.0` el 2026-11-02 a las 17:50 (UTC-3). Esta versión las aplica (§7.1).
- **Gate 3A:** Vissiuss aprobó la versión `0.2.1` el 2026-11-02 a las 22:17 (UTC-3) con el mensaje "alinea y aprobado 04" (§9). La v0.2.2 agrega `VIEW-18` y los campos de `VIEW-10` según `05`; Vissiuss la aprobó el 2026-11-02 a las 22:51 (UTC-3) con el plan de construcción.
- **direction_skill:** `minimalist-ui`. Coincide con `MOD-DIR` en `03-module-discovery.md` (`direction_locked: true`).
- **Estado de `05`:** `05-build-plan.md` APROBADO con `ready_for_construction: true`. Autenticación, datos, imágenes y mapa están definidos allí y construidos en `iterations/v1/`.
- **Alcance Fase 1:** HTML semántico y SSR en `iterations/v1/` para el cliente (`VIEW-01` a `VIEW-09`) y el panel (`VIEW-10` a `VIEW-18`). El look lo pone `minimalist-ui` en Fase 2.
- **Fase 1:** Vissiuss firmó el contrato el 2026-11-02 a las 23:37 (UTC-3) con el mensaje "esta bien firmo el contrato de fase 1, sigamos el flujo mientras pusheo (listo)". El agente transcribió la firma.

`direction_skill` debe coincidir con `MOD-DIR` en `03-module-discovery.md`.

---

## 2. Mapa de vistas (VIEW-XX)

| ID Vista | Ruta / ancla | Módulos | Feature |
| :--- | :--- | :--- | :--- |
| **Cliente (sin cuenta)** | | | |
| `VIEW-01` | `index.html` `#buscar` — portada y barra de búsqueda | `MOD-05` | `FEAT-05` |
| `VIEW-02` | `index.html` `#ubicacion` — ubicación del cliente (permiso del navegador o localidad escrita) | `MOD-05`, `MOD-04` | `FEAT-06` |
| `VIEW-03` | `index.html` `#estado-busqueda` — mensajes de estado de la búsqueda (región viva) | `MOD-05` | `FEAT-05`, `FEAT-06` |
| `VIEW-04` | `index.html` `#resultados` — listado de ofertas cercanas | `MOD-05`, `MOD-02`, `MOD-04`, `MOD-01` | `FEAT-05`, `FEAT-06` |
| `VIEW-05` | `perfil.html?slug={slug}` `#perfil` — identidad del perfil público | `MOD-01` | `FEAT-01` |
| `VIEW-06` | `perfil.html?slug={slug}` `#contacto` — botón `Contactar`, dato de contacto visible y redes | `MOD-01` | `FEAT-07` |
| `VIEW-07` | `perfil.html?slug={slug}` `#ofertas` — ofertas públicas | `MOD-02` | `FEAT-02` |
| `VIEW-08` | `perfil.html?slug={slug}` `#portafolio` — imágenes del trabajo | `MOD-03` | `FEAT-03` |
| `VIEW-09` | `perfil.html?slug={slug}` `#localidad` — localidad georreferenciada | `MOD-04` | `FEAT-04` |
| **Panel del emprendedor** | | | |
| `VIEW-10` | `panel/entrar.html` — entrar | `MOD-06` | `FEAT-01` (1.2, sesión) |
| `VIEW-11` | `panel/*` — marco común: cabecera, navegación del panel y guardia de sesión | `MOD-06`, `MOD-01` | `FEAT-01` (1.2), `FEAT-04` (4.2, aviso) |
| `VIEW-12` | `panel/perfil.html` `#datos` — nombre visible y contacto | `MOD-01`, `MOD-06` | `FEAT-01`, `FEAT-07` |
| `VIEW-13` | `panel/perfil.html` `#redes` — redes sociales | `MOD-01`, `MOD-06` | `FEAT-07` |
| `VIEW-14` | `panel/ofertas.html` — ofertas (regla `#` de `MOD-05`) | `MOD-02`, `MOD-06` | `FEAT-02` |
| `VIEW-15` | `panel/portafolio.html` — portafolio | `MOD-03`, `MOD-06` | `FEAT-03` |
| `VIEW-16` | `panel/localidad.html` — localidad | `MOD-04`, `MOD-06` | `FEAT-04` |
| `VIEW-17` | `panel/perfil.html` `#publicacion` — estado del perfil público y enlace "Ver mi perfil público" | `MOD-01`, `MOD-02`, `MOD-03`, `MOD-04` | `FEAT-01`, `FEAT-04` (4.2), `FEAT-07` |

| `VIEW-18` | `panel/crear-cuenta.html` — crear cuenta con correo y contraseña (`05`) | `MOD-06` | `FEAT-01` (1.1, autenticación) |

`VIEW-19` queda reservada. `VIEW-18` entra en v0.2.2 porque `05` fija la autenticación con correo y contraseña.

`VIEW-01` a `VIEW-04` viven en una sola página: la cercanía es el orden del resultado, no una segunda pantalla (`FEAT-06`). `VIEW-05` a `VIEW-09` son secciones de una sola página de perfil. Cobertura de `03`: `MOD-01` a `MOD-06` tienen al menos una vista; `MOD-DIR` se aplica en Fase 2.

---

## 3. Flujo principal

### 3.1 Flujo del cliente

```text
[VIEW-01 Barra] el cliente escribe un oficio y activa Buscar
   │
   ▼
Normaliza el texto a un # (regla única, §3.3)
   │
   ├─ # vacío ("", "#", solo espacios) ─▶ [VIEW-03 error: pide un oficio] ─▶ foco en la barra
   │
   ├─ # sin coincidencia ─▶ [VIEW-04 vacío: "#xyz no está"] (no muestra otros #)
   │
   └─ # con coincidencia ─▶ ¿hay origen de cercanía?
          │
          ├─ campo "localidad" con texto ─▶ MOD-04 resuelve la localidad
          │       ├─ sin punto ─▶ [VIEW-02 error: localidad no encontrada] (sin listado)
          │       └─ con punto ─────────────────────────────┐
          │                                                  │
          ├─ campo vacío ─▶ permiso del navegador            │
          │       ├─ pendiente ─▶ [VIEW-03 loading: esperando ubicación]
          │       ├─ concedido ─────────────────────────────┤
          │       └─ negado / sin soporte / tiempo agotado   │
          │             ─▶ [VIEW-02 pide localidad escrita]  │
          │                (no se inventa un punto)          │
          │                                                  ▼
          └──────────────────────────────▶ [VIEW-03 loading: buscando #oficio]
                                                 │
                     ┌───────────────────────────┼─────────────────────────────┐
                     ▼                           ▼                             ▼
          [VIEW-03 error de servicio]  [VIEW-04 vacío propio (D-04): [VIEW-04 éxito: <ol> de ofertas
           + botón Reintentar           el # existe pero ninguna      con punto, de la más cercana
                                        oferta tiene localidad        a la más lejana, cada una
                                        marcada]                      con "a 1,2 km" (D-02)]
                                                                               │
                                                     enlace de cada resultado ─┘
                                                                               ▼
                                              [perfil.html?slug=…]
                                               VIEW-05 identidad (h1 nombre)
                                               VIEW-06 Contactar (tel: | mailto: | URL) + dato visible (D-03)
                                                       y redes (enlaces)
                                               VIEW-07 ofertas · VIEW-08 portafolio · VIEW-09 localidad
                                               "Buscar otro oficio" ─▶ VIEW-01
```

### 3.2 Flujo del emprendedor

```text
Primera vez (orden de onboarding):

[index.html o perfil.html: enlace "Crear perfil" del encabezado]
      │
      ▼
[VIEW-10 Entrar] ──credencial válida──▶ [VIEW-12 Perfil y contacto: "Crear perfil"]
      ▲                                        │ nombre + contacto válido = perfil público (D-01)
      │ sin sesión / sesión vencida            ▼
[VIEW-11 guardia de panel/*]            [VIEW-13 Redes: "Guardar redes"]
                                               │
                                               ▼
                                        [VIEW-14 Ofertas: "Agregar oferta" + vista previa del #]
                                               │
                                               ▼
                                        [VIEW-15 Portafolio: "Subir imagen" + texto alternativo]
                                               │
                                               ▼
                                        [VIEW-16 Localidad: buscar o tocar mapa → nombre de la
                                         localidad (D-08) → "Marcar localidad"]
                                               │
                                               ▼
                                        [VIEW-17 Estado del perfil público] ──▶ "Ver mi perfil público"
                                                                                (perfil.html, VIEW-05)

Vuelta posterior:
[VIEW-10 Entrar] ──▶ página pedida (?volver=) o VIEW-12 ──▶ cualquier vista desde la navegación de VIEW-11
```

Sin cuenta, `VIEW-10` enlaza a `VIEW-18` "Crear cuenta"; al crearla, la sesión empieza y el flujo sigue en `VIEW-12`.

Cada paso del panel termina con un enlace al siguiente ("Siguiente: Ofertas", etc.). El orden es una guía: la navegación de `VIEW-11` permite saltar a cualquier vista, salvo que el perfil aún no exista (ver "bloqueada sin perfil" en §3.4).

### 3.3 Reglas compartidas

**Regla única de normalización del `#`.** La usan la barra de búsqueda (`VIEW-01`) y la vista previa y el guardado de ofertas (`VIEW-14`). Es el contrato de `MOD-05` que `MOD-02` reutiliza (`03`):

1. Quitar los espacios al inicio y al final.
2. Quitar los `#` del inicio y los espacios que queden justo después de ellos. **Supuesto.**
3. Reducir cada grupo de espacios internos a un solo espacio; el espacio interno se conserva (decisión del Gate 2). **Supuesto** en la reducción a uno.
4. Pasar a minúsculas. Las tildes y la `ñ` se conservan; `#gásfiter` y `#gasfiter` son oficios distintos (decisión del Gate 2).
5. Si queda vacío, no hay `#`: en el panel es un error de guardado; en la búsqueda se pide un oficio. Si no queda vacío, se antepone un `#`.

| Texto escrito | Resultado |
| :--- | :--- |
| `gasfiter` | `#gasfiter` |
| `Gasfiter` | `#gasfiter` |
| `#gasfiter` | `#gasfiter` |
| `# gasfiter` | `#gasfiter` |
| `##gasfiter` | `#gasfiter` |
| `  #Electricista ` | `#electricista` |
| `Gásfiter` | `#gásfiter` (distinto de `#gasfiter`) |
| `maestro  chasquilla` | `#maestro chasquilla` |
| `#Maestro Chasquilla ` | `#maestro chasquilla` |
| vacío, `#`, `##` o solo espacios | sin `#`: error en `VIEW-14`; la búsqueda pide un oficio |

La coincidencia es por igualdad exacta del `#` normalizado. **Supuesto:** no hay coincidencia parcial ni sugerencias; `gas` no encuentra `#gasfiter` y el estado vacío no propone otros `#` (`FEAT-05` 5.2).

**Orden y distancia (D-02).** El listado ordena por distancia ascendente entre el punto del cliente y el punto del perfil, medida en línea recta (`03` riesgo 4, confirmado por D-02). Cada resultado muestra su distancia en kilómetros con un decimal y coma decimal: "a 1,2 km", "a 0,4 km", "a 12,0 km". **Supuesto:** el valor se redondea al décimo más cercano y siempre se expresa en km. **Supuesto:** los empates se ordenan por `nombre` del perfil. Solo entran ofertas cuyo perfil tiene `punto` distinto de `null` (`FEAT-04` 4.2, `FEAT-06`). **Supuesto:** v1 no tiene radio máximo ni paginación; si hace falta un límite, se fija en `05`.

**Origen de la cercanía (cliente).**

- **Supuesto:** si el campo de localidad tiene texto, esa localidad es el origen y tiene prioridad sobre el permiso del navegador.
- Si el campo está vacío y el permiso no se ha pedido, `Buscar` pide la ubicación del navegador. El botón `Usar mi ubicación` también la pide. **Supuesto:** el permiso no se pide al cargar la página, solo tras una acción del cliente.
- Si la ubicación tarda, la búsqueda espera el punto y no muestra un listado con un origen falso (`02` §6). **Supuesto:** el tiempo máximo de espera se fija en `05`; al agotarse se trata como ubicación no disponible.
- El punto del cliente no se guarda (`03` `MOD-04`). **Supuesto:** la consulta y la localidad escrita van en la URL (`index.html?q=…&localidad=…`) para que el botón Atrás y el enlace compartido funcionen; las coordenadas del dispositivo no van en la URL.
- **Supuesto:** primero se valida el `#` y después el origen. Un `#` sin coincidencia da el vacío "no está" sin pedir ubicación; un `#` con coincidencia y sin origen pide una ubicación.

**Punto del emprendedor.** El punto público es el que el emprendedor confirma en `VIEW-16`. `VIEW-16` ofrece solo el mapa o una localidad escrita; no hay "Usar mi ubicación actual" y el panel nunca pide permiso de ubicación del dispositivo (`03` `MOD-04`, límite; D-06). Junto al aviso de que el punto es público, `VIEW-16` sugiere a quien trabaja desde su casa marcar un punto cercano, como su comuna o una esquina cercana (D-05). Todo punto guardado lleva `etiqueta`, el nombre legible de la localidad (D-08): se llena con el resultado elegido de la localidad escrita o con el nombre que la geocodificación da al punto del mapa, y el emprendedor puede editarlo antes de guardar. Sin `etiqueta` el punto no se guarda.

**Rutas.** Perfil público: `perfil.html?slug={slug}`. Entrada al panel: `panel/entrar.html`; el enlace `Crear perfil` del encabezado público apunta allí. **Supuesto:** el esquema final de URL se fija en `05`.

**Publicación sin borradores.** Un perfil es público desde que se guarda por primera vez con nombre y contacto válido. No hay estado de borrador; el lado público solo recibe perfiles guardados. Un `slug` que no existe muestra "Perfil no disponible".

**Contacto obligatorio (D-01).** El primer guardado exige nombre visible y un contacto válido: teléfono, correo o URL (`02` 1.1 desde v0.1.2). Sin alguno de los dos, `Crear perfil` no publica nada (`VIEW-12`). Por eso todo perfil publicado tiene `Contactar` en `VIEW-06`. En ediciones posteriores, un contacto vacío o inválido no se guarda y queda el contacto válido anterior (`02` 7.2).

**Dato de contacto visible (D-03).** Junto a `Contactar`, `VIEW-06` muestra el dato como texto: el teléfono o el correo tal como se guardaron, o el dominio de la URL. `Contactar` sigue siendo un enlace.

**Ítems con `id` (D-09).** Cada oferta, imagen y red guardada tiene un `id` que asigna el sistema. `Quitar` apunta a ese `id`. Un ítem que aún no se guarda no tiene `id`, por eso el campo es opcional en el contrato (§6.1).

### 3.4 Estados por vista

#### Cliente

**`VIEW-01` Barra**

- **Inicial (vacío):** barra vacía con texto de ayuda. No hay listado.
- **Precargada:** si la URL trae `q`, la barra muestra ese texto y la búsqueda corre al cargar.
- **Error:** el texto normaliza a un `#` vacío. El campo queda `aria-invalid="true"`, `VIEW-03` dice "Escribe un oficio, por ejemplo gasfiter." y el foco vuelve a la barra.
- **Loading:** la barra y `Buscar` siguen activos. **Supuesto:** una búsqueda nueva reemplaza la que está en curso.
- **Éxito:** lo muestra `VIEW-04`. La barra conserva el texto que escribió el cliente; el `#` normalizado aparece en `VIEW-03` y en el título de `VIEW-04`.

**`VIEW-02` Ubicación**

- **Sin indicar (inicial):** "Ubicación: sin indicar", botón `Usar mi ubicación` y campo "O escribe tu localidad".
- **Permiso pendiente (loading):** "Esperando permiso de ubicación…". El campo de localidad sigue disponible.
- **Permiso concedido (éxito):** "Ubicación: tu ubicación actual".
- **Permiso negado (error):** "No tenemos permiso para usar tu ubicación. Escribe tu localidad para ver oficios cercanos." El foco pasa al campo de localidad. No hay listado.
- **Sin soporte o tiempo agotado (error):** "No pudimos obtener tu ubicación. Escribe tu localidad para ver oficios cercanos." Mismo comportamiento que el permiso negado.
- **Localidad resolviéndose (loading):** "Buscando la localidad «Ñuñoa»…".
- **Localidad resuelta (éxito):** "Ubicación: Ñuñoa" (texto escrito por el cliente).
- **Localidad no resuelta (error):** "No encontramos la localidad «xyz». Prueba con comuna y ciudad." El campo queda `aria-invalid="true"`. No hay listado y no se inventa un punto.
- **Sin ubicación al buscar (vacío de origen):** "Para ver oficios cercanos necesitamos tu ubicación. Usa tu ubicación o escribe tu localidad." (`FEAT-06` 6.2).

**`VIEW-03` Estado de la búsqueda** (región viva; el texto se reemplaza, no se acumula)

| Estado | Texto |
| :--- | :--- |
| Inicial | Sin texto. |
| Loading (ubicación) | "Esperando tu ubicación…" |
| Loading (búsqueda) | "Buscando #gasfiter cerca de ti…" |
| Éxito | "5 ofertas de #gasfiter, de la más cercana a la más lejana." |
| Vacío (sin coincidencia) | "No encontramos #xyz." |
| Vacío (sin ofertas con punto, D-04) | "Ninguna oferta de #gasfiter tiene localidad marcada." |
| Error (`#` vacío) | "Escribe un oficio, por ejemplo gasfiter." |
| Error (sin origen) | "Para ver oficios cercanos necesitamos tu ubicación." |
| Error (localidad no resuelta) | "No encontramos la localidad «xyz»." |
| Error (servicio) | "No pudimos completar la búsqueda. Intenta de nuevo." + botón `Reintentar búsqueda` |

**`VIEW-04` Listado de cercanos**

- **Oculto:** antes de la primera búsqueda la sección no se muestra.
- **Loading:** la sección queda `aria-busy="true"` y se retira el listado anterior, para no mostrar resultados con un origen viejo.
- **Éxito:** título "Ofertas de #gasfiter cerca de {origen}" y lista ordenada. Cada ítem muestra `titulo`, `tipo`, `tag`, `nombre` del perfil y la distancia ("a 1,2 km", D-02), y enlaza a `perfil.html?slug={slug}`. **Supuesto:** un ítem por oferta; si un perfil tiene dos ofertas con el mismo `#`, aparecen dos ítems.
- **Vacío sin coincidencia:** título "No encontramos #xyz". Texto: "Ese oficio no está publicado. Revisa cómo lo escribiste: las tildes cuentan, #gásfiter y #gasfiter son distintos." No aparece ninguna oferta ni otro `#`.
- **Vacío sin ofertas con punto (mensaje propio, D-04):** título "Sin oficios cercanos para #gasfiter". Texto: "Hay ofertas de #gasfiter, pero ninguna tiene localidad marcada, así que no aparecen como cercanas." No se listan. Este mensaje es distinto de "Ese oficio no está publicado".
- **Error:** no hay listado; el mensaje está en `VIEW-03`.

**`VIEW-05` Identidad del perfil**

- **Loading:** "Cargando perfil…" con `main` en `aria-busy="true"`. **Supuesto:** aplica si el perfil se carga en el navegador; si se entrega armado desde el servidor, este estado no existe. Se decide en `05`.
- **Éxito:** `h1` con `nombre`, navegación interna a Contacto, Ofertas, Portafolio y Localidad, y enlace `Buscar otro oficio`.
- **Error, perfil no disponible:** falta `slug` o el `slug` no existe. `h1` "Perfil no disponible" y enlace `Buscar otro oficio`. **Supuesto:** respuesta 404 y `noindex` si hay servidor.
- **Error de carga:** "No pudimos cargar el perfil." + botón `Reintentar`.
- **Vacío:** no aplica; un perfil guardado siempre tiene `nombre` (`FEAT-01` 1.1) y contacto (D-01).

**`VIEW-06` Contactar y redes**

- **Éxito:** enlace `Contactar` (abre `tel:`, `mailto:` o la URL) con el dato de contacto como texto al lado (D-03): "Teléfono: +56 9 1234 5678", "Correo: juan@dominio.cl" o "Sitio: dominio.cl". Debajo, la lista de redes, cada una con su `nombre` como texto.
- **Contacto:** siempre presente en un perfil publicado (D-01); no hay estado vacío de contacto.
- **Sin redes (vacío):** texto "Este perfil aún no publica redes."
- **Loading y error:** heredan de `VIEW-05`.
- Solo se muestran el contacto y las redes que el panel guardó como válidos (`FEAT-07` 7.2); el cliente no valida ni corrige datos.

**`VIEW-07` Ofertas**

- **Éxito:** lista de ofertas con `tipo` (Proyecto, Servicio u Oficio), `titulo` y `tag`.
- **Vacío:** "Este perfil aún no publica ofertas."
- **Loading y error:** heredan de `VIEW-05`.

**`VIEW-08` Portafolio**

- **Éxito:** lista de imágenes, cada una con su `alt` escrito por el emprendedor.
- **Vacío (perfil sin portafolio):** "Este perfil aún no tiene imágenes de su trabajo."
- **Error de una imagen:** si el archivo no carga, queda visible el `alt`. **Supuesto:** sin botón de reintento por imagen.
- **Loading:** **Supuesto:** las imágenes cargan en diferido (`loading="lazy"`); el resto del perfil no espera al portafolio.

**`VIEW-09` Localidad**

- **Éxito:** texto con `punto.etiqueta` (D-08), por ejemplo "Maipú, Región Metropolitana", y región de mapa con el `punto` del perfil. **Supuesto:** el formato del mapa (interactivo o imagen) y el proveedor se fijan en `05`.
- **Vacío (`punto: null`):** "Este perfil aún no marca su localidad."
- **Error del mapa:** "No pudimos mostrar el mapa." El texto de la localidad y el resto del perfil siguen visibles.

#### Panel del emprendedor

| Vista | loading | success | error | empty |
| :--- | :--- | :--- | :--- | :--- |
| `VIEW-10` | "Verificando…" en el botón `Entrar` y en el mensaje de estado | Redirige a la página pedida o a `VIEW-12` | Credencial rechazada (mensaje genérico); servicio de autenticación no disponible | Formulario vacío. Variante "Tu sesión terminó" cuando llega desde la guardia |
| `VIEW-18` | "Creando cuenta…" | Cuenta creada, sesión iniciada y redirige a `VIEW-12` | Correo vacío o inválido, contraseña corta, contraseñas distintas, correo ya registrado: no se crea nada | Formulario vacío |
| `VIEW-11` | "Verificando sesión…": no se muestra ningún formulario hasta confirmar la sesión | Marco con nombre del perfil, navegación y estado de cada paso | Sin sesión: redirige a `VIEW-10?volver={ruta}`. Error al cargar datos: "No pudimos cargar tus datos. No se cambió nada." con botón `Reintentar` | Sesión válida sin perfil: la navegación muestra solo "Crear perfil" activo; el resto dice "Disponible después de crear tu perfil" |
| `VIEW-12` | "Guardando perfil…" | "Perfil publicado" (primera vez) o "Perfil guardado" | Primer guardado sin nombre o sin contacto válido: no se publica nada y se indica el dato que falta (D-01). Edición sin nombre: nada se guarda. Edición con contacto vacío o inválido: el contacto no se guarda y queda el anterior. Sesión vencida al guardar: nada se guarda | Sin perfil: título "Crear perfil", campos vacíos, botón `Crear perfil` |
| `VIEW-13` | "Guardando redes…" | "Redes guardadas" con la lista publicada | Red con URL inválida o incompleta: esa red no se publica y queda su valor anterior; las demás válidas se guardan | "Aún no agregas redes." con una fila vacía y botón `Agregar red` |
| `VIEW-14` | "Cargando ofertas…" / "Guardando oferta…" | La oferta nueva aparece al final de la lista con su tipo, su título y su `#` | Sin tipo, sin título (D-07) o con `#` vacío: no se guarda y la lista anterior queda igual | "Aún no tienes ofertas." Bloqueada sin perfil |
| `VIEW-15` | "Subiendo imagen…" con barra de progreso | La imagen aparece en el portafolio con su texto alternativo | Archivo que no es imagen, carga fallida o texto alternativo vacío: el portafolio no cambia y se indica que la imagen no se guardó | "Aún no hay imágenes en tu portafolio." Bloqueada sin perfil |
| `VIEW-16` | "Cargando mapa…" / "Buscando localidad…" / "Guardando localidad…" | "Localidad marcada: {etiqueta}" con el punto confirmado | Localidad escrita que no se resuelve: no se marca ningún punto. Nombre de la localidad vacío: el punto no se guarda (D-08). Mapa no carga: queda disponible la búsqueda escrita. Guardado fallido: el punto anterior se mantiene | "Sin localidad confirmada: tus ofertas no aparecen como oficios cercanos." Bloqueada sin perfil |
| `VIEW-17` | Usa la carga de `VIEW-11` | Lista de lo publicado y enlace "Ver mi perfil público" | Hereda el error de carga de `VIEW-11` | Sin perfil: la sección no aparece; `VIEW-11` indica "sin crear" |

**Bloqueada sin perfil:** `FEAT-02` exige "perfil publicado" y `MOD-03`/`MOD-04` dependen de `MOD-01`. Sin perfil, `VIEW-14`, `VIEW-15` y `VIEW-16` muestran solo "Primero crea tu perfil." con un enlace a `VIEW-12`, sin formulario.

---

## 4. HTML semántico (Fase 1)

### 4.1 Reglas comunes a todas las páginas

- **Página:** `<html lang="es-CL">`, `meta charset utf-8`, `meta viewport width=device-width, initial-scale=1`.
- **Landmarks:** `<header>`, `<nav>` con nombre (`aria-label`), `<main id="contenido">`, `<footer>`. Un solo `<h1>` por página.
- **Saltar al contenido:** `<a href="#contenido">Saltar al contenido</a>` es el primer elemento enfocable.
- **Enlace o botón:** navegar a otra página, ancla o destino externo es `<a>`; ejecutar una acción (enviar, pedir ubicación, reintentar, agregar fila, quitar, buscar localidad, salir) es `<button>`.
- **Texto oculto visualmente:** `<span class="oculto">` completa el nombre accesible de un control sin cambiar el texto visible. `oculto` nombra la función, no un estilo final; la clase concreta se define al construir.
- **Regiones vivas:** los mensajes de estado van en `<p role="status" aria-live="polite">`; el texto se reemplaza, no se acumula.
- **Enlaces externos:** **Supuesto:** `Contactar` tipo `url`, las redes y "Ver mi perfil público" abren en la misma pestaña. `Contactar` tipo `url` y las redes llevan `rel="nofollow ugc"` porque son contenido del emprendedor.

### 4.2 Páginas públicas (`index.html`, `perfil.html`)

**Encabezado y pie públicos**

```text
<a href="#contenido">Saltar al contenido</a>
<header>
  <a href="index.html">trabajamos.com</a>
  <nav aria-label="Principal">
    <ul>
      <li><a href="index.html">Buscar oficios</a></li>
      <li><a href="panel/entrar.html">Crear perfil</a></li>
    </ul>
  </nav>
</header>
<main id="contenido"> … </main>
<footer>
  <p>trabajamos.com: oficios y emprendedores cerca de ti.</p>
</footer>
```

**Supuesto:** el enlace `Crear perfil` del encabezado es la entrada pública al panel (CTA de `FEAT-01`). `01` y `02` no piden páginas legales; el pie no las incluye.

#### `index.html` (`VIEW-01` a `VIEW-04`)

**Title y meta**

- Sin búsqueda: `<title>trabajamos.com — Encuentra oficios cerca de ti</title>`; `description`: "Busca un oficio en trabajamos.com y encuentra emprendedores cercanos a tu ubicación."
- Con búsqueda: **Supuesto:** `<title>#gasfiter cerca de ti — trabajamos.com</title>`, para que el historial del navegador distinga búsquedas.

**Esquema de encabezados**

```text
h1  Encuentra un oficio cerca de ti                (VIEW-01)
  h2  Ofertas de #gasfiter cerca de Ñuñoa          (VIEW-04, éxito)
      | No encontramos #xyz                        (VIEW-04, vacío)
      | Sin oficios cercanos para #gasfiter        (VIEW-04, vacío sin punto)
    h3  {titulo}, {nombre} — un h3 por resultado
```

**Estructura de `main`**

```text
<main id="contenido">
  <section id="buscar" aria-labelledby="buscar-titulo">            VIEW-01
    <h1 id="buscar-titulo">Encuentra un oficio cerca de ti</h1>
    <form role="search" aria-label="Buscar oficios" action="index.html" method="get">
      <label for="q">Oficio</label>
      <input type="search" id="q" name="q" autocomplete="off"
             enterkeyhint="search" aria-describedby="q-ayuda">
      <p id="q-ayuda">Escribe solo el oficio, por ejemplo gasfiter o #maestro chasquilla.</p>

      <fieldset id="ubicacion" aria-describedby="ubicacion-ayuda">  VIEW-02
        <legend>Tu ubicación</legend>
        <p id="ubicacion-actual">Ubicación: sin indicar</p>
        <button type="button" id="usar-ubicacion">Usar mi ubicación</button>
        <label for="localidad">O escribe tu localidad</label>
        <input type="text" id="localidad" name="localidad" autocomplete="address-level2">
        <p id="ubicacion-ayuda">Usamos tu ubicación solo para ordenar los resultados. No la guardamos.</p>
      </fieldset>

      <button type="submit">Buscar</button>
    </form>
    <p id="estado-busqueda" role="status" aria-live="polite"></p>   VIEW-03
  </section>

  <section id="resultados" aria-labelledby="resultados-titulo" hidden>   VIEW-04
    <h2 id="resultados-titulo">Ofertas de #gasfiter cerca de Ñuñoa</h2>
    <ol>
      <li>
        <article aria-labelledby="r1">
          <h3 id="r1"><a href="perfil.html?slug=juan-perez">Gasfitería a domicilio, Juan Pérez</a></h3>
          <p>Oficio · #gasfiter</p>
          <p>a 1,2 km</p>                                           D-02
        </article>
      </li>
      …
    </ol>
  </section>
</main>
```

**Formularios, nombres accesibles y foco**

- La barra tiene etiqueta visible "Oficio" y ayuda enlazada con `aria-describedby` (`02` §6). `type="search"` y `enterkeyhint="search"` dan el teclado de búsqueda en el teléfono.
- El campo de localidad tiene etiqueta visible. Cuando falla, recibe `aria-invalid="true"` y su `aria-describedby` incluye el texto del error.
- Con `#` vacío, la barra recibe `aria-invalid="true"` y el foco.
- El `form` tiene `role="search"` y nombre "Buscar oficios", así que aparece como punto de referencia de búsqueda.
- La frase "No la guardamos" se apoya en `03` `MOD-04`: el punto del cliente no se guarda.
- `#estado-busqueda` es la única región viva de la página. Anuncia carga, cantidad de resultados, vacíos y errores. `#ubicacion-actual` es texto persistente, no región viva, para no duplicar anuncios.
- `#resultados` usa `aria-busy="true"` mientras carga.
- Tras un éxito el foco no se mueve; el anuncio basta. Tras un error de `#` vacío el foco va a la barra. Tras permiso negado, sin origen o localidad no resuelta, el foco va al campo de localidad.
- El listado es `<ol>` porque el orden (cercanía) es parte del significado.
- La distancia de cada resultado es texto (`<p>a 1,2 km</p>`), con un decimal y coma decimal (D-02). No forma parte del enlace, para que el nombre accesible del enlace siga siendo "{titulo}, {nombre}".

#### `perfil.html` (`VIEW-05` a `VIEW-09`)

**Title y meta**

- Éxito: `<title>{nombre} — trabajamos.com</title>` (`02` §6: título identificable por perfil). **Supuesto:** `description` = "{nombre} en trabajamos.com: ofertas, trabajos realizados y contacto." Si hay ofertas, agrega sus `tag`: "Ofrece #gasfiter y #electricista."
- No disponible: `<title>Perfil no disponible — trabajamos.com</title>` y `meta name="robots" content="noindex"` (**Supuesto**).

**Esquema de encabezados**

```text
h1  {nombre}                          (VIEW-05) | Perfil no disponible
  h2  Contacto                        (VIEW-06)
    h3  Redes
  h2  Ofertas                         (VIEW-07)
    h3  {titulo} — un h3 por oferta
  h2  Portafolio                      (VIEW-08)
  h2  Localidad                       (VIEW-09)
```

**Estructura de `main`**

```text
<main id="contenido">
  <p id="estado-perfil" role="status" aria-live="polite"></p>
  <article id="perfil" aria-labelledby="perfil-nombre">              VIEW-05
    <h1 id="perfil-nombre">Juan Pérez</h1>
    <nav aria-label="Secciones del perfil">
      <ul>
        <li><a href="#contacto">Contacto</a></li>
        <li><a href="#ofertas">Ofertas</a></li>
        <li><a href="#portafolio">Portafolio</a></li>
        <li><a href="#localidad">Localidad</a></li>
      </ul>
    </nav>

    <section id="contacto" aria-labelledby="contacto-titulo">       VIEW-06
      <h2 id="contacto-titulo">Contacto</h2>
      <p><a href="tel:+56912345678" aria-describedby="contacto-dato">Contactar<span class="oculto"> a Juan Pérez por teléfono</span></a></p>
      <p id="contacto-dato">Teléfono: +56 9 1234 5678</p>               D-03
      <h3 id="redes-titulo">Redes</h3>
      <ul aria-labelledby="redes-titulo">
        <li><a href="https://instagram.com/…" rel="nofollow ugc">Instagram</a></li>
        <li><a href="https://facebook.com/…" rel="nofollow ugc">Facebook</a></li>
      </ul>
    </section>

    <section id="ofertas" aria-labelledby="ofertas-titulo">         VIEW-07
      <h2 id="ofertas-titulo">Ofertas</h2>
      <ul>
        <li><h3>Gasfitería a domicilio</h3><p>Oficio · #gasfiter</p></li>
      </ul>
    </section>

    <section id="portafolio" aria-labelledby="portafolio-titulo">   VIEW-08
      <h2 id="portafolio-titulo">Portafolio</h2>
      <ul>
        <li><img src="{url}" alt="{alt}" loading="lazy"></li>
      </ul>
    </section>

    <section id="localidad" aria-labelledby="localidad-titulo">     VIEW-09
      <h2 id="localidad-titulo">Localidad</h2>
      <p>{punto.etiqueta}</p>                                         D-08
      <div role="img" aria-label="Mapa con la localidad de Juan Pérez"> mapa (proveedor en 05) </div>
    </section>

    <p><a href="index.html">Buscar otro oficio</a></p>
  </article>
</main>
```

**Destino de `Contactar` según `contacto.tipo`**

| `contacto.tipo` | `href` | Nombre accesible | Texto junto al botón (D-03) |
| :--- | :--- | :--- | :--- |
| `telefono` | `tel:{valor}` | "Contactar a {nombre} por teléfono" | "Teléfono: {valor}" |
| `correo` | `mailto:{valor}` | "Contactar a {nombre} por correo" | "Correo: {valor}" |
| `url` | `{valor}` (URL `https://` completa) | "Contactar a {nombre} en su sitio" | "Sitio: {dominio}" |

El teléfono llega en formato internacional (`+56…`) porque así lo valida `VIEW-12`. El nombre accesible empieza con el texto visible "Contactar", así que coincide con lo que se ve. `Contactar` sigue siendo un `<a>`; el dato de contacto es texto plano (`<p id="contacto-dato">`), se puede copiar y el enlace lo referencia con `aria-describedby`. **Supuesto:** `{dominio}` es el nombre de host de la URL, sin `https://`, sin `www.` y sin ruta (por ejemplo `https://www.dominio.cl/contacto` muestra "dominio.cl").

**Otros puntos**

- Las redes son enlaces con el `nombre` de la red como texto. No hay feed, iframe ni contenido incrustado (`03` `MOD-01`, límite).
- Cada imagen usa el `alt` de `Imagen`. Las imágenes no son enlaces y no hay visor ampliado (no está en `02`).
- `#estado-perfil` anuncia "Cargando perfil…" y los errores de carga. En el estado "Perfil no disponible" el `article` se reemplaza por `h1` y el enlace `Buscar otro oficio`.

#### Enlace o botón en las páginas públicas

| Control | Elemento | Nombre accesible | Por qué |
| :--- | :--- | :--- | :--- |
| `Buscar` | `<button type="submit">` | "Buscar" | Envía el formulario |
| `Usar mi ubicación` | `<button type="button">` | "Usar mi ubicación" | Acción dentro de la página |
| `Reintentar búsqueda` | `<button type="button">` | "Reintentar búsqueda" | Acción dentro de la página |
| `Reintentar` (perfil) | `<button type="button">` | "Reintentar carga del perfil" | Acción dentro de la página |
| Resultado del listado | `<a href="perfil.html?slug=…">` | "{titulo}, {nombre}" | Navega al perfil |
| `Contactar` | `<a href="tel:|mailto:|https:">` | Ver tabla anterior | Navega fuera del portal |
| Red social | `<a href="{url}">` | "{nombre de la red}" | Navega fuera del portal |
| `Buscar otro oficio` | `<a href="index.html">` | "Buscar otro oficio" | Navega |
| `Crear perfil` | `<a href="panel/entrar.html">` | "Crear perfil" | Navega al panel |
| `Saltar al contenido` | `<a href="#contenido">` | "Saltar al contenido" | Navega dentro de la página |

### 4.3 Panel del emprendedor (`panel/`)

#### Reglas del panel

- **Rutas:** los `href` del panel son relativos a `panel/`. Dentro del panel, `perfil.html` es `panel/perfil.html`; el perfil público es `../perfil.html?slug={slug}` y el inicio público es `../index.html`.
- **Títulos de página:** `{Vista} — Panel — trabajamos.com`. Si el formulario tiene errores tras enviar, el título se antepone con `Error: `.
- **Nombres de campo:** los atributos `name` usan los nombres del contrato (§6.1).
- **Obligatorios:** atributo `required` y el texto "(obligatorio)" dentro del `<label>` o de la `<legend>`. No se usa un asterisco solo.
- **Ayudas:** cada ayuda es `<p id="{campo}-ayuda">` y el campo la referencia con `aria-describedby`.
- **Resumen de errores:** al enviar con errores, aparece al inicio del `<form>` un `<div id="{form}-errores" role="alert" tabindex="-1" aria-labelledby="{form}-errores-titulo">` con `<h2 id="{form}-errores-titulo">Hay {n} datos por corregir</h2>` y una `<ul>` de enlaces `<a href="#{campo}">` al campo con error. El foco pasa a ese bloque.
- **Error por campo:** `<p id="{campo}-error">` con el prefijo visible "Error:". El campo lleva `aria-invalid="true"` y `aria-describedby="{campo}-ayuda {campo}-error"`. Para grupos de radios, el error va dentro del `<fieldset>`, después de la `<legend>`, y el `<fieldset>` lo referencia con `aria-describedby`.
- **Valor que se mantiene:** cuando un dato no se publica, debajo del error aparece `<p id="{campo}-vigente">Sigue publicado: {valor anterior}</p>` (o "No hay un valor publicado") y el campo también lo referencia.
- **Mensajes de estado:** cada formulario tiene `<p id="{form}-estado" role="status" aria-live="polite">` para "Guardando…", "Guardado" y avisos sin error. Los errores van en el resumen (`role="alert"`), no en esta región.
- **Acción en curso:** el botón lleva `aria-disabled="true"` y conserva su texto; el progreso se anuncia en la región de estado.
- **Nombres accesibles de NFR (`02` §6):** `Crear perfil`, `Editar perfil`, `Agregar oferta`, `Subir imagen` y `Marcar localidad` son el texto visible de su control. `Contactar` no tiene control en el panel; el panel anuncia qué abrirá en el perfil público (`VIEW-12`).
- **Botones repetidos:** cada `Quitar` lleva texto oculto con su objeto: "Quitar oferta: {titulo}", "Quitar imagen: {alt}", "Quitar red: {nombre}".
- **`Quitar` por `id` (D-09):** el `Quitar` de un ítem guardado es `<button type="submit" name="quitar" value="{id}">` dentro de un formulario `method="post"`; apunta al `id` del ítem, no a su posición, y funciona sin JavaScript. En `VIEW-13`, una fila nueva que aún no tiene `id` se quita con `<button type="button">` y no envía nada.

#### `VIEW-11` — Marco del panel y guardia de sesión (`panel/*`)

- `<header>`:
  - `<a href="../index.html">trabajamos.com</a>` (vuelve al inicio público).
  - `<p>Panel de {nombre}</p>`, o "Panel" si aún no hay perfil.
  - `<a href="../perfil.html?slug={slug}">Ver mi perfil público</a>`. Solo aparece cuando el perfil ya está creado.
  - `<form method="post" action="{salir}"><button type="submit">Salir</button></form>`. **Supuesto:** cerrar sesión; `03` no lo nombra, pero la sesión de `MOD-06` lo implica.
- `<nav aria-label="Panel">` con `<ol>` (el orden es el del onboarding). Cada ítem es un `<a>` con `aria-current="page"` en la vista actual y un texto de estado dentro del enlace:
  1. `Editar perfil` → `perfil.html` · estado "publicado" / "sin crear". Si no hay perfil, el texto del enlace es `Crear perfil`.
  2. `Ofertas` → `ofertas.html` · "{n} ofertas" / "sin ofertas".
  3. `Portafolio` → `portafolio.html` · "{n} imágenes" / "sin imágenes".
  4. `Localidad` → `localidad.html` · "marcada" / "sin confirmar".
  - Sin perfil, los ítems 2 a 4 no son enlaces: son texto con "Disponible después de crear tu perfil".
- `<main id="contenido">`: contenido de la vista.
- **Aviso global de localidad:** si `punto` es `null` y hay al menos una oferta, todas las vistas muestran bajo la navegación `<p role="note">Tus ofertas no aparecen como oficios cercanos porque no has marcado tu localidad. <a href="localidad.html">Marcar localidad</a></p>`.
- **Guardia de sesión:**
  - Al cargar, `<main>` contiene solo `<p role="status">Verificando sesión…</p>`. `<title>`: "Verificando sesión — Panel — trabajamos.com".
  - Sin sesión válida: redirige a `entrar.html?volver={ruta actual}`. No se muestra ningún formulario ni dato del perfil.
  - Sesión que vence al enviar un formulario: nada se guarda. El resumen de errores dice "Tu sesión terminó. No se guardó ningún cambio." con el enlace `<a href="entrar.html?volver={ruta}">Entrar de nuevo</a>`. Los valores escritos quedan en el formulario, sin publicar.
  - Error al cargar datos: `<div role="alert">No pudimos cargar tus datos. No se cambió nada.</div>` y `<button type="button">Reintentar</button>`.
- `<footer>`: `<a href="../index.html">Volver al inicio de trabajamos.com</a>`.

#### `VIEW-10` — Entrar (`panel/entrar.html`)

- `<title>`: "Entrar — Panel — trabajamos.com".
- `<header>`: `<a href="../index.html">trabajamos.com</a>`. Sin navegación del panel.
- `<main id="contenido">`:
  - `<h1>Entrar a tu panel</h1>`.
  - `<p>` "Entra para crear o editar tu perfil, tus ofertas, tus imágenes y tu localidad."
  - Variante sesión vencida (`?volver=` con motivo): `<div role="status">Tu sesión terminó. Entra de nuevo para seguir editando.</div>`.
  - `<form id="form-entrar" method="post" novalidate>`:
    - Resumen de errores.
    - Credencial (`05`: correo y contraseña):
      - `<label for="correo">Correo (obligatorio)</label>` · `<input id="correo" name="correo" type="email" required autocomplete="username">`.
      - `<label for="contrasena">Contraseña (obligatorio)</label>` · `<input id="contrasena" name="contrasena" type="password" required autocomplete="current-password">`.
    - `<button type="submit">Entrar</button>`.
    - `<p id="form-entrar-estado" role="status" aria-live="polite">`.
  - `<p>` "¿Primera vez? <a href="crear-cuenta.html">Crea tu cuenta</a> y luego tu perfil." (`VIEW-18`).
- Errores:
  - Credencial rechazada: "No pudimos verificar tus datos. Revisa e intenta de nuevo." Mensaje genérico; no indica cuál dato falló.
  - Servicio no disponible: "No pudimos conectar con el servicio de acceso. Intenta en unos minutos."
  - Cuenta bloqueada tras 5 intentos fallidos (`05`): "Demasiados intentos. Espera 15 minutos e intenta de nuevo."
- Éxito: redirige a `volver` si es una ruta de `panel/`; si no, a `panel/perfil.html`.

#### `VIEW-18` — Crear cuenta (`panel/crear-cuenta.html`)

- `<title>`: "Crear cuenta — Panel — trabajamos.com".
- `<header>`: igual que `VIEW-10`.
- `<main id="contenido">`:
  - `<h1>Crear tu cuenta</h1>` · `<p>` "Con tu cuenta creas y editas tu perfil. Los clientes no necesitan cuenta."
  - `<form id="form-cuenta" method="post" novalidate>`:
    - Resumen de errores.
    - `<label for="correo">Correo (obligatorio)</label>` · `<input id="correo" name="correo" type="email" required autocomplete="email">`.
    - `<label for="contrasena">Contraseña (obligatorio)</label>` · `<input id="contrasena" name="contrasena" type="password" required minlength="8" autocomplete="new-password" aria-describedby="contrasena-ayuda">` · `<p id="contrasena-ayuda">Al menos 8 caracteres.</p>`.
    - `<label for="contrasena2">Repite la contraseña (obligatorio)</label>` · `<input id="contrasena2" name="contrasena2" type="password" required autocomplete="new-password">`.
    - `<button type="submit">Crear cuenta</button>`.
    - `<p id="form-cuenta-estado" role="status" aria-live="polite">`.
  - `<p>` "¿Ya tienes cuenta? <a href="entrar.html">Entrar</a>".
- Errores: "Escribe tu correo"; "El correo no es válido"; "La contraseña debe tener al menos 8 caracteres"; "Las contraseñas no coinciden"; "Ya existe una cuenta con ese correo. <a href="entrar.html">Entrar</a>". No se crea nada.
- Éxito: la cuenta queda creada, la sesión empieza y redirige a `perfil.html` (`VIEW-12`, "Crear perfil").

#### `VIEW-12` — Perfil y contacto (`panel/perfil.html#datos`)

- `<title>`: "Crear perfil — Panel — trabajamos.com" o "Editar perfil — Panel — trabajamos.com".
- `<main id="contenido">`:
  - `<h1>Crear perfil</h1>` (sin perfil) o `<h1>Editar perfil</h1>`.
  - `VIEW-17` va primero cuando el perfil existe.
  - `<section id="datos" aria-labelledby="datos-titulo">` con `<h2 id="datos-titulo">Nombre y contacto</h2>`.
  - `<form id="form-datos" method="post" novalidate>`:
    - Resumen de errores.
    - `<label for="nombre">Nombre visible (obligatorio)</label>` · `<input id="nombre" name="nombre" type="text" required autocomplete="name">` · ayuda: "Es el nombre que verán los clientes. Puede ser tu nombre o el de tu emprendimiento."
    - `<fieldset aria-describedby="contacto-ayuda">` · `<legend>Contacto (obligatorio)</legend>` (D-01):
      - `<p id="contacto-ayuda">` "Es lo que abre el botón Contactar de tu perfil público y el dato que se ve a su lado. Elige un solo medio. Sin contacto no se puede crear el perfil."
      - `<fieldset aria-describedby="contacto-tipo-error">` · `<legend>Medio de contacto (obligatorio)</legend>` · radios `name="contacto[tipo]"` con `required`: `Teléfono` (`telefono`), `Correo` (`correo`), `Enlace web` (`url`).
      - `<label for="contacto-valor">{Teléfono | Correo | Enlace web} (obligatorio)</label>` · `<input id="contacto-valor" name="contacto[valor]" required>`. El `type` cambia con el medio: `tel` + `autocomplete="tel"`, `email` + `autocomplete="email"`, `url`. Sin JavaScript, el label es "Teléfono, correo o enlace web (obligatorio)" y el `type` es `text`.
      - Ayuda por medio: teléfono "Incluye el código de país, por ejemplo +56 9 …"; correo "Ejemplo: nombre@dominio.cl"; enlace "Debe empezar con https://".
      - `<p id="contacto-destino">` "El botón Contactar abrirá: {llamada a +56 9 … | correo a … | el enlace …}. En tu perfil se verá: {Teléfono: … | Correo: … | Sitio: dominio}" (D-03). Sin dato todavía: "Elige un medio y escribe el dato."
    - `<button type="submit">Crear perfil</button>` (sin perfil) o `<button type="submit">Guardar perfil</button>`.
    - `<p id="form-datos-estado" role="status" aria-live="polite">`.
    - Al final, enlace de avance `<a href="#redes">Siguiente: Redes sociales</a>`.
- Regla de guardado (`02` 1.2 y 7.2, `01` §5, `03` `MOD-01`, D-01):
  1. Sin sesión: nada se publica (guardia de `VIEW-11`).
  2. Primer guardado (`Crear perfil`): exige nombre visible y contacto válido. Si falta cualquiera de los dos, nada se publica. El resumen de errores lista cada dato que falta y cada campo muestra su error: "Falta el nombre visible. Tu perfil no se publicó."; "Elige un medio de contacto"; "Escribe tu teléfono" (o "tu correo", "tu enlace"; sin medio elegido, "Escribe tu teléfono, correo o enlace"); "El correo no es válido"; "El enlace debe empezar con https://". El estado dice "Tu perfil no se publicó." Los valores escritos quedan en el formulario.
  3. Edición sin nombre: nada se guarda. Error en `nombre`: "Falta el nombre visible. No se guardó ningún cambio." y "Sigue publicado: {nombre anterior}".
  4. Edición con nombre y contacto vacío (sin medio o sin dato) o con formato inválido: el nombre se guarda; el contacto no. Error en el campo que corresponde y "Sigue publicado: {contacto anterior}" (`02` 7.2). El estado dice "Perfil guardado. El contacto no se guardó." y el resumen lista el error de contacto. El perfil nunca queda sin contacto.
  5. Todo válido: "Perfil publicado" (primera vez) o "Perfil guardado". El primer guardado crea el `slug`.

#### `VIEW-13` — Redes sociales (`panel/perfil.html#redes`)

- `<section id="redes" aria-labelledby="redes-titulo">` · `<h2 id="redes-titulo">Redes sociales</h2>` · `<p>` "Cada red aparece en tu perfil como un enlace con su nombre."
- Sin perfil, la sección muestra "Primero crea tu perfil." y no tiene formulario.
- `<form id="form-redes" method="post" novalidate>`:
  - Resumen de errores.
  - `<ol id="lista-redes">`; cada fila es un `<li>` con `<fieldset>` · `<legend>Red {n}</legend>`:
    - Fila guardada: campo oculto `redes[{n}][id]` con el `id` de la red (D-09). Fila nueva: sin `id`.
    - `<label for="red-{n}-nombre">Nombre de la red</label>` · `<input id="red-{n}-nombre" name="redes[{n}][nombre]" type="text">` · ayuda "Por ejemplo: Instagram".
    - `<label for="red-{n}-url">Dirección de la red</label>` · `<input id="red-{n}-url" name="redes[{n}][url]" type="url" inputmode="url">` · ayuda "Copia la dirección completa; empieza con https://".
    - Fila guardada: `<button type="submit" name="quitar" value="{id}">Quitar<span class="oculto"> red: {nombre}</span></button>`. Fila nueva: `<button type="button">Quitar<span class="oculto"> red {n}</span></button>`.
  - `<button type="button">Agregar red</button>`: agrega una fila y mueve el foco a su primer campo; la región de estado dice "Se agregó la red {n}".
  - `<button type="submit">Guardar redes</button>`.
  - `<p id="form-redes-estado" role="status" aria-live="polite">`.
  - Enlace de avance `<a href="ofertas.html">Siguiente: Ofertas</a>`.
- Regla de guardado (`02` 7.2):
  - Fila totalmente vacía: se ignora.
  - Fila con nombre sin URL, URL sin nombre o URL que no es `https://` completa: esa red no se publica. Error en el campo; "Sigue publicada: {nombre} {url anterior}" si la fila tiene `id`, o "Esta red no se publicó" si era nueva.
  - Las filas válidas se guardan aunque otra fila falle. Estado: "Se guardaron {k} redes. {m} no se publicaron." El resumen lista las que fallaron.
  - Envío con `quitar={id}`: solo se quita esa red; estado "Se quitó la red {nombre}." **Supuesto:** las demás filas no se guardan en ese envío y conservan lo escrito.

#### `VIEW-17` — Estado del perfil público (`panel/perfil.html#publicacion`)

- `<section id="publicacion" aria-labelledby="publicacion-titulo">`, primera sección de `<main>` cuando el perfil existe.
- `<h2 id="publicacion-titulo">Tu perfil público</h2>`.
- `<ul>` con una línea de texto por dato (sin íconos como único indicador):
  - "Nombre: {nombre}".
  - "Contactar: abre {destino}. En tu perfil se ve: {Teléfono: … | Correo: … | Sitio: dominio}" (D-01, D-03). Un perfil creado siempre tiene contacto.
  - "Redes: {n}" o "Redes: ninguna".
  - "Ofertas: {n}" o "Ofertas: ninguna. Sin ofertas, la barra de búsqueda no te encuentra." + `<a href="ofertas.html">Agregar oferta</a>`.
  - "Portafolio: {n} imágenes" o "Portafolio: sin imágenes".
  - "Localidad: {punto.etiqueta}" (D-08) o "Localidad: sin confirmar. Tus ofertas no aparecen como oficios cercanos." + `<a href="localidad.html">Marcar localidad</a>`.
- `<a href="../perfil.html?slug={slug}">Ver mi perfil público</a>`.
- Sin perfil, la sección no se muestra; `VIEW-11` ya indica "sin crear".

#### `VIEW-14` — Ofertas (`panel/ofertas.html`)

- `<title>`: "Ofertas — Panel — trabajamos.com".
- `<main id="contenido">`:
  - `<h1>Ofertas</h1>` · `<p>` "Publica proyectos, servicios u oficios. El # es lo que los clientes buscan en la barra."
  - Aviso de localidad (de `VIEW-11`) si `punto` es `null`.
  - `<section aria-labelledby="mis-ofertas">` · `<h2 id="mis-ofertas">Mis ofertas</h2>`:
    - `<ul>`; cada `<li>` es un `<article aria-labelledby="oferta-{id}-titulo">` con `<h3 id="oferta-{id}-titulo">{titulo}</h3>`, `<p>Tipo: {Proyecto|Servicio|Oficio}</p>`, `<p>Etiqueta: {tag}</p>` y `<form method="post"><button type="submit" name="quitar" value="{id}">Quitar<span class="oculto"> oferta: {titulo}</span></button></form>` (D-09).
    - Vacío: `<p>Aún no tienes ofertas. Sin ofertas, la barra de búsqueda no te encuentra.</p>`.
  - `<section aria-labelledby="nueva-oferta">` · `<h2 id="nueva-oferta">Agregar oferta</h2>`:
    - `<form id="form-oferta" method="post" novalidate>`:
      - Resumen de errores.
      - `<fieldset aria-describedby="tipo-error">` · `<legend>Tipo de oferta (obligatorio)</legend>` · radios `name="tipo"` con `required`: `Proyecto` (`proyecto`), `Servicio` (`servicio`), `Oficio` (`oficio`).
      - `<label for="titulo">Título (obligatorio)</label>` · `<input id="titulo" name="titulo" type="text" required>` · ayuda "Por ejemplo: Reparación de cañerías". Obligatorio por D-07.
      - `<label for="tag">Etiqueta de oficio, # (obligatorio)</label>` · `<input id="tag" name="tag" type="text" required autocapitalize="none" spellcheck="false" aria-describedby="tag-ayuda tag-vista-previa">`.
      - `<p id="tag-ayuda">` "Escribe el oficio, con o sin #. Se guarda en minúsculas, con # al inicio y sin espacios sobrantes. Las tildes cuentan: #gásfiter y #gasfiter son oficios distintos."
      - `<p>Se guardará como: <output id="tag-vista-previa" for="tag" aria-live="polite">{tag normalizado}</output></p>`. Aplica la regla única de §3.3. Se actualiza al dejar de escribir y al salir del campo, no en cada tecla, para no saturar al lector de pantalla. Sin texto válido: "—".
      - `<button type="submit">Agregar oferta</button>`.
      - `<p id="form-oferta-estado" role="status" aria-live="polite">`.
    - Enlace de avance `<a href="portafolio.html">Siguiente: Portafolio</a>`.
- Regla de guardado (`02` 2.2 y D-07): sin tipo ("Elige el tipo de oferta"), sin título ("Escribe un título") o con `#` vacío según §3.3 ("Escribe la etiqueta de oficio"): la oferta no se guarda, la lista "Mis ofertas" queda igual y el estado lo confirma: "La oferta no se guardó. Tus ofertas anteriores siguen publicadas." Los valores escritos quedan en el formulario para corregir.
- Éxito: "Oferta agregada: {titulo}, {tag}". La oferta aparece al final de la lista, el formulario se limpia y el foco vuelve al primer radio de tipo.

#### `VIEW-15` — Portafolio (`panel/portafolio.html`)

- `<title>`: "Portafolio — Panel — trabajamos.com".
- `<main id="contenido">`:
  - `<h1>Portafolio</h1>` · `<p>` "Sube fotos de trabajos que hiciste. Cada imagen necesita una descripción para quien no puede verla."
  - `<section aria-labelledby="mis-imagenes">` · `<h2 id="mis-imagenes">Mis imágenes</h2>`:
    - `<ul>`; cada `<li>` tiene `<figure>` con `<img src="{url}" alt="{alt}">` y `<figcaption>Texto alternativo: {alt}</figcaption>` (el emprendedor ve lo que escribió), más `<form method="post"><button type="submit" name="quitar" value="{id}">Quitar<span class="oculto"> imagen: {alt}</span></button></form>` (D-09).
    - Vacío: `<p>Aún no hay imágenes en tu portafolio.</p>`.
  - `<section aria-labelledby="nueva-imagen">` · `<h2 id="nueva-imagen">Subir imagen</h2>`:
    - `<form id="form-imagen" method="post" enctype="multipart/form-data" novalidate>`:
      - Resumen de errores.
      - `<label for="imagen">Imagen del trabajo (obligatorio)</label>` · `<input id="imagen" name="imagen" type="file" accept="image/*" required>` · ayuda "Formatos y tamaño máximo: {según 05}".
      - `<label for="alt">Descripción de la imagen (obligatorio)</label>` · `<textarea id="alt" name="alt" required rows="2">` · ayuda "Describe lo que se ve, por ejemplo: Baño con cerámica nueva instalada."
      - `<button type="submit">Subir imagen</button>`.
      - `<p id="form-imagen-estado" role="status" aria-live="polite">` y `<progress id="imagen-progreso" max="100" aria-label="Progreso de la carga">` visible solo durante la carga.
    - Enlace de avance `<a href="localidad.html">Siguiente: Localidad</a>`.
- Regla de guardado (`02` 3.2 y NFR de texto alternativo):
  - Sin archivo: "Elige una imagen".
  - Archivo que no es imagen: "El archivo no es una imagen. La imagen no se guardó y tu portafolio no cambió."
  - Descripción vacía: "Escribe la descripción de la imagen. La imagen no se guardó."
  - Carga fallida: "La imagen no se guardó y tu portafolio no cambió. Intenta de nuevo." El archivo y la descripción quedan en el formulario cuando el navegador lo permite.
  - En todos los casos de error, "Mis imágenes" queda igual.
- Éxito: "Imagen agregada al portafolio." La imagen aparece al final de la lista y el formulario se limpia.

#### `VIEW-16` — Localidad (`panel/localidad.html`)

- `<title>`: "Localidad — Panel — trabajamos.com".
- `<main id="contenido">`:
  - `<h1>Localidad</h1>` · `<p>` "Marca el lugar desde donde ofreces tu trabajo. Los clientes ven primero las ofertas más cercanas a ellos."
  - `<p id="aviso-publico">` "Este punto es público. trabajamos.com no usa ni sigue la ubicación de tu teléfono: solo publica el punto que tú confirmas."
  - `<p id="sugerencia-punto">` "Si trabajas desde tu casa, puedes marcar un punto cercano en vez de tu dirección exacta, por ejemplo tu comuna o una esquina cercana." (D-05). Va justo después del aviso de que el punto es público.
  - `<section aria-labelledby="localidad-actual">` · `<h2 id="localidad-actual">Localidad publicada</h2>`:
    - Con punto: `<p>Localidad marcada: {punto.etiqueta}</p>` (D-08).
    - Sin punto: `<p role="note">Sin localidad confirmada. Tus ofertas no aparecen como oficios cercanos hasta que marques tu localidad.</p>`.
  - `<section aria-labelledby="cambiar-localidad">` · `<h2 id="cambiar-localidad">Marcar localidad</h2>`:
    - `<form id="form-localidad" method="post" novalidate aria-describedby="aviso-publico sugerencia-punto">`:
      - Resumen de errores.
      - Solo hay dos opciones: localidad escrita o mapa. No hay botón "Usar mi ubicación actual" (D-06).
      - Opción escrita (camino accesible completo, funciona sin mapa):
        - `<label for="localidad-texto">Escribe tu localidad</label>` · `<input id="localidad-texto" type="text" autocomplete="off">` · ayuda "Por ejemplo: Maipú, Santiago".
        - `<button type="button">Buscar localidad</button>`.
        - Resultados: `<fieldset>` · `<legend>Elige el resultado correcto</legend>` · un radio por resultado. Elegir uno mueve el marcador del mapa a ese punto.
      - Opción mapa:
        - `<div id="mapa" role="region" aria-label="Mapa para marcar tu localidad">`. Tocar o hacer clic deja un marcador.
        - `<p id="punto-elegido" aria-live="polite">` "Punto elegido: {nombre sugerido | en el mapa}. Aún no está guardado." o "Aún no eliges un punto." Aquí la etiqueta puede faltar mientras la geocodificación no da un nombre; por eso es el único lugar con el texto "en el mapa".
      - Campos ocultos `punto[lat]` y `punto[lng]`, llenados solo por el resultado elegido o el marcador.
      - Nombre de la localidad (D-08): `<label for="punto-etiqueta">Nombre de la localidad (obligatorio)</label>` · `<input id="punto-etiqueta" name="punto[etiqueta]" type="text" required aria-describedby="punto-etiqueta-ayuda">` · `<p id="punto-etiqueta-ayuda">` "Es lo que verán los clientes en tu perfil. Se llena con el resultado que elegiste o con el nombre del punto del mapa, y puedes cambiarlo. Por ejemplo: Maipú, Santiago." Si la geocodificación no da un nombre para el punto del mapa, el campo queda vacío y la región de estado dice "No encontramos un nombre para ese punto. Escribe el nombre de la localidad."
      - `<button type="submit">Marcar localidad</button>`.
      - `<p id="form-localidad-estado" role="status" aria-live="polite">`.
    - Enlace de avance `<a href="perfil.html#publicacion">Siguiente: Revisar mi perfil público</a>`.
- Regla de guardado (`02` 4.1, 4.2; `03` `MOD-04`):
  - Sin punto elegido: "Elige tu localidad en el mapa o escríbela." No se guarda nada; el punto anterior se mantiene o sigue sin punto.
  - Localidad escrita sin resultados: "No encontramos esa localidad. No se marcó ningún punto. Prueba con la comuna o una calle cercana."
  - Punto sin nombre de la localidad: "Escribe el nombre de la localidad. La localidad no se guardó." El punto anterior se mantiene o sigue sin punto (D-08).
  - Mapa que no carga: `<p role="status">El mapa no está disponible. Puedes escribir tu localidad.</p>`; la opción escrita sigue activa.
  - Guardado fallido: "La localidad no se guardó. Sigue publicada: {anterior}" o "Sigues sin localidad confirmada".
  - Éxito: "Localidad marcada: {etiqueta}. Tus ofertas ya pueden aparecer como oficios cercanos." El aviso global de `VIEW-11` desaparece.
  - Nunca se pide permiso de ubicación del dispositivo en esta vista (D-06).

### 4.4 Checklist de fases

- [x] `ready_for_construction` se activa en **05**, tras Gate 3A + 3B
- [x] `construction_phase_complete` — HTML de `iterations/v1/` cumple este documento (firma 2026-11-02 23:37 UTC-3)
- [x] Fase 2 (taste-skill) habilitada: `minimalist-ui`

---

## 5. Wireframe textual (móvil primero)

Ancho de referencia: teléfono. En pantallas anchas el orden de lectura se mantiene; barra y ubicación pueden quedar en una fila y el perfil puede mostrar Contacto junto a la identidad. La distribución final la decide Fase 2. Sin look final.

### 5.1 Cliente

#### `VIEW-01` + `VIEW-02` + `VIEW-03` — inicial

```text
+----------------------------------------+
| trabajamos.com                         |
| Buscar oficios | Crear perfil          |
+----------------------------------------+
| ENCUENTRA UN OFICIO CERCA DE TI        |  h1
|                                        |
| Oficio                                 |  label
| [ gasfiter                     ] [Buscar]
| Escribe solo el oficio, por ejemplo    |
| gasfiter o #maestro chasquilla.        |
|                                        |
| Tu ubicación                           |  legend
| Ubicación: sin indicar                 |
| [Usar mi ubicación]                    |
| O escribe tu localidad                 |  label
| [                              ]       |
| Usamos tu ubicación solo para ordenar  |
| los resultados. No la guardamos.       |
|                                        |
| (estado: vacío)                        |  role=status
+----------------------------------------+
| trabajamos.com: oficios y              |
| emprendedores cerca de ti.             |
+----------------------------------------+
```

#### `VIEW-02` / `VIEW-03` — esperando ubicación (loading)

```text
| Oficio                                 |
| [ gasfiter                     ] [Buscar]
| Tu ubicación                           |
| Ubicación: esperando permiso…          |
| [Usar mi ubicación]                    |
| O escribe tu localidad                 |
| [                              ]       |
|                                        |
| Esperando tu ubicación…                |  role=status
| (sin listado: no hay origen todavía)   |
```

#### `VIEW-02` — permiso negado o sin ubicación: pide localidad (error)

```text
| Oficio                                 |
| [ #gasfiter                    ] [Buscar]
| Tu ubicación                           |
| Ubicación: sin indicar                 |
| No tenemos permiso para usar tu        |
| ubicación. Escribe tu localidad para   |
| ver oficios cercanos.                  |
| [Usar mi ubicación]                    |
| O escribe tu localidad                 |
| [|                             ]  <- foco
|                                        |
| Para ver oficios cercanos necesitamos  |  role=status
| tu ubicación.                          |
| (sin listado, sin punto inventado)     |
```

#### `VIEW-02` — localidad no encontrada (error)

```text
| O escribe tu localidad                 |
| [ xyz                          ]  aria-invalid
| No encontramos la localidad «xyz».     |
| Prueba con comuna y ciudad.            |
| (sin listado)                          |
```

#### `VIEW-04` — éxito, listado por cercanía

```text
| Oficio                                 |
| [ gasfiter                     ] [Buscar]
| Ubicación: Ñuñoa                       |
| [Usar mi ubicación]                    |
|                                        |
| 3 ofertas de #gasfiter, de la más      |  role=status
| cercana a la más lejana.               |
+----------------------------------------+
| OFERTAS DE #GASFITER CERCA DE ÑUÑOA    |  h2
|                                        |
| 1. Gasfitería a domicilio, Juan Pérez  |  h3 > a (perfil)
|    Oficio · #gasfiter                  |
|    a 0,8 km                            |  D-02
| -------------------------------------- |
| 2. Reparación de calefont, Ana Soto    |
|    Servicio · #gasfiter                |
|    a 1,2 km                            |
| -------------------------------------- |
| 3. Remodelación de baño, Taller Ríos   |
|    Proyecto · #gasfiter                |
|    a 4,5 km                            |
+----------------------------------------+
```

#### `VIEW-04` — vacío, `#` sin coincidencia

```text
| [ gásfiter                     ] [Buscar]
|                                        |
| No encontramos #gásfiter.              |  role=status
+----------------------------------------+
| NO ENCONTRAMOS #GÁSFITER               |  h2
| Ese oficio no está publicado. Revisa   |
| cómo lo escribiste: las tildes         |
| cuentan, #gásfiter y #gasfiter son     |
| distintos.                             |
| (ninguna oferta, ningún otro #)        |
+----------------------------------------+
```

#### `VIEW-04` — vacío propio, el `#` existe pero ninguna oferta tiene punto (D-04)

```text
| Ninguna oferta de #gasfiter tiene      |  role=status
| localidad marcada.                     |
+----------------------------------------+
| SIN OFICIOS CERCANOS PARA #GASFITER    |  h2
| Hay ofertas de #gasfiter, pero ninguna |
| tiene localidad marcada, así que no    |
| aparecen como cercanas.                |
```

#### `VIEW-03` — error de servicio

```text
| No pudimos completar la búsqueda.      |  role=status
| Intenta de nuevo.                      |
| [Reintentar búsqueda]                  |
| (sin listado)                          |
```

#### `VIEW-05` a `VIEW-09` — perfil completo (éxito)

```text
+----------------------------------------+
| trabajamos.com                         |
| Buscar oficios | Crear perfil          |
+----------------------------------------+
| JUAN PÉREZ                             |  h1
| Contacto · Ofertas · Portafolio ·      |  nav secciones
| Localidad                              |
+----------------------------------------+
| CONTACTO                               |  h2  VIEW-06
| [Contactar]                            |  a tel:/mailto:/URL
| Teléfono: +56 9 1234 5678              |  texto, D-03
| Redes                                  |  h3
|  - Instagram                           |  a
|  - Facebook                            |  a
+----------------------------------------+
| OFERTAS                                |  h2  VIEW-07
| Gasfitería a domicilio                 |  h3
|   Oficio · #gasfiter                   |
| Instalación eléctrica                  |  h3
|   Servicio · #electricista             |
+----------------------------------------+
| PORTAFOLIO                             |  h2  VIEW-08
| [img: alt "Baño con cerámica nueva"]   |
| [img: alt "Calefont instalado"]        |
| [img: alt "Tablero eléctrico"]         |
+----------------------------------------+
| LOCALIDAD                              |  h2  VIEW-09
| Ñuñoa, Santiago                        |  punto.etiqueta, D-08
| [ mapa con el punto del perfil ]       |  role=img, nombre
+----------------------------------------+
| Buscar otro oficio                     |  a
+----------------------------------------+
| trabajamos.com: oficios y              |
| emprendedores cerca de ti.             |
+----------------------------------------+
```

#### Perfil con datos faltantes (vacíos de redes en `VIEW-06`, y de `VIEW-07`, `VIEW-08`, `VIEW-09`)

El contacto nunca falta en un perfil publicado (D-01). Ejemplo con contacto tipo `url`:

```text
| MARÍA LÓPEZ                            |  h1
+----------------------------------------+
| CONTACTO                               |
| [Contactar]                            |  a https://…
| Sitio: costurasmaria.cl                |  dominio, D-03
| Redes                                  |
| Este perfil aún no publica redes.      |
+----------------------------------------+
| OFERTAS                                |
| Costura a medida                       |
|   Oficio · #costurera                  |
+----------------------------------------+
| PORTAFOLIO                             |
| Este perfil aún no tiene imágenes de   |
| su trabajo.                            |
+----------------------------------------+
| LOCALIDAD                              |
| Este perfil aún no marca su localidad. |
+----------------------------------------+
```

#### `VIEW-05` — perfil no disponible y error de carga

```text
| PERFIL NO DISPONIBLE                   |  h1
| Buscar otro oficio                     |  a -> index.html
```

```text
| No pudimos cargar el perfil.           |  role=status
| [Reintentar]                           |  button
```

### 5.2 Panel del emprendedor

#### `VIEW-10` — Entrar

```text
+--------------------------------------+
| trabajamos.com                       |
+--------------------------------------+
| ENTRAR A TU PANEL                    |
| Entra para crear o editar tu perfil, |
| tus ofertas, tus imágenes y tu       |
| localidad.                           |
|                                      |
| [estado: Tu sesión terminó. Entra    |
|  de nuevo para seguir editando.]     |  <- solo si llega desde la guardia
|                                      |
| [ CAMPOS DE CREDENCIAL               |
|   según método de 05 ]               |
|                                      |
| [ Entrar ]                           |
| (estado: Verificando…)               |
|                                      |
| ¿Primera vez? Entra y luego creas    |
| tu perfil.                           |
+--------------------------------------+

Error:
| +----------------------------------+ |
| | No pudimos verificar tus datos.  | |
| | Revisa e intenta de nuevo.       | |
| +----------------------------------+ |
```

#### `VIEW-11` — Marco del panel

```text
+--------------------------------------+
| [Saltar al contenido]                |
| trabajamos.com                       |
| Panel de Juan Pérez Gasfitería       |
| Ver mi perfil público   [ Salir ]    |
+--------------------------------------+
| PANEL                                |
| 1. Editar perfil · publicado         |
| 2. Ofertas · 2 ofertas               |
| 3. Portafolio · sin imágenes         |
| 4. Localidad · sin confirmar         |
+--------------------------------------+
| ! Tus ofertas no aparecen como       |
|   oficios cercanos porque no has     |
|   marcado tu localidad.              |
|   Marcar localidad                   |
+--------------------------------------+
| (contenido de la vista)              |
+--------------------------------------+
| Volver al inicio de trabajamos.com   |
+--------------------------------------+

Cargando:                         Sin perfil (navegación):
+------------------------------+  | 1. Crear perfil · sin crear     |
| Verificando sesión…          |  | 2. Ofertas                      |
+------------------------------+  |    Disponible después de crear  |
                                  |    tu perfil                    |
Error de carga:                   | 3. Portafolio (igual)           |
| No pudimos cargar tus datos. |  | 4. Localidad (igual)            |
| No se cambió nada.           |
| [ Reintentar ]               |
```

#### `VIEW-12` + `VIEW-13` + `VIEW-17` — Editar perfil

```text
+--------------------------------------+
| (marco VIEW-11)                      |
+--------------------------------------+
| EDITAR PERFIL                        |
|                                      |
| TU PERFIL PÚBLICO          (VIEW-17) |
| - Nombre: Juan Pérez Gasfitería      |
| - Contactar: abre llamada a          |
|   +56 9 1234 5678. En tu perfil se   |
|   ve: Teléfono: +56 9 1234 5678      |
| - Redes: 1                           |
| - Ofertas: 2                         |
| - Portafolio: sin imágenes           |
| - Localidad: sin confirmar. Tus      |
|   ofertas no aparecen como oficios   |
|   cercanos. Marcar localidad         |
| Ver mi perfil público                |
|--------------------------------------|
| NOMBRE Y CONTACTO          (VIEW-12) |
| Nombre visible (obligatorio)         |
| [ Juan Pérez Gasfitería            ] |
| Es el nombre que verán los clientes. |
|                                      |
| Contacto (obligatorio)               |
| Es lo que abre el botón Contactar y  |
| el dato que se ve a su lado.         |
| Medio de contacto (obligatorio)      |
| (o) Teléfono ( ) Correo ( ) Enlace   |
| Teléfono (obligatorio)               |
| [ +56 9 1234 5678                  ] |
| El botón Contactar abrirá: llamada   |
| a +56 9 1234 5678. En tu perfil se   |
| verá: Teléfono: +56 9 1234 5678      |
|                                      |
| [ Guardar perfil ]                   |
| (estado)                             |
| Siguiente: Redes sociales            |
|--------------------------------------|
| REDES SOCIALES             (VIEW-13) |
| Red 1                                |
| Nombre de la red [ Instagram       ] |
| Dirección        [ https://insta…  ] |
| [ Quitar ]                           |
| [ Agregar red ]                      |
| [ Guardar redes ]                    |
| (estado)                             |
| Siguiente: Ofertas                   |
+--------------------------------------+

Primera vez (empty): título "CREAR PERFIL", sin bloque VIEW-17,
campos vacíos, botón [ Crear perfil ]; redes dice
"Primero crea tu perfil."

Error primer guardado, sin nombre y sin contacto (D-01):
| +----------------------------------+ |
| | Hay 3 datos por corregir         | |
| | - Falta el nombre visible        | |
| | - Elige un medio de contacto     | |
| | - Escribe tu teléfono, correo o  | |
| |   enlace                         | |
| +----------------------------------+ |
| (estado) Tu perfil no se publicó.    |
| Nombre visible (obligatorio)         |
| Error: Falta el nombre visible. Tu   |
| perfil no se publicó.                |
| [                                  ] |
| Medio de contacto (obligatorio)      |
| Error: Elige un medio de contacto.   |
| ( ) Teléfono ( ) Correo ( ) Enlace   |
| Teléfono, correo o enlace web        |
| (obligatorio)                        |
| Error: Escribe tu teléfono, correo o |
| enlace.                              |
| [                                  ] |
| [ Crear perfil ]                     |

Error edición sin nombre:
| +----------------------------------+ |
| | Hay 1 dato por corregir          | |
| | - Falta el nombre visible        | |
| +----------------------------------+ |
| Nombre visible (obligatorio)         |
| Error: Falta el nombre visible. No   |
| se guardó ningún cambio.             |
| Sigue publicado: Juan Pérez          |
| Gasfitería                           |
| [                                  ] |

Error contacto en edición (nombre sí se guarda):
| (estado) Perfil guardado. El         |
| contacto no se guardó.               |
| +----------------------------------+ |
| | Hay 1 dato por corregir          | |
| | - El correo no es válido         | |
| +----------------------------------+ |
| Correo (obligatorio)                 |
| Error: El correo no es válido.       |
| Sigue publicado: +56 9 1234 5678     |
| [ juan@                            ] |

Error red:
| Red 2                                |
| Nombre de la red [ Facebook        ] |
| Dirección        [ facebook.com/j  ] |
| Error: La dirección debe empezar     |
| con https://. Esta red no se publicó.|
| (estado) Se guardó 1 red. 1 no se    |
| publicó.                             |
```

#### `VIEW-14` — Ofertas

```text
+--------------------------------------+
| (marco VIEW-11)                      |
+--------------------------------------+
| OFERTAS                              |
| Publica proyectos, servicios u       |
| oficios. El # es lo que los clientes |
| buscan en la barra.                  |
|                                      |
| MIS OFERTAS                          |
| +----------------------------------+ |
| | Reparación de cañerías           | |
| | Tipo: Oficio                     | |
| | Etiqueta: #gasfiter              | |
| | [ Quitar ]                       | |
| +----------------------------------+ |
|                                      |
| AGREGAR OFERTA                       |
| Tipo de oferta (obligatorio)         |
| ( ) Proyecto ( ) Servicio ( ) Oficio |
| Título (obligatorio)                 |
| [                                  ] |
| Etiqueta de oficio, # (obligatorio)  |
| [ Maestro   Chasquilla             ] |
| Se guardará como:                    |
|   #maestro chasquilla                |
| Las tildes cuentan: #gásfiter y      |
| #gasfiter son oficios distintos.     |
|                                      |
| [ Agregar oferta ]                   |
| (estado)                             |
| Siguiente: Portafolio                |
+--------------------------------------+

Vacío:
| MIS OFERTAS                          |
| Aún no tienes ofertas. Sin ofertas,  |
| la barra de búsqueda no te encuentra.|

Error (sin tipo, sin título y # vacío; título obligatorio por D-07):
| +----------------------------------+ |
| | Hay 3 datos por corregir         | |
| | - Elige el tipo de oferta        | |
| | - Escribe un título              | |
| | - Escribe la etiqueta de oficio  | |
| +----------------------------------+ |
| (estado) La oferta no se guardó. Tus |
| ofertas anteriores siguen publicadas.|
| (MIS OFERTAS sin cambios)            |

Bloqueada sin perfil:
| OFERTAS                              |
| Primero crea tu perfil.              |
| Crear perfil                         |
```

#### `VIEW-15` — Portafolio

```text
+--------------------------------------+
| (marco VIEW-11)                      |
+--------------------------------------+
| PORTAFOLIO                           |
| Sube fotos de trabajos que hiciste.  |
| Cada imagen necesita una descripción.|
|                                      |
| MIS IMÁGENES                         |
| +----------------------------------+ |
| | [imagen]                         | |
| | Texto alternativo: Baño con      | |
| | cerámica nueva instalada.        | |
| | [ Quitar ]                       | |
| +----------------------------------+ |
|                                      |
| SUBIR IMAGEN                         |
| Imagen del trabajo (obligatorio)     |
| [ Elegir archivo ] ningún archivo    |
| Formatos y tamaño: según 05          |
| Descripción de la imagen             |
| (obligatorio)                        |
| [                                  ] |
| [                                  ] |
|                                      |
| [ Subir imagen ]                     |
| (estado: Subiendo imagen… [====  ])  |
| Siguiente: Localidad                 |
+--------------------------------------+

Vacío:
| MIS IMÁGENES                         |
| Aún no hay imágenes en tu portafolio.|

Error (no es imagen o carga fallida):
| +----------------------------------+ |
| | Hay 1 dato por corregir          | |
| | - El archivo no es una imagen    | |
| +----------------------------------+ |
| Error: El archivo no es una imagen.  |
| La imagen no se guardó y tu          |
| portafolio no cambió.                |
| (MIS IMÁGENES sin cambios)           |
```

#### `VIEW-16` — Localidad

```text
+--------------------------------------+
| (marco VIEW-11)                      |
+--------------------------------------+
| LOCALIDAD                            |
| Marca el lugar desde donde ofreces   |
| tu trabajo.                          |
| Este punto es público. No usamos ni  |
| seguimos la ubicación de tu teléfono.|
| Si trabajas desde tu casa, puedes    |  D-05
| marcar un punto cercano en vez de tu |
| dirección exacta, por ejemplo tu     |
| comuna o una esquina cercana.        |
|                                      |
| LOCALIDAD PUBLICADA                  |
| Sin localidad confirmada. Tus        |
| ofertas no aparecen como oficios     |
| cercanos hasta que marques tu        |
| localidad.                           |
|                                      |
| MARCAR LOCALIDAD                     |
| Escribe tu localidad                 |
| [ Maipú                            ] |
| [ Buscar localidad ]                 |
| Elige el resultado correcto          |
| (o) Maipú, Región Metropolitana      |
| ( ) Maipú, otra región               |
|                                      |
| +----------------------------------+ |
| |            [ MAPA ]              | |
| |               x                  | |
| +----------------------------------+ |
| Punto elegido: Maipú, Región         |
| Metropolitana. Aún no está guardado. |
|                                      |
| Nombre de la localidad (obligatorio) |  D-08
| [ Maipú, Región Metropolitana      ] |
| Es lo que verán los clientes en tu   |
| perfil. Puedes cambiarlo.            |
|                                      |
| (sin botón "Usar mi ubicación        |  D-06
|  actual")                            |
| [ Marcar localidad ]                 |
| (estado)                             |
| Siguiente: Revisar mi perfil público |
+--------------------------------------+

Éxito:
| (estado) Localidad marcada: Maipú,   |
| Región Metropolitana. Tus ofertas ya |
| pueden aparecer como oficios         |
| cercanos.                            |
| LOCALIDAD PUBLICADA                  |
| Localidad marcada: Maipú, Región     |
| Metropolitana                        |

Error (no se resuelve):
| Error: No encontramos esa localidad. |
| No se marcó ningún punto.            |

Error (punto del mapa sin nombre):
| Punto elegido: en el mapa. Aún no    |
| está guardado.                       |
| (estado) No encontramos un nombre    |
| para ese punto. Escribe el nombre de |
| la localidad.                        |
| Nombre de la localidad (obligatorio) |
| Error: Escribe el nombre de la       |
| localidad. La localidad no se guardó.|
| [                                  ] |

Mapa no disponible:
| El mapa no está disponible. Puedes   |
| escribir tu localidad.               |
```

---

## 6. Contrato de datos compartido

### 6.1 Contrato base

```text
Perfil  { slug, nombre, contacto { tipo: telefono|correo|url, valor }, redes [ { id?, nombre, url } ],
          punto { lat, lng, etiqueta } | null, ofertas [ Oferta ], imagenes [ Imagen ] }
Oferta  { id?, tipo: proyecto|servicio|oficio, titulo, tag }
Imagen  { id?, url, alt }
```

- `contacto` es obligatorio en todo perfil publicado (D-01): nunca es `null` ni vacío.
- `punto.etiqueta` es el nombre legible de la localidad (D-08), por ejemplo "Maipú, Región Metropolitana". Es obligatorio cuando hay `punto`; con `punto: null` no existe.
- `id` es opcional (D-09): lo asigna el sistema al guardar una oferta, una imagen o una red. Un ítem que aún no se guarda no tiene `id`. `Quitar` usa el `id`.
- `titulo` es obligatorio en `Oferta` (D-07).
- `tag` se guarda ya normalizado con la regla única de §3.3.
- `slug` lo genera el sistema al crear el perfil (supuesto S-05).
- Atributos `name` de los formularios del panel: `nombre`, `contacto[tipo]`, `contacto[valor]`, `redes[i][id]`, `redes[i][nombre]`, `redes[i][url]`, `tipo`, `titulo`, `tag`, `imagen` (archivo), `alt`, `punto[lat]`, `punto[lng]`, `punto[etiqueta]`, `quitar` (valor: `id` del ítem).
- El cliente solo lee `Perfil`; `VIEW-17` también solo lee `Perfil` (supuesto S-17).

### 6.2 Resultado de búsqueda (derivado, no se guarda)

```text
ResultadoCercano { oferta: Oferta, perfil: { slug, nombre }, distancia_km }
```

Lista ordenada por `distancia_km` ascendente al origen del cliente (§3.3). `distancia_km` es la distancia en línea recta en kilómetros; la vista la muestra con un decimal y coma decimal ("a 1,2 km", D-02). Solo incluye ofertas de perfiles con `punto` distinto de `null`. No cambia `Perfil` ni `Oferta`.

### 6.3 Propuestas (no incorporadas)

No queda ninguna propuesta pendiente. `punto.etiqueta` (D-08) y los `id` opcionales (D-09) se incorporaron al contrato de §6.1.

---

## 7. Decisiones y supuestos

### 7.1 Decisiones del arquitecto (2026-11-02)

Vissiuss respondió "todas si" a las nueve preguntas de la versión `0.1.0` el 2026-11-02 a las 17:50 (UTC-3). `02` v0.1.2 y `03` v0.1.1 recogen D-01, D-02, D-07, D-08 y D-09.

- **D-01 Contacto obligatorio en el primer guardado.** El perfil se publica solo con nombre y contacto válido (teléfono, correo o URL); en ediciones, un contacto vacío o inválido no se guarda y queda el anterior. `02` v0.1.2 lo recoge en 1.1 y 1.2. Vistas: `VIEW-06`, `VIEW-12`, `VIEW-17`.
- **D-02 Distancia visible por resultado.** Cada resultado muestra "a 1,2 km" (línea recta, un decimal, coma decimal) y el orden sigue siendo del más cercano al más lejano; `distancia_km` entra al resultado derivado. Vistas: `VIEW-03`, `VIEW-04`.
- **D-03 Dato de contacto visible.** Junto a `Contactar` se muestra el teléfono o el correo como texto, o el dominio si el contacto es una URL; `Contactar` sigue siendo un enlace. Vistas: `VIEW-06`, `VIEW-12`, `VIEW-17`.
- **D-04 Mensaje propio sin punto.** "El `#` existe pero ninguna oferta tiene localidad marcada" tiene su mensaje, distinto de "ese oficio no está". Vistas: `VIEW-03`, `VIEW-04`.
- **D-05 Sugerencia de punto cercano.** Junto al aviso de que el punto es público, el panel sugiere a quien trabaja desde su casa marcar un punto cercano, como su comuna o una esquina cercana. Vista: `VIEW-16`.
- **D-06 Sin ubicación actual en el panel.** `VIEW-16` ofrece solo el mapa o una localidad escrita; no hay "Usar mi ubicación actual". Vista: `VIEW-16`.
- **D-07 Título de oferta obligatorio.** Una oferta sin título no se guarda. Vista: `VIEW-14`.
- **D-08 `punto.etiqueta` en el contrato.** `punto { lat, lng, etiqueta } | null`; la etiqueta es obligatoria al guardar un punto, se llena con la localidad elegida o el nombre geocodificado del punto del mapa y el emprendedor puede editarla. Vistas: `VIEW-09`, `VIEW-16`, `VIEW-17`.
- **D-09 `id` opcional en ofertas, imágenes y redes.** El sistema asigna el `id` al guardar y `Quitar` apunta a ese `id`. Vistas: `VIEW-13`, `VIEW-14`, `VIEW-15`.

### 7.2 Supuestos

Convertidos en decisión: **S-08 → D-07** (título obligatorio) y la parte "distancia en línea recta" de **S-12 → D-02**. El resto de S-12 sigue como supuesto. Los demás supuestos no cambian; los identificadores se mantienen para no romper referencias.

- **S-01 Rutas.** Fase 1 usa `perfil.html?slug={slug}` para el perfil público y `panel/entrar.html` para entrar; el esquema final de URL se fija en `05`.
- **S-02 Autenticación.** El método de autenticación se fija en `05`. `VIEW-10` usa un formulario de credencial genérico; si el método exige registro aparte, `05` lo agrega en `VIEW-18`.
- **S-03 Salir.** El panel tiene un botón `Salir` para cerrar sesión.
- **S-04 Mantener ítems.** Redes, ofertas e imágenes se quitan con `Quitar` (apoyado en "el emprendedor mantiene" de `01` §7). No hay edición de un ítem existente: se quita y se agrega de nuevo.
- **S-05 Slug.** El `slug` lo genera el sistema al crear el perfil y no cambia al editar el nombre.
- **S-06 Formatos.** Teléfono con código de país (regla exacta en `05`), correo con formato estándar, y contacto tipo `url` y redes con URL `https://` completa (`03` riesgo 5).
- **S-07 Perfil primero.** Ofertas, portafolio y localidad requieren perfil creado.
- **S-09 Regla `#`.** El tratamiento de los `#` iniciales y la reducción de espacios internos a uno desarrollan la regla de `03`. No hay coincidencia parcial ni sugerencias.
- **S-10 Orden de validación.** La búsqueda valida primero el `#` y después el origen.
- **S-11 Origen.** La localidad escrita tiene prioridad sobre la ubicación del navegador; el permiso solo se pide tras una acción del cliente; el tiempo máximo de espera se fija en `05`.
- **S-12 Empates y alcance.** Empates por `nombre`, sin radio máximo ni paginación en v1. La distancia se redondea al décimo más cercano y siempre se expresa en km.
- **S-13 URL de búsqueda.** `q` y `localidad` van en la URL; las coordenadas del dispositivo no.
- **S-14 Ítems del listado.** Un ítem por oferta; una búsqueda nueva reemplaza la que está en curso.
- **S-15 Enlaces externos.** Abren en la misma pestaña; `Contactar` tipo `url` y las redes llevan `rel="nofollow ugc"`.
- **S-16 Carga del perfil.** Si el perfil se carga en el navegador existe el estado "Cargando perfil…"; si se entrega desde el servidor, no. Un `slug` inexistente responde 404 con `noindex`. Se decide en `05`.
- **S-17 Estado del perfil.** `VIEW-17` no agrega datos; solo lee el `Perfil`.
- **S-18 Mapa.** Proveedor y formato (interactivo o imagen) en `05`. El control de teclado depende del proveedor; la opción escrita de `VIEW-16` cubre a quien no usa el mapa. El nombre del punto marcado en el mapa (D-08) usa la geocodificación inversa de `MOD-04` (`03` v0.1.1), con el mismo proveedor.
- **S-19 Imágenes.** Formatos y tamaño máximo en `05`. En el perfil público cargan en diferido, sin reintento por imagen y sin visor ampliado.
- **S-20 Encabezado público.** El enlace `Crear perfil` del encabezado es la entrada al panel. No hay páginas legales en v1.
- **S-21 Títulos y descripciones.** El `title` de `index.html` refleja la búsqueda; la `description` del perfil se arma con `nombre` y los `tag` de sus ofertas.
- **S-22 Dominio visible.** Para un contacto tipo `url`, el texto visible (D-03) es el nombre de host sin `https://`, sin `www.` y sin ruta.

---

## 8. Trazabilidad

| Escenario (`01` / `02`) | Cliente (`VIEW-01` a `VIEW-09`) | Panel (`VIEW-10` a `VIEW-17`) |
| :--- | :--- | :--- |
| `01` Escenario 1: el cliente encuentra un oficio cerca | `VIEW-01` barra + `VIEW-02` ubicación concedida o resuelta → `VIEW-04` éxito ordenado por cercanía con "a 1,2 km" por resultado (D-02) → `VIEW-05` con `VIEW-06` (`Contactar`, dato de contacto visible y redes; D-03). Solo hay barra, sin compositor de hashtags. | `VIEW-14` éxito (oferta con título y `#`) + `VIEW-16` éxito (punto con etiqueta) + `VIEW-12`/`VIEW-13` éxito (contacto obligatorio y redes). |
| `01` Escenario 2: sin oficio o sin ubicación no hay listado inventado | `VIEW-04` vacío sin coincidencia (sin otros `#`); `VIEW-03` error `#` vacío (pide un oficio); `VIEW-02` sin origen o permiso negado (pide ubicación, sin punto inventado). | — |
| `FEAT-01` 1.1: perfil guardado con nombre y contacto válido queda publicado | `VIEW-05` éxito: `h1` con `nombre`, secciones `VIEW-06` a `VIEW-09`, `<title>{nombre} — trabajamos.com</title>`; `VIEW-06` siempre con `Contactar`. | `VIEW-18` crea la cuenta e inicia la sesión; `VIEW-12` éxito "Perfil publicado" tras guardar nombre y contacto válido; `VIEW-17` con enlace "Ver mi perfil público"; `VIEW-11` pasa a "publicado". |
| `FEAT-01` 1.2: sin sesión, no se publica y ve qué falta | Un perfil sin guardar no existe: `VIEW-05` error "Perfil no disponible". | `VIEW-11` guardia (redirige a `VIEW-10`, sin formularios); sesión vencida al enviar: "Tu sesión terminó. No se guardó ningún cambio." + "Entrar de nuevo"; `VIEW-10` variante sesión vencida. |
| `FEAT-01` 1.2: sin nombre o sin contacto válido, no se publica y ve qué falta | `VIEW-05` error "Perfil no disponible" si el perfil nunca se guardó. | `VIEW-12` error de primer guardado: el resumen lista nombre y contacto faltantes, "Tu perfil no se publicó."; edición sin nombre: "Falta el nombre visible. No se guardó ningún cambio." y "Sigue publicado: {nombre anterior}". |
| `FEAT-02` 2.1: la oferta aparece en el perfil con tipo, título y `#` | `VIEW-07` éxito; `VIEW-04` éxito muestra `tipo` y `tag` por ítem. | `VIEW-14` éxito: la oferta entra a "Mis ofertas" con tipo y `#` normalizado (vista previa "Se guardará como"). |
| `FEAT-02` 2.2: sin tipo, sin título o con `#` vacío, no se guarda y se conservan las anteriores | `VIEW-07` muestra solo ofertas guardadas; `VIEW-07` vacío si no hay. | `VIEW-14` error (sin tipo, sin título o `#` vacío): resumen por campo, "La oferta no se guardó. Tus ofertas anteriores siguen publicadas.", lista sin cambios. |
| `FEAT-02` precondición "perfil publicado" | — | `VIEW-14` bloqueada sin perfil, con enlace a `VIEW-12`. |
| `FEAT-03` 3.1: la imagen queda en el portafolio | `VIEW-08` éxito con `alt` por imagen. | `VIEW-15` éxito: imagen en "Mis imágenes" con su texto alternativo. |
| `FEAT-03` 3.2: no es imagen o la carga falla, el portafolio no cambia | `VIEW-08` muestra solo imágenes guardadas; `VIEW-08` vacío si no hay. | `VIEW-15` error: "La imagen no se guardó y tu portafolio no cambió.", lista sin cambios. |
| `FEAT-04` 4.1: localidad confirmada se guarda y habilita cercanía | `VIEW-09` éxito (`punto.etiqueta` y mapa; D-08); `VIEW-04` éxito solo lista perfiles con `punto`. | `VIEW-16` éxito: "Localidad marcada: {etiqueta}. Tus ofertas ya pueden aparecer como oficios cercanos."; desaparece el aviso de `VIEW-11`; `VIEW-17` muestra la etiqueta. Error: punto sin nombre de la localidad no se guarda (D-08). |
| `FEAT-04` 4.2: sin punto, las ofertas no aparecen como cercanas | `VIEW-04` excluye ofertas con `punto: null`; `VIEW-04` vacío propio sin ofertas con punto (D-04); `VIEW-09` vacío. | `VIEW-16` vacío "Sin localidad confirmada…"; aviso global de `VIEW-11`; "Localidad: sin confirmar" en `VIEW-17`; aviso en `VIEW-14`. |
| `FEAT-04` supuesto: punto confirmado, no posición del dispositivo | El punto del cliente no se guarda ("No la guardamos" en `VIEW-02`). | `VIEW-16`: "No usamos ni seguimos la ubicación de tu teléfono" y sugerencia de punto cercano para quien trabaja desde su casa (D-05); solo mapa o localidad escrita, sin "Usar mi ubicación actual" (D-06); el punto solo se guarda con `Marcar localidad`. |
| `FEAT-05` 5.1: `gasfiter` o `#gasfiter` dan solo `#gasfiter` | Regla única de §3.3 + `VIEW-04` éxito con coincidencia exacta del `#`. | `VIEW-14` guarda el `tag` con la misma regla, así que la búsqueda y el guardado coinciden. |
| `FEAT-05` 5.2: texto sin coincidencia, listado vacío y sin otros `#` | `VIEW-04` vacío "No encontramos #xyz" + anuncio en `VIEW-03`; sin sugerencias ni otros `#`. | — |
| `FEAT-06` 6.1: ubicación autorizada o escrita, orden por cercanía | `VIEW-02` permiso concedido o localidad resuelta → `VIEW-03` loading → `VIEW-04` éxito en `<ol>` por distancia ascendente, con la distancia de cada resultado (D-02). | `VIEW-16` éxito aporta el punto del perfil. |
| `FEAT-06` 6.2: niega ubicación y no escribe localidad | `VIEW-02` permiso negado / sin soporte / tiempo agotado → pide localidad, foco en el campo; `VIEW-03` "necesitamos tu ubicación"; sin listado. | — |
| `FEAT-07` 7.1: el cliente ve `Contactar` y redes; cada uno abre su destino | `VIEW-06` éxito: `Contactar` es `<a>` con `tel:`, `mailto:` o URL, con el dato de contacto como texto al lado (D-03); cada red es `<a>` con su nombre. | `VIEW-12` éxito con "El botón Contactar abrirá: … En tu perfil se verá: …"; `VIEW-13` éxito "Redes guardadas"; `VIEW-17` enlaza al perfil público. |
| `FEAT-07` 7.2: contacto vacío, no se publica y queda el válido anterior | `VIEW-06` muestra el último contacto válido; un perfil publicado siempre tiene contacto (D-01). | `VIEW-12` primer guardado sin contacto: no se publica el perfil (D-01). Edición con contacto vacío o inválido: error de contacto con "Sigue publicado: {anterior}". |
| `FEAT-07` 7.2: URL de red inválida, no se publica y quedan las válidas | `VIEW-06` muestra solo redes válidas; vacío "Este perfil aún no publica redes." | `VIEW-13` error por fila: esa red no se publica, "Sigue publicada: …" si existía; las demás filas válidas se guardan. |
| `02` §6 Performance: usable en teléfono; esperar el punto | Wireframes de una columna con barra y `Buscar` arriba; `type="search"`, `enterkeyhint`; `VIEW-03` "Esperando tu ubicación…" sin listado con origen falso; `VIEW-04` retira el listado anterior al cargar. | Wireframes de una columna; camino escrito en `VIEW-16` que no depende del mapa. |
| `02` §6 SEO mínimo | `title` y `description` propios en `index.html`; `<title>{nombre} — trabajamos.com</title>` en cada perfil. | `{Vista} — Panel — trabajamos.com` por página. |
| `02` §6 Accesibilidad | Etiqueta visible "Oficio"; `form role="search"`; nombre accesible de `Contactar` y dato de contacto enlazado con `aria-describedby` (D-03); cada red anuncia su nombre; `alt` del emprendedor en cada imagen; región viva `role="status"`; enlace para saltar al contenido. | Texto visible de `Crear perfil`, `Editar perfil`, `Agregar oferta`, `Subir imagen` y `Marcar localidad`; campo "Descripción de la imagen (obligatorio)" en `VIEW-15`; "Contacto (obligatorio)" en `VIEW-12` y "Nombre de la localidad (obligatorio)" en `VIEW-16`; resumen de errores con `role="alert"`; `Quitar` con su objeto en texto oculto. |

---

## 9. Aprobación

- **Gate 3A** `visual_approval_passed` — wireframe / estructura. **APROBADO** por Vissiuss (arquitecto), 2026-11-02 22:17 (UTC-3). El agente transcribió la decisión.
- **Gate 3B** `audit_3_passed` — ensamblado 03+04+05. **APROBADO** por Vissiuss (arquitecto), 2026-11-02 22:51 (UTC-3) (`audits/auditoria-ensamblado.md`).
- **Fase 1** `ready_for_construction` — flag en `05-build-plan.md` (`true`).
- **Fase 1 completa** `construction_phase_complete` — **APROBADO** por Vissiuss (arquitecto), 2026-11-02 23:37 (UTC-3). El agente transcribió la firma. Habilita Fase 2 con `minimalist-ui`.
