---
id: "FEAT-001"
title: "Especificación de Requerimientos — my Pet"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss"
created_at: "2026-08-31"
updated_at: "2026-08-31"
audit_1_passed: true
audit_2_passed: true
---

# [02] Especificación de Características y Requerimientos Funcionales

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y este documento.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** my Pet
- **Documento base:** `idea/01-problem.md` (ID: `PROB-001`)
- **Estado de gatekeeping:** `AUDITORIA_DOCUMENTACION_APROBADA`

---

## 2. Matriz de Trazabilidad de Requerimientos (RTM 1:1)

| ID Feature | ID Problema (`01-problem.md`) | Nombre de la Característica | Prioridad | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-01` | `ERR-01` | Registrar mascota con casa GPS | `Crítica` | `mod-pet-registry` |
| `FEAT-02` | `ERR-02` | QR imprimible hacia URL pública | `Crítica` | `mod-qr` |
| `FEAT-03` | `ERR-03` | Landing de hallazgo + botón | `Crítica` | `mod-public-landing` |
| `FEAT-04` | `ERR-04` | Alerta en app con coordenadas | `Crítica` | `mod-find-alert` |
| `FEAT-05` | `ERR-05` | API / web de prueba compartida | `Crítica` | `mod-test-api` |

---

## 3. Funcionalidades Obligatorias

### Feature `FEAT-01`: Registrar mascota con casa GPS

**Descripción:** El dueño crea una ficha (nombre, especie, dirección). Al confirmar se capturan coordenadas como casa de la mascota.

#### Escenario 1.1: Flujo exitoso

- **Dado que** el formulario tiene nombre, especie y dirección válidos y hay lat/lng
- **Cuando** el dueño confirma
- **Entonces** se persiste la mascota con `publicToken` único y coordenadas de casa

#### Escenario 1.2: Validación

- **Dado que** falta el nombre o las coordenadas no son números válidos
- **Cuando** confirma
- **Entonces** no se crea la ficha y se muestra error de engine (`PET_NAME_REQUIRED` / `PET_COORDS_INVALID`)

#### Escenario 1.3: GPS denegado en la app

- **Dado que** el permiso de ubicación falla
- **Cuando** el dueño usa coordenadas manuales o de prueba
- **Entonces** el registro puede completarse igual

---

### Feature `FEAT-02`: QR imprimible

**Descripción:** Cada mascota tiene una URL ` {apiBase}/p/{publicToken} ` y un QR PNG + ficha imprimible.

#### Escenario 2.1: Happy path

- **Dado que** la mascota existe
- **Cuando** el dueño abre el detalle
- **Entonces** ve el QR, puede abrir `/print/{token}` y compartir la URL

---

### Feature `FEAT-03`: Landing pública de hallazgo

**Descripción:** Página web (sin app) con nombre, especie y CTA «Encontré tu mascota / parece perdida». No muestra dirección ni teléfono.

#### Escenario 3.1: Scan fuera de la app

- **Dado que** el QR se abre en el navegador del teléfono
- **Cuando** carga `/p/{token}`
- **Entonces** se muestra la ficha pública y el botón

#### Escenario 3.2: Token inválido

- **Dado que** el token no existe
- **Cuando** se abre la URL
- **Entonces** se muestra estado 404 amigable, sin crash

---

### Feature `FEAT-04`: Alerta con coordenadas del hallazgo

**Descripción:** El botón pide GPS del navegador, POST a la API, y la app lista la alerta (polling). Si el GPS se deniega, la alerta se envía sin coords.

#### Escenario 4.1: Con GPS

- **Dado que** el hallador concede ubicación
- **Cuando** pulsa el botón
- **Entonces** se crea `FindAlert` con `foundLat`/`foundLng` y la app la muestra con distancia a casa

#### Escenario 4.2: Sin GPS / demo

- **Dado que** el GPS falla
- **Cuando** pulsa o usa «ubicación de prueba»
- **Entonces** igual se notifica al dueño (coords nulas o demo Santiago)

#### Escenario 4.3: Cooldown

- **Dado que** acaba de enviarse una alerta para el mismo token
- **Cuando** se reintenta antes de 5 minutos
- **Entonces** `ALERT_COOLDOWN` y no se duplica spam

---

### Feature `FEAT-05`: API y web de prueba

**Descripción:** Servidor Node local (puerto 8787) con store JSON, semilla `demo-luna`, CORS, QR PNG y hub `/`.

#### Escenario 5.1: Semilla

- **Dado que** arranca `npm run web`
- **Cuando** se visita `/p/demo-luna`
- **Entonces** la landing de Luna está disponible sin registrar antes

---

## 4. Funcionalidades Deseables (V1.1+)

| ID Feature | Nombre | Prioridad | Notas |
| :--- | :--- | :--- | :--- |
| `FEAT-06` | Push Expo / FCM | `Alta` | Reemplaza polling |
| `FEAT-07` | Foto de mascota en landing | `Media` | |
| `FEAT-08` | Dominio HTTPS de producción | `Alta` | QR impreso durable |
| `FEAT-09` | Chat anónimo hallador–dueño | `Baja` | |

---

## 5. Fuera de Alcance

- Login, iOS store, collar GPS, telemedicina, ads
- Mostrar dirección/teléfono en la web pública
- Fusionar con Pet Care Assistant

---

## 6. Requerimientos No Funcionales (NFRs) Medibles

| ID NFR | Categoría | Criterio aceptable | Método de validación |
| :--- | :--- | :--- | :--- |
| `NFR-01` | **Rendimiento** | Engine smoke &lt; 30s | `npm run smoke` |
| `NFR-02` | **Web prueba** | Health + landing demo + POST alerta | `npm run smoke:web` |
| `NFR-03` | **Fidelidad visual** | 0% hex sueltos en componentes | theme.ts |
| `NFR-04` | **Privacidad** | Landing sin `address` | HTML de `/p/:token` |
| `NFR-05` | **Build** | APK release sin Metro (local) | `scripts/build-apk.sh` |

---

## 7. Mapeo de UI y Componentes

| Componente UI | Pantalla / Vista | Tokens | Estado mockup |
| :--- | :--- | :--- | :--- |
| `PrimaryButton` | Registro, detalle, alertas | `accent`, `alert`, `spacing.md` | Wireframe ASCII |
| `ChipSelect` | Especie | `surface`, `accentMuted` | Wireframe ASCII |
| `Screen` | Todas las pantallas app | `background` | Wireframe ASCII |
| Landing HTML | `/p/:token` | mismos hex del theme (web) | Wireframe ASCII |

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

- **Aprobado por (Arquitecto):** Vissiuss
- **Fecha:** 2026-08-31
- **audit_1_passed:** `true`
- **audit_2_passed:** `true` (módulos cubiertos 1:1; ver `03` + auditoría de módulos)
