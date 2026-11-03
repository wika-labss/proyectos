import type { Perfil, ResultadoCercano } from "../datos.js";
import { Html, attrSi, html } from "../lib/html.js";
import {
  ETIQUETA_OFERTA,
  contactoDato,
  contactoHref,
  contactoMedio,
  distanciaTexto,
} from "../lib/reglas.js";
import { documento } from "./comun.js";

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

function cabeceraPublica(): Html {
  return html`<header>
  <a href="/index.html">trabajamos.com</a>
  <nav aria-label="Principal">
    <ul>
      <li><a href="/index.html">Buscar oficios</a></li>
      <li><a href="/panel/entrar.html">Crear perfil</a></li>
    </ul>
  </nav>
</header>`;
}

function piePublico(): Html {
  return html`<footer>
  <p>trabajamos.com: oficios y emprendedores cerca de ti.</p>
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
    contenido = html`<h2 id="resultados-titulo">Ofertas de ${e.tag} cerca de ${origen}</h2>
    <ol>
      ${e.resultados.map(
        (r, i) => html`<li>
        <article aria-labelledby="r${i + 1}">
          <h3 id="r${i + 1}"><a href="/perfil.html?slug=${encodeURIComponent(r.perfil.slug)}">${r.oferta.titulo}, ${r.perfil.nombre}</a></h3>
          <p>${ETIQUETA_OFERTA[r.oferta.tipo]} · ${r.oferta.tag}</p>
          <p>${distanciaTexto(r.distanciaKm)}</p>
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
  return html`<section id="resultados" aria-labelledby="resultados-titulo"${attrSi(!visible, "hidden")}>
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
  const cuerpo = html`<main id="contenido">
  <section id="buscar" aria-labelledby="buscar-titulo">
    <h1 id="buscar-titulo">Encuentra un oficio cerca de ti</h1>
    <form id="form-buscar" role="search" aria-label="Buscar oficios" action="/index.html" method="get">
      <label for="q">Oficio</label>
      <input type="search" id="q" name="q" value="${e.q}" autocomplete="off" enterkeyhint="search"
             aria-describedby="q-ayuda${qInvalido ? " estado-busqueda" : ""}"${attrSi(qInvalido, 'aria-invalid="true" autofocus')}>
      <p id="q-ayuda">Escribe solo el oficio, por ejemplo gasfiter o #maestro chasquilla.</p>

      <fieldset id="ubicacion" aria-describedby="ubicacion-ayuda">
        <legend>Tu ubicación</legend>
        <p id="ubicacion-actual">${textoUbicacion(e)}</p>
        <button type="button" id="usar-ubicacion" hidden>Usar mi ubicación</button>
        <label for="localidad">O escribe tu localidad</label>
        <input type="text" id="localidad" name="localidad" value="${e.localidad}" autocomplete="address-level2"
               aria-describedby="ubicacion-actual"${attrSi(localidadInvalida, 'aria-invalid="true"')}${attrSi(localidadInvalida && !qInvalido, "autofocus")}>
        <p id="ubicacion-ayuda">Usamos tu ubicación solo para ordenar los resultados. No la guardamos.</p>
      </fieldset>

      <button type="submit">Buscar</button>
    </form>
    <p id="estado-busqueda" role="status" aria-live="polite">${textoEstado(e)}</p>
    <button type="button" id="reintentar"${attrSi(e.tipo !== "error_servicio", "hidden")}>Reintentar búsqueda</button>
  </section>

  ${seccionResultados(e)}
</main>`;
  return documento({
    titulo: tituloInicio(e),
    descripcion: "Busca un oficio en trabajamos.com y encuentra emprendedores cercanos a tu ubicación.",
    cabecera: cabeceraPublica(),
    cuerpo,
    pie: piePublico(),
    scripts: ["/assets/buscar.js"],
  });
}

export function vistaPerfil(perfil: Perfil, urlImagen: (archivo: string) => string): Html {
  const c = perfil.contacto;
  const tags = [...new Set(perfil.ofertas.map((o) => o.tag))];
  const descripcion =
    `${perfil.nombre} en trabajamos.com: ofertas, trabajos realizados y contacto.` +
    (tags.length ? ` Ofrece ${tags.join(" y ")}.` : "");
  const externo = c.tipo === "url" ? ' rel="nofollow ugc"' : "";
  const cuerpo = html`<main id="contenido">
  <p id="estado-perfil" role="status" aria-live="polite"></p>
  <article id="perfil" aria-labelledby="perfil-nombre">
    <h1 id="perfil-nombre">${perfil.nombre}</h1>
    <nav aria-label="Secciones del perfil">
      <ul>
        <li><a href="#contacto">Contacto</a></li>
        <li><a href="#ofertas">Ofertas</a></li>
        <li><a href="#portafolio">Portafolio</a></li>
        <li><a href="#localidad">Localidad</a></li>
      </ul>
    </nav>

    <section id="contacto" aria-labelledby="contacto-titulo">
      <h2 id="contacto-titulo">Contacto</h2>
      <p><a href="${contactoHref(c.tipo, c.valor)}" aria-describedby="contacto-dato"${new Html(externo)}>Contactar<span class="oculto"> a ${perfil.nombre} ${contactoMedio(c.tipo)}</span></a></p>
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

    <section id="ofertas" aria-labelledby="ofertas-titulo">
      <h2 id="ofertas-titulo">Ofertas</h2>
      ${
        perfil.ofertas.length
          ? html`<ul>
        ${perfil.ofertas.map(
          (o) => html`<li><h3>${o.titulo}</h3><p>${ETIQUETA_OFERTA[o.tipo]} · ${o.tag}</p></li>`,
        )}
      </ul>`
          : html`<p>Este perfil aún no publica ofertas.</p>`
      }
    </section>

    <section id="portafolio" aria-labelledby="portafolio-titulo">
      <h2 id="portafolio-titulo">Portafolio</h2>
      ${
        perfil.imagenes.length
          ? html`<ul>
        ${perfil.imagenes.map(
          (i) =>
            html`<li><img src="${urlImagen(i.archivo)}" alt="${i.alt}" width="${i.ancho}" height="${i.alto}" loading="lazy"></li>`,
        )}
      </ul>`
          : html`<p>Este perfil aún no tiene imágenes de su trabajo.</p>`
      }
    </section>

    <section id="localidad" aria-labelledby="localidad-titulo">
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

    <p><a href="/index.html">Buscar otro oficio</a></p>
  </article>
</main>`;
  return documento({
    titulo: `${perfil.nombre} — trabajamos.com`,
    descripcion,
    cabecera: cabeceraPublica(),
    cuerpo,
    pie: piePublico(),
    estilos: perfil.punto ? ["/vendor/leaflet/leaflet.css"] : [],
    scripts: perfil.punto ? ["/vendor/leaflet/leaflet.js", "/assets/mapa.js", "/assets/perfil.js"] : [],
  });
}

export function vistaPerfilNoDisponible(): Html {
  return documento({
    titulo: "Perfil no disponible — trabajamos.com",
    noindex: true,
    cabecera: cabeceraPublica(),
    cuerpo: html`<main id="contenido">
  <h1>Perfil no disponible</h1>
  <p><a href="/index.html">Buscar otro oficio</a></p>
</main>`,
    pie: piePublico(),
  });
}
