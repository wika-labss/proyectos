// Menú cajón + reveals ligeros. El cajón funciona sin JS (checkbox).
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

  if (reduce) {
    document.documentElement.classList.add("motion-reduce");
    return;
  }

  document.documentElement.classList.add("motion-ready");

  const targets = document.querySelectorAll(
    ".eg-header, .eg-hero, .eg-search-shell, .eg-results, .eg-result, .eg-profile__hero, .eg-section, .eg-offers > li, .eg-folio > li, body > main > *:not(script), body > footer",
  );

  targets.forEach((el, i) => {
    if (!(el instanceof HTMLElement)) return;
    if (el.closest(".menu-cajon")) return;
    el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", `${Math.min(i * 45, 400)}ms`);
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("reveal-in");
        io.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
  );

  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  requestAnimationFrame(() => {
    document.querySelector(".eg-header")?.classList.add("reveal-in");
    document.querySelector(".eg-hero, .eg-profile__hero, body > main > *:first-child")?.classList.add("reveal-in");
  });
})();
