---
id: "DES-001"
title: "Geo Empresa — Diseño V1 agente + panel TI"
status: "BORRADOR"
version: "2.0.0"
owner: "Vissiuss / Arquitecto WIKA"
created_at: "2026-09-24"
updated_at: "2026-09-24"
audit_1_passed: false
audit_2_passed: false
visual_approval_passed: false
audit_3_passed: false
---

# [04] Diseño de Aplicación, Navegación y Aprobación Visual

> **Pre-requisito:** `audit_2_passed: true` en `03-module-discovery.md`. Hoy `false`.  
> **Gate visual:** `visual_approval_passed: true` solo lo firma el arquitecto/stakeholder.  
> Theme **local V1**. Pipeline `design-system/` diferido a V3+.  
> Hex **solo** en `theme.ts` (agente) y `admin/v1/src/theme.ts` (panel).

## 1. Identificación y Antecedentes

- **Nombre del Proyecto:** Geo Empresa
- **Documentos base:** `01-problem.md` | `02-features.md` | `03-module-discovery.md`
- **Estado de gatekeeping:** `PENDIENTE_APROBACION_VISUAL`
- **Dos superficies:** agente Android (`iterations/v1/`) y panel web TI (`admin/v1/`)

---

## 2. Arquitectura General

**Agente**

1. `app/` expo-router — registro y estado; sin fetch directo.
2. Hooks: location, command, policy status.
3. `src/engine/` — fence, deviceState, geoApi (sin React, sin Kotlin).
4. `src/modules/` — registration store, location-agent, command-agent.
5. `modules/device-policy` — Expo module Kotlin + config plugin.
6. `src/constants/theme.ts` — tokens de este documento.

**Panel**

1. `admin/v1/app/` — login, flota, detalle, enrollment.
2. `admin/v1/src/auth/` — `@supabase/ssr`.
3. `admin/v1/src/engine/adminApi.ts` — RPCs TI sin React.
4. `admin/v1/src/theme.ts` — mismos nombres semánticos que el agente.

---

## 3. Módulos Utilizados en V1

| ID Módulo | Nombre | Rol en V1 |
| :--- | :--- | :--- |
| `MOD-01` | `mod-registration` | Formulario alta |
| `MOD-02` | `mod-location-agent` | Ping 10 min |
| `MOD-03` | `mod-fence-engine` | Radio client-side |
| `MOD-04` | `mod-device-state` | Encendido inferido + shouldLock |
| `MOD-05` | `mod-api` | RPCs agente |
| `MOD-06` | `mod-registration-store` | Persist local |
| `MOD-07` | `mod-device-policy` | lock / reboot / PIN |
| `MOD-08` | `mod-command-agent` | Poll comandos |
| `MOD-09` | `mod-admin-web` | Páginas TI |
| `MOD-10` | `mod-admin-auth` | Login / guard |
| `MOD-11` | `mod-admin-api` | RPCs TI |

Sin módulos huérfanos.

---

## 4. Relaciones entre Módulos

Agente: **pantalla → hooks → engine (04/03/05) → store (06)**. Lock solo vía **08 → 07**.

Panel: **página → auth (10) → adminApi (11)**.

Estados agente: `loading` · `register` · `pending_approval` · `not_enrolled` · `owner_ok` · `error` · `offline`.

Estados panel: `unauthenticated` · `loading` · `empty_fleet` · `success` · `command_pending` · `forbidden` · `error`.

Estados enrollment (dato): `pendiente` · `aprobado` · `rechazado`.

Estados comando: `pendiente` · `ejecutado` · `fallido`.

---

## 5. Flujo Principal de Usuario

### Colaborador (agente)

```text
[Register]
  → persist + RPC registrar (pendiente)
    → [Status: pendiente de TI]
      → (en paralelo, si no Owner) [Status: no enrolado]
        → TI aprueba + Owner OK
          → [Agente background: ping 10 min + poll 30–60 s]
            → debe_bloquear o comando lock → lockNow()
```

### TI (panel)

