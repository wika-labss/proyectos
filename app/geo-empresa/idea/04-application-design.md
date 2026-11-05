---
id: "DES-001"
title: "Geo Empresa — Diseño de aplicación"
status: "BORRADOR"
version: "1.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-09-28"
updated_at: "2026-09-28"
audit_1_passed: true
audit_2_passed: true
visual_approval_passed: false
audit_3_passed: false
---

# [04] Diseño de Aplicación, Navegación y Aprobación Visual

> **Pre-requisito:** `audit_2_passed: true` en `03-module-discovery.md`.  
> **Contrato de datos:** Supabase `geo-empresa` al 2026-09-24, documentado en `supabase/README.md`.  
> **Gate visual:** `visual_approval_passed` queda en `false` hasta el visto bueno del arquitecto.

## 1. Identificación y Antecedentes

- **Nombre del Proyecto:** Geo Empresa
- **Documentos base:** `01-problem.md` | `02-features.md` | `03-module-discovery.md`
- **Estado de gatekeeping:** `PENDIENTE_APROBACION_VISUAL`
- **Iteración prevista:** `iterations/v1/` (aún no existe)
- **Package:** `com.wika.geoempresa`

Dos superficies en la misma app Expo:

1. **Agente Android** — registro, espera de enrollment y servicio en background.
2. **Consola TI** — login, flota, aprobación y comandos. En V1 corre en el mismo binario, rutas `ti/*`, usable en web de Expo para el escritorio de TI.

---

## 2. Arquitectura General

```text
app/                         expo-router
  (agent)/                   registro, espera, estado
  ti/                        login, flota, detalle
src/engine/                  sin React: fence, deviceState, geoApi, commands
src/modules/                 registration, location-agent, device-policy, command-agent, ti-console
src/constants/theme.ts       tokens de este documento
```

- Red solo en `src/engine/geoApi.ts`.
- El engine no importa pantallas.
- Persistencia local del fingerprint y del nombre: AsyncStorage en `mod-registration-store`.
- Background Android: tarea periódica de 10 minutos. Cada ciclo llama `reportar_ubicacion`, `reportar_politica` y `obtener_comando_pendiente`.

---

## 3. Módulos Utilizados en V1

| ID Módulo | Nombre | Rol en V1 |
| :--- | :--- | :--- |
| `MOD-01` | `mod-registration` | Pantalla de alta y lectura del fingerprint |
| `MOD-02` | `mod-location-agent` | Ping GPS en background |
| `MOD-03` | `mod-fence-engine` | `isInsideFence` de apoyo; la verdad es Postgres |
| `MOD-04` | `mod-device-state` | `telefono_encendido` desde AppState |
| `MOD-05` | `mod-api` | Cliente HTTP de los RPC |
| `MOD-06` | `mod-registration-store` | Fingerprint y alta local |
| `MOD-07` | `mod-device-policy` | Ejecuta lock / PIN / reboot si hay Device Owner |
| `MOD-08` | `mod-command-agent` | Toma el comando pendiente y acusa resultado |
| `MOD-09` | `mod-ti-console` | Flota, detalle, aprobación y comandos |
| `MOD-10` | `mod-ti-auth` | Sesión Supabase del rol `ti` |

---

## 4. Relaciones entre Módulos

```text
Registro (MOD-01) → store (MOD-06) → registrar_dispositivo (MOD-05)
Espera / estado → obtener_dispositivo (MOD-05)
Background (MOD-02 + MOD-04) → reportar_ubicacion
        → si debe_bloquear y Device Owner: lock (MOD-07)
        → reportar_politica
        → comando pendiente (MOD-08) → MOD-07 → acusar_comando
Consola (MOD-09) solo con sesión TI (MOD-10)
```

`debe_bloquear` no se recalcula en el cliente. Se obedece el booleano del RPC.

---

## 5. Flujo Principal de Usuario

### Agente

```text
[/] sin alta local
  → permisos de ubicación
  → [/registro] nombre + GPS como base + radio 120
  → registrar_dispositivo
  → [/espera] mientras estado_enrollment = pendiente
  → [/estado] si aprobado (el servicio sigue con la app cerrada)
  → [/rechazo] si rechazado (sin lock, sin comandos)
```

Estados: loading del GPS, error de red, éxito de alta, vacío (sin fix GPS), pendiente, aprobado, rechazado.

### Consola TI

```text
[/ti/login] → listar_flota
  → vacío: "Sin dispositivos"
  → [/ti/flota]
  → [/ti/dispositivo/:id]
      Aprobar | Rechazar
      Lock | Quitar autolock | Nuevo PIN | Reiniciar
```

Estados: loading, error `forbidden` (sesión sin rol `ti`), success, empty.

---

## 6. Navegación (expo-router)

