import type { Perfil } from "../datos.js";
import { Html, attrSi, html } from "../lib/html.js";
import {
  ETIQUETA_OFERTA,
  OFERTA_TIPOS,
  contactoDato,
  contactoDestino,
  type ContactoTipo,
} from "../lib/reglas.js";
import {
  type ErrorCampo,
  type EnlaceMenu,
  cabeceraBanner,
  campoOcultoCsrf,
  describedBy,
  documento,
  errorDe,
  regionEstado,
  resumenErrores,
  textoError,
} from "./comun.js";

export type SeccionPanel = "perfil" | "ofertas" | "portafolio" | "localidad";

function tituloPanel(vista: string, conError: boolean): string {
  return `${conError ? "Error: " : ""}${vista} — Panel — trabajamos.com`;
}

function piePanel(): Html {
  return html`<footer><a href="/index.html">Volver al inicio de trabajamos.com</a></footer>`;
}

function cuenta(n: number, singular: string, plural: string): string {
  return n === 1 ? `1 ${singular}` : `${n} ${plural}`;
}

function enlacesPanel(perfil: Perfil | null, actual: SeccionPanel): EnlaceMenu[] {
  if (!perfil) {
    return [
      { href: "/panel/perfil.html", texto: "Crear perfil", meta: "sin crear", actual: actual === "perfil" },
      { href: "/panel/perfil.html", texto: "Ofertas", meta: "después del perfil" },
      { href: "/panel/perfil.html", texto: "Portafolio", meta: "después del perfil" },
      { href: "/panel/perfil.html", texto: "Localidad", meta: "después del perfil" },
    ];
  }
  return [
    {
      href: "/panel/perfil.html",
      texto: "Editar perfil",
      meta: "publicado",
      actual: actual === "perfil",
    },
    {
      href: "/panel/ofertas.html",
      texto: "Ofertas",
      meta: perfil.ofertas.length ? cuenta(perfil.ofertas.length, "oferta", "ofertas") : "sin ofertas",
      actual: actual === "ofertas",
    },
    {
      href: "/panel/portafolio.html",
      texto: "Portafolio",
      meta: perfil.imagenes.length ? cuenta(perfil.imagenes.length, "imagen", "imágenes") : "sin imágenes",
      actual: actual === "portafolio",
    },
    {
      href: "/panel/localidad.html",
      texto: "Localidad",
      meta: perfil.punto ? "marcada" : "sin confirmar",
      actual: actual === "localidad",
    },
  ];
}

function avisoLocalidad(perfil: Perfil | null, actual: SeccionPanel): Html {
  if (!perfil || perfil.punto || !perfil.ofertas.length || actual === "localidad") return html``;
  return html`<p role="note">Tus ofertas no aparecen como oficios cercanos porque no has marcado tu localidad. <a href="/panel/localidad.html">Marcar localidad</a></p>`;
}

function cabeceraAuth(lema: string): Html {
  return cabeceraBanner({
    lema,
    meta: "Panel · acceso",
    enlaces: [
      { href: "/panel/crear-cuenta.html", texto: "Crear cuenta" },
      { href: "/panel/entrar.html", texto: "Entrar" },
      { href: "/index.html", texto: "Buscar oficios" },
    ],
  });
}

function marco(opciones: {
  vista: string;
  conError: boolean;
  perfil: Perfil | null;
  actual: SeccionPanel;
  csrf: string;
  main: Html;
  estilos?: string[];
  scripts?: string[];
}): Html {
  const { perfil } = opciones;
  const extra = html`${
    perfil
      ? html`<p class="menu-accion"><a href="/perfil.html?slug=${encodeURIComponent(perfil.slug)}">Ver mi perfil público</a></p>`
      : ""
  }
  <form method="post" action="/panel/salir" class="menu-salir">${campoOcultoCsrf(opciones.csrf)}<button type="submit">Salir</button></form>`;
  const cabecera = html`${cabeceraBanner({
    lema: perfil ? `Panel de ${perfil.nombre}` : "Panel del emprendedor",
    meta: perfil ? `Slug · ${perfil.slug}` : "Sin perfil",
    enlaces: enlacesPanel(perfil, opciones.actual),
    extra,
  })}
  ${avisoLocalidad(perfil, opciones.actual)}`;
  return documento({
    titulo: tituloPanel(opciones.vista, opciones.conError),
    cabecera,
    cuerpo: html`<main id="contenido">${opciones.main}</main>`,
    pie: piePanel(),
    estilos: opciones.estilos,
    scripts: ["/assets/panel.js", ...(opciones.scripts ?? [])],
  });
}

