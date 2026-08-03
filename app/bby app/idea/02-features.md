# Funcionalidades

## Funcionalidades principales

- [ ] **Encender / apagar linterna** — Botón principal que activa/desactiva el flash LED del teléfono
- [ ] **Control de intensidad** — Slider o selector para regular la intensidad de la luz (0–100%)
- [ ] **Modo SOS** — Señal de emergencia con patrón Morse internacional: `··· ——— ···` (3 cortos, 3 largos, 3 cortos), repetido en bucle
- [ ] **Indicador de estado** — Feedback visual claro: linterna apagada, encendida continua o en modo SOS
- [ ] **Detección de hardware** — Verificar disponibilidad de flash al iniciar; mensaje informativo si el dispositivo no tiene LED
- [ ] **Persistencia de preferencias** — Recordar última intensidad seleccionada entre sesiones

## Modo SOS — Especificación técnica

Patrón Morse estándar de emergencia:

| Elemento | Duración | Repeticiones |
|----------|----------|--------------|
| Punto (·) | 200 ms ON / 200 ms OFF | 3 |
| Pausa intra-grupo | 200 ms OFF | — |
| Raya (—) | 600 ms ON / 200 ms OFF | 3 |
| Pausa intra-grupo | 200 ms OFF | — |
| Punto (·) | 200 ms ON / 200 ms OFF | 3 |
| Pausa entre ciclos | 1000 ms OFF | — |

> El ciclo completo se repite hasta que el usuario desactive SOS o active la linterna continua.

## Control de intensidad — Comportamiento

| Rango | Comportamiento |
|-------|----------------|
| 100% | Flash LED a máxima potencia nativa |
| 50% | Intensidad media (torch strength nativo si disponible; fallback: duty cycle simulado) |
| 0% | Flash apagado (equivalente a OFF) |

> En dispositivos Android 13+ (API 33+) con soporte de `torch strength`, usar API nativa. En dispositivos anteriores, simular intensidad mediante PWM software (ciclos ON/OFF rápidos) documentado en arquitectura.

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
