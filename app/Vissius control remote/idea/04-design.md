# Diseño

## Experiencia de usuario

La app debe sentirse como un **mando remoto digital** simple y directo. Dos pantallas claras: una para navegar y controlar volumen, otra para lanzar apps de streaming. Interacción con una sola mano; botones grandes y legibles sobre fondo de color sólido.

Principios UX:
- **Dos pantallas, un propósito cada una** — Mando vs Apps de streaming
- **Botones obvios** — Negro sobre fondo coral/rojo; texto blanco siempre legible
- **Sin decoración innecesaria** — Colores sólidos, sin gradientes complejos ni sombras pesadas
- **Accesibilidad** — Targets táctiles ≥ 48×48 dp; contraste alto botón negro / texto blanco

## Estilo visual

Estética **bold y minimalista**: fondos en colores sólidos cálidos, botones negros con texto blanco. Sin modo oscuro alternativo en v1 — la identidad visual es fija.

## Paleta de colores (obligatoria)

### Fondos — colores sólidos

| Token | Hex | Uso |
|-------|-----|-----|
| `backgroundSoft` | `#F7B9AD` | Fondo principal — salmón/coral claro |
| `backgroundStrong` | `#E83A17` | Fondo de secciones, header, tab activo — rojo intenso |

Distribución sugerida:
- Zona superior / header: `#E83A17`
- Zona de contenido / cuerpo: `#F7B9AD`
- Alternativa válida: pantalla completa `#F7B9AD` con barra inferior `#E83A17`

> **Regla:** solo estos dos colores para fondos. No usar otros colores de fondo en v1.

### Botones — negro y blanco (obligatorio)

| Token | Hex | Uso |
|-------|-----|-----|
| `buttonBackground` | `#000000` | Fondo de **todos** los botones |
| `buttonText` | `#FFFFFF` | Texto e iconos sobre botones |
| `buttonPressed` | `#1A1A1A` | Estado pressed (opcional, casi negro) |

> **Regla:** todos los botones (navegación, volumen, apps) usan fondo negro y texto/icono blanco. Sin excepciones en v1.

### Textos sobre fondo (no botones)

| Token | Hex | Uso |
|-------|-----|-----|
| `textOnSoft` | `#000000` | Textos sobre `#F7B9AD` |
| `textOnStrong` | `#FFFFFF` | Textos sobre `#E83A17` |

## Pantallas / Vistas

| Pantalla | Descripción |
|----------|-------------|
| **Emparejamiento** | Fondo `#F7B9AD`; lista de TVs encontradas; botón negro "Buscar TV" / "Conectar" |
| **Mando (principal)** | Pad de navegación central + botones volumen; fondo según distribución de paleta |
| **Apps (segunda pantalla)** | Cuatro botones grandes: Netflix, HBO, YouTube, Crunchyroll — todos negro/blanco |
| **Barra inferior** | Tabs "Mando" / "Apps"; tab activo sobre `#E83A17`, inactivo sobre `#F7B9AD` |

## Componentes UI

### Botones de navegación

Layout tipo cruceta (D-pad):

```text
        [ ▲ Arriba ]
[ ◄ ]   [  OK  ]   [ ► ]
        [ ▼ Abajo ]
              [ ← Atrás ]
```

- Cada botón: fondo `#000000`, texto/icono `#FFFFFF`
- Forma: rectángulo con bordes redondeados (radio 8–12 dp) o círculo para OK
- Tamaño mínimo: 56×56 dp

### Botones de volumen

```text
[  + Volumen  ]    [  − Volumen  ]
```

- Misma regla: negro / blanco
- Ubicación: debajo del pad de navegación o en columna lateral derecha
- Labels: "Vol +" y "Vol −" o iconos +/−

### Botones de apps (segunda pantalla)

Cuatro botones apilados o en grid 2×2:

| Botón | Label |
|-------|-------|
| Netflix | `Netflix` |
| HBO | `HBO` |
| YouTube | `YouTube` |
| Crunchyroll | `Crunchyroll` |

- Fondo `#000000`, texto `#FFFFFF`
- Ancho completo o 50% según grid; altura mínima 64 dp
- Sin logos oficiales en v1 (solo texto); logos en iteración futura si hay licencia

## Flujos de usuario

### Flujo principal — Emparejar y controlar

1. Usuario abre la app → Pantalla emparejamiento (fondo `#F7B9AD`)
2. Toca botón negro **Buscar TV** → App escanea red WiFi
3. Selecciona TV de la lista → Toca **Conectar** → Estado "Conectado"
4. Navega a pantalla **Mando** → Usa pad direccional y volumen
5. Cambia a tab **Apps** → Toca Netflix (u otra) → App se abre en la TV

### Flujo reconexión

1. Usuario abre app con TV ya emparejada → Reconexión automática
2. Si falla → Mensaje sobre fondo `#F7B9AD` + botón negro **Reintentar**

## Tipografía

| Uso | Fuente | Peso | Color |
|-----|--------|------|-------|
| Título pantalla | System sans | 700 | `#FFFFFF` sobre `#E83A17` o `#000000` sobre `#F7B9AD` |
| Botones | System sans | 600 | `#FFFFFF` |
| Labels secundarios | System sans | 400 | `#000000` sobre fondo claro |

## Animaciones

- Press de botón: opacidad 0.85 o escala 0.97 (100 ms) — sutil, sin distraer
- Cambio de tab Mando/Apps: fade o slide horizontal (200 ms)
