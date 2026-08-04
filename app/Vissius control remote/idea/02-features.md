# Funcionalidades

## Iteración v2 — cambios respecto a v1

| Área | v1 | v2 |
|------|----|----|
| Discovery | Mock (2 TVs simuladas) | **Escaneo LAN real** (Vissius HTTP + Roku ECP) |
| Pantalla inicio | Emparejamiento directo | **Splash Vissiuss** (negro, texto blanco, marca de agua) |
| Navegación mando | Solo tabs | **Botón atrás** → volver a buscar otra TV |
| Volumen | Subir/bajar sin rango | **0–100**, **0 = mute** |
| Feedback | Banner estado | **Aviso sin TVs** + **mensaje conexión exitosa** |
| Perfil build | BUILD APK release | BUILD APK release (target **v2**) |

---

## Funcionalidades principales

### Pantalla de inicio (v2)

- [ ] **Splash Vissiuss** — Fondo negro `#000000`, nombre **Vissiuss** en blanco `#FFFFFF`, marca de agua semitransparente
- [ ] Transición automática a emparejamiento tras ~2 s (o tap para continuar)

### Conexión y emparejamiento

- [ ] **Detección de red WiFi** — Verificar WiFi; no bloquear escaneo si el módulo reporta UNKNOWN (Android release)
- [ ] **Buscar televisor real** — Escanear subred LAN y detectar TVs (protocolo Vissius `:8080`, Roku `:8060`)
- [ ] **Aviso sin TVs** — Mensaje claro si el escaneo no encuentra dispositivos
- [ ] **Emparejar con TV** — Conexión HTTP real con el televisor seleccionado
- [ ] **Conexión exitosa** — Mensaje visible: *Conectado exitosamente a {nombre TV}*
- [ ] **Recordar TV emparejada** — AsyncStorage + reconexión al abrir
- [ ] **Estado de conexión** — buscando / conectado / desconectado / error

### Control remoto — Pantalla principal

- [ ] **Botón atrás (UI)** — Desde mando, volver a pantalla de emparejamiento para buscar otra TV
- [ ] **Botones de navegación** — Pad ▲ ▼ ◄ ► OK + Atrás (comando TV)
- [ ] **Control de volumen 0–100** — Vol + / Vol −; **nivel 0 = mute**; indicador numérico y estado Mute

### Segunda pantalla — Apps de streaming

- [ ] Netflix, HBO, YouTube, Crunchyroll — comandos reales vía driver de TV

## Layout de pantallas

| Pantalla | Contenido |
|----------|-----------|
| **Inicio (splash)** | Negro, Vissiuss blanco, marca de agua |
| **Emparejamiento** | Buscar TV real, lista, aviso sin resultados, conectar |
| **Mando** | Pad + volumen 0–100 + botón **Cambiar TV** |
| **Apps** | Netflix, HBO, YouTube, Crunchyroll |

## Priorización v2

| Prioridad | Funcionalidad |
|-----------|---------------|
| P0 | Discovery LAN real + conexión funcional |
| P0 | Splash inicio Vissiuss |
| P0 | Botón volver a emparejamiento |
| P0 | Volumen 0–100, mute en 0 |
| P0 | Mensajes sin TV / conexión exitosa |
| P0 | Paleta mando según `04-design.md` |
| P1 | Reconexión automática |
| P1 | Feedback háptico |

## Fuera de alcance (v2)

- iOS
- Control remoto fuera de LAN
- Emparejamiento Bluetooth
- Todas las marcas de TV del mercado (v2: Vissius HTTP + Roku; más drivers en v3)