function primeroCreaPerfil(): Html {
  return html`<p>Primero crea tu perfil. <a href="/panel/perfil.html">Crear perfil</a></p>`;
}

// VIEW-10
export function vistaEntrar(opciones: {
  csrf: string;
  correo: string;
  volver: string | null;
  sesionTerminada: boolean;
  error: string | null;
}): Html {
  const accion = opciones.volver ? `/panel/entrar.html?volver=${encodeURIComponent(opciones.volver)}` : "/panel/entrar.html";
  const cuerpo = html`<main id="contenido">
  <h1>Entrar a tu panel</h1>
  <p>Entra para crear o editar tu perfil, tus ofertas, tus imágenes y tu localidad.</p>
  ${opciones.sesionTerminada ? html`<div role="status">Tu sesión terminó. Entra de nuevo para seguir editando.</div>` : ""}
  <form id="form-entrar" method="post" action="${accion}" novalidate>
    ${campoOcultoCsrf(opciones.csrf)}
    ${
      opciones.error
        ? html`<div id="form-entrar-errores" role="alert" tabindex="-1" data-foco><p>${opciones.error}</p></div>`
        : ""
    }
    <label for="correo">Correo (obligatorio)</label>
    <input id="correo" name="correo" type="email" required autocomplete="username" value="${opciones.correo}">
    <label for="contrasena">Contraseña (obligatorio)</label>
    <input id="contrasena" name="contrasena" type="password" required autocomplete="current-password">
    <button type="submit">Entrar</button>
    ${regionEstado("form-entrar-estado")}
  </form>
  <p>¿Primera vez? <a href="/panel/crear-cuenta.html">Crea tu cuenta</a> y luego tu perfil.</p>
</main>`;
  return documento({
    titulo: tituloPanel("Entrar", Boolean(opciones.error)),
    cabecera: cabeceraAuth("Entra para editar tu perfil y tus ofertas."),
    cuerpo,
    pie: piePanel(),
    scripts: ["/assets/panel.js"],
  });
}

// VIEW-18
export function vistaCrearCuenta(opciones: {
  csrf: string;
  correo: string;
  errores: ErrorCampo[];
  duplicado: boolean;
}): Html {
  const { errores } = opciones;
  const campo = (id: string, extraAyuda?: string) => {
    const err = errorDe(errores, id);
    return html`${attrSi(Boolean(err), 'aria-invalid="true"')} aria-describedby="${describedBy(extraAyuda, err && `${id}-error`)}"`;
  };
  const cuerpo = html`<main id="contenido">
  <h1>Crear tu cuenta</h1>
  <p>Con tu cuenta creas y editas tu perfil. Los clientes no necesitan cuenta.</p>
  <form id="form-cuenta" method="post" action="/panel/crear-cuenta.html" novalidate>
    ${campoOcultoCsrf(opciones.csrf)}
    ${resumenErrores(
      "form-cuenta",
      errores,
      opciones.duplicado ? html`<p>Ya existe una cuenta con ese correo. <a href="/panel/entrar.html">Entrar</a></p>` : undefined,
    )}
    <label for="correo">Correo (obligatorio)</label>
    <input id="correo" name="correo" type="email" required autocomplete="email" value="${opciones.correo}"${campo("correo")}>
    ${textoError("correo", errorDe(errores, "correo"))}
    <label for="contrasena">Contraseña (obligatorio)</label>
    <input id="contrasena" name="contrasena" type="password" required minlength="8" autocomplete="new-password"${campo("contrasena", "contrasena-ayuda")}>
    <p id="contrasena-ayuda">Al menos 8 caracteres.</p>
    ${textoError("contrasena", errorDe(errores, "contrasena"))}
    <label for="contrasena2">Repite la contraseña (obligatorio)</label>
    <input id="contrasena2" name="contrasena2" type="password" required autocomplete="new-password"${campo("contrasena2")}>
    ${textoError("contrasena2", errorDe(errores, "contrasena2"))}
    <button type="submit">Crear cuenta</button>
    ${regionEstado("form-cuenta-estado")}
  </form>
  <p>¿Ya tienes cuenta? <a href="/panel/entrar.html">Entrar</a></p>
</main>`;
  return documento({
    titulo: tituloPanel("Crear cuenta", errores.length > 0 || opciones.duplicado),
    cabecera: cabeceraAuth("Crea tu cuenta. Los clientes no necesitan una."),
    cuerpo,
    pie: piePanel(),
    scripts: ["/assets/panel.js"],
  });
}

