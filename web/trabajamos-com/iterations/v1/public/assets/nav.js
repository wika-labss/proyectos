// Menú hamburguesa: sincroniza aria y cierra con Escape. El cajón funciona sin JS (checkbox).
(() => {
  "use strict";
  const toggle = document.getElementById("menu-toggle");
  const boton = document.querySelector(".menu-boton");
  if (!(toggle instanceof HTMLInputElement) || !boton) return;

  const sync = () => {
    boton.setAttribute("aria-expanded", toggle.checked ? "true" : "false");
    document.body.classList.toggle("menu-abierto", toggle.checked);
  };
  toggle.addEventListener("change", sync);
  sync();

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && toggle.checked) {
      toggle.checked = false;
      sync();
      boton.focus();
    }
  });
})();
