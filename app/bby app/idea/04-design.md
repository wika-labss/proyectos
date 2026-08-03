# Diseño

## Experiencia de usuario

La app debe sentirse **oscura, misteriosa y funcional** — una linterna gótica, no una utilidad genérica. Interacción con una sola mano: el botón principal ocupa el centro de la pantalla y los controles secundarios (intensidad, SOS) están al alcance del pulgar inferior. Feedback inmediato en cada acción: el flash responde al instante y la UI refleja el estado con cambios de color y animaciones sutiles.

Principios UX:
- **Claridad en la oscuridad** — Botones blancos sobre fondo oscuro; alto contraste para uso nocturno
- **Un toque para lo esencial** — Encender/apagar debe ser la acción más accesible
- **Estado visible** — El usuario siempre sabe si la linterna está OFF, ON o en SOS
- **Accesibilidad** — Targets táctiles ≥ 48×48 dp; contraste WCAG AA mínimo en textos

## Estilo visual — Gótico

Estética inspirada en arquitectura gótica y atmósfera nocturna: formas angulares, ornamentos sutiles, tipografía serif o display gótica, y una paleta sombría con acentos de color profundo.

## Pantallas / Vistas

| Pantalla | Descripción |
|----------|-------------|
| **Principal (única)** | Pantalla única con todos los controles: botón central de linterna, slider de intensidad, botón SOS, indicador de estado. Sin navegación adicional en v1 |
| **Sin flash (fallback)** | Mensaje centrado informando que el dispositivo no tiene flash LED disponible, la cámara está ocupada o falta el permiso, con botón blanco **REINTENTAR** |

## Flujos de usuario

### Flujo principal — Encender linterna

1. Usuario abre la app → Pantalla principal gótica, linterna apagada
2. Toca el botón central (círculo blanco con icono de rayo) → Flash se enciende, botón brilla con borde morado
3. Ajusta el slider de intensidad → La luz cambia de intensidad en tiempo real
4. Toca de nuevo el botón central → Flash se apaga, UI vuelve a estado reposo

### Flujo SOS

1. Usuario toca botón **SOS** (parte inferior, texto blanco sobre fondo rojo oscuro)
2. La linterna entra en modo parpadeo Morse `··· ——— ···`
3. Indicador de estado muestra "SOS" con animación pulsante roja
4. Usuario toca **SOS** de nuevo o el botón central → Sale del modo SOS

### Flujo sin hardware

1. App detecta ausencia de flash LED al iniciar
2. Muestra pantalla fallback con mensaje y estilo gótico coherente
3. Controles de linterna deshabilitados

## Identidad visual

### Paleta de colores

| Token | Hex | Uso |
|-------|-----|-----|
| `background` | `#0A0A0F` | Fondo principal — negro profundo |
| `surface` | `#1A1025` | Tarjetas, paneles — negro con tinte morado |
| `primary` | `#6B2D5B` | Acentos, bordes activos, slider track — morado gótico |
| `primaryDark` | `#4A1A3E` | Estados hover/pressed del morado |
| `accent` | `#8B1A1A` | Modo SOS, alertas — rojo oscuro |
| `accentGlow` | `#C41E3A` | Glow pulsante en SOS activo |
| `button` | `#FFFFFF` | Botones principales — blanco |
| `buttonText` | `#0A0A0F` | Texto sobre botones blancos — negro |
| `textPrimary` | `#E8E0F0` | Textos principales — blanco lavanda |
| `textSecondary` | `#9B8FA8` | Textos secundarios, labels |
| `border` | `#3D2B4F` | Bordes ornamentales, divisores |
| `glow` | `#6B2D5B40` | Sombras/glow morado (25% opacidad) |

### Tipografía

| Uso | Fuente sugerida | Peso | Tamaño |
|-----|-----------------|------|--------|
| Título app | Cinzel / Playfair Display (serif gótica) | 700 | 28 sp |
| Botones | Inter / System | 600 | 16 sp |
| Labels | Inter / System | 400 | 14 sp |
| Indicador SOS | Cinzel | 700 | 20 sp, letter-spacing 4 |

> Si las fuentes custom no están disponibles, usar serif del sistema en Android (`serif`) como fallback.

### Iconografía

- Estilo: línea fina (outline), trazo blanco sobre fondos oscuros
- Icono principal: rayo/flash estilizado dentro del botón circular
- Icono SOS: tres puntos + tres rayas + tres puntos (representación Morse) o texto "SOS"
- Sin iconos coloridos ni estilo Material filled

### Espaciado

| Token | Valor |
|-------|-------|
| `xs` | 4 dp |
| `sm` | 8 dp |
| `md` | 16 dp |
| `lg` | 24 dp |
| `xl` | 32 dp |
| `xxl` | 48 dp |

## Componentes UI clave

### Botón principal de linterna (TorchButton)

- Forma: círculo grande (160×160 dp mínimo)
- OFF: fondo blanco, icono rayo negro, borde morado sutil (`#3D2B4F`)
- ON: fondo blanco, icono rayo morado (`#6B2D5B`), glow morado exterior
- SOS: borde rojo oscuro pulsante, icono oculto, texto "SOS" en el centro
- Animación: scale 0.95 → 1.0 al presionar (150 ms)

### Slider de intensidad (IntensitySlider)

- Track: `#1A1025` con fill morado (`#6B2D5B`) hasta el valor actual
- Thumb: círculo blanco (24 dp) con borde morado
- Label: "INTENSIDAD" en `textSecondary`, valor numérico (ej. "75%") en `textPrimary`
- Habilitado en OFF y ON (permite preajustar antes de encender); deshabilitado solo en SOS
- El relleno y el thumb no capturan toques (`pointerEvents="none"`) para que el arrastre
  se calcule siempre contra el track completo

### Botón SOS (SosButton)

- Forma: pill / rectángulo redondeado (altura 48 dp, ancho completo menos márgenes)
- OFF: fondo `#8B1A1A`, texto "SOS" blanco, borde ornamentado sutil
- ON: fondo `#C41E3A` pulsante, texto blanco bold
- Posición: parte inferior de la pantalla, encima del safe area

### Indicador de estado (StatusIndicator)

- Tres estados visuales:
  - **APAGADA** — Texto `textSecondary`, sin animación
  - **ENCENDIDA** — Texto morado `#6B2D5B`, icono rayo
  - **SOS ACTIVO** — Texto rojo `#C41E3A`, animación pulse continua

### Fondo gótico (GothicBackground)

- Gradiente radial: centro `#1A1025` → bordes `#0A0A0F`
- Ornamento sutil en esquinas (líneas angulares `#3D2B4F`, opacidad 30%)
- Sin imágenes pesadas; todo vectorial o CSS/StyleSheet

## Layout — Pantalla principal

```text
┌─────────────────────────────┐
│         BBY LIGHT           │  ← Título serif gótico
│                             │
│      ┌─────────────┐        │
│      │             │        │
│      │   ⚡ / SOS   │        │  ← TorchButton (160dp)
│      │             │        │
│      └─────────────┘        │
│                             │
│       ● ENCENDIDA           │  ← StatusIndicator
│                             │
│   INTENSIDAD          75%   │
│   ════════●──────────       │  ← IntensitySlider
│                             │
│   ┌─────────────────────┐   │
│   │        SOS          │   │  ← SosButton
│   └─────────────────────┘   │
└─────────────────────────────┘
```