export function vistaSesionTerminada(volver: string): Html {
  return documento({
    titulo: tituloPanel("Sesión terminada", true),
    cabecera: cabeceraAuth("Tu sesión terminó."),
    cuerpo: html`<main id="contenido">
  <h1>Tu sesión terminó</h1>
  <div role="alert" tabindex="-1" data-foco>
    <p>Tu sesión terminó. No se guardó ningún cambio.</p>
    <p><a href="/panel/entrar.html?volver=${encodeURIComponent(volver)}&amp;motivo=sesion">Entrar de nuevo</a></p>
  </div>
</main>`,
    pie: piePanel(),
    scripts: ["/assets/panel.js"],
  });
}

export function vistaSolicitudInvalida(): Html {
  return documento({
    titulo: tituloPanel("Solicitud no válida", true),
    cabecera: cabeceraAuth("Solicitud no válida."),
    cuerpo: html`<main id="contenido">
  <h1>No pudimos procesar el formulario</h1>
  <p>El formulario venció o llegó incompleto. No se guardó ningún cambio. Vuelve a la página e intenta de nuevo.</p>
  <p><a href="/panel/perfil.html">Volver al panel</a></p>
</main>`,
    pie: piePanel(),
  });
}

export interface FormDatos {
  nombre: string;
  tipo: ContactoTipo | "";
  valor: string;
}

export interface FilaRed {
  id: string | null;
  nombre: string;
  url: string;
  error?: { campo: "nombre" | "url"; texto: string };
  vigente?: string;
}

export interface EstadoPerfilPanel {
  csrf: string;
  perfil: Perfil | null;
  datos: FormDatos;
  erroresDatos: ErrorCampo[];
  vigenteNombre: string | null;
  vigenteContacto: string | null;
  estadoDatos: string;
  redes: FilaRed[];
  erroresRedes: ErrorCampo[];
  estadoRedes: string;
}

const AYUDA_CONTACTO: Record<ContactoTipo, string> = {
  telefono: "Incluye el código de país, por ejemplo +56 9 1234 5678.",
  correo: "Ejemplo: nombre@dominio.cl",
  url: "Debe empezar con https://",
};

const ETIQUETA_CONTACTO: Record<ContactoTipo, string> = {
  telefono: "Teléfono",
  correo: "Correo",
  url: "Enlace web",
};

function seccionPublicacion(perfil: Perfil): Html {
  const c = perfil.contacto;
  return html`<section id="publicacion" aria-labelledby="publicacion-titulo">
  <h2 id="publicacion-titulo">Tu perfil público</h2>
  <ul>
    <li>Nombre: ${perfil.nombre}</li>
    <li>Contactar: abre ${contactoDestino(c.tipo, c.valor)}. En tu perfil se ve: ${contactoDato(c.tipo, c.valor)}</li>
    <li>Redes: ${perfil.redes.length ? String(perfil.redes.length) : "ninguna"}</li>
    <li>${
      perfil.ofertas.length
        ? `Ofertas: ${perfil.ofertas.length}`
        : html`Ofertas: ninguna. Sin ofertas, la barra de búsqueda no te encuentra. <a href="/panel/ofertas.html">Agregar oferta</a>`
    }</li>
    <li>Portafolio: ${perfil.imagenes.length ? cuenta(perfil.imagenes.length, "imagen", "imágenes") : "sin imágenes"}</li>
    <li>${
      perfil.punto
        ? `Localidad: ${perfil.punto.etiqueta}`
        : html`Localidad: sin confirmar. Tus ofertas no aparecen como oficios cercanos. <a href="/panel/localidad.html">Marcar localidad</a>`
    }</li>
  </ul>
  <p><a href="/perfil.html?slug=${encodeURIComponent(perfil.slug)}">Ver mi perfil público</a></p>
</section>`;
}