| Ruta | Pantalla | Módulos | Feature |
| :--- | :--- | :--- | :--- |
| `/` | Redirección según store y enrollment | `MOD-06`, `MOD-05` | `FEAT-01`, `FEAT-06` |
| `/registro` | Alta única | `MOD-01`, `MOD-06` | `FEAT-01` |
| `/espera` | Enrollment pendiente | `MOD-05` | `FEAT-06` |
| `/estado` | Snapshot del agente | `MOD-02`, `MOD-04`, `MOD-07` | `FEAT-02`, `FEAT-03`, `FEAT-04`, `FEAT-07` |
| `/rechazo` | Alta rechazada | `MOD-05` | `FEAT-06` |
| `/ti/login` | Email y contraseña | `MOD-10` | `FEAT-09` |
| `/ti/flota` | Listado | `MOD-09`, `MOD-10` | `FEAT-09` |
| `/ti/dispositivo/[id]` | Detalle, reportes y comandos | `MOD-09` | `FEAT-08`, `FEAT-09` |

El grupo `(agent)` no monta la consola. La consola no inicia el agente de ubicación.

---

## 7. Consumo de Tokens y Theme

Archivo previsto: `iterations/v1/src/constants/theme.ts`.

Tema local V1, nombres de `standards/design-system.md`. Pensado para leerse al sol en el alta y en un escritorio TI.

| Token semántico | Uso en app | Valor |
| :--- | :--- | :--- |
| `background` | Fondo | `#F4F6F8` |
| `surface` | Cards y sheets | `#FFFFFF` |
| `text` | Texto principal | `#121417` |
| `textMuted` | Secundario, metadatos | `#5C6770` |
| `accent` | CTA primario | `#0F6E6B` |
| `error` | Rechazo, fuera de perímetro, fallo de red | `#B42318` |
| `success` | Dentro de perímetro, comando ejecutado | `#067647` |
| `warning` | Enrollment pendiente | `#B54708` |
| `border` | Bordes de card e input | `#D0D5DD` |
| `spacing.md` | Padding de pantalla | `16` |
| `spacing.lg` | Separación de secciones | `24` |
| `radius.md` | Cards | `12` |
| `fontSize.md` | Cuerpo | `16` |
| `fontSize.lg` | Título de pantalla | `22` |

Touch target mínimo 44 dp. CTA a ancho completo, máximo 340 dp, centrado.

---

## 8. Matriz Preview Visual vs Componentes de Código

| ID Vista | ID Módulo | Componente / Pantalla | Tokens | Referencia |
| :--- | :--- | :--- | :--- | :--- |
| `VIEW-01` | `MOD-01` | `RegisterScreen` | `surface`, `accent` | Wireframe registro |
| `VIEW-02` | `MOD-05` | `PendingScreen` | `warning` | Wireframe espera |
| `VIEW-03` | `MOD-02` | `StatusScreen` | `success`, `error` | Wireframe estado |
| `VIEW-04` | `MOD-05` | `RejectedScreen` | `error` | Wireframe rechazo |
| `VIEW-05` | `MOD-10` | `TiLoginScreen` | `accent` | Wireframe login |
| `VIEW-06` | `MOD-09` | `FleetScreen` | `surface`, `warning` | Wireframe flota |
| `VIEW-07` | `MOD-09` | `DeviceAdminScreen` | `surface`, `error` | Wireframe detalle |

---

## 9. Layout Visual (wireframe)

### VIEW-01 Registro

```text
┌─────────────────────────────────────┐
│ Geo Empresa                         │
│ Alta del teléfono                   │
├─────────────────────────────────────┤
│ Nombre                              │
│ [ Telefono bodega 1            ]    │
│                                     │
│ Base                                │
│ -33.4489, -70.6693     [ Usar GPS ] │
│ Radio  120 m                        │
│                                     │
│ [        Registrar         ]        │
└─────────────────────────────────────┘
```

Modelo y fingerprint no se editan. El botón queda deshabilitado sin nombre (≥ 2) o sin coordenadas.

### VIEW-02 Espera

```text
┌─────────────────────────────────────┐
│ Telefono bodega 1                   │
│                                     │
│         Pendiente de TI             │
│   El agente ya reporta ubicación.   │
│   El bloqueo espera la aprobación.  │
│                                     │
│ [        Actualizar        ]        │
└─────────────────────────────────────┘
```

### VIEW-03 Estado

```text
┌─────────────────────────────────────┐
│ Telefono bodega 1          Aprobado │
├─────────────────────────────────────┤
│  Dentro · 18 m de 120 m             │
│  Encendido · último ping 10:42      │
│  Device Owner activo                │
│  Autolock activo                    │
├─────────────────────────────────────┤
│ El servicio sigue en segundo plano. │
└─────────────────────────────────────┘
```

