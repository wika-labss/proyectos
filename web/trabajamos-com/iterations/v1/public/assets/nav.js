// Menú Soft Structuralism: aria, Escape, reveals de entrada. El cajón funciona sin JS (checkbox).
(() => {
  "use strict";
  const toggle = document.getElementById("menu-toggle");
  const boton = document.querySelector(".menu-boton");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (toggle instanceof HTMLInputElement && boton) {
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
  }

  // Entrada: fade-up suave en bloques principales (solo transform/opacity).
  if (reduce) {
    document.documentElement.classList.add("motion-reduce");
    return;
  }

  document.documentElement.classList.add("motion-ready");

  const targets = document.querySelectorAll(
    "[data-reveal], body > main > *:not(script), body > footer, #resultados > li, #ofertas > ul > li, #portafolio > ul > li",
  );

  targets.forEach((el, i) => {
    if (!(el instanceof HTMLElement)) return;
    if (el.closest(".menu-cajon")) return;
    el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", `${Math.min(i * 55, 420)}ms`);
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("reveal-in");
        io.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );

  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // Primer paint: cabecera y primer bloque sin esperar scroll.
  requestAnimationFrame(() => {
    document.querySelector(".banner")?.classList.add("reveal-in");
    const first = document.querySelector("body > main > *:first-child");
    first?.classList.add("reveal-in");
  });
})();
