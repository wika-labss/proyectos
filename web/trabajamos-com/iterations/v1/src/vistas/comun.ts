import { Html, html } from "../lib/html.js";

export interface ErrorCampo {
  campo: string;
  texto: string;
}

export interface EnlaceMenu {
  href: string;
  texto: string;
  actual?: boolean;
  meta?: string;
}

/** Banner grande + menú hamburguesa que abre un cajón desde la derecha (funciona sin JS). */
export function cabeceraBanner(opciones: {
  lema: string;
  meta?: string;
  enlaces: EnlaceMenu[];
  extra?: Html;
}): Html {
  return html`<header class="banner">
  <div class="banner-franja" aria-hidden="true"><span>REV 1.0</span><span>CL / LOCAL</span><span>OFICIOS</span></div>
  <div class="banner-cuerpo">
    <div class="banner-marca">
      <p class="banner-kicker">PORTAL DE OFICIOS CERCANOS</p>
      <a class="marca" href="/index.html">trabajamos.com</a>
      <p class="banner-lema">${opciones.lema}</p>
      ${opciones.meta ? html`<p class="banner-meta">${opciones.meta}</p>` : ""}
    </div>
    <input type="checkbox" id="menu-toggle" class="menu-toggle">
    <label for="menu-toggle" class="menu-boton" aria-controls="menu-cajon">
      <span class="menu-boton-lineas" aria-hidden="true"></span>
      <span class="menu-boton-texto">Menú</span>
    </label>
    <label for="menu-toggle" class="menu-fondo" aria-hidden="true"></label>
    <aside id="menu-cajon" class="menu-cajon" aria-label="Menú principal">
      <div class="menu-cajon-cabeza">
        <p class="menu-cajon-titulo">[ MENÚ ]</p>
        <label for="menu-toggle" class="menu-cerrar">Cerrar</label>
      </div>
      <nav aria-label="Principal">
        <ul>
          ${opciones.enlaces.map(
            (e) => html`<li><a href="${e.href}"${e.actual ? html` aria-current="page"` : ""}>${e.texto}${
              e.meta ? html`<span class="menu-meta"> · ${e.meta}</span>` : ""
            }</a></li>`,
          )}
        </ul>
      </nav>
      ${opciones.extra ?? ""}
    </aside>
  </div>
  <div class="banner-barra" aria-hidden="true"></div>
</header>`;
}

export function documento(opciones: {
  titulo: string;
  descripcion?: string;
  noindex?: boolean;
  cabecera: Html;
  cuerpo: Html;
  pie: Html;
  estilos?: string[];
  scripts?: string[];
}): Html {
  return html`<!doctype html>
<html lang="es-CL">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${opciones.titulo}</title>
${opciones.descripcion ? html`<meta name="description" content="${opciones.descripcion}">` : ""}
${opciones.noindex ? html`<meta name="robots" content="noindex">` : ""}
<link rel="stylesheet" href="/assets/app.css">
${(opciones.estilos ?? []).map((href) => html`<link rel="stylesheet" href="${href}">`)}
</head>
<body>
<a href="#contenido">Saltar al contenido</a>
${opciones.cabecera}
${opciones.cuerpo}
${opciones.pie}
${(opciones.scripts ?? []).map((src) => html`<script src="${src}" defer></script>`)}
<script src="/assets/nav.js" defer></script>
</body>
</html>`;
}

export function resumenErrores(formId: string, errores: ErrorCampo[], extra?: Html): Html {
  if (!errores.length && !extra) return html``;
  const n = errores.length;
  const titulo = n === 1 ? "Hay 1 dato por corregir" : `Hay ${n} datos por corregir`;
  return html`<div id="${formId}-errores" role="alert" tabindex="-1" data-foco aria-labelledby="${formId}-errores-titulo">
  <h2 id="${formId}-errores-titulo">${extra && !n ? "No se guardó ningún cambio" : titulo}</h2>
  ${extra ?? ""}
  ${n ? html`<ul>${errores.map((e) => html`<li><a href="#${e.campo}">${e.texto}</a></li>`)}</ul>` : ""}
</div>`;
}

export function errorDe(errores: ErrorCampo[], campo: string): string | undefined {
  return errores.find((e) => e.campo === campo)?.texto;
}

export function textoError(campo: string, texto: string | undefined): Html {
  return texto ? html`<p id="${campo}-error" class="error">Error: ${texto}</p>` : html``;
}

export function describedBy(...ids: (string | false | undefined)[]): string {
  return ids.filter(Boolean).join(" ");
}

export function campoOcultoCsrf(token: string): Html {
  return html`<input type="hidden" name="_csrf" value="${token}">`;
}

export function regionEstado(id: string, texto?: string): Html {
  return html`<p id="${id}" role="status" aria-live="polite">${texto ?? ""}</p>`;
}
