# Diseño

## Experiencia de usuario

La app debe sentirse como un **reloj digital retro de los años 70–80**: display de 7 segmentos, fondo oscuro, brillo de VFD/LCD, y una sensación nostálgica pero legible. La interacción es mínima: abrir la app y ver la hora; el widget lleva esa misma estética a la pantalla de inicio.

Principios UX:
- **Legibilidad primero** — Hora grande, alto contraste, legible a distancia
- **Estética retro coherente** — App y widget comparten la misma identidad visual
- **Cero fricción** — Sin login, sin onboarding largo; widget añadible en 3 pasos
- **Accesibilidad** — Targets táctiles ≥ 48×48 dp; contraste WCAG AA en textos de ajustes

## Estilo visual — Retro digital

Estética inspirada en relojes Casio, displays VFD de equipos Hi-Fi, y terminales CRT verdes/ámbar. Dígitos tipo **7 segmentos**, fondo casi negro, glow sutil en el color del display activo.

## Pantallas / Vistas

| Pantalla | Descripción |
|----------|-------------|
| **Principal (Reloj)** | Hora grande centrada en display 7 segmentos, fecha opcional debajo, acceso a ajustes |
| **Ajustes** | Formato horario, segundos, fecha, color del display, instrucciones del widget, preview |
| **Widget (launcher)** | Solo hora HH:MM (+ AM/PM) en display retro; sin navegación |

## Flujos de usuario

### Flujo principal — Ver la hora

1. Usuario abre la app → Pantalla negra con hora retro en grande, actualizándose cada segundo
2. (Opcional) Ve la fecha debajo si está activada
3. Toca icono de ajustes → Pantalla de preferencias

### Flujo widget

1. Usuario mantiene pulsado en pantalla de inicio → **Widgets**
2. Busca **Reloj Retro** → arrastra a la pantalla de inicio
3. El widget muestra la hora con estilo 7 segmentos
4. Tap en widget → abre la app

### Flujo ajustes

1. Usuario cambia formato a 12h → App y widget se actualizan
2. Usuario elige color Ámbar → Display cambia de verde a ámbar en app y widget
3. Preferencias persisten al cerrar la app

## Identidad visual

### Paleta de colores — Presets retro

| Preset | Display (segmentos) | Glow | Fondo |
|--------|---------------------|------|-------|
| **Verde VFD** (default) | `#39FF14` | `#39FF1440` | `#0D0D0D` |
| **Ámbar LCD** | `#FFB000` | `#FFB00040` | `#0A0A0A` |
| **Cian CRT** | `#00FFFF` | `#00FFFF40` | `#0C0C14` |
| **Rojo LED** | `#FF3333` | `#FF333340` | `#0D0808` |

### Tokens de diseño (app)

| Token | Valor | Uso |
|-------|-------|-----|
| `background` | `#0D0D0D` | Fondo principal |
| `surface` | `#1A1A1A` | Paneles de ajustes |
| `display` | (preset activo) | Color de dígitos 7 segmentos |
| `displayGlow` | (preset + 25% opacidad) | Sombra/glow del display |
| `displayDim` | (preset × 30% opacidad) | Segmentos apagados / fondo del dígito |
| `textPrimary` | `#E0E0E0` | Labels en ajustes |
| `textSecondary` | `#888888` | Texto secundario, instrucciones |
| `accent` | `#FFB000` | Botones, switches activos |
| `border` | `#333333` | Bordes de paneles |

### Tipografía

| Uso | Fuente | Peso | Tamaño |
|-----|--------|------|--------|
| Hora (app) | **DSEG7 Classic** (7 segmentos) | Regular | 72 sp (HH:MM), 36 sp (SS) |
| Hora (widget) | **DSEG7 Classic** | Regular | Escala al tamaño del widget |
| Fecha | DSEG14 o monospace | Regular | 18 sp |
| Ajustes / labels | System monospace | 400 | 14 sp |
| Título ajustes | System | 600 | 20 sp |

> Fuente principal: `DSEG7Classic-Bold.ttf` en `assets/fonts/`. Registrar en widget config (`fonts` array) y cargar con `expo-font` en app.

### Efectos visuales

- **Glow del display:** `textShadow` / sombra con color del preset, radio 8–12, opacidad 40%
- **Scanlines (app, opcional):** Overlay sutil horizontal, opacidad 5%, solo en pantalla principal
- **Bezel retro (app):** Marco redondeado alrededor del display simulando carcasa de reloj (`borderRadius: 8`, borde `#333`, padding interno)
- **Segmentos apagados:** Cada dígito 7-seg muestra segmentos "off" en `displayDim` detrás de los activos

## Componentes UI clave

### SevenSegmentDisplay

- Renderiza una cadena de tiempo (`12:34:56`) dígito a dígito
- Props: `value`, `color`, `size`, `showSeconds`
- Usa fuente DSEG7; fallback a monospace si la fuente no cargó
- Dos puntos (`:`) parpadean cada segundo (opacidad 1 ↔ 0.3, 500 ms)

### RetroBezel

- Contenedor con borde metálico simulado (`#444` → `#222` gradiente)
- Fondo `#111` interior, padding generoso
- Envuelve el `SevenSegmentDisplay` en pantalla principal

### DateLine

- Fecha en formato `SÁB 08/08/2026` o `08.08.2026`
- Color `display` al 70% de opacidad
- Oculto si preferencia desactivada

### SettingsRow

- Fila con label a la izquierda y control (Switch/selector) a la derecha
- Estilo terminal: monospace, fondo `surface`

### WidgetPreview

- Miniatura del widget con hora actual y preset de color activo
- Muestra cómo se verá en la pantalla de inicio

### ColorPresetPicker

- 4 círculos con los presets (Verde, Ámbar, Cian, Rojo)
- Seleccionado: borde blanco + glow del color

## Layout — Pantalla principal

```text
┌─────────────────────────────┐
│                        ⚙    │  ← Icono ajustes (esquina)
│                             │
│   ┌─────────────────────┐   │
│   │                     │   │
│   │    12:34:56         │   │  ← SevenSegmentDisplay en RetroBezel
│   │                     │   │
│   └─────────────────────┘   │
│                             │
│      SÁB 08/08/2026         │  ← DateLine (opcional)
│                             │
└─────────────────────────────┘
```

## Layout — Widget (launcher)

```text
┌──────────────────┐
│  ┌────────────┐  │
│  │  12:34 PM  │  │  ← SevenSegmentDisplay compacto en RetroBezel mini
│  └────────────┘  │
└──────────────────┘
```

Fondo del widget: `#0D0D0D`. Sin scanlines en widget (rendimiento).
