---
id: "DES-001"
title: "Diseño de Aplicación — my Pet"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss"
created_at: "2026-08-31"
updated_at: "2026-08-31"
audit_1_passed: true
audit_2_passed: true
visual_approval_passed: true
audit_3_passed: true
---

# [04] Diseño de Aplicación, Navegación y Aprobación Visual

> **Pre-requisito:** `audit_2_passed: true` en `03-module-discovery.md`.  
> **Gate visual:** `visual_approval_passed: true` — stakeholder pidió V1 + web de prueba (2026-08-31).

## 1. Identificación y Antecedentes

- **Nombre del Proyecto:** my Pet
- **Documentos base:** `01-problem.md` | `02-features.md` | `03-module-discovery.md`
- **Estado de gatekeeping:** `APROBACION_VISUAL_OK`

---

## 2. Arquitectura General

App Expo (SDK 52, expo-router) para el dueño. Servidor Node de prueba (`web/server.ts`) sirve API JSON, landing pública y ficha imprimible. El engine puro (`src/engine/`) es la fuente de reglas y lo importan tanto smoke tests como el servidor. Theme local en `src/constants/theme.ts` (tokens semánticos V1; no pipeline design-system).

---

## 3. Módulos Utilizados en V1

| ID Módulo | Nombre | Rol en V1 |
| :--- | :--- | :--- |
| `MOD-01` | `mod-pet-registry` | Alta de mascota |
| `MOD-02` | `mod-qr` | URLs QR / print |
| `MOD-03` | `mod-public-landing` | Página del extraño |
| `MOD-04` | `mod-find-alert` | Alertas + distancia |
| `MOD-05` | `mod-test-api` | Backend de prueba |
| `MOD-06` | `mod-owner-ui` | Pantallas dueño |

---

## 4. Relaciones entre Módulos

```text
Pantalla → PetProvider (fetch + polling)
        → API MOD-05
        → engine MOD-01/02/04
Landing → geolocation navegador → POST alerta → store
App lista alertas cada 5s
```

Estados: loading, empty (sin mascotas), error de red, success, 404 token.

---

## 5. Flujo Principal de Usuario

```text
[Lista] → [Registrar] → GPS casa → [Detalle + QR]
                                      ↓
                              [Print / compartir URL]
                                      ↓
                         Extraño abre /p/{token}
                                      ↓
                         Botón hallazgo + GPS
                                      ↓
                         [Alertas] muestra coords + distancia a casa
```

---

## 6. Navegación (expo-router)

| Ruta | Pantalla | Módulos | Feature |
| :--- | :--- | :--- | :--- |
| `/` | Lista / vacío | MOD-06 | FEAT-01 |
| `/register` | Alta mascota | MOD-01, MOD-06 | FEAT-01 |
| `/pet/[id]` | Ficha + QR | MOD-02, MOD-06 | FEAT-02 |
| `/alerts` | Alertas | MOD-04, MOD-06 | FEAT-04 |
| `/settings` | URL API de prueba | MOD-05, MOD-06 | FEAT-05 |

Web (no expo-router):

| Ruta | Vista | Feature |
| :--- | :--- | :--- |
| `/` | Hub de prueba | FEAT-05 |
| `/p/:token` | Landing hallazgo | FEAT-03 |
| `/print/:token` | Ficha imprimible | FEAT-02 |
| `/owner` | Dashboard HTML de prueba | FEAT-04/05 |

---

## 7. Consumo de Tokens y Theme

> Estilos derivados de `theme.ts` (familia local my-pet). Hex solo en `theme.ts` y en CSS de la landing (mismos valores).

### Tokens clave V1

| Token semántico | Uso | Valor |
| :--- | :--- | :--- |
| `background` | Fondo app | `#F4F7F5` |
| `surface` | Cards | `#FFFFFF` |
| `text` | Texto | `#1C2B24` |
| `textMuted` | Secundario | `#5C6B64` |
| `accent` | CTA primario | `#1F7A5C` |
| `accentMuted` | Chip on | `#D5EDE4` |
| `alert` | Hallazgo / urgencia | `#C45C26` |
| `error` | Errores | `#B42318` |
| `border` | Bordes | `#D5E0DA` |
| `spacing.md` | Padding | `16` |
| `radius.md` | Cards/botones | `12` |
| Touch | Mínimo | `44 dp` |

---

## 8. Matriz Preview Visual vs Componentes de Código

| ID Vista | ID Módulo | Componente / Pantalla | Tokens | Referencia |
| :--- | :--- | :--- | :--- | :--- |
| `VIEW-01` | MOD-06 | Home lista | background, accent | ASCII |
| `VIEW-02` | MOD-06 | Register | surface, border, accent | ASCII |
| `VIEW-03` | MOD-06 | Pet detail + QR | surface, text | ASCII |
| `VIEW-04` | MOD-06 | Alerts | alert, error | ASCII |
| `VIEW-05` | MOD-03 | Landing hallazgo | alert (CTA) | ASCII |

---

## 9. Layout Visual (wireframe / ASCII)

### VIEW-01 Lista

```text
┌─────────────────────────────────────┐
│ my Pet                              │
│ Placa QR para volver a casa         │
├─────────────────────────────────────┤
│ [Luna · perro]              1 nueva │
│ Av. Demo 123                        │
├─────────────────────────────────────┤
│ [+ Registrar mascota]               │
│ Alertas | Ajustes                   │
└─────────────────────────────────────┘
```

### VIEW-05 Landing (web, fuera de la app)

```text
┌─────────────────────────────────────┐
│ my Pet                              │
│ Me llamo Luna                       │
│ perro                               │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Encontré tu mascota             │ │
│ │ parece perdida                  │ │
│ └─────────────────────────────────┘ │
│ No se muestra la dirección          │
└─────────────────────────────────────┘
```

---

## 10. Riesgos de Diseño

| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| Landing recargada de datos del dueño | Alto | Solo nombre + especie |
| Theme local vs design-system V3+ | Medio | Migrar en V3+ si el producto madura |
| QR pequeño en pantalla | Medio | Página `/print` a tamaño página |

---

## 11. Puerta de Enlace — Aprobación Visual y Ensamblado

### Checklist aprobación visual (Gate 3A)

- [x] Navegación y flujo principal definidos.
- [x] Todos los módulos V1 incorporados sin huérfanos.
- [x] Tokens/theme documentados.
- [x] Wireframe textual revisado (solicitud V1 del stakeholder).
- [x] Sin dependencias circulares.

### Checklist auditoría de ensamblado (Gate 3B)

- [x] `05-build-plan.md` coherente con este diseño.
- [x] Estrategia de build y riesgos alineados.
- [x] `audits/auditoria-ensamblado.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobación visual (Arquitecto / Stakeholder):** Vissiuss
- **Fecha visual:** 2026-08-31
- **visual_approval_passed:** `true`

- **Aprobación ensamblado (Arquitecto):** Vissiuss
- **Fecha ensamblado:** 2026-08-31
- **audit_3_passed:** `true`
