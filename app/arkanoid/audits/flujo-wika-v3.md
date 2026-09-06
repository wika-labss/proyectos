# Flujo WIKA — Arkanoid V3

Registro del ciclo oficial aplicado a este refinamiento.  
Referencia: `wika-fundaments/workflows/application-lifecycle.md`.

```
Idea / Preparación (idea/ 01–05)     ← fuente oficial de verdad
    → Auditoría 1 (puede construirse)
    → Generación IA (iterations/v3)
    → Auditoría 2 (la solución funciona)
    → Refinamiento
    → Aprobación / final/            ← aún no
    → Demo / Publicación             ← aún no
```

`idea/` es la única fuente de verdad. Este archivo no la duplica: solo traza el proceso.  
Los documentos de `idea/` **no** se copian a `iterations/` ni a `final/`.

---

## Etapa 1–2 · Idea y preparación

Contrato oficial actualizado **antes** de cerrar el código:

| Documento | Qué define en V3 |
|-----------|------------------|
| `idea/01-problem.md` | Clásico + cápsulas + 33 niveles; sin jefe |
| `idea/02-features.md` | 06/17 (33 niveles + BDD), 22, 23, 24 |
| `idea/03-module-discovery.md` | `brick-field` 33 layouts, `vaus-capsules`, `ambient-audio`; `boss` histórico |
| `idea/04-application-design.md` | Overlays, constantes `LEVEL_COUNT = 33`, cápsulas, audio, 8-bit |
| `idea/05-build-plan.md` | Orden WIKA y plan V3-01…V3-13 |

---

## Etapa 3 · Auditoría 1

Ver `audits/auditoria-1-v3.md` (**APROBADO**).

Las auditorías V1 de documentación / módulos / ensamblado siguen vigentes.  
Esta auditoría cubre el delta V3 (Features 06/17 y 22–24).

---

## Etapa 4 · Generación IA

**Contexto usado (regla WIKA):**

```
idea/ 01–05
+ audits/ V1
+ audits/auditoria-1-v3.md
+ review.md (v1 / v2 / v3)
+ iterations/v1 (base clásica)
+ iterations/v2 (histórico: qué no copiar)
→ iterations/v3
```

V3 = jugabilidad V1 − delta V2 + Feature 06/17 (33 niveles) + Feature 23 + Feature 24 + UI 8-bit.

Código: `app/arkanoid/iterations/v3/`  
Informe de generación: `iterations/v3/generation-report.md`  
Revisión de iteración: `app/arkanoid/review.md`

---

## Etapa 5 · Auditoría 2

Ver `audits/auditoria-release-v3.md`.

Gates de código: smoke (33 niveles), TypeScript, `expo export`.  
APK Release: pendiente de JDK 17 + SDK local → bloquea `final/`.

---

## Etapa 6 · Incrementos de este refinamiento

| Incremento | Feature | Módulo / docs |
|------------|---------|---------------|
| Quitar jefe / `/lose` `/win` | 22 | `arkanoid-screens`, `level-progress` |
| Cápsulas L E C S B D P | 23 | `vaus-capsules` |
| Loop ambiental Castillo | 24 | `ambient-audio` |
| UI 8-bit unificada | 09, 10 | `menu-futuristic`, `playfield-retro` |
| 33 niveles fácil → difícil | 06, 17 | `idea/` + `brick-field` + `levelLayouts.ts` |

---

## Etapas 7–9 · Fuera de este ciclo

Aprobación (`final/`), demo y publicación esperan APK sideload validado y visto del arquitecto.
