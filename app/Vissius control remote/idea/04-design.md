# Diseño

## Experiencia de usuario

La app debe sentirse **profesional, confiable y directa** — un mando remoto digital, no un panel de administración complejo. Interacción con una sola mano: el botón de power y los modos están en la zona inferior accesible al pulgar. Feedback inmediato en cada comando: la UI refleja el estado del dispositivo en tiempo real y muestra claramente si hay conexión o error de red.

Principios UX:
- **Estado siempre visible** — Conexión, encendido/apagado y modo activo visibles sin scroll
- **Un toque para lo esencial** — Power y cambio de modo en máximo 2 toques
- **Confianza** — Indicadores claros de éxito/error al enviar comandos
- **Accesibilidad** — Targets táctiles ≥ 48×48 dp; contraste WCAG AA en textos

## Estilo visual — Control industrial moderno

Estética limpia con acentos en azul eléctrico y verde de estado. Fondo oscuro para uso en entornos con poca luz (taller, cuarto técnico, salón con TV apagada).

## Pantallas / Vistas

| Pantalla | Descripción |
|----------|-------------|
| **Conexión** | Lista de dispositivos descubiertos o campo IP manual + botón Conectar. Estado: buscando / sin dispositivos / error |
| **Control** | Panel principal: StatusPanel arriba, PowerButton central, ModeSelector debajo, sliders de parámetros |
| **Ajustes** | IP, puerto, timeout, modo mock (DEV), reiniciar emparejamiento |

## Flujos de usuario

### Flujo principal — Controlar dispositivo

1. Usuario abre la app → Pantalla conexión (auto-reconecta último dispositivo si existe)
2. Si no hay dispositivo guardado → Escanea LAN o ingresa IP manualmente → Toca **Conectar**
3. Navega a pantalla control → Ve estado actual (power, mode, valores)
4. Toca botón **Power** → Dispositivo enciende/apaga; UI actualiza en < 500 ms
5. Selecciona modo (Auto, Manual, Eco, Boost) → Comando enviado; badge de modo cambia
6. Ajusta slider de setpoint → Valor enviado al soltar el dedo (debounce 300 ms)

### Flujo reconexión

1. Se pierde WiFi o el dispositivo no responde
2. Banner rojo "Desconectado" aparece en parte superior
3. App reintenta conexión cada 5 s (máx. 3 intentos)
4. Usuario puede tocar **Reintentar** manualmente

### Flujo sin dispositivo (DEV mock)

1. En ajustes, activar "Modo demo"
2. App usa `mockDevice.ts` — misma UI, datos simulados
3. Permite validar flujos sin hardware Vissius

## Identidad visual

### Paleta de colores

| Token | Hex | Uso |
|-------|-----|-----|
| `background` | `#0D1117` | Fondo principal — gris oscuro |
| `surface` | `#161B22` | Tarjetas, paneles |
| `primary` | `#238636` | Power ON, conexión OK — verde |
| `primaryDark` | `#1A7F37` | Estados pressed del verde |
| `accent` | `#388BFD` | Modos activos, links — azul |
| `accentGlow` | `#388BFD40` | Glow en modo seleccionado |
| `danger` | `#DA3633` | Power OFF visual, errores, desconectado |
| `warning` | `#D29922` | Reconectando, estado intermedio |
| `button` | `#21262D` | Botones secundarios |
| `buttonPrimary` | `#238636` | Botón power ON |
| `textPrimary` | `#E6EDF3` | Textos principales |
| `textSecondary` | `#8B949E` | Labels, valores secundarios |
| `border` | `#30363D` | Bordes, divisores |

### Tipografía

| Uso | Fuente | Peso | Tamaño |
|-----|--------|------|--------|
| Título app | System (sans) | 700 | 24 sp |
| Valor de estado | System (monospace) | 600 | 32 sp |
| Botones / modos | System | 600 | 16 sp |
| Labels | System | 400 | 14 sp |

### Iconografía

- Estilo: outline, trazo 2 px, color `textPrimary` o `accent`
- Power: círculo con línea vertical (estándar IEC)
- Modos: iconos distintos por modo (hoja Eco, rayo Boost, engranaje Manual, ciclo Auto)
- Conexión: icono WiFi con badge verde/rojo

## Componentes UI

| Componente | Comportamiento visual |
|------------|----------------------|
| `PowerButton` | Círculo grande (120 dp); verde brillante si ON, gris/rojo si OFF; animación scale al pulsar |
| `ModeSelector` | Chips horizontales; modo activo con fondo `accent` y borde glow |
| `StatusPanel` | Tarjeta con filas clave-valor; valores numéricos en monospace |
| `ParameterSlider` | Track `border`, thumb `accent`; label con valor actual arriba |
| `ConnectionBanner` | Barra fija superior: verde "Conectado" / rojo "Desconectado" / amarillo "Reconectando…" |

## Animaciones

- Transición power ON/OFF: scale 0.95 → 1.0 (150 ms)
- Cambio de modo: fade del chip anterior → highlight del nuevo (200 ms)
- Banner conexión: slide-down desde top (250 ms)
