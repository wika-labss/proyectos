// VIEW-01..04: mejora progresiva de la búsqueda. Sin este archivo, el formulario GET funciona por localidad escrita.
// Las coordenadas del navegador se envían por POST a /api/buscar y nunca entran en la URL ni se guardan.
(() => {
  "use strict";

  const form = document.getElementById("form-buscar");
  if (!form || !window.fetch) return;

  const q = document.getElementById("q");
  const localidad = document.getElementById("localidad");
  const usarUbicacion = document.getElementById("usar-ubicacion");
  const ubicacionActual = document.getElementById("ubicacion-actual");
  const estado = document.getElementById("estado-busqueda");
  const reintentar = document.getElementById("reintentar");
  const TIEMPO_UBICACION_MS = 10000;

  let coords = null;
  let controlador = null;

  function normalizarTag(texto) {
    const sinPrefijo = texto.trim().replace(/^[#\s]+/u, "");
    const compacto = sinPrefijo.replace(/\s+/gu, " ").toLocaleLowerCase("es-CL");
    return compacto ? `#${compacto}` : null;
  }

  function anunciar(texto) {
    estado.textContent = texto;
  }

  function marcarInvalido(campo, invalido) {
    if (invalido) campo.setAttribute("aria-invalid", "true");
    else campo.removeAttribute("aria-invalid");
  }

  function resultados() {
    return document.getElementById("resultados");
  }

  function pedirUbicacion() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ error: "sin_soporte" });
        return;
      }
      ubicacionActual.textContent = "Esperando permiso de ubicación…";
      anunciar("Esperando tu ubicación…");
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => resolve({ error: err.code === err.PERMISSION_DENIED ? "negado" : "fallo" }),
        { enableHighAccuracy: false, timeout: TIEMPO_UBICACION_MS, maximumAge: 300000 },
      );
    });
  }

  function falloUbicacion(error) {
    coords = null;
    const texto =
      error === "negado"
        ? "No tenemos permiso para usar tu ubicación. Escribe tu localidad para ver oficios cercanos."
        : "No pudimos obtener tu ubicación. Escribe tu localidad para ver oficios cercanos.";
    ubicacionActual.textContent = texto;
    anunciar(texto);
    localidad.focus();
  }

  async function obtenerUbicacion() {
    const r = await pedirUbicacion();
    if (r.error) {
      falloUbicacion(r.error);
      return false;
    }
    coords = { lat: r.lat, lng: r.lng };
    ubicacionActual.textContent = "Ubicación: tu ubicación actual";
    return true;
  }

  function actualizarUrl() {
    const params = new URLSearchParams();
    if (q.value) params.set("q", q.value);
    if (localidad.value.trim()) params.set("localidad", localidad.value.trim());
    const url = `/index.html${params.toString() ? `?${params}` : ""}`;
    if (url !== location.pathname + location.search) history.pushState(null, "", url);
  }

  async function buscar({ yaPidioUbicacion = false } = {}) {
    reintentar.hidden = true;
    const tag = normalizarTag(q.value);
    if (!tag) {
      marcarInvalido(q, true);
      anunciar("Escribe un oficio, por ejemplo gasfiter.");
      resultados().hidden = true;
      q.focus();
      return;
    }
    marcarInvalido(q, false);
    const textoLocalidad = localidad.value.trim();
    if (textoLocalidad) {
      coords = null;
      ubicacionActual.textContent = `Buscando la localidad «${textoLocalidad}»…`;
    }
    anunciar(`Buscando ${tag} cerca de ti…`);
    const seccion = resultados();
    seccion.setAttribute("aria-busy", "true");
    seccion.replaceChildren();

    if (controlador) controlador.abort();
    controlador = new AbortController();
    let datos;
    try {
      const respuesta = await fetch("/api/buscar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          q: q.value,
          localidad: textoLocalidad,
          lat: textoLocalidad ? null : (coords?.lat ?? null),
          lng: textoLocalidad ? null : (coords?.lng ?? null),
        }),
        signal: controlador.signal,
      });
      if (!respuesta.ok) throw new Error(String(respuesta.status));
      datos = await respuesta.json();
    } catch (error) {
      if (error.name === "AbortError") return;
      seccion.removeAttribute("aria-busy");
      seccion.hidden = true;
      anunciar("No pudimos completar la búsqueda. Intenta de nuevo.");
      reintentar.hidden = false;
      return;
    }

    if (datos.tipo === "sin_origen" && !yaPidioUbicacion && navigator.geolocation) {
      if (await obtenerUbicacion()) return buscar({ yaPidioUbicacion: true });
      seccion.removeAttribute("aria-busy");
      return;
    }

    const plantilla = document.createElement("template");
    plantilla.innerHTML = datos.resultadosHtml;
    const nueva = plantilla.content.firstElementChild;
    if (nueva) resultados().replaceWith(nueva);
    anunciar(datos.estado);
    ubicacionActual.textContent = datos.ubicacion;
    document.title = datos.titulo;
    reintentar.hidden = datos.tipo !== "error_servicio";
    const localidadInvalida = datos.tipo === "localidad_no_encontrada" || datos.tipo === "sin_origen";
    marcarInvalido(localidad, localidadInvalida);
    if (localidadInvalida) localidad.focus();
    actualizarUrl();
  }

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    void buscar();
  });

  reintentar.addEventListener("click", () => void buscar());

  if (navigator.geolocation) {
    usarUbicacion.hidden = false;
    usarUbicacion.addEventListener("click", async () => {
      localidad.value = "";
      marcarInvalido(localidad, false);
      if (!(await obtenerUbicacion())) return;
      if (normalizarTag(q.value)) void buscar({ yaPidioUbicacion: true });
      else anunciar("Ubicación lista. Escribe un oficio y busca.");
    });
  }

  window.addEventListener("popstate", () => location.reload());
})();
