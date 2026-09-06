# Flujo WIKA — Arkanoid V3

Registro del ciclo oficial.  
Referencia: `wika-fundaments/workflows/application-lifecycle.md`.

```
Idea / Preparación (idea/ 01–05)
    → Auditoría 1
         documentación  → auditoria-documentacion-v3.md  APROBADO
         módulos        → auditoria-modulos-v3.md        APROBADO
         ensamblado     → auditoria-ensamblado-v3.md     APROBADO
    → Generación IA (iterations/v3)
    → Auditoría 2 (release)
         auditoria-release-v3.md           REQUIERE CORRECCIONES (sideload)
         auditoria-audio-arranque-v3.md    APROBADA (contrato + código)
    → Aprobación / final/     ← bloqueado
    → Demo / Publicación      ← bloqueado
```

`idea/` es la única fuente de verdad. Este archivo no la duplica.  
Los documentos de `idea/` **no** se copian a `iterations/` ni a `final/`.

Índice de la Auditoría 1: `audits/auditoria-1-v3.md`.

---

## Etapa 1–2 · Idea y preparación

| Documento | Qué define en V3 |
|-----------|------------------|
| `idea/01-problem.md` | Clásico + cápsulas + 33 niveles; sin jefe |
| `idea/02-features.md` | 06/17 (33 niveles + BDD), 22, 23, 24 |
| `idea/03-module-discovery.md` | `brick-field` 33 layouts, `vaus-capsules`, `ambient-audio`; `boss` histórico |
| `idea/04-application-design.md` | Contrato vigente §9: 8-bit, overlays, `LEVEL_COUNT = 33` |
| `idea/05-build-plan.md` | Plan V3-01…V3-13 |

---

## Etapa 3 · Auditoría 1 (ejecutada 2026-09-06)

Ver los tres documentos. Hallazgos no bloqueantes: texto V1 “futurista/retro” histórico; plantillas YAML v2.1 no usadas (patrón del portafolio).

---

## Etapa 4 · Generación IA

```
idea/ 01–05
+ auditorías V1
+ auditorías 1 V3
+ review.md
+ iterations/v1
+ iterations/v2 (qué no copiar)
→ iterations/v3
```

Informe: `iterations/v3/generation-report.md`  
Revisión: `app/arkanoid/review.md`

---

## Etapa 5 · Auditoría 2 (ejecutada 2026-09-06)

`audits/auditoria-release-v3.md` — código OK; sideload pendiente.  
`audits/auditoria-audio-arranque-v3.md` — H1/H2 (MP3 tumba el arranque) cerrados en contrato; menú 3.0.3 no carga `expo-av`.  
`audits/errores-v3.md` — catálogo `ERR-V3-01` … `ERR-V3-27`.

---

## Etapa 6 · Incrementos cubiertos

| Incremento | Feature | Dónde |
|------------|---------|-------|
| Sin jefe / `/lose` `/win` | 22 | screens, level-progress |
| Cápsulas L E C S B D P | 23 | vaus-capsules |
| Loop Castillo (MediaPlayer, ≤ 2 MB) | 24 | ambient-audio |
| UI 8-bit | 09, 10 | pixel + pack Castillo |
| 33 niveles fácil → difícil | 06, 17 | brick-field, levelLayouts.ts |

---

## Etapas 7–9 · Fuera de este ciclo

Aprobación (`final/`), demo y publicación esperan APK sideload y Release **APROBADO**.