function formularioDatos(e: EstadoPerfilPanel): Html {
  const err = (c: string) => errorDe(e.erroresDatos, c);
  const tipo = e.datos.tipo;
  const etiquetaValor = tipo ? `${ETIQUETA_CONTACTO[tipo]} (obligatorio)` : "Teléfono, correo o enlace web (obligatorio)";
  const tipoInput = tipo === "telefono" ? "tel" : tipo === "correo" ? "email" : tipo === "url" ? "url" : "text";
  const autocomplete = tipo === "telefono" ? "tel" : tipo === "correo" ? "email" : "off";
  const destino =
    tipo && e.datos.valor
      ? `El botón Contactar abrirá ${contactoDestino(tipo, e.datos.valor)}. En tu perfil se verá: ${contactoDato(tipo, e.datos.valor)}`
      : "Elige un medio y escribe el dato.";
  return html`<section id="datos" aria-labelledby="datos-titulo">
  <h2 id="datos-titulo">Nombre y contacto</h2>
  <form id="form-datos" method="post" action="/panel/perfil.html" novalidate>
    ${campoOcultoCsrf(e.csrf)}
    <input type="hidden" name="form" value="datos">
    ${resumenErrores("form-datos", e.erroresDatos)}
    <label for="nombre">Nombre visible (obligatorio)</label>
    <input id="nombre" name="nombre" type="text" required autocomplete="name" maxlength="120" value="${e.datos.nombre}"
           aria-describedby="${describedBy("nombre-ayuda", err("nombre") && "nombre-error", e.vigenteNombre !== null && "nombre-vigente")}"${attrSi(Boolean(err("nombre")), 'aria-invalid="true"')}>
    <p id="nombre-ayuda">Es el nombre que verán los clientes. Puede ser tu nombre o el de tu emprendimiento.</p>
    ${textoError("nombre", err("nombre"))}
    ${e.vigenteNombre !== null ? html`<p id="nombre-vigente">Sigue publicado: ${e.vigenteNombre}</p>` : ""}

    <fieldset aria-describedby="contacto-ayuda">
      <legend>Contacto (obligatorio)</legend>
      <p id="contacto-ayuda">Es lo que abre el botón Contactar de tu perfil público y el dato que se ve a su lado. Elige un solo medio. Sin contacto no se puede crear el perfil.</p>
      <fieldset id="contacto-tipo" aria-describedby="${describedBy(err("contacto-tipo") && "contacto-tipo-error")}">
        <legend>Medio de contacto (obligatorio)</legend>
        ${textoError("contacto-tipo", err("contacto-tipo"))}
        ${(["telefono", "correo", "url"] as const).map(
          (t, i) => html`<input type="radio" id="contacto-tipo-${t}" name="contacto[tipo]" value="${t}" required${attrSi(tipo === t, "checked")}${attrSi(i === 0, 'data-primero')}>
        <label for="contacto-tipo-${t}">${ETIQUETA_CONTACTO[t]}</label>`,
        )}
      </fieldset>
      <label for="contacto-valor" id="contacto-valor-etiqueta">${etiquetaValor}</label>
      <input id="contacto-valor" name="contacto[valor]" type="${tipoInput}" required autocomplete="${autocomplete}" value="${e.datos.valor}"
             aria-describedby="${describedBy("contacto-valor-ayuda", "contacto-destino", err("contacto-valor") && "contacto-valor-error", e.vigenteContacto !== null && "contacto-vigente")}"${attrSi(Boolean(err("contacto-valor")), 'aria-invalid="true"')}>
      <p id="contacto-valor-ayuda" data-ayudas='${JSON.stringify(AYUDA_CONTACTO)}'>${tipo ? AYUDA_CONTACTO[tipo] : "Teléfono con código de país (+56 9 …), correo o enlace que empiece con https://"}</p>
      ${textoError("contacto-valor", err("contacto-valor"))}
      ${e.vigenteContacto !== null ? html`<p id="contacto-vigente">Sigue publicado: ${e.vigenteContacto}</p>` : ""}
      <p id="contacto-destino">${destino}</p>
    </fieldset>

    <button type="submit">${e.perfil ? "Guardar perfil" : "Crear perfil"}</button>
    ${regionEstado("form-datos-estado", e.estadoDatos)}
    ${e.perfil ? html`<p><a href="#redes">Siguiente: Redes sociales</a></p>` : ""}
  </form>
</section>`;
}

