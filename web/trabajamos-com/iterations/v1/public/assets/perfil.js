// VIEW-09: mapa del perfil público. Si falla, el texto de la localidad sigue visible.
(() => {
  "use strict";

  const contenedor = document.getElementById("mapa-perfil");
  const estado = document.getElementById("mapa-perfil-estado");
  if (!contenedor || !window.trabajamosMapa) return;
  const { crear, numero } = window.trabajamosMapa;
  const lat = numero(contenedor.dataset.lat);
  const lng = numero(contenedor.dataset.lng);
  const alFallar = () => {
    contenedor.hidden = true;
    estado.textContent = "No pudimos mostrar el mapa.";
  };
  const mapa = crear(contenedor, { lat, lng, zoom: 14, alFallar });
  if (mapa) L.marker([lat, lng], { keyboard: false }).addTo(mapa);
})();