```text
[Login]
  → [Flota]
      → tap fila
        → [Detalle]
            → Aprobar | Rechazar
            → Bloquear | Liberar | Nuevo PIN | Reiniciar
            → [Enrollment] instrucciones QR / dpm
```

---

## 6. Navegación

### Agente (expo-router)

| Ruta | Pantalla | Módulos | Feature |
| :--- | :--- | :--- | :--- |
| `/register` | Alta | MOD-01, 05, 06 | FEAT-01 |
| `/` | Estado / enrollment | MOD-04, 07, 06 | FEAT-06, FEAT-09 |
| (sin UI) | Location + commands | MOD-02, 08 | FEAT-02, FEAT-08 |

Sin tabs. Tras registro, `/` es la única pantalla visible (banner de estado). Touch ≥ 44 dp.

### Panel (Next.js App Router)

| Ruta | Pantalla | Módulos | Feature |
| :--- | :--- | :--- | :--- |
| `/login` | Login TI | MOD-10 | FEAT-11 |
| `/` | Flota | MOD-09, 11 | FEAT-10 |
| `/dispositivos/[id]` | Detalle + comandos | MOD-09, 11 | FEAT-08, FEAT-10 |
| `/enrollment` | QR / dpm | MOD-09 | FEAT-06, FEAT-10 |

Rutas de panel (excepto `/login`) exigen `perfiles.rol = ti`.

---

## 7. Consumo de Tokens y Theme

> Hex **solo** en `iterations/v1/src/constants/theme.ts` y `admin/v1/src/theme.ts`.  
> Nombres alineados a `standards/design-system.md` (wika-tokens/v1).

### Tokens clave V1 (ambas superficies)

| Token semántico | Uso | Valor |
| :--- | :--- | :--- |
| `background` | Fondo | `#0F1720` |
| `surface` | Cards / form | `#1B2733` |
| `text` | Principal | `#F4F7FA` |
| `textMuted` | Meta / timestamps | `#9AA8B5` |
| `accent` | CTA primario (Aprobar, registro) | `#3DDC97` |
| `warning` | Pendiente / no enrolado | `#C9A227` |
| `error` | Rechazado, lock, errores | `#F07167` |
| `border` | Bordes | `#2C3A47` |
| `spacing.md` | Padding | `16` |
| `spacing.lg` | Secciones | `24` |
| `radius.md` | Cards | `12` |
| `touchMin` | Hit target | `44` |

Semántica de flags (chips, no hex sueltos):

| Flag | Token |
| :--- | :--- |
| Dentro de perímetro / Owner OK / ejecutado | `accent` |
| Pendiente TI / no enrolado | `warning` |
| Fuera de perímetro / rechazado / fallido / lock | `error` |

---

## 8. Matriz Preview Visual vs Componentes de Código

| ID Vista | ID Módulo | Componente / Pantalla | Tokens | Referencia |
| :--- | :--- | :--- | :--- | :--- |
| `VIEW-01` | MOD-01 | Register `/register` | surface, accent, error | ASCII §9 |
| `VIEW-02` | MOD-01/07 | Status `/` | warning, accent, error | ASCII §9 |
| `VIEW-03` | MOD-10 | Login `/login` | background, accent | ASCII §9 |
| `VIEW-04` | MOD-09 | Flota `/` | surface, border, chips | ASCII §9 |
| `VIEW-05` | MOD-09 | Detalle `[id]` | accent, error, warning | ASCII §9 |
| `VIEW-06` | MOD-09 | Enrollment | text, textMuted | ASCII §9 |

Sin PNG formales en V1. Gate 3A = revisión del wireframe textual.

---

## 9. Layout Visual (wireframe / ASCII)

### VIEW-01 Registro (agente)

```text
┌─────────────────────────────────┐
│  Geo Empresa                    │
│  Registrar teléfono             │
├─────────────────────────────────┤
│  Nombre                         │
│  [________________________]     │
│  Lat base  [________]           │
│  Lng base  [________]           │
│  Radio m   [120]                │
│                                 │
│  [        Registrar        ]    │
│  error / loading                │
└─────────────────────────────────┘
```