function formularioRedes(e: EstadoPerfilPanel): Html {
  if (!e.perfil) {
    return html`<section id="redes" aria-labelledby="redes-titulo">
  <h2 id="redes-titulo">Redes sociales</h2>
  ${primeroCreaPerfil()}
</section>`;
  }
  const filas = e.redes.length ? e.redes : [{ id: null, nombre: "", url: "" } as FilaRed];
  return html`<section id="redes" aria-labelledby="redes-titulo">
  <h2 id="redes-titulo">Redes sociales</h2>
  <p>Cada red aparece en tu perfil como un enlace con su nombre.</p>
  ${!e.perfil.redes.length && !e.erroresRedes.length ? html`<p>Aún no agregas redes.</p>` : ""}
  <form id="form-redes" method="post" action="/panel/perfil.html#redes" novalidate>
    ${campoOcultoCsrf(e.csrf)}
    <input type="hidden" name="form" value="redes">
    ${resumenErrores("form-redes", e.erroresRedes)}
    <ol id="lista-redes">
      ${filas.map((fila, n) => {
        const errNombre = fila.error?.campo === "nombre" ? fila.error.texto : undefined;
        const errUrl = fila.error?.campo === "url" ? fila.error.texto : undefined;
        const vigenteId = fila.vigente ? `red-${n}-vigente` : undefined;
        return html`<li><fieldset>
        <legend>Red ${n + 1}</legend>
        ${fila.id ? html`<input type="hidden" name="redes[${n}][id]" value="${fila.id}">` : ""}
        <label for="red-${n}-nombre">Nombre de la red</label>
        <input id="red-${n}-nombre" name="redes[${n}][nombre]" type="text" maxlength="60" value="${fila.nombre}"
               aria-describedby="${describedBy(`red-${n}-nombre-ayuda`, errNombre && `red-${n}-nombre-error`, vigenteId)}"${attrSi(Boolean(errNombre), 'aria-invalid="true"')}>
        <p id="red-${n}-nombre-ayuda">Por ejemplo: Instagram</p>
        ${textoError(`red-${n}-nombre`, errNombre)}
        <label for="red-${n}-url">Dirección de la red</label>
        <input id="red-${n}-url" name="redes[${n}][url]" type="url" inputmode="url" value="${fila.url}"
               aria-describedby="${describedBy(`red-${n}-url-ayuda`, errUrl && `red-${n}-url-error`, vigenteId)}"${attrSi(Boolean(errUrl), 'aria-invalid="true"')}>
        <p id="red-${n}-url-ayuda">Copia la dirección completa; empieza con https://</p>
        ${textoError(`red-${n}-url`, errUrl)}
        ${fila.vigente ? html`<p id="${vigenteId}">${fila.vigente}</p>` : ""}
        ${
          fila.id
            ? html`<button type="submit" name="quitar" value="${fila.id}">Quitar<span class="oculto"> red: ${fila.nombre}</span></button>`
            : html`<button type="button" data-quitar-fila>Quitar<span class="oculto"> red ${n + 1}</span></button>`
        }
      </fieldset></li>`;
      })}
    </ol>
    <button type="button" id="agregar-red" hidden>Agregar red</button>
    <button type="submit">Guardar redes</button>
    ${regionEstado("form-redes-estado", e.estadoRedes)}
    <p><a href="/panel/ofertas.html">Siguiente: Ofertas</a></p>
  </form>
</section>`;
}

// VIEW-11 + VIEW-17 + VIEW-12 + VIEW-13
export function vistaPerfilPanel(e: EstadoPerfilPanel): Html {
  const conError = e.erroresDatos.length > 0 || e.erroresRedes.length > 0;
  const titulo = e.perfil ? "Editar perfil" : "Crear perfil";
  return marco({
    vista: titulo,
    conError,
    perfil: e.perfil,
    actual: "perfil",
    csrf: e.csrf,
    main: html`<h1>${titulo}</h1>
    ${e.perfil ? seccionPublicacion(e.perfil) : ""}
    ${formularioDatos(e)}
    ${formularioRedes(e)}`,
  });
}

export interface EstadoOfertas {
  csrf: string;
  perfil: Perfil | null;
  form: { tipo: string; titulo: string; tag: string };
  vistaPrevia: string;
  errores: ErrorCampo[];
  estado: string;
}

