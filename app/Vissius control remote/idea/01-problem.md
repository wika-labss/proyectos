# Problema

## Contexto

Ver contenido en streaming desde el móvil en una TV es cada vez más habitual, pero los mandos físicos se pierden, se agotan las pilas o resultan incómodos de usar. Las apps oficiales de Netflix, HBO, YouTube o Crunchyroll en el teléfono no sustituyen un mando completo cuando se quiere navegar la interfaz del televisor desde el sofá.

Los usuarios necesitan una **segunda pantalla** en el móvil que funcione como control remoto del televisor, conectada por **WiFi**, sin depender de un mando físico.

## Problema a resolver

Crear una aplicación móvil que permita **conectar y emparejar** el teléfono con un televisor en la misma red WiFi, y usarlo como mando remoto con:

- Botones de **navegación** (direccionales y confirmación)
- Control de **volumen** (subir y bajar)
- Una **segunda pantalla** dedicada a abrir y controlar apps de streaming: **Netflix, HBO, YouTube y Crunchyroll**

## Usuarios objetivo

| Perfil | Necesidad |
|--------|-----------|
| Usuario doméstico | Controlar la TV desde el móvil sin buscar el mando físico |
| Usuario de streaming | Abrir Netflix, HBO, YouTube o Crunchyroll en la TV con un toque |
| Usuario en el sofá | Navegar menús del televisor y ajustar volumen con una mano |
| Usuario Android | App ligera, conexión WiFi local, sin configuración compleja en v1 |

## Restricciones

- **Plataformas:** Android (API 24+, Android 7.0+) — **v1 solo Android**
- **Conectividad:** Misma red WiFi que el televisor (LAN)
- **Emparejamiento:** Conexión y emparejamiento WiFi con la TV (protocolo a definir según modelo/marca)
- **Rendimiento:** Respuesta perceptible al pulsar botón (< 300 ms en LAN)
- **Almacenamiento:** Persistir TV emparejada entre sesiones
- **Tamaño de app:** < 25 MB instalado
- **Permisos:** `INTERNET`, `ACCESS_NETWORK_STATE`, `ACCESS_WIFI_STATE`

## Criterios de éxito

- [ ] El usuario puede conectar y emparejar el móvil con un televisor en la misma red WiFi
- [ ] Los botones de navegación mueven el foco en la interfaz del televisor
- [ ] Los botones de volumen suben y bajan el volumen del televisor
- [ ] Existe una segunda pantalla con acceso directo a Netflix, HBO, YouTube y Crunchyroll
- [ ] La interfaz usa la paleta definida en `04-design.md` (fondos `#F7B9AD` / `#E83A17`, botones negros con texto blanco)
- [ ] La TV emparejada se recuerda al reabrir la app
