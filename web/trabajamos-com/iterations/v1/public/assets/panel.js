// Mejoras del panel (VIEW-10..18). Todo formulario funciona sin este archivo.
(() => {
  "use strict";

  const foco = document.querySelector("[data-foco]");
  if (foco) foco.focus();

  // Acción en curso: el botón conserva su texto y se anuncia en la región de estado (04 §4.3).
  const TEXTOS_EN_CURSO = {
    "form-entrar": "Verificando…",
    "form-cuenta": "Creando cuenta…",
    "form-datos": "Guardando perfil…",
    "form-registro": "Publicando perfil…",
    "form-redes": "Guardando redes…",
    "form-oferta": "Guardando oferta…",
    "form-imagen": "Subiendo imagen…",
    "form-localidad": "Guardando localidad…",
  };
  document.addEventListener("submit", (evento) => {
    const form = evento.target;
    if (!(form instanceof HTMLFormElement) || evento.defaultPrevented) return;
    if (form.dataset.enviando) {
      evento.preventDefault();
      return;
    }
    form.dataset.enviando = "1";
    const boton = evento.submitter;
    if (boton) boton.setAttribute("aria-disabled", "true");
    const region = document.getElementById(`${form.id}-estado`);
    if (region && form.id === "form-registro" && boton && boton.value === "buscar") {
      region.textContent = "Buscando localidad…";
    } else if (region && TEXTOS_EN_CURSO[form.id]) {
      region.textContent = TEXTOS_EN_CURSO[form.id];
    }
    if (form.id === "form-imagen") {
      const progreso = document.getElementById("imagen-progreso");
      if (progreso) {
        progreso.removeAttribute("value");
        progreso.hidden = false;
      }
    }
  });
  window.addEventListener("pageshow", () => {
    for (const form of document.forms) delete form.dataset.enviando;
    for (const b of document.querySelectorAll('button[aria-disabled="true"]')) b.removeAttribute("aria-disabled");
  });

  // VIEW-14: vista previa del # con la regla única de 04 §3.3.
  function normalizarTag(texto) {
    const sinPrefijo = texto.trim().replace(/^[#\s]+/u, "");
    const compacto = sinPrefijo.replace(/\s+/gu, " ").toLocaleLowerCase("es-CL");
    return compacto ? `#${compacto}` : null;
  }
  const tag = document.getElementById("tag");
  const vistaPrevia = document.getElementById("tag-vista-previa");
  if (tag && vistaPrevia) {
    let espera;
    const actualizar = () => {
      vistaPrevia.textContent = normalizarTag(tag.value) ?? "—";
    };
    tag.addEventListener("input", () => {
      clearTimeout(espera);
      espera = setTimeout(actualizar, 500);
    });
    tag.addEventListener("blur", actualizar);
  }

  // Contactar abre el teléfono. El correo público se anuncia al lado.
  const telefono = document.getElementById("telefono");
  const correoPublico = document.getElementById("correo-publico");
  const destino = document.getElementById("contacto-destino");
  if (telefono && correoPublico && destino) {
    const actualizar = () => {
      const tel = telefono.value.trim();
      const correo = correoPublico.value.trim();
      const llamada = tel ? `una llamada a ${tel}` : "una llamada a tu teléfono";
      const lado = correo ? `Correo: ${correo}` : "el correo público, para copiarlo";
      destino.textContent = `El botón Contactar abrirá ${llamada}. Al lado se verá ${lado}.`;
    };
    telefono.addEventListener("blur", actualizar);
    correoPublico.addEventListener("blur", actualizar);
  }

  // VIEW-13: agregar y quitar filas nuevas de redes.
  const lista = document.getElementById("lista-redes");
  const agregar = document.getElementById("agregar-red");
  const estadoRedes = document.getElementById("form-redes-estado");
  if (lista && agregar) {
    agregar.hidden = false;
    let siguiente = lista.children.length;
    const crear = (tag, attrs, texto) => {
      const el = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      if (texto) el.textContent = texto;
      return el;
    };
    agregar.addEventListener("click", () => {
      const n = siguiente++;
      const visible = lista.children.length + 1;
      const li = document.createElement("li");
      const fs = document.createElement("fieldset");
      fs.append(
        crear("legend", {}, `Red ${visible}`),
        crear("label", { for: `red-${n}-nombre` }, "Nombre de la red"),
        crear("input", {
          id: `red-${n}-nombre`,
          name: `redes[${n}][nombre]`,
          type: "text",
          maxlength: "60",
          "aria-describedby": `red-${n}-nombre-ayuda`,
        }),
        crear("p", { id: `red-${n}-nombre-ayuda` }, "Por ejemplo: Instagram"),
        crear("label", { for: `red-${n}-url` }, "Dirección de la red"),
        crear("input", {
          id: `red-${n}-url`,
          name: `redes[${n}][url]`,
          type: "url",
          inputmode: "url",
          "aria-describedby": `red-${n}-url-ayuda`,
        }),
        crear("p", { id: `red-${n}-url-ayuda` }, "Copia la dirección completa; empieza con https://"),
      );
      const quitar = crear("button", { type: "button", "data-quitar-fila": "" }, "Quitar");
      quitar.append(crear("span", { class: "oculto" }, ` red ${visible}`));
      fs.append(quitar);
      li.append(fs);
      lista.append(li);
      if (estadoRedes) estadoRedes.textContent = `Se agregó la red ${visible}`;
      document.getElementById(`red-${n}-nombre`).focus();
    });
    lista.addEventListener("click", (evento) => {
      const boton = evento.target.closest("[data-quitar-fila]");
      if (!boton) return;
      const li = boton.closest("li");
      const legend = li.querySelector("legend")?.textContent ?? "La red";
      li.remove();
      if (estadoRedes) estadoRedes.textContent = `Se quitó ${legend.toLowerCase()}`;
      agregar.focus();
    });
  }
})();