// VIEW-14
export function vistaOfertas(e: EstadoOfertas): Html {
  const err = (c: string) => errorDe(e.errores, c);
  let contenido: Html;
  if (!e.perfil) {
    contenido = primeroCreaPerfil();
  } else {
    contenido = html`<section aria-labelledby="mis-ofertas">
    <h2 id="mis-ofertas">Mis ofertas</h2>
    ${
      e.perfil.ofertas.length
        ? html`<ul>${e.perfil.ofertas.map(
            (o) => html`<li><article aria-labelledby="oferta-${o.id}-titulo">
        <h3 id="oferta-${o.id}-titulo">${o.titulo}</h3>
        <p>Tipo: ${ETIQUETA_OFERTA[o.tipo]}</p>
        <p>Etiqueta: ${o.tag}</p>
        <form method="post" action="/panel/ofertas.html">${campoOcultoCsrf(e.csrf)}<button type="submit" name="quitar" value="${o.id}">Quitar<span class="oculto"> oferta: ${o.titulo}</span></button></form>
      </article></li>`,
          )}</ul>`
        : html`<p>Aún no tienes ofertas. Sin ofertas, la barra de búsqueda no te encuentra.</p>`
    }
  </section>
  <section aria-labelledby="nueva-oferta">
    <h2 id="nueva-oferta">Agregar oferta</h2>
    <form id="form-oferta" method="post" action="/panel/ofertas.html" novalidate>
      ${campoOcultoCsrf(e.csrf)}
      ${resumenErrores("form-oferta", e.errores)}
      <fieldset id="tipo" aria-describedby="${describedBy(err("tipo") && "tipo-error")}">
        <legend>Tipo de oferta (obligatorio)</legend>
        ${textoError("tipo", err("tipo"))}
        ${OFERTA_TIPOS.map(
          (t) => html`<input type="radio" id="tipo-${t}" name="tipo" value="${t}" required${attrSi(e.form.tipo === t, "checked")}>
        <label for="tipo-${t}">${ETIQUETA_OFERTA[t]}</label>`,
        )}
      </fieldset>
      <label for="titulo">Título (obligatorio)</label>
      <input id="titulo" name="titulo" type="text" required maxlength="120" value="${e.form.titulo}"
             aria-describedby="${describedBy("titulo-ayuda", err("titulo") && "titulo-error")}"${attrSi(Boolean(err("titulo")), 'aria-invalid="true"')}>
      <p id="titulo-ayuda">Por ejemplo: Reparación de cañerías</p>
      ${textoError("titulo", err("titulo"))}
      <label for="tag">Etiqueta de oficio, # (obligatorio)</label>
      <input id="tag" name="tag" type="text" required autocapitalize="none" spellcheck="false" maxlength="80" value="${e.form.tag}"
             aria-describedby="${describedBy("tag-ayuda", "tag-vista-previa", err("tag") && "tag-error")}"${attrSi(Boolean(err("tag")), 'aria-invalid="true"')}>
      <p id="tag-ayuda">Escribe el oficio, con o sin #. Se guarda en minúsculas, con # al inicio y sin espacios sobrantes. Las tildes cuentan: #gásfiter y #gasfiter son oficios distintos.</p>
      <p>Se guardará como: <output id="tag-vista-previa" for="tag" aria-live="polite">${e.vistaPrevia}</output></p>
      ${textoError("tag", err("tag"))}
      <button type="submit">Agregar oferta</button>
      ${regionEstado("form-oferta-estado", e.estado)}
    </form>
    <p><a href="/panel/portafolio.html">Siguiente: Portafolio</a></p>
  </section>`;
  }
  return marco({
    vista: "Ofertas",
    conError: e.errores.length > 0,
    perfil: e.perfil,
    actual: "ofertas",
    csrf: e.csrf,
    main: html`<h1>Ofertas</h1>
    <p>Publica proyectos, servicios u oficios. El # es lo que los clientes buscan en la barra.</p>
    ${e.perfil && !e.perfil.punto ? html`<p role="note">Tus ofertas no aparecen como oficios cercanos porque no has marcado tu localidad. <a href="/panel/localidad.html">Marcar localidad</a></p>` : ""}
    ${contenido}`,
  });
}

export interface EstadoPortafolio {
  csrf: string;
  perfil: Perfil | null;
  alt: string;
  errores: ErrorCampo[];
  estado: string;
  urlImagen: (archivo: string) => string;
}

