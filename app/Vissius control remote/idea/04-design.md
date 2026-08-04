# Diseño

## Experiencia de usuario

Mando remoto digital con flujo claro: **splash de marca → emparejar TV real → controlar → cambiar TV cuando quieras**.

## Paleta de colores (obligatoria)

### Pantalla de inicio (splash) — v2

| Token | Hex | Uso |
|-------|-----|-----|
| `splashBackground` | `#000000` | Fondo pantalla inicio |
| `splashText` | `#FFFFFF` | Nombre **Vissiuss** |
| `splashWatermark` | `#FFFFFF` @ 12% opacidad | Marca de agua grande detrás del título |

> La splash es la **única** pantalla con fondo negro. El resto mantiene coral/rojo v1.

### Fondos mando y emparejamiento (sin cambios v1)

| Token | Hex | Uso |
|-------|-----|-----|
| `backgroundSoft` | `#F7B9AD` | Cuerpo |
| `backgroundStrong` | `#E83A17` | Header, tab activo |

### Botones (sin cambios)

| Token | Hex |
|-------|-----|
| `buttonBackground` | `#000000` |
| `buttonText` | `#FFFFFF` |

## Pantallas / Vistas v2

| Pantalla | Descripción |
|----------|-------------|
| **Inicio** | Negro total; "Vissiuss" centrado blanco; watermark; fade a emparejamiento |
| **Emparejamiento** | Buscar TV, lista real, aviso amarillo si 0 TVs, banner éxito al conectar |
| **Mando** | Pad + volumen **0–100** (muestra "Mute" en 0) + botón negro **Cambiar TV** |
| **Apps** | Grid streaming (negro/blanco) |

## Mensajes de feedback (v2)

| Situación | Estilo | Texto ejemplo |
|-----------|--------|---------------|
| Sin TVs encontradas | Banner sobre `#E83A17`, texto blanco | *No se encontró ninguna TV en la red. Comprueba que el móvil y la TV están en la misma WiFi.* |
| Conexión exitosa | Banner verde oscuro `#1B5E20` o strong coral con ✓ | *Conectado exitosamente a Vissius TV — Salón* |
| Error conexión | Banner existente `ConnectionStatus` | *No se pudo conectar con la TV* |

## Volumen (v2)

```text
[  Vol −  ]   [  42  ]   [  Vol +  ]
              (Mute si 0)
```

- Rango **0–100** entero visible
- **0 = mute** — etiqueta "Mute" junto al número
- Subir desde 0 quita mute y sube a 5 (paso configurable)

## Flujos de usuario v2

### Flujo principal

1. Abrir app → **Splash Vissiuss** (negro)
2. → Emparejamiento → **Buscar TV**
3. TVs reales en lista **o** aviso sin resultados
4. **Conectar** → mensaje éxito → Mando
5. **Cambiar TV** (botón atrás) → desconecta → Emparejamiento

### Volver a buscar otra TV

1. En Mando (o Apps) → **Cambiar TV**
2. Desconecta TV actual, limpia mensajes
3. Pantalla emparejamiento lista para nuevo escaneo

## Tipografía splash

| Uso | Peso | Color | Tamaño |
|-----|------|-------|--------|
| Vissiuss | 700 | `#FFFFFF` | 36–40 sp |
| Watermark | 700 | blanco 12% | 120 sp |
