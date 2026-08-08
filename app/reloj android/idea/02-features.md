# Funcionalidades

## Funcionalidades principales

- [ ] **Reloj digital en app** — Pantalla principal con hora actual (HH:MM:SS), actualizada cada segundo
- [ ] **Estilo retro 7 segmentos** — Dígitos renderizados con tipografía/display estilo LCD/VFD retro (ver `04-design.md`)
- [ ] **Widget de pantalla de inicio** — Widget Android añadible desde el launcher; muestra hora (HH:MM) con estilo retro
- [ ] **Formato 12h / 24h** — Toggle en ajustes; aplica a app y widget
- [ ] **Indicador AM/PM** — Visible en modo 12h (app y widget)
- [ ] **Fecha opcional** — Mostrar fecha debajo del reloj en app (DD/MM/AAAA o configurable)
- [ ] **Persistencia de preferencias** — Formato horario, color del display y visibilidad de segundos/fecha guardados localmente

## Widget Android — Especificación

| Atributo | Valor |
|----------|-------|
| Nombre interno | `RetroClockWidget` |
| Label en selector | `Reloj Retro` |
| Tamaño mínimo | 2×1 celdas (~110×40 dp) |
| Tamaño recomendado | 4×2 celdas (~250×110 dp) |
| Contenido | Hora HH:MM (+ AM/PM si 12h) |
| Estilo | Mismo display 7 segmentos y paleta que la app |
| Tap | Abre la app principal |
| Actualización | Ver tabla de estrategia abajo |

### Estrategia de actualización del widget

Android limita `updatePeriodMillis` a mínimo **30 minutos**. Para un reloj usable:

| Evento | Acción |
|--------|--------|
| `WIDGET_ADDED` | Renderizar hora inmediatamente (obligatorio — evitar widget vacío) |
| App en primer plano | `requestWidgetUpdate` cada **60 s** mientras la app está abierta |
| App pasa a background | Programar actualización al abrir de nuevo; aceptar refresh del sistema cada 30 min |
| Cambio de preferencias | `requestWidgetUpdate` inmediato para todos los widgets activos |
| Tap en widget | Abre app → refresh al montar |

> v1 no requiere servicio en foreground ni AlarmManager nativo custom. Actualización cada minuto con app abierta + refresh periódico del sistema es aceptable.

## Pantalla de ajustes

- [ ] **Formato 12h / 24h** — Switch
- [ ] **Mostrar segundos** — Switch (solo app; widget siempre HH:MM en v1)
- [ ] **Mostrar fecha** — Switch
- [ ] **Color del display** — Selector entre presets retro: Ámbar, Verde VFD, Cian, Rojo
- [ ] **Instrucciones widget** — Texto breve: "Mantén pulsado en la pantalla de inicio → Widgets → Reloj Retro"

## Funcionalidades secundarias

- [ ] **Pantalla siempre encendida** — Opción para mantener pantalla activa mientras la app está abierta (modo escritorio/reloj de mesa)
- [ ] **Feedback háptico** — Vibración breve al cambiar preferencias
- [ ] **Preview del widget** — Vista previa en ajustes de cómo se verá el widget

## Priorización

| Prioridad | Funcionalidad | Descripción |
|-----------|---------------|-------------|
| P0 | Reloj digital en app | Core del producto |
| P0 | Estilo retro 7 segmentos | Identidad visual obligatoria |
| P0 | Widget Android | Requisito explícito del proyecto |
| P0 | Formato 12h/24h | Básico para reloj |
| P1 | Persistencia de preferencias | UX sin reconfigurar cada vez |
| P1 | Color del display (presets) | Personalización retro |
| P1 | Fecha en app | Complemento útil |
| P2 | Pantalla siempre encendida | Modo reloj de mesa |
| P2 | Preview del widget | Ayuda onboarding |
| P2 | Feedback háptico | Pulido UX |

## Fuera de alcance (v1)

- Soporte iOS / widget iOS
- Alarmas, cronómetro, temporizador
- Zonas horarias múltiples / reloj mundial
- Backend, cuentas de usuario o sincronización en la nube
- Widget interactivo (botones en el widget)
- Publicidad o compras in-app
- Fuentes personalizadas descargables (solo presets en v1)