Fuera de perímetro: la franja usa `error` y el texto «Fuera · debe bloquear» solo si el RPC devolvió `debe_bloquear`.

### VIEW-04 Rechazo

```text
┌─────────────────────────────────────┐
│ Alta rechazada                      │
│ TI no autorizó este teléfono.       │
│ El agente no bloquea ni toma        │
│ comandos.                           │
└─────────────────────────────────────┘
```

### VIEW-05 Login TI

```text
┌─────────────────────────────────────┐
│ Consola TI                          │
│ [ email                        ]    │
│ [ contraseña                   ]    │
│ [         Entrar           ]        │
└─────────────────────────────────────┘
```

### VIEW-06 Flota

```text
┌─────────────────────────────────────┐
│ Flota                      [Salir]  │
├─────────────────────────────────────┤
│ Telefono bodega 1                   │
│ Pendiente · sin ping                │
├─────────────────────────────────────┤
│ Telefono Juan                       │
│ Aprobado · Fuera · 145 m            │
└─────────────────────────────────────┘
```

Card pendiente usa `warning`. Fuera de perímetro usa `error`. Lista vacía: «Sin dispositivos».

### VIEW-07 Detalle

```text
┌─────────────────────────────────────┐
│ Telefono Juan                       │
│ Aprobado · Owner sí · Autolock sí   │
│ 145 m · ping 10:42                  │
│ [ Aprobar ]  [ Rechazar ]           │
├─────────────────────────────────────┤
│ [ Bloquear ] [ Quitar autolock ]    │
│ [ Nuevo PIN ] [ Reiniciar ]         │
├─────────────────────────────────────┤
│ Comandos                            │
│ lock · ejecutado · 10:40            │
├─────────────────────────────────────┤
│ Últimos reportes                    │
│ 10:42 · fuera · 145 m               │
└─────────────────────────────────────┘
```

`Nuevo PIN` abre un sheet con un campo numérico (mínimo 4). El valor no se guarda en el dispositivo de TI después del envío. Los botones de comando se deshabilitan si el enrollment no es `aprobado`.

---

## 10. Reglas de comportamiento que la UI debe respetar

| Regla | Origen |
| :--- | :--- |
| Alta nueva = `pendiente` | `registrar_dispositivo` |
| Re-registro no cambia el enrollment | `ON CONFLICT` vigente |
| Lock automático solo con `debe_bloquear` | `reportar_ubicacion` |
| Comandos solo sobre dispositivos aprobados | `solicitar_comando` |
| `lock` enciende `politica_autolock`; `unlock_policy` lo apaga | `solicitar_comando` |
| PIN solo viaja en el payload del comando pendiente y se borra al acusar éxito | `acusar_comando` |
| Sin Device Owner, el agente reporta `es_device_owner = false` y acusa el comando como fallido | `MOD-07` |
| Intervalo de ping V1: 10 min (rango permitido 5–15) | `FEAT-02` |

El aprovisionamiento Device Owner (QR o `dpm`) es un paso de instalación del teléfono corporativo, fuera de estas pantallas.

---

## 11. Riesgos de Diseño

| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| Android 14 limita ubicación en background | Alto | Permiso foreground service + explicación en el alta antes de registrar |
| Sin Device Owner el lock no puede cumplirse | Alto | La pantalla de estado lo muestra; el acuse marca `fallido` |
| PIN en `payload` hasta el acuse | Alto | No loguear el payload; el RPC lo limpia al éxito |
| `EXECUTE` de RPCs TI también figura para `anon` | Medio | `is_ti()` rechaza; revocar `anon` antes de construir la consola |
| Tema local vs pipeline `design-system/` | Bajo | V1 usa esta tabla; V3+ sincroniza tokens |

---

## 12. Puerta de Enlace — Aprobación Visual y Ensamblado

### Checklist aprobación visual (Gate 3A)

- [x] Navegación y flujo principal definidos.
- [x] Módulos V1 incorporados, incluidos los de flota.
- [x] Tokens/theme documentados.
- [ ] Wireframe revisado por arquitecto.
- [x] Sin dependencias circulares.

### Checklist auditoría de ensamblado (Gate 3B)

- [ ] `05-build-plan.md` coherente con este diseño.
- [ ] Estrategia de build y riesgos alineados.
- [ ] `audits/auditoria-ensamblado.md` en estado aprobado.

### Registro de visto bueno

- **Aprobación visual (Arquitecto / Stakeholder):** `________________________`
- **Fecha visual:** `YYYY-MM-DD`
- **visual_approval_passed:** `false`

- **Aprobación ensamblado (Arquitecto):** `________________________`
- **Fecha ensamblado:** `YYYY-MM-DD`
- **audit_3_passed:** `false`
