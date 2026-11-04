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
    "form-redes": "Guardando redes…",
    "form-oferta": "Guardando oferta…",
    "form-imagen": "Subiendo imagen…",
    "form-foto": "Guardando foto…",
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
    if (region && TEXTOS_EN_CURSO[form.id]) region.textContent = TEXTOS_EN_CURSO[form.id];
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

  // VIEW-12: etiqueta, tipo y ayuda del contacto según el medio elegido (D-03).
  const valor = document.getElementById("contacto-valor");
  const ayuda = document.getElementById("contacto-valor-ayuda");
  const etiquetaValor = document.getElementById("contacto-valor-etiqueta");
  const destino = document.getElementById("contacto-destino");
  if (valor && ayuda && etiquetaValor && destino) {
    const ayudas = JSON.parse(ayuda.dataset.ayudas || "{}");
    const MEDIOS = {
      telefono: { etiqueta: "Teléfono", type: "tel", autocomplete: "tel" },
      correo: { etiqueta: "Correo", type: "email", autocomplete: "email" },
      url: { etiqueta: "Enlace web", type: "url", autocomplete: "off" },
    };
    const dominio = (v) => {
      try {
        return new URL(v).hostname.replace(/^www\./u, "");
      } catch {
        return v;
      }
    };
    const elegido = () => document.querySelector('input[name="contacto[tipo]"]:checked')?.value;
    const actualizar = () => {
      const tipo = elegido();
      const medio = MEDIOS[tipo];
      if (medio) {
        etiquetaValor.textContent = `${medio.etiqueta} (obligatorio)`;
        valor.type = medio.type;
        valor.autocomplete = medio.autocomplete;
        ayuda.textContent = ayudas[tipo] ?? "";
      }
      const v = valor.value.trim();
      if (!medio || !v) {
        destino.textContent = "Elige un medio y escribe el dato.";
        return;
      }
      const abre =
        tipo === "telefono" ? `una llamada a ${v}` : tipo === "correo" ? `un correo a ${v}` : `el enlace ${v}`;
      const dato = tipo === "telefono" ? `Teléfono: ${v}` : tipo === "correo" ? `Correo: ${v}` : `Sitio: ${dominio(v)}`;
      destino.textContent = `El botón Contactar abrirá ${abre}. En tu perfil se verá: ${dato}`;
    };
    for (const radio of document.querySelectorAll('input[name="contacto[tipo]"]')) {
      radio.addEventListener("change", actualizar);
    }
    valor.addEventListener("blur", actualizar);
    actualizar();
  }

  // VIEW-14: la categoría provisional es obligatoria solo en tipo oficio.
  const categoria = document.getElementById("categoria");
  if (categoria instanceof HTMLSelectElement) {
    const syncCategoria = () => {
      const oficio = document.querySelector('input[name="tipo"]:checked')?.value === "oficio";
      categoria.required = oficio;
      categoria.setAttribute("aria-required", oficio ? "true" : "false");
    };
    for (const radio of document.querySelectorAll('input[name="tipo"]')) {
      radio.addEventListener("change", syncCategoria);
    }
    syncCategoria();
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
