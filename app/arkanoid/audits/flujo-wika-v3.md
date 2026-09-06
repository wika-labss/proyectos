# Flujo WIKA — Arkanoid V3

Registro del ciclo oficial aplicado a este refinamiento.
Referencia: `wika-fundaments/workflows/application-lifecycle.md`.

```
Documentación (idea/)
    → Auditoría 1
    → Generación IA (iterations/v3)
    → Auditoría 2 (release)
    → Refinamiento
    → Aprobación / final/   ← aún no
```

La carpeta `idea/` es la única fuente de verdad. Este archivo no la duplica: solo traza el proceso.

---

## Etapa 1–2 · Idea y preparación

Se actualizó el contrato oficial **antes** de tratar el código como cerrado:

| Documento | Cambio V3 |
|-----------|-----------|
| `idea/01-problem.md` | Fidelidad clásica + cápsulas; sin jefe |
| `idea/02-features.md` | Feature 22 (sin delta V2), 23 (cápsulas), 24 (ambiente) |
| `idea/03-module-discovery.md` | `vaus-capsules`, `ambient-audio`; `boss` histórico |
| `idea/04-application-design.md` | Overlays, modelo de cápsulas, canales de audio |
| `idea/05-build-plan.md` | Orden WIKA y plan V3 |

No se copiaron estos documentos dentro de `iterations/`.

---

## Etapa 3 · Auditoría 1 (puede construirse)

Las auditorías V1 de documentación / módulos / ensamblado siguen **APROBADAS**.
El refinamiento V3 añade módulos y features; la generación se apoya en ese contrato actualizado.

Validaciones cubiertas:

- Features 22–24 definidas, con BDD en 23 y 24.
- Módulos con responsabilidad única (`vaus-capsules`, `ambient-audio`).
- Recurso de audio en catálogo `recursos/audio/` y copia runtime en la iteración.
- Entregable sigue siendo APK Release (Expo 52, JDK 17).

---

## Etapa 4 · Generación IA

**Contexto usado (regla WIKA):**

```
idea/ 01–05
+ audits/ V1
+ review.md (v1 / v2)
+ iterations/v1 (base clásica)
+ iterations/v2 (histórico: qué no copiar)
→ iterations/v3
```

V3 = jugabilidad V1 − delta V2 + Feature 23 + Feature 24.

Código: `app/arkanoid/iterations/v3/`  
Informe: `iterations/v3/generation-report.md`  
Revisión de iteración: `app/arkanoid/review.md`

---

## Etapa 5 · Auditoría 2 (la solución funciona)

Ver `audits/auditoria-release-v3.md`.

Gates de código: smoke, TypeScript, `expo export`.
APK Release: pendiente de JDK 17 + SDK en máquina local → bloquea `final/`.

---

## Etapa 6 · Este refinamiento

| Incremento | Feature | Módulo |
|------------|---------|--------|
| Quitar jefe / `/lose` `/win` | 22 | `arkanoid-screens`, `level-progress` |
| Cápsulas L E C S B D P | 23 | `vaus-capsules` |
| Loop ambiental + cambio de tema (stop → loop) | 24 | `ambient-audio` |

---

## Etapas 7–9 · Fuera de este ciclo

Aprobación (`final/`), demo y publicación esperan APK sideload validado y visto del arquitecto.
