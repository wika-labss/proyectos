// Micro-animación de entrada (Fase 2). Respeta prefers-reduced-motion.
(() => {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;
  const bloques = document.querySelectorAll(
    "#buscar, #resultados, #perfil > article > section, #datos, #redes, #publicacion, main > section, main > h1",
  );
  for (const el of bloques) {
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    el.style.transition = "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)";
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.style.opacity = "1";
        e.target.style.transform = "translateY(0)";
        io.unobserve(e.target);
      }
    },
    { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
  );
  for (const el of bloques) io.observe(el);
})();