// VIEW-15
export function vistaPortafolio(e: EstadoPortafolio): Html {
  const err = (c: string) => errorDe(e.errores, c);
  const contenido = !e.perfil
    ? primeroCreaPerfil()
    : html`<section aria-labelledby="mis-imagenes">
    <h2 id="mis-imagenes">Mis imágenes</h2>
    ${
      e.perfil.imagenes.length
        ? html`<ul>${e.perfil.imagenes.map(
            (i) => html`<li><figure>
        <img src="${e.urlImagen(i.archivo)}" alt="${i.alt}" width="${i.ancho}" height="${i.alto}" loading="lazy">
        <figcaption>Texto alternativo: ${i.alt}</figcaption>
      </figure>
      <form method="post" action="/panel/portafolio.html">${campoOcultoCsrf(e.csrf)}<button type="submit" name="quitar" value="${i.id}">Quitar<span class="oculto"> imagen: ${i.alt}</span></button></form></li>`,
          )}</ul>`
        : html`<p>Aún no hay imágenes en tu portafolio.</p>`
    }
  </section>
  <section aria-labelledby="nueva-imagen">
    <h2 id="nueva-imagen">Subir imagen</h2>
    <form id="form-imagen" method="post" action="/panel/portafolio.html" enctype="multipart/form-data" novalidate>
      ${campoOcultoCsrf(e.csrf)}
      ${resumenErrores("form-imagen", e.errores)}
      <label for="imagen">Imagen del trabajo (obligatorio)</label>
      <input id="imagen" name="imagen" type="file" accept="image/jpeg,image/png,image/webp" required
             aria-describedby="${describedBy("imagen-ayuda", err("imagen") && "imagen-error")}"${attrSi(Boolean(err("imagen")), 'aria-invalid="true"')}>
      <p id="imagen-ayuda">Formatos JPEG, PNG o WebP, hasta 5 MB. Al guardarla quitamos los datos de ubicación de la foto.</p>
      ${textoError("imagen", err("imagen"))}
      <label for="alt">Descripción de la imagen (obligatorio)</label>
      <textarea id="alt" name="alt" required rows="2" maxlength="300"
                aria-describedby="${describedBy("alt-ayuda", err("alt") && "alt-error")}"${attrSi(Boolean(err("alt")), 'aria-invalid="true"')}>${e.alt}</textarea>
      <p id="alt-ayuda">Describe lo que se ve, por ejemplo: Baño con cerámica nueva instalada.</p>
      ${textoError("alt", err("alt"))}
      <button type="submit">Subir imagen</button>
      ${regionEstado("form-imagen-estado", e.estado)}
      <progress id="imagen-progreso" max="100" value="0" aria-label="Progreso de la carga" hidden></progress>
    </form>
    <p><a href="/panel/localidad.html">Siguiente: Localidad</a></p>
  </section>`;
  return marco({
    vista: "Portafolio",
    conError: e.errores.length > 0,
    perfil: e.perfil,
    actual: "portafolio",
    csrf: e.csrf,
    main: html`<h1>Portafolio</h1>
    <p>Sube fotos de trabajos que hiciste. Cada imagen necesita una descripción para quien no puede verla.</p>
    ${contenido}`,
  });
}

export interface ResultadoLocalidad {
  lat: number;
  lng: number;
  etiqueta: string;
}

export interface EstadoLocalidad {
  csrf: string;
  perfil: Perfil | null;
  texto: string;
  resultados: ResultadoLocalidad[] | null;
  elegido: string;
  lat: string;
  lng: string;
  etiqueta: string;
  errores: ErrorCampo[];
  estado: string;
}

export function valorResultado(r: ResultadoLocalidad): string {
  return `${r.lat}|${r.lng}|${r.etiqueta}`;
}

