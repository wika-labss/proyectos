# Funcionalidades

## Funcionalidades principales

- [ ] **Descubrimiento de dispositivos** — Escanear la red local o permitir entrada manual de IP/host del equipo Vissius
- [ ] **Conexión y emparejamiento** — Establecer sesión con el dispositivo; guardar último equipo conectado
- [ ] **Encender / apagar** — Botón principal de power con confirmación visual inmediata
- [ ] **Selector de modos** — Cambiar entre modos de operación definidos por el protocolo Vissius (ej. Auto, Manual, Eco, Boost)
- [ ] **Panel de estado** — Mostrar estado actual: conexión, encendido/apagado, modo activo, valores clave (temperatura, velocidad, etc.)
- [ ] **Controles deslizantes** — Ajustar parámetros numéricos (setpoint, velocidad, intensidad) con slider o stepper
- [ ] **Reconexión automática** — Reintentar conexión si se pierde el enlace WiFi; indicador de desconexión claro
- [ ] **Persistencia de preferencias** — Recordar último dispositivo, IP y último modo usado entre sesiones

## Protocolo de comunicación — Especificación v1

Comunicación con el dispositivo Vissius vía HTTP REST en puerto configurable (default `8080`).

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/status` | GET | Estado actual del dispositivo (power, mode, values) |
| `/api/power` | POST | `{ "on": true \| false }` — Encender/apagar |
| `/api/mode` | POST | `{ "mode": "auto" \| "manual" \| "eco" \| "boost" }` |
| `/api/setpoint` | POST | `{ "key": string, "value": number }` — Ajustar parámetro |
| `/api/discover` | GET | Respuesta de presencia (usado en escaneo LAN) |

> Si el protocolo real difiere, actualizar esta tabla antes de generar código. La documentación es contrato.

### Polling de estado

- Intervalo: **2 s** mientras la app está en primer plano y conectada
- Pausar polling en background o al desconectar
- Actualizar store global con respuesta de `/api/status`

## Funcionalidades secundarias

- [ ] **Feedback háptico** — Vibración breve al enviar comando exitoso o al fallar conexión
- [ ] **Historial de comandos** — Log local de últimos 20 comandos enviados (debug/UX)
- [ ] **Pantalla de configuración** — IP manual, puerto, timeout, reiniciar emparejamiento
- [ ] **Modo oscuro** — Tema oscuro por defecto; coherente con `04-design.md`

## Priorización

| Prioridad | Funcionalidad | Descripción |
|-----------|---------------|-------------|
| P0 | Conexión al dispositivo | Sin conexión no hay producto |
| P0 | Encender/apagar | Control básico esencial |
| P0 | Selector de modos | Requisito core del control remoto |
| P0 | Panel de estado | Feedback en tiempo real |
| P1 | Descubrimiento LAN | Mejora UX; IP manual como fallback |
| P1 | Controles deslizantes | Ajuste fino de parámetros |
| P1 | Persistencia | Reconexión rápida en sesiones siguientes |
| P2 | Feedback háptico | Pulido de UX |
| P2 | Historial de comandos | Utilidad para soporte/debug |

## Fuera de alcance (v1)

- Soporte iOS
- Control remoto fuera de LAN (VPN, cloud relay)
- Cuentas de usuario / autenticación multi-dispositivo
- Backend propio o sincronización en la nube
- Control por voz o widgets de pantalla de inicio
- Emparejamiento Bluetooth (solo WiFi en v1)
- Publicidad o compras in-app
