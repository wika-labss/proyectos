---
id: "FEAT-001"
title: "Geo Empresa — Features V1 seguridad de flota"
status: "APROBADO"
version: "2.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-08-27"
updated_at: "2026-09-24"
audit_1_passed: true
---

# [02] Especificación de Características y Requerimientos Funcionales

> **Gate 1:** este documento se aprueba **junto con** `01-problem.md`.  
> **Equivalencia:** Auditoría de Documentación → `audits/auditoria-documentacion.md`.  
> El Gate 2 vive en `03-module-discovery.md`.  
> Un agente IA no activa `audit_1_passed`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** Geo Empresa
- **Documento base:** `idea/01-problem.md` (ID: `PROB-001`)
- **Estado de gatekeeping:** `AUDIT_1_APROBADO`

---

## 2. Matriz de Trazabilidad de Requerimientos (RTM 1:1)

| ID Feature | ID Problema (`01-problem.md`) | Nombre de la Característica | Prioridad | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-01` | `ERR-01`, `ERR-02` | Registro único del dispositivo | `Crítica` | `mod-registration` |
| `FEAT-02` | `ERR-03` | Agente de ubicación en background | `Crítica` | `mod-location-agent` |
| `FEAT-03` | `ERR-04` | Geocerca 120 m | `Crítica` | `mod-fence-engine` |
| `FEAT-04` | `ERR-05` | Estado teléfono encendido/apagado (inferido) | `Alta` | `mod-device-state` |
| `FEAT-05` | `ERR-06` | Snapshot del dispositivo (agente) | `Alta` | `mod-api` |
| `FEAT-06` | `ERR-08` | Device Owner + receiver + anti-uninstall | `Crítica` | `mod-device-policy` |
| `FEAT-07` | `ERR-07` | Lock automático al salir de perímetro | `Crítica` | `mod-device-policy` |
| `FEAT-08` | `ERR-09`, `ERR-11` | Cola de comandos lock / unlock_policy / reset_pin / reboot | `Crítica` | `mod-command-agent` |
| `FEAT-09` | `ERR-11` | Reportar política Owner / admin / último lock | `Alta` | `mod-device-state`, `mod-api` |
| `FEAT-10` | `ERR-10` | Panel web TI (aprobar, monitorear, comandos) | `Crítica` | `mod-admin-web` |
| `FEAT-11` | `ERR-10` | Auth TI (`perfiles.rol = ti`) | `Crítica` | `mod-admin-auth` |

---

## 3. Funcionalidades Obligatorias

### Feature `FEAT-01`: Registro único

**Descripción:** Pantalla única al instalar. Crea o actualiza la fila en `dispositivos` por `device_fingerprint`. El registro queda en `estado_enrollment = pendiente` hasta que TI aprueba (`FEAT-10`).

| Campo UI | Campo Supabase | Tipo |
| :--- | :--- | :--- |
| Nombre del teléfono | `nombre_registrado` | text |
| (auto) ID dispositivo | `device_fingerprint` | text |
| (auto) Modelo | `modelo` | text |
| Latitud base | `base_lat` | float |
| Longitud base | `base_lng` | float |
| Radio (default 120) | `radio_metros` | int |

**RPC:** `registrar_dispositivo`

#### Escenario 1.1: Flujo exitoso (Happy Path)

- **Dado que** hay red y permisos de ubicación
- **Cuando** el colaborador confirma registro
- **Entonces** la RPC retorna `id`, coordenadas base y `estado_enrollment = pendiente`

#### Escenario 1.2: Manejo de errores

- **Dado que** no hay red o fallan permisos
- **Cuando** intenta confirmar
- **Entonces** no se crea fila falsa; feedback de error con token `error`; puede reintentar

---

### Feature `FEAT-02`: Background location

**Descripción:** Tras registro, la UI puede minimizarse. El agente envía GPS cada 10 min (rango configurable 5–15). Cada ping llama `reportar_ubicacion`.

#### Escenario 2.1: Happy path

- **Dado que** el dispositivo ya está registrado
- **Cuando** vence el intervalo
- **Entonces** se envía lat/lng/precisión/`telefono_encendido` y se actualizan flags + histórico

#### Escenario 2.2: Sin red

- **Dado que** el ping no alcanza Supabase
- **Cuando** falla el POST
- **Entonces** no crashea; reintenta en el siguiente ciclo

---

### Feature `FEAT-03`: Geocerca

**Descripción:** Haversine en Postgres (`distancia_metros`). `dentro_perimetro = distancia_base_m <= radio_metros`. Default `radio_metros = 120`.

#### Escenario 3.1: Fuera de perímetro

- **Dado que** la distancia a la base supera 120 m
- **Cuando** llega un ping
- **Entonces** `dentro_perimetro = false` en dispositivo e histórico

#### Escenario 3.2: Dentro

- **Dado que** la distancia es ≤ radio
- **Cuando** llega un ping
- **Entonces** `dentro_perimetro = true`

---

### Feature `FEAT-04`: Estado del teléfono (inferido)

**Descripción:** No apaga ni enciende el hardware. Infiera si el agente está vivo.

| Valor | Significado |
| :--- | :--- |
| `telefono_encendido = true` | Dispositivo operativo, agente vivo / ping reciente |
| `telefono_encendido = false` | Sin señal prolongada, agente detenido, o se asume apagado |

#### Escenario 4.1

- **Dado que** el agente reporta
- **Cuando** llama `reportar_ubicacion` con `p_telefono_encendido`
- **Entonces** el flag se persiste en estado e histórico

`PowerManager.shutdown()` queda fuera de alcance (no es API pública).

---

### Feature `FEAT-05`: Snapshot agente

**Descripción:** `obtener_dispositivo(fingerprint)` — consulta local del propio equipo, sin escribir histórico.

#### Escenario 5.1

- **Dado que** el fingerprint existe
- **Cuando** el agente consulta
- **Entonces** recibe nombre, flags, distancia, `estado_enrollment`, `politica_autolock`, `ultimo_ping_at`

---

### Feature `FEAT-06`: Device Owner + anti-uninstall

**Descripción:** Módulo nativo Kotlin (`DeviceAdminReceiver` + config plugin que mergea receiver y `device_admin.xml`). Device Owner se provisiona con factory reset + QR / `adb shell dpm set-device-owner`. Impide desinstalar el agente. Un Device Admin “aceptar diálogo” **no** cumple esta feature.

#### Escenario 6.1: Owner activo

- **Dado que** el package `com.wika.geoempresa` es Device Owner
- **Cuando** el colaborador intenta desinstalar
- **Entonces** el sistema lo impide

#### Escenario 6.2: Sin Owner

- **Dado que** la app es sideload común
- **Cuando** arranca
- **Entonces** UI “no enrolado”; `es_device_owner = false`; no se aplica lock

---

### Feature `FEAT-07`: Lock automático al salir de perímetro

**Descripción:** Si `estado_enrollment = aprobado`, `es_device_owner = true` y `politica_autolock = true`, `reportar_ubicacion` responde `debe_bloquear = true` cuando `dentro_perimetro = false`. El agente llama `DevicePolicyManager.lockNow()`. `src/engine/` solo decide; el nativo ejecuta.

#### Escenario 7.1: Happy path

- **Dado que** el dispositivo aprobado está fuera de 120 m con auto-lock
- **Cuando** llega el ping
- **Entonces** el agente ejecuta `lockNow()` y reporta `ultimo_lock_at`

#### Escenario 7.2: No aprobado o política liberada

- **Dado que** `estado_enrollment != aprobado` o `politica_autolock = false`
- **Cuando** está fuera de perímetro
- **Entonces** `debe_bloquear = false`; no se llama `lockNow()`

---

### Feature `FEAT-08`: Cola de comandos

**Descripción:** Tabla `comandos_dispositivo`. Tipos: `lock` | `unlock_policy` | `reset_pin` | `reboot`. El agente hace poll cada 30–60 s (`obtener_comando_pendiente` + `acusar_comando`).

| Tipo | Efecto en el dispositivo |
| :--- | :--- |
| `lock` | `lockNow()` |
| `unlock_policy` | `politica_autolock = false`; no re-bloquea por geocerca hasta que TI la reactive (un `lock` o aprobación de política) |
| `reset_pin` | Owner: API 24–25 `resetPassword`; API 26+ `resetPasswordWithToken`. El colaborador desbloquea con el PIN que TI definió |
| `reboot` | `DevicePolicyManager.reboot(admin)` — solo Owner |

El PIN viaja en `payload` y **solo** lo lee la RPC agente SECURITY DEFINER acotada al fingerprint. `listar_comandos` (TI) no devuelve el PIN.

#### Escenario 8.1: Lock remoto

- **Dado que** hay comando `lock` pendiente
- **Cuando** el agente obtiene el comando
- **Entonces** bloquea y marca `ejecutado`

#### Escenario 8.2: Unlock + reset PIN

- **Dado que** TI envía `unlock_policy` y `reset_pin`
- **Cuando** el agente los ejecuta siendo Owner
- **Entonces** deja auto-lock y deja el PIN nuevo; acusa ambos

#### Escenario 8.3: Reboot sin Owner

- **Dado que** `isDeviceOwnerApp()` es false
- **Cuando** llega `reboot` o `reset_pin`
- **Entonces** acusa `fallido` con error; no crashea

#### Escenario 8.4: `lockNow()` no desbloquea

- **Dado que** el equipo está en lock screen
- **Cuando** TI quiere que el colaborador entre de nuevo
- **Entonces** usa `unlock_policy` + `reset_pin`; no existe “unlock mágico” del PIN viejo

---

### Feature `FEAT-09`: Reportar política

**Descripción:** `reportar_politica(fingerprint, owner, admin_activo, locked)` actualiza `es_device_owner`, `admin_activo`, `ultimo_lock_at`.

#### Escenario 9.1

- **Dado que** el módulo nativo lee Owner/admin
- **Cuando** el agente reporta
- **Entonces** TI ve esos flags en el panel

---

### Feature `FEAT-10`: Panel web TI

**Descripción:** Next.js en `admin/v1/`. Login, listado de flota, detalle, CTA: Aprobar, Bloquear, Liberar, Nuevo PIN, Reiniciar. Documenta el payload QR / `dpm set-device-owner`; **no** reemplaza el provisionamiento de Android.

#### Escenario 10.1: Otorgar permiso

- **Dado que** un dispositivo está `pendiente`
- **Cuando** TI pulsa Aprobar
- **Entonces** `aprobar_dispositivo` lo deja `aprobado`

#### Escenario 10.2: Monitoreo

- **Dado que** TI está autenticado
- **Cuando** abre flota / detalle
- **Entonces** ve nombre, distancia, `dentro_perimetro`, `telefono_encendido`, Owner, admin, `ultimo_ping_at`, enrollment

#### Escenario 10.3: Comando

- **Dado que** el dispositivo está `aprobado`
- **Cuando** TI solicita `lock` / `unlock_policy` / `reset_pin` / `reboot`
- **Entonces** se inserta comando `pendiente` y el panel muestra estado hasta `ejecutado` o `fallido`

#### Escenario 10.4: Sin sesión

- **Dado que** no hay JWT TI
- **Cuando** se llama una RPC admin
- **Entonces** se rechaza; redirect a login

---

### Feature `FEAT-11`: Auth TI

**Descripción:** Supabase Auth. Tabla `perfiles` (`id = auth.uid()`, `rol` check `ti`). Las RPCs admin exigen JWT + rol. El agente **no** usa esas RPCs (sigue anon acotado a fingerprint).

#### Escenario 11.1

- **Dado que** el usuario tiene `perfiles.rol = ti`
- **Cuando** inicia sesión en el panel
- **Entonces** puede listar flota y emitir comandos

#### Escenario 11.2

- **Dado que** el JWT no es TI o es anon
- **Cuando** llama `listar_flota` / `solicitar_comando`
- **Entonces** la RPC niega acceso

---

## 4. Funcionalidades Deseables (V1.1+)

| ID Feature | Nombre | Prioridad | Notas |
| :--- | :--- | :--- | :--- |
| `FEAT-12` | Alertas push al supervisor | `Media` | Sustituye o complementa polling |
| `FEAT-13` | Wipe remoto | `Media` | Fuera de V1; Device Owner wipe |
| `FEAT-14` | Reactivar `politica_autolock` desde panel (CTA dedicado) | `Baja` | V1 puede reactivar vía `lock` + flag en `solicitar_comando` |
| `FEAT-15` | Multi-tenant / varias compañías | `Baja` | Un solo proyecto Supabase en V1 |
| `FEAT-16` | iOS | `Baja` | MDM distinto; fuera de Android Owner |

---

## 5. Fuera de Alcance

- iOS.
- BYOD (teléfono personal).
- Wipe / factory reset remoto.
- Push notifications.
- Apagado completo de hardware.
- Play Store consumidor.
- Device Admin opcional como sustituto de Device Owner.
- Multi-tenant.
- Construcción de `iterations/v1/` o deploy del panel antes de `ready_for_construction: true`.

---

## 6. Requerimientos No Funcionales (NFRs) Medibles

| ID NFR | Categoría | Criterio aceptable | Método de validación |
| :--- | :--- | :--- | :--- |
| `NFR-01` | **Rendimiento** | Engine smoke tests pasan en &lt; 30s | `npm run verify` (post-construcción) |
| `NFR-02` | **Build** | APK release compila sin Metro; panel Next typecheck | `scripts/build-apk.sh` + `admin/v1` typecheck |
| `NFR-03` | **Fidelidad visual** | 100% tokens documentados en `04` | Revisión `theme.ts` |
| `NFR-04` | **Red agente** | Ping 10 min; comandos 30–60 s | Reloj del agente + logs |
| `NFR-05` | **Seguridad** | PIN de reset no aparece en listados TI ni en `ubicacion_reportes` | Revisión SQL + RPC |
| `NFR-06` | **Toolchain** | Expo `~52`, RN `~0.76`, JDK 17, Kotlin 1.9.25, minSdk 24 | `05-build-plan.md` |

---

## 7. Mapeo de UI y Componentes (si aplica)

| Componente UI | Pantalla / Vista | Tokens (`04-application-design.md`) | Estado mockup |
| :--- | :--- | :--- | :--- |
| `RegisterForm` | Agente `/register` | `surface`, `accent`, `text` | ASCII en `04` |
| `EnrollmentBanner` | Agente `/` | `error` / `accent` | ASCII en `04` |
| `FleetTable` | Panel `/` | `surface`, `border`, `text` | ASCII en `04` |
| `DeviceDetail` | Panel `/dispositivos/[id]` | `surface`, `accent`, `error` | ASCII en `04` |
| `CommandButtons` | Detalle TI | `accent`, `error` | ASCII en `04` |
| `LoginForm` | Panel `/login` | `background`, `accent` | ASCII en `04` |

---

## 8. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist

- [x] Frontmatter YAML vinculado a `PROB-001`.
- [x] RTM 1:1 con IDs `ERR-XX` de `01-problem.md`.
- [x] Escenarios BDD por feature obligatoria.
- [x] NFRs con métricas verificables.
- [x] Deseables y fuera de alcance diferenciados.
- [x] `audits/auditoria-documentacion.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `Vissiuss`
- **Fecha:** `2026-09-24`
- **audit_1_passed:** `true`
