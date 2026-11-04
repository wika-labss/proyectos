// VIEW-16: buscar localidad sin recargar, tocar el mapa y nombrar el punto (D-08).
// Nunca pide la ubicación del dispositivo (D-06).
(() => {
  "use strict";

  const form = document.getElementById("form-localidad");
  const contenedor = document.getElementById("mapa");
  if (!form || !contenedor || !window.trabajamosMapa) return;
  const { crear, numero } = window.trabajamosMapa;

  const texto = document.getElementById("localidad-texto");
  const resultados = document.getElementById("resultados-localidad");
  const elegido = document.getElementById("punto-elegido");
  const lat = document.getElementById("punto-lat");
  const lng = document.getElementById("punto-lng");
  const etiqueta = document.getElementById("punto-etiqueta");
  const estado = document.getElementById("form-localidad-estado");

  const publicadoLat = numero(contenedor.dataset.lat);
  const publicadoLng = numero(contenedor.dataset.lng);
  estado.textContent = "Cargando mapa…";
  const mapa = crear(contenedor, {
    lat: publicadoLat,
    lng: publicadoLng,
    zoom: Number.isFinite(publicadoLat) ? 15 : 11,
    alFallar: () => {
      contenedor.hidden = true;
      estado.textContent = "El mapa no está disponible. Puedes escribir tu localidad.";
    },
  });
  if (mapa) mapa.whenReady(() => {
    if (estado.textContent === "Cargando mapa…") estado.textContent = "";
  });

  let marcador = null;
  function ponerMarcador(la, ln, centrar) {
    if (!mapa) return;
    if (marcador) marcador.setLatLng([la, ln]);
    else marcador = L.marker([la, ln], { keyboard: false }).addTo(mapa);
    if (centrar) mapa.setView([la, ln], Math.max(mapa.getZoom(), 14));
  }
  if (Number.isFinite(publicadoLat) && Number.isFinite(publicadoLng)) ponerMarcador(publicadoLat, publicadoLng, false);
  const inicialLat = numero(lat.value);
  const inicialLng = numero(lng.value);
  if (Number.isFinite(inicialLat) && Number.isFinite(inicialLng)) ponerMarcador(inicialLat, inicialLng, true);

  function fijarPunto(la, ln, nombre) {
    lat.value = la.toFixed(6);
    lng.value = ln.toFixed(6);
    etiqueta.value = nombre;
    elegido.textContent = `Punto elegido: ${nombre || "en el mapa"}. Aún no está guardado.`;
  }

  let consultaInversa = 0;
  if (mapa) {
    mapa.on("click", async (evento) => {
      const { lat: la, lng: ln } = evento.latlng;
      ponerMarcador(la, ln, false);
      for (const r of resultados.querySelectorAll('input[name="resultado"]')) r.checked = false;
      fijarPunto(la, ln, "");
      const id = ++consultaInversa;
      try {
        const respuesta = await fetch(`/panel/api/geo/inversa?lat=${la.toFixed(6)}&lng=${ln.toFixed(6)}`);
        if (!respuesta.ok) throw new Error(String(respuesta.status));
        const datos = await respuesta.json();
        if (id !== consultaInversa) return;
        if (datos.etiqueta) {
          fijarPunto(la, ln, datos.etiqueta);
          estado.textContent = "";
        } else {
          estado.textContent = "No encontramos un nombre para ese punto. Escribe el nombre de la localidad.";
        }
      } catch {
        if (id === consultaInversa) {
          estado.textContent = "No encontramos un nombre para ese punto. Escribe el nombre de la localidad.";
        }
      }
    });
  }

  function pintarResultados(lista) {
    resultados.replaceChildren();
    if (!lista.length) return;
    const fs = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.textContent = "Elige el resultado correcto";
    fs.append(legend);
    lista.forEach((r, i) => {
      const input = document.createElement("input");
      input.type = "radio";
      input.id = `resultado-${i}`;
      input.name = "resultado";
      input.value = `${r.lat}|${r.lng}|${r.etiqueta}`;
      const label = document.createElement("label");
      label.htmlFor = input.id;
      label.textContent = r.etiqueta;
      fs.append(input, label);
    });
    resultados.append(fs);
  }

  resultados.addEventListener("change", (evento) => {
    const radio = evento.target;
    if (radio.name !== "resultado") return;
    const [la, ln, ...resto] = radio.value.split("|");
    const nLat = Number(la);
    const nLng = Number(ln);
    fijarPunto(nLat, nLng, resto.join("|"));
    ponerMarcador(nLat, nLng, true);
  });

  form.addEventListener("submit", async (evento) => {
    if (evento.submitter?.value !== "buscar") return;
    evento.preventDefault();
    const consulta = texto.value.trim();
    if (!consulta) {
      estado.textContent = "Escribe tu localidad para buscarla.";
      texto.focus();
      return;
    }
    estado.textContent = "Buscando localidad…";
    try {
      const respuesta = await fetch(`/panel/api/geo/buscar?q=${encodeURIComponent(consulta)}`);
      if (respuesta.status === 401) {
        location.href = `/panel/entrar.html?volver=${encodeURIComponent("/panel/localidad.html")}&motivo=sesion`;
        return;
      }
      if (!respuesta.ok) throw new Error(String(respuesta.status));
      const { resultados: lista } = await respuesta.json();
      pintarResultados(lista);
      if (!lista.length) {
        estado.textContent =
          "No encontramos esa localidad. No se marcó ningún punto. Prueba con la comuna o una calle cercana.";
        texto.setAttribute("aria-invalid", "true");
        return;
      }
      texto.removeAttribute("aria-invalid");
      if (lista.length === 1) {
        const unico = resultados.querySelector('input[name="resultado"]');
        unico.checked = true;
        unico.dispatchEvent(new Event("change", { bubbles: true }));
        estado.textContent = "1 resultado. Revisa el nombre y marca tu localidad.";
      } else {
        estado.textContent = `${lista.length} resultados. Elige el correcto.`;
      }
    } catch {
      estado.textContent =
        "No pudimos buscar la localidad en este momento. Intenta en unos minutos o marca el punto en el mapa.";
    }
  });
})();
