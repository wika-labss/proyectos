# Historial de iteraciones — Arkanoid

Cronología de las versiones en `iterations/`. El contrato detallado vive en [`../idea/`](../idea/).

| Fecha | Versión | Motivo |
|-------|---------|--------|
| 2026-08-19 | **V1** | MVP clásico: pala, bola, 3 niveles, menú futurista |
| 2026-08-19 | **V2** | Experimento: jefe móvil, pantallas `/lose` y `/win` |
| 2026-09-06 | **V3** | Contrato WIKA: 33 niveles, cápsulas Vaus, UI 8-bit, audio Castillo |
| 2026-09-06 | V3.0.1–3.0.3 | Mitigaciones arranque: audio diferido, encode 64 kbps, menú sin audio al abrir |
| 2026-09-06 | **V4** | V3 sin MP3 ni `expo-av` — arranque más seguro en gama baja |

## Ramas Git

| Versión | Rama |
|---------|------|
| V1 | `cursor/arkanoid-v1-eb2a` |
| V2 | `cursor/arkanoid-v2-eb2a` |
| V3 | `cursor/arkanoid-v3-classic-eb2a` |
| V4 | `cursor/arkanoid-v4-silent-eb2a` |

## Decisiones clave

- **V2 descartado como base:** V3/V4 retoman V1 (clásico), no el jefe ni las rutas `/lose` `/win`.
- **V3 audio:** Feature 24 (MP3 Castillo) provocó OOM en algunos dispositivos; ver [`../audits/auditoria-audio-arranque-v3.md`](../audits/auditoria-audio-arranque-v3.md) y [`../audits/errores-v3.md`](../audits/errores-v3.md).
- **V4:** misma jugabilidad que V3, sin dependencia de audio en el arranque.