// VIEW-16
export function vistaLocalidad(e: EstadoLocalidad): Html {
  const err = (c: string) => errorDe(e.errores, c);
  const perfil = e.perfil;
  const contenido = !perfil
    ? primeroCreaPerfil()
    : html`<section aria-labelledby="localidad-actual">
    <h2 id="localidad-actual">Localidad publicada</h2>
    ${
      perfil.punto
        ? html`<p>Localidad marcada: ${perfil.punto.etiqueta}</p>`
        : html`<p role="note">Sin localidad confirmada. Tus ofertas no aparecen como oficios cercanos hasta que marques tu localidad.</p>`
    }
  </section>
  <section aria-labelledby="cambiar-localidad">
    <h2 id="cambiar-localidad">Marcar localidad</h2>
    <form id="form-localidad" method="post" action="/panel/localidad.html" novalidate aria-describedby="aviso-publico sugerencia-punto">
      ${campoOcultoCsrf(e.csrf)}
      ${resumenErrores("form-localidad", e.errores)}
      <label for="localidad-texto">Escribe tu localidad</label>
      <input id="localidad-texto" name="localidad_texto" type="text" autocomplete="off" value="${e.texto}"
             aria-describedby="${describedBy("localidad-texto-ayuda", err("localidad-texto") && "localidad-texto-error")}"${attrSi(Boolean(err("localidad-texto")), 'aria-invalid="true"')}>
      <p id="localidad-texto-ayuda">Por ejemplo: Maipú, Santiago</p>
      ${textoError("localidad-texto", err("localidad-texto"))}
      <button type="submit" name="accion" value="buscar" id="buscar-localidad">Buscar localidad</button>
      <div id="resultados-localidad">
      ${
        e.resultados && e.resultados.length
          ? html`<fieldset>
        <legend>Elige el resultado correcto</legend>
        ${e.resultados.map(
          (r, i) => html`<input type="radio" id="resultado-${i}" name="resultado" value="${valorResultado(r)}"${attrSi(e.elegido === valorResultado(r), "checked")}>
        <label for="resultado-${i}">${r.etiqueta}</label>`,
        )}
      </fieldset>`
          : ""
      }
      </div>
      <div id="mapa" class="mapa" role="region" aria-label="Mapa para marcar tu localidad"
           data-lat="${perfil.punto?.lat ?? ""}" data-lng="${perfil.punto?.lng ?? ""}"></div>
      <p id="punto-elegido" aria-live="polite">${e.lat && e.lng ? `Punto elegido: ${e.etiqueta || "en el mapa"}. Aún no está guardado.` : "Aún no eliges un punto."}</p>
      <input type="hidden" id="punto-lat" name="punto[lat]" value="${e.lat}">
      <input type="hidden" id="punto-lng" name="punto[lng]" value="${e.lng}">
      <label for="punto-etiqueta">Nombre de la localidad (obligatorio)</label>
      <input id="punto-etiqueta" name="punto[etiqueta]" type="text" required maxlength="160" value="${e.etiqueta}"
             aria-describedby="${describedBy("punto-etiqueta-ayuda", err("punto-etiqueta") && "punto-etiqueta-error")}"${attrSi(Boolean(err("punto-etiqueta")), 'aria-invalid="true"')}>
      <p id="punto-etiqueta-ayuda">Es lo que verán los clientes en tu perfil. Se llena con el resultado que elegiste o con el nombre del punto del mapa, y puedes cambiarlo. Por ejemplo: Maipú, Santiago.</p>
      ${textoError("punto-etiqueta", err("punto-etiqueta"))}
      <button type="submit" name="accion" value="marcar">Marcar localidad</button>
      ${regionEstado("form-localidad-estado", e.estado)}
    </form>
    <p><a href="/panel/perfil.html#publicacion">Siguiente: Revisar mi perfil público</a></p>
  </section>`;
  return marco({
    vista: "Localidad",
    conError: e.errores.length > 0,
    perfil,
    actual: "localidad",
    csrf: e.csrf,
    main: html`<h1>Localidad</h1>
    <p>Marca el lugar desde donde ofreces tu trabajo. Los clientes ven primero las ofertas más cercanas a ellos.</p>
    <p id="aviso-publico">Este punto es público. trabajamos.com no usa ni sigue la ubicación de tu teléfono: solo publica el punto que tú confirmas.</p>
    <p id="sugerencia-punto">Si trabajas desde tu casa, puedes marcar un punto cercano en vez de tu dirección exacta, por ejemplo tu comuna o una esquina cercana.</p>
    ${contenido}`,
    estilos: perfil ? ["/vendor/leaflet/leaflet.css"] : [],
    scripts: perfil ? ["/vendor/leaflet/leaflet.js", "/assets/mapa.js", "/assets/localidad.js"] : [],
  });
}
