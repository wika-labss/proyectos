# Funcionalidades

## Funcionalidades principales

### Conexión y emparejamiento

- [ ] **Detección de red WiFi** — Verificar que el móvil está conectado a una red WiFi antes de buscar TVs
- [ ] **Buscar televisor** — Escanear la red local o listar TVs disponibles para emparejar
- [ ] **Emparejar con TV** — Establecer conexión WiFi con el televisor seleccionado
- [ ] **Recordar TV emparejada** — Guardar la última TV conectada para reconexión automática
- [ ] **Estado de conexión** — Indicador claro: buscando / conectado / desconectado / error

### Control remoto — Pantalla principal

- [ ] **Botones de navegación** — Pad direccional con:
  - Arriba
  - Abajo
  - Izquierda
  - Derecha
  - OK / Seleccionar
  - Atrás (Back)
- [ ] **Control de volumen** — Dos botones dedicados:
  - **Subir volumen**
  - **Bajar volumen**

### Segunda pantalla — Apps de streaming

Pantalla separada del mando principal, dedicada a apps de streaming en la TV:

- [ ] **Netflix** — Botón para abrir/lanzar Netflix en el televisor
- [ ] **HBO** — Botón para abrir/lanzar HBO en el televisor
- [ ] **YouTube** — Botón para abrir/lanzar YouTube en el televisor
- [ ] **Crunchyroll** — Botón para abrir/lanzar Crunchyroll en el televisor

> Cada botón de app envía el comando correspondiente al televisor emparejado. Si la app no está instalada en la TV, mostrar mensaje informativo.

## Layout de pantallas

| Pantalla | Contenido |
|----------|-----------|
| **Emparejamiento** | Buscar TV en WiFi, listar dispositivos, conectar |
| **Mando (principal)** | Navegación + volumen |
| **Apps (segunda pantalla)** | Netflix, HBO, YouTube, Crunchyroll |

Navegación entre **Mando** y **Apps** mediante tabs o botón de cambio de pantalla en la parte inferior.

## Priorización

| Prioridad | Funcionalidad | Descripción |
|-----------|---------------|-------------|
| P0 | Emparejamiento WiFi con TV | Sin conexión no hay producto |
| P0 | Botones de navegación | Core del mando remoto |
| P0 | Volumen subir / bajar | Control básico esencial |
| P0 | Segunda pantalla de apps | Netflix, HBO, YouTube, Crunchyroll |
| P0 | Diseño según `04-design.md` | Paleta y botones obligatorios |
| P1 | Reconexión automática | Reconectar a última TV al abrir app |
| P1 | Feedback háptico | Vibración breve al pulsar botón |
| P2 | Indicador de app activa en TV | Mostrar qué app está abierta en el televisor |

## Fuera de alcance (v1)

- Soporte iOS
- Control fuera de la red WiFi local (internet remoto, VPN)
- Teclado virtual para búsqueda de texto en la TV
- Control por voz
- Emparejamiento Bluetooth
- Apps de streaming distintas a Netflix, HBO, YouTube y Crunchyroll
- Cuentas de usuario / login
- Publicidad o compras in-app
