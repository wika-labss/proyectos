---
id: "MOD-001"
title: "Descubrimiento y Arquitectura de Módulos — my Pet"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss"
created_at: "2026-08-31"
updated_at: "2026-08-31"
audit_1_passed: true
audit_2_passed: true
---

# [03] Descubrimiento y Especificación de Arquitectura Modular

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y `02-features.md`.

## 1. Identificación y Documentos Base

- **Nombre del Proyecto:** my Pet
- **Especificaciones base:** `01-problem.md` (`PROB-001`) | `02-features.md` (`FEAT-001`)
- **Estado de gatekeeping:** `AUDITORIA_MODULOS_APROBADA`

---

## 2. Matriz de Trazabilidad Modular (RTM 1:1)

| ID Módulo | ID Feature (`02-features.md`) | ID Problema (`01-problem.md`) | Nombre del Módulo | Tipo | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MOD-01` | `FEAT-01` | `ERR-01` | `mod-pet-registry` | `engine` | Validar y crear fichas (nombre, especie, dirección, casa GPS, token) |
| `MOD-02` | `FEAT-02` | `ERR-02` | `mod-qr` | `engine` | Construir URL pública y contrato del QR |
| `MOD-03` | `FEAT-03` | `ERR-03` | `mod-public-landing` | `web` | HTML de hallazgo + geolocalización del navegador |
| `MOD-04` | `FEAT-04` | `ERR-04` | `mod-find-alert` | `engine` | Crear alerta, cooldown, distancia a casa |
| `MOD-05` | `FEAT-05` | `ERR-05` | `mod-test-api` | `servicio` | HTTP JSON + persistencia de prueba + QR PNG |
| `MOD-06` | `FEAT-01`–`04` | `ERR-01`–`04` | `mod-owner-ui` | `UI` | Pantallas Expo (lista, alta, detalle, alertas) |

---

## 3. Desglose de Arquitectura Modular

### Módulo `MOD-01`: mod-pet-registry

**Patrón:** Pure engine  
**Ruta:** `src/engine/petRegistry.ts`

#### Contrato

- **Entradas:** `{ name, species, address, homeLat, homeLng, now? }`
- **Salidas:** `EngineResult<AppStore>` con `Pet` (id, publicToken, casa)
- **Dependencias:** tipos + ids; sin React
- **Reutilizable:** Sí (también lo consume el servidor de prueba)

#### Reglas de aislamiento

- No importa React ni HTTP
- Errores estables: `PET_NAME_REQUIRED`, `PET_SPECIES_INVALID`, `PET_ADDRESS_REQUIRED`, `PET_COORDS_INVALID`

---

### Módulo `MOD-02`: mod-qr

**Patrón:** Pure engine  
**Ruta:** `src/engine/qr.ts`

#### Contrato

- **Entradas:** `apiBaseUrl`, `publicToken`
- **Salidas:** `publicUrl`, `printUrl`, `qrPngUrl`
- **Dependencias:** ninguna de UI
- **Reutilizable:** Sí

---

### Módulo `MOD-03`: mod-public-landing

**Patrón:** Server-rendered HTML  
**Ruta:** `web/server.ts` (rutas `GET /p/:token`, `GET /print/:token`)

#### Contrato

- **Entradas:** token de URL
- **Salidas:** HTML público (nombre + especie + CTA); 404 si no existe
- **Dependencias:** MOD-01 (lectura), MOD-04 (POST alerta), MOD-05
- **Prohibido:** renderizar `address` o coords de casa

---

### Módulo `MOD-04`: mod-find-alert

**Patrón:** Pure engine  
**Ruta:** `src/engine/alerts.ts`, `src/engine/geo.ts`

#### Contrato

- **Entradas:** `{ token, foundLat?, foundLng?, accuracyMeters?, now?, cooldownMs? }`
- **Salidas:** store con alerta nueva o `ALERT_UNKNOWN_TOKEN` / `ALERT_COOLDOWN`
- **Dependencias:** haversine puro
- **Reutilizable:** Sí

---

### Módulo `MOD-05`: mod-test-api

**Patrón:** HTTP + JSON file store  
**Ruta:** `web/server.ts`, `web/store.ts`

#### Contrato

- REST: `GET/POST /api/pets`, `GET /api/pets/:id/alerts`, `POST /api/p/:token/alert`
- Persistencia: `web/data/store.json` (semilla `demo-luna`)
- CORS abierto para Expo web / LAN
- Puerto default `8787`

---

### Módulo `MOD-06`: mod-owner-ui

**Patrón:** Feature screens expo-router  
**Ruta:** `app/`, `src/components/`, `src/hooks/PetProvider.tsx`

#### Contrato

- Consume engine + fetch a MOD-05
- Theme tokens; polling de alertas
- No contiene reglas de validación duplicadas (delega al engine en servidor; client muestra errores)

---

## 4. Grafo de Dependencias y Reglas de Importación

```text
[app/ screens]
       │
       ▼
[MOD-06 UI / PetProvider]
       │
       ▼ fetch
[MOD-05 test API] ──renders──► [MOD-03 landing]
       │
       ▼ importa
[MOD-01 registry] [MOD-02 qr] [MOD-04 alerts]
       │
       ▼
[src/engine puro — sin React]
```

**Reglas:**

- Prohibidas importaciones circulares
- `src/engine/` sin imports de React
- Estilos solo vía tokens/theme documentados

---

## 5. Matriz de Riesgos Arquitectónicos

| ID Módulo | Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| `MOD-05` | API local no alcanzable desde el teléfono | `Alto` | URL configurable + hub `/` + semilla demo |
| `MOD-03` | Geolocalización denegada | `Medio` | Alerta sin coords + botón demo |
| `MOD-04` | Spam de alertas | `Medio` | Cooldown 5 min |
| `MOD-06` | Hex hardcoded | `Medio` | theme.ts + smoke visual por revisión |

---

## 6. Evaluación de Reutilización WIKA

| Módulo | ¿Existe equivalente WIKA? | Decisión |
| :--- | :--- | :--- |
| `MOD-01` | `petProfile` en pet-care-assistant | No reutilizar: dominio distinto (casa/QR vs cuidado) |
| `MOD-06` | Screen / PrimaryButton / ChipSelect | Reutilizar patrón, theme propio my Pet |
| Landing | Ninguno | Crear nuevo (web de prueba) |

---

## 7. Puerta de Enlace y Firma de Auditoría de Módulos

### Checklist

- [x] Toda feature obligatoria tiene al menos un módulo.
- [x] Sin módulos duplicados ni responsabilidades superpuestas.
- [x] Dependencias y riesgos documentados.
- [x] Reutilización WIKA evaluada.
- [x] Grafo sin ciclos.
- [x] `audits/auditoria-modulos.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** Vissiuss
- **Fecha:** 2026-08-31
- **audit_2_passed:** `true`