### VIEW-02 Estado (agente)

```text
┌─────────────────────────────────┐
│  Geo Empresa              estado│
├─────────────────────────────────┤
│  BANNER: pendiente de TI        │
│       o no enrolado             │
│       o Owner OK · aprobado     │
│                                 │
│  Perímetro  dentro / fuera      │
│  Último ping  --:--             │
│  Auto-lock    on / off          │
│                                 │
│  El agente corre en background  │
└─────────────────────────────────┘
```

### VIEW-03 Login (panel)

```text
┌─────────────────────────────────┐
│  Geo Empresa TI                 │
│  Email                          │
│  Contraseña                     │
│  [          Entrar           ]  │
└─────────────────────────────────┘
```

### VIEW-04 Flota (panel)

```text
┌──────────────────────────────────────────────┐
│  Flota corporativa            [Enrollment]   │
├──────────────────────────────────────────────┤
│  Nombre   Perímetro  Owner  Enrollment  Ping │
│  Juan     fuera      no     pendiente   10m  │
│  Bodega   dentro     sí     aprobado    2m   │
└──────────────────────────────────────────────┘
```

Empty: “No hay dispositivos registrados”.

### VIEW-05 Detalle (panel)

```text
┌─────────────────────────────────┐
│  ← Telefono Juan                │
│  145 m · fuera · pendiente      │
│  Owner: no   Admin: no          │
│                                 │
│  [Aprobar]  [Rechazar]          │
│  [Bloquear] [Liberar]           │
│  [Nuevo PIN] [Reiniciar]        │
│                                 │
│  Comandos (sin PIN)             │
│  lock · pendiente · 18:40       │
│  Últimos pings                  │
└─────────────────────────────────┘
```

Nuevo PIN: modal (input + confirmar). El valor no se re-lista.

### VIEW-06 Enrollment (panel)

```text
┌─────────────────────────────────┐
│  Provisionar Device Owner       │
│  1. Factory reset               │
│  2. QR / dpm set-device-owner   │
│     com.wika.geoempresa         │
│  3. Abrir agente y registrar    │
│  4. Volver a Flota → Aprobar    │
└─────────────────────────────────┘
```

---

## 10. Riesgos de Diseño

| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| Dos superficies con tokens distintos | Medio | Mismos nombres semánticos en ambos `theme.ts` |
| TI cree que “Liberar” quita el lock screen | Alto | Copy: “Libera auto-lock. Para entrar use Nuevo PIN” |
| Sideload se ve como flota segura | Alto | Banner `warning` “no enrolado”; no CTA de lock en agente |
| Theme local vs design-system V3+ | Medio | Diferir kits; no inventar look de VE |
| Panel sin mockups PNG | Medio | Gate 3A sobre ASCII de este documento |

---

## 11. Puerta de Enlace — Aprobación Visual y Ensamblado

### Checklist aprobación visual (Gate 3A)

- [x] Navegación y flujo principal definidos (agente + panel).
- [x] Todos los módulos V1 incorporados sin huérfanos.
- [x] Tokens/theme documentados (local V1).
- [ ] Wireframe revisado por arquitecto (`visual_approval_passed`).
- [x] Sin dependencias circulares (grafo en `03`).

### Checklist auditoría de ensamblado (Gate 3B)

- [ ] `05-build-plan.md` coherente con este diseño.
- [ ] Estrategia de build y riesgos alineados.
- [ ] `audits/auditoria-ensamblado.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobación visual (Arquitecto / Stakeholder):** `________________________`
- **Fecha visual:** `YYYY-MM-DD`
- **visual_approval_passed:** `false` → `true` al aprobar preview (solo humano)

- **Aprobación ensamblado (Arquitecto):** `________________________`
- **Fecha ensamblado:** `YYYY-MM-DD`
- **audit_3_passed:** `false` → `true` al aprobar ensamblado (solo humano)
