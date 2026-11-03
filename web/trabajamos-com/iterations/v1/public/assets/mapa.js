// Base común de los mapas Leaflet + OpenStreetMap (perfil público y panel).
window.trabajamosMapa = (() => {
  "use strict";

  const SANTIAGO = [-33.45, -70.66];

  function crear(contenedor, { lat, lng, zoom, alFallar }) {
    if (!window.L) {
      alFallar();
      return null;
    }
    const centro = Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : SANTIAGO;
    const mapa = L.map(contenedor, { scrollWheelZoom: false }).setView(centro, zoom);
    let cargoAlguna = false;
    let avisado = false;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    })
      .on("tileload", () => {
        cargoAlguna = true;
      })
      .on("tileerror", () => {
        if (!cargoAlguna && !avisado) {
          avisado = true;
          alFallar();
        }
      })
      .addTo(mapa);
    return mapa;
  }

  function numero(texto) {
    return texto === undefined || texto === "" ? Number.NaN : Number(texto);
  }

  return { crear, numero };
})();
