import type { Perfil, ResultadoCercano } from "../datos.js";
import { Html, attrSi, html } from "../lib/html.js";
import {
  ETIQUETA_OFERTA,
  contactoDato,
  contactoHref,
  contactoMedio,
  distanciaTexto,
} from "../lib/reglas.js";
import { cabeceraBanner, documento } from "./comun.js";

export type TipoBusqueda =
  | "inicial"
  | "tag_vacio"
  | "sin_coincidencia"
  | "sin_origen"
  | "localidad_no_encontrada"
  | "sin_punto"
  | "exito"
  | "error_servicio";

export interface EstadoBusqueda {
  tipo: TipoBusqueda;
  q: string;
  localidad: string;
  tag: string | null;
  origen: "localidad" | "navegador" | null;
  origenTexto: string | null;
  resultados: ResultadoCercano[];
}

const OFICIOS_EJEMPLO = [
  "Gasfitería",
  "Electricidad",
  "Carpintería",
  "Pintura",
  "Albañilería",
  "Jardinería",
  "Cerrajería",
  "Limpieza",
  "Mudanzas",
  "Maestro chasquilla",
] as const;

function oficioCoincide(q: string | undefined, nombre: string): boolean {
  if (!q) return false;
  const limpio = q.trim().replace(/^#+\s*/u, "");
  return limpio.localeCompare(nombre, "es-CL", { sensitivity: "accent" }) === 0;
}

/** Select nativo entre los dos botones. Sin JS se envía con «Ver» a `?q=`. */
function controlOficios(q: string | undefined): Html {
  return html`<form class="tw-oficios" action="/index.html" method="get">
    <label class="tw-oficios__label" for="oficio-ejemplo">Oficio de ejemplo</label>
    <span class="tw-oficios__control">
      <select id="oficio-ejemplo" name="q">
        <option value="">Ejemplos</option>
        ${OFICIOS_EJEMPLO.map(
          (nombre) =>
            html`<option value="${nombre}"${oficioCoincide(q, nombre) ? html` selected` : ""}>${nombre}</option>`,
        )}
      </select>
      <button type="submit" class="tw-oficios__ir">Ver</button>
    </span>
  </form>`;
}

function cabeceraPublica(actual: "buscar" | "perfil" | "publicate" | "otra" = "otra", q?: string): Html {
  return cabeceraBanner({
    lema: "Oficios y emprendedores cerca de ti",
    meta: "Chile",
    enlaces: [],
    acciones: html`<div class="tw-header__acciones">
      <a class="tw-header__btn" href="/index.html"${actual === "buscar" ? html` aria-current="page"` : ""}>Buscar oficios</a>
      ${controlOficios(q)}
      <a class="tw-header__btn" href="/publicate-ahora.html"${actual === "publicate" ? html` aria-current="page"` : ""}>Públicate ahora</a>
    </div>`,
  });
}

function piePublico(): Html {
  return html`<footer class="tw-footer">
  <p><strong>trabajamos.com</strong> - oficios y emprendedores cerca de ti.</p>
  <p class="atribucion">Mapas y localidades: © colaboradores de <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>.</p>
</footer>`;
}

function cantidadOfertas(n: number): string {
  return n === 1 ? "1 oferta" : `${n} ofertas`;
}

export function textoEstado(e: EstadoBusqueda): string {
  switch (e.tipo) {
    case "inicial":
      return "";
    case "tag_vacio":
      return "Escribe un oficio, por ejemplo gasfiter.";
    case "sin_coincidencia":
      return `No encontramos ${e.tag}.`;
    case "sin_origen":
      return "Para ver oficios cercanos necesitamos tu ubicación.";
    case "localidad_no_encontrada":
      return `No encontramos la localidad «${e.localidad}».`;
    case "sin_punto":
      return `Ninguna oferta de ${e.tag} tiene localidad marcada.`;
    case "exito":
      return `${cantidadOfertas(e.resultados.length)} de ${e.tag}, de la más cercana a la más lejana.`;
    case "error_servicio":
      return "No pudimos completar la búsqueda. Intenta de nuevo.";
  }
}

export function textoUbicacion(e: EstadoBusqueda): string {
  if (e.tipo === "sin_origen") {
    return "Para ver oficios cercanos necesitamos tu ubicación. Usa tu ubicación o escribe tu localidad.";
  }
  if (e.tipo === "localidad_no_encontrada") {
    return `No encontramos la localidad «${e.localidad}». Prueba con comuna y ciudad.`;
  }
  if (e.origen === "localidad" && e.origenTexto) return `Ubicación: ${e.localidad}`;
  if (e.origen === "navegador") return "Ubicación: tu ubicación actual";
  return "Ubicación: sin indicar";
}

export function seccionResultados(e: EstadoBusqueda): Html {
  const visible = e.tipo === "exito" || e.tipo === "sin_coincidencia" || e.tipo === "sin_punto";
  let contenido: Html = html``;
  if (e.tipo === "exito") {
    const origen = e.origen === "localidad" ? e.localidad : "ti";
    contenido = html`<header class="tw-results__head">
      <h2 id="resultados-titulo">Ofertas de ${e.tag} cerca de ${origen}</h2>
      <p class="tw-sort">Orden: <span aria-current="true">cercanía</span></p>
    </header>
    <ol class="tw-list">
      ${e.resultados.map(
        (r, i) => html`<li style="--i:${String(i)}">
        <article class="tw-card" aria-labelledby="r${i + 1}">
          <p class="tw-card__km">${distanciaTexto(r.distanciaKm)}</p>
          <div class="tw-card__body">
            <h3 id="r${i + 1}" class="tw-card__title"><a href="/perfil.html?slug=${encodeURIComponent(r.perfil.slug)}">${r.oferta.titulo}</a></h3>
            <p class="tw-card__who">${r.perfil.nombre}</p>
            <p class="tw-card__tag"><span class="tw-card__chip">${ETIQUETA_OFERTA[r.oferta.tipo]}</span> ${r.oferta.tag}</p>
            <p class="tw-card__contacto">${contactoDato(r.contacto.tipo, r.contacto.valor)}</p>
          </div>
        </article>
      </li>`,
      )}
    </ol>`;
  } else if (e.tipo === "sin_coincidencia") {
    contenido = html`<h2 id="resultados-titulo">No encontramos ${e.tag}</h2>
    <p>Ese oficio no está publicado. Revisa cómo lo escribiste: las tildes cuentan, #gásfiter y #gasfiter son distintos.</p>`;
  } else if (e.tipo === "sin_punto") {
    contenido = html`<h2 id="resultados-titulo">Sin oficios cercanos para ${e.tag}</h2>
    <p>Hay ofertas de ${e.tag}, pero ninguna tiene localidad marcada, así que no aparecen como cercanas.</p>`;
  }
  return html`<section id="resultados" class="tw-results" aria-labelledby="resultados-titulo"${attrSi(!visible, "hidden")}>
    ${contenido}
  </section>`;
}

export function tituloInicio(e: EstadoBusqueda): string {
  return e.tag && e.tipo !== "tag_vacio"
    ? `${e.tag} cerca de ti — trabajamos.com`
    : "trabajamos.com — Encuentra oficios cerca de ti";
}

export function vistaInicio(e: EstadoBusqueda): Html {
  const qInvalido = e.tipo === "tag_vacio";
  const localidadInvalida = e.tipo === "localidad_no_encontrada" || e.tipo === "sin_origen";
  const cuerpo = html`<main id="contenido" class="tw-page">
  <section id="buscar" class="tw-hero" aria-labelledby="buscar-titulo">
    <div class="tw-hero__stage">
      <p class="tw-hero__brand">trabajamos.com</p>
      <h1 id="buscar-titulo">Encuentra un oficio cerca de ti</h1>
      <p class="tw-hero__lead">Busca por oficio y comuna. Te ordenamos quién está más cerca.</p>
      <form id="form-buscar" class="tw-search" role="search" aria-label="Buscar oficios" action="/index.html" method="get">
        <label class="tw-field" for="q">
          <span class="tw-field__label">Qué</span>
          <input type="search" id="q" name="q" value="${e.q}" autocomplete="off" enterkeyhint="search"
                 placeholder="Oficio o palabra clave"
                 aria-describedby="q-ayuda${qInvalido ? " estado-busqueda" : ""}"${attrSi(qInvalido, 'aria-invalid="true" autofocus')}>
        </label>
        <div class="tw-field tw-field--donde" id="ubicacion" aria-describedby="ubicacion-ayuda">
          <label class="tw-field__label" for="localidad">Dónde</label>
          <input type="text" id="localidad" name="localidad" value="${e.localidad}" autocomplete="address-level2"
                 placeholder="Comuna o ciudad"
                 aria-describedby="ubicacion-actual"${attrSi(localidadInvalida, 'aria-invalid="true"')}${attrSi(localidadInvalida && !qInvalido, "autofocus")}>
          <p id="ubicacion-actual" class="tw-field__hint">${textoUbicacion(e)}</p>
          <button type="button" id="usar-ubicacion" class="tw-linkish" hidden>Usar mi ubicación</button>
        </div>
        <button type="submit" class="tw-cta">Buscar</button>
      </form>
      <p id="q-ayuda" class="tw-help">Escribe solo el oficio, por ejemplo gasfiter o #maestro chasquilla.</p>
      <p id="ubicacion-ayuda" class="tw-help">Usamos tu ubicación solo para ordenar los resultados. No la guardamos.</p>
      <p id="estado-busqueda" role="status" aria-live="polite">${textoEstado(e)}</p>
      <button type="button" id="reintentar" class="tw-cta tw-cta--ghost"${attrSi(e.tipo !== "error_servicio", "hidden")}>Reintentar búsqueda</button>
    </div>
    <div class="tw-hero__splash">
      <img class="tw-mark" src="/assets/vissiuss-logo.png" alt="Vissiuss" width="160" height="160">
    </div>
  </section>

  <div class="tw-filters" role="toolbar" aria-label="Filtros">
    <button type="button" class="tw-chip is-active" aria-pressed="true" disabled>Cercanía</button>
    <button type="button" class="tw-chip" aria-pressed="false" disabled>Oficio</button>
    <button type="button" class="tw-chip" aria-pressed="false" disabled>Fecha</button>
  </div>

  ${seccionResultados(e)}
</main>`;
  return documento({
    titulo: tituloInicio(e),
    descripcion: "Busca un oficio en trabajamos.com y encuentra emprendedores cercanos a tu ubicación.",
    cabecera: cabeceraPublica("buscar", e.q),
    cuerpo,
    pie: piePublico(),
    scripts: ["/assets/buscar.js"],
  });
}

function headlinePerfil(perfil: Perfil): string {
  if (perfil.ofertas[0]) return perfil.ofertas[0].titulo;
  const tags = [...new Set(perfil.ofertas.map((o) => o.tag))];
  if (tags.length) return tags.join(" · ");
  return "Emprendedor en trabajamos.com";
}

export function vistaPerfil(perfil: Perfil, urlImagen: (archivo: string) => string): Html {
  const c = perfil.contacto;
  const tags = [...new Set(perfil.ofertas.map((o) => o.tag))];
  const descripcion =
    `${perfil.nombre} en trabajamos.com: ofertas, trabajos realizados y contacto.` +
    (tags.length ? ` Ofrece ${tags.join(" y ")}.` : "");
  const externo = c.tipo === "url" ? ' rel="nofollow ugc"' : "";
  const locLine = perfil.punto?.etiqueta ?? "Localidad sin marcar";
  const cuerpo = html`<main id="contenido" class="tw-profile-page">
  <p id="estado-perfil" role="status" aria-live="polite"></p>
  <article id="perfil" class="tw-profile" aria-labelledby="perfil-nombre">
    <div class="tw-profile__banner">
      <img class="tw-mark tw-mark--banner" src="/assets/vissiuss-logo.png" alt="Vissiuss" width="96" height="96">
    </div>
    <header class="tw-profile__hero">
      <div class="tw-profile__photo"><img class="tw-mark" src="/assets/vissiuss-logo.png" alt="Vissiuss" width="112" height="112"></div>
      <div class="tw-profile__id">
        <h1 id="perfil-nombre">${perfil.nombre}</h1>
        <p class="tw-profile__headline">${headlinePerfil(perfil)}</p>
        <p class="tw-profile__loc">${locLine}</p>
        <div class="tw-profile__cta">
          <a class="tw-cta tw-cta--contact" href="${contactoHref(c.tipo, c.valor)}" aria-describedby="contacto-dato"${new Html(externo)}>Contactar<span class="oculto"> a ${perfil.nombre} ${contactoMedio(c.tipo)}</span></a>
          ${
            perfil.redes.length
              ? html`<ul class="tw-redes-inline" aria-label="Redes">
            ${perfil.redes.map((r) => html`<li><a href="${r.url}" rel="nofollow ugc">${r.nombre}</a></li>`)}
          </ul>`
              : ""
          }
        </div>
      </div>
    </header>

    <nav class="tw-toc" aria-label="Secciones del perfil">
      <ul>
        <li><a href="#contacto">Contacto</a></li>
        <li><a href="#ofertas">Ofertas</a></li>
        <li><a href="#portafolio">Portafolio</a></li>
        <li><a href="#localidad">Localidad</a></li>
      </ul>
    </nav>

    <section id="contacto" class="tw-block tw-block--sun" aria-labelledby="contacto-titulo">
      <h2 id="contacto-titulo">Contacto</h2>
      <p id="contacto-dato">${contactoDato(c.tipo, c.valor)}</p>
      <h3 id="redes-titulo">Redes</h3>
      ${
        perfil.redes.length
          ? html`<ul aria-labelledby="redes-titulo">
        ${perfil.redes.map((r) => html`<li><a href="${r.url}" rel="nofollow ugc">${r.nombre}</a></li>`)}
      </ul>`
          : html`<p>Este perfil aún no publica redes.</p>`
      }
    </section>

    <section id="ofertas" class="tw-block" aria-labelledby="ofertas-titulo">
      <h2 id="ofertas-titulo">Ofertas</h2>
      ${
        perfil.ofertas.length
          ? html`<ul class="tw-offers">
        ${perfil.ofertas.map(
          (o) => html`<li><article><h3>${o.titulo}</h3><p class="tw-offers__meta">${ETIQUETA_OFERTA[o.tipo]} · ${o.tag}</p></article></li>`,
        )}
      </ul>`
          : html`<p>Este perfil aún no publica ofertas.</p>`
      }
    </section>

    <section id="portafolio" class="tw-block tw-block--ink" aria-labelledby="portafolio-titulo">
      <h2 id="portafolio-titulo">Portafolio</h2>
      ${
        perfil.imagenes.length
          ? html`<ul class="tw-folio">
        ${perfil.imagenes.map(
          (i) =>
            html`<li><img src="${urlImagen(i.archivo)}" alt="${i.alt}" width="${i.ancho}" height="${i.alto}" loading="lazy"></li>`,
        )}
      </ul>`
          : html`<p>Este perfil aún no tiene imágenes de su trabajo.</p>`
      }
    </section>

    <section id="localidad" class="tw-block" aria-labelledby="localidad-titulo">
      <h2 id="localidad-titulo">Localidad</h2>
      ${
        perfil.punto
          ? html`<p>${perfil.punto.etiqueta}</p>
      <div id="mapa-perfil" class="mapa" role="img" aria-label="Mapa con la localidad de ${perfil.nombre}"
           data-lat="${perfil.punto.lat}" data-lng="${perfil.punto.lng}"></div>
      <p id="mapa-perfil-estado" role="status" aria-live="polite"></p>`
          : html`<p>Este perfil aún no marca su localidad.</p>`
      }
    </section>

    <p class="tw-back"><a href="/index.html">Buscar otro oficio</a></p>
  </article>
</main>`;
  return documento({
    titulo: `${perfil.nombre} — trabajamos.com`,
    descripcion,
    cabecera: cabeceraPublica("perfil"),
    cuerpo,
    pie: piePublico(),
    estilos: perfil.punto ? ["/vendor/leaflet/leaflet.css"] : [],
    scripts: perfil.punto ? ["/vendor/leaflet/leaflet.js", "/assets/mapa.js", "/assets/perfil.js"] : [],
  });
}

/** Informativa previa al registro. No pide sesión. */
export function vistaPublicate(): Html {
  const cuerpo = html`<main id="contenido">
  <h1>Públicate ahora</h1>
  <p>Esto es lo que hace trabajamos.com hoy, antes de crear la cuenta.</p>

  <section id="como-funciona" class="tw-block" aria-labelledby="como-funciona-titulo">
    <h2 id="como-funciona-titulo">Cómo funciona</h2>
    <p>Quien busca escribe un oficio y una comuna. trabajamos.com muestra las ofertas publicadas y las ordena de la más cercana a la más lejana. Buscar y abrir un perfil no pide cuenta.</p>
    <p>Quien ofrece publica su perfil con nombre y un medio de contacto (teléfono, correo o enlace), sus ofertas, el portafolio y la localidad donde trabaja. Ese contacto queda visible en el perfil. El botón Contactar abre el teléfono, el correo o el enlace guardado.</p>
  </section>

  <section id="normas" class="tw-block" aria-labelledby="normas-titulo">
    <h2 id="normas-titulo">Normas de la comunidad</h2>
    <p>Pendiente de redacción con Vissiuss. Esta sección no publica un reglamento.</p>
  </section>

  <section id="planes" class="tw-block" aria-labelledby="planes-titulo">
    <h2 id="planes-titulo">Planes disponibles</h2>
    <p>Pendiente. No hay planes ni precios publicados.</p>
  </section>

  <section id="preguntas-frecuentes" class="tw-block" aria-labelledby="preguntas-titulo">
    <h2 id="preguntas-titulo">Preguntas frecuentes</h2>
    <p>Pendiente. No hay preguntas escritas.</p>
  </section>

  <p>El paso siguiente es crear la cuenta. Si ya tienes una, entra.</p>
  <p><a class="tw-cta tw-cta--contact" href="/panel/crear-cuenta.html">Crear cuenta</a></p>
  <p><a href="/panel/entrar.html">Ya tengo cuenta</a></p>
</main>`;
  return documento({
    titulo: "Públicate ahora — trabajamos.com",
    descripcion: "Cómo funciona trabajamos.com antes de crear la cuenta del emprendedor.",
    cabecera: cabeceraPublica("publicate"),
    cuerpo,
    pie: piePublico(),
  });
}

export function vistaPerfilNoDisponible(): Html {
  return documento({
    titulo: "Perfil no disponible — trabajamos.com",
    noindex: true,
    cabecera: cabeceraPublica(),
    cuerpo: html`<main id="contenido" class="tw-page">
  <h1>Perfil no disponible</h1>
  <p><a href="/index.html">Buscar otro oficio</a></p>
</main>`,
    pie: piePublico(),
  });
}
