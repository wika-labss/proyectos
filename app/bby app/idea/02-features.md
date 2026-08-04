# Funcionalidades

## Funcionalidades principales

- [ ] **Encender / apagar linterna** — Botón principal que activa/desactiva el flash LED del teléfono
- [ ] **Control de intensidad** — Slider o selector para regular la intensidad de la luz (0–100%)
- [ ] **Modo SOS** — Señal de emergencia con patrón Morse internacional: `··· ——— ···` (3 cortos, 3 largos, 3 cortos), repetido en bucle
- [ ] **Indicador de estado** — Feedback visual claro: linterna apagada, encendida continua o en modo SOS
- [ ] **Detección de hardware** — La disponibilidad se asume al conceder el permiso de cámara y se degrada si `CameraView` falla al montarse (sin LED o cámara ocupada). Pantalla informativa con botón **Reintentar**. Android no ofrece ninguna API JS para consultar la presencia del flash
- [ ] **Persistencia de preferencias** — Recordar última intensidad seleccionada entre sesiones (guardado con debounce de 400 ms)

## Modo SOS — Especificación técnica

Patrón Morse estándar de emergencia. Unidad base = 200 ms.

| Elemento | Duración | Unidades |
|----------|----------|----------|
| Punto (·) ON | 200 ms | 1 |
| Raya (—) ON | 600 ms | 3 |
| Pausa entre símbolos de una letra | 200 ms OFF | 1 |
| Pausa entre letras (S→O→S) | 600 ms OFF | 3 |
| Pausa entre ciclos | 1200 ms OFF | 6 |

Secuencia resultante (21 pasos, ciclo completo de **6600 ms**):

```text
· · ·   [600 ms]   — — —   [600 ms]   · · ·   [1200 ms]
```

> Las pausas entre letras son obligatorias: sin ellas el patrón no es reconocible como SOS.
> El ciclo se repite hasta que el usuario desactive SOS o apague la linterna.

## Control de intensidad — Comportamiento

v1 implementa **PWM software** sobre el torch de `expo-camera`. No usa la API nativa de
`torch strength` (fuera de alcance en v1).

| Valor slider | Comportamiento |
|--------------|----------------|
| 100% | Flash LED encendido de forma continua (máxima potencia) |
| 21–99% | PWM software: ciclo de 20 ms con duty cycle proporcional |
| 1–20% | PWM al duty mínimo alcanzable (~20%) |
| 0% | Flash apagado (equivalente a OFF) |

### Límites conocidos del PWM

- Los timers de React Native no disparan de forma fiable por debajo de ~4 ms, por lo que
  cada pulso se acota a `[4 ms, 16 ms]` dentro del período de 20 ms.
- El duty cycle efectivo queda entre **20% y 80%**; valores fuera de ese rango saturan.
- La atenuación percibida depende del hardware: algunos LED responden con parpadeo en
  lugar de atenuación suave.
- Pulsar el botón principal con el slider en 0% eleva la intensidad al mínimo visible (25%)
  en lugar de no hacer nada.

## Funcionalidades secundarias

- [ ] **Pantalla siempre encendida** — Mantener la pantalla activa mientras la linterna o SOS esté activo
- [ ] **Feedback háptico** — Vibración breve al encender/apagar y al activar SOS
- [ ] **Pantalla como luz auxiliar** — Overlay blanco en pantalla como luz complementaria (opcional, intensidad vinculada al slider)

## Priorización

| Prioridad | Funcionalidad | Descripción |
|-----------|---------------|-------------|
| P0 | Encender/apagar flash | Core de la app; sin esto no hay producto |
| P0 | Modo SOS | Requisito explícito del proyecto |
| P0 | Control de intensidad | Requisito explícito del proyecto |
| P0 | UI gótica | Estilo visual definido en `04-design.md` |
| P1 | Persistencia de intensidad | Mejora UX sin bloquear v1 |
| P1 | Detección de hardware | Evita crashes en dispositivos sin flash |
| P1 | Pantalla siempre encendida | Útil mientras la linterna está activa |
| P2 | Feedback háptico | Pulido de UX |
| P2 | Pantalla como luz auxiliar | Nice-to-have |

## Fuera de alcance (v1)

- Soporte iOS
- Linterna frontal (selfie flash)
- Widgets de pantalla de inicio
- Atajos por volumen o botón de encendido
- Modos de color de pantalla (rojo nocturno, etc.)
- Backend, cuentas de usuario o sincronización en la nube
- Publicidad o compras in-app
