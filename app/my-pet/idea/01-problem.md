---
id: "PROB-001"
title: "my Pet"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss"
created_at: "2026-08-31"
updated_at: "2026-08-31"
audit_1_passed: true
---

# [01] Definición del Problema, Alcance y Metas

> **Equivalencia de auditoría:** `audit_1_passed: true` requiere aprobación formal en `docs/auditoria-documentacion.md`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `my Pet`
- **Repositorio de aplicación:** `proyectos/app/my-pet/`
- **Stakeholders clave:** Vissiuss (ingeniero / product owner)
- **Estado de gatekeeping:** `AUDITORIA_DOCUMENTACION_APROBADA`

---

## 2. Definición del Problema y Justificación

- **¿Qué problema se intenta resolver?**  
  Si una mascota se pierde, un extraño que la encuentra no tiene un canal inmediato para avisar al dueño con la ubicación del hallazgo. Las placas tradicionales solo muestran un teléfono (privacidad, idioma, horario) y no entregan coordenadas.

- **Impacto actual / costo de oportunidad:**  
  Horas o días de búsqueda; el hallazgo ocurre lejos de casa; el dueño no sabe dónde mirar.

- **Análisis de brecha (Gap Analysis):**
  - **Estado actual (hoy):** no existe app my Pet en el repo; `pet-care-assistant` cubre cuidado diario, no recuperación.
  - **Estado deseado (mañana):** V1 con registro + casa GPS + QR imprimible + landing pública + alerta con coordenadas en la app del dueño.

---

## 3. Matriz de Trazabilidad de Requerimientos (RTM Inicial)

| ID Problema | Descripción del Dolor | Impacto | ID Feature (`02-features.md`) | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-01` | No hay ficha de mascota con casa geolocalizada | `Alto` | `FEAT-01` | `mod-pet-registry` |
| `ERR-02` | No existe identificador físico escaneable | `Alto` | `FEAT-02` | `mod-qr` |
| `ERR-03` | Quien encuentra no puede avisar sin instalar la app | `Alto` | `FEAT-03` | `mod-public-landing` |
| `ERR-04` | El dueño no recibe dónde ocurrió el hallazgo | `Alto` | `FEAT-04` | `mod-find-alert` |
| `ERR-05` | App y web no comparten estado en un entorno de prueba | `Medio` | `FEAT-05` | `mod-test-api` |

---

## 4. Audiencia y Casos de Uso Core

- **Usuarios principales:**
  - **Dueño:** registra la mascota, imprime el QR, recibe alertas.
  - **Hallador (extraño):** escanea el QR con la cámara nativa, pulsa un botón, comparte GPS.

- **Fuera de alcance (Out of Scope explícito):**
  - Login social, cuentas multi-dispositivo, chat con el hallador
  - GPS continuo / collar IoT
  - iOS App Store, fotos de mascota, pagos
  - Push FCM de producción (V1 usa polling contra API de prueba)
  - Design System pipeline V3+
  - Fusión con `pet-care-assistant`

---

## 5. Objetivo y Beneficios Esperados

- **Objetivo:** Al cerrar V1, un dueño puede registrar una mascota, obtener un QR cuya URL abre una web de prueba, y ver en la app las coordenadas de un hallazgo simulado o real.
- **Beneficios esperados:**
  - Canal de aviso que funciona sin que el extraño instale nada
  - Casa y hallazgo comparables en metros (haversine)
  - Entorno de prueba local reproducible (`npm run web`)

---

## 6. Criterios de Éxito en Formato BDD (Gherkin)

### Escenario 1: Registro con casa

- **Dado que** el dueño abre my Pet
- **Cuando** ingresa nombre, especie, dirección y se capturan coordenadas
- **Entonces** la mascota queda persistida con `homeLat`/`homeLng` y un `publicToken`

### Escenario 2: QR → web pública

- **Dado que** la mascota tiene token público
- **Cuando** un extraño escanea el QR (o abre la URL)
- **Entonces** ve una página con el nombre y el botón «Encontré tu mascota / parece perdida»

### Escenario 3: Alerta con coordenadas

- **Dado que** el hallador está en la landing
- **Cuando** pulsa el botón y el navegador entrega GPS (o ubicación de prueba)
- **Entonces** la app muestra una alerta nueva con lat/lng del hallazgo

### Escenario 4: Tokens visuales

- **Dado que** se renderizan componentes
- **Cuando** el agente compile la interfaz
- **Entonces** los estilos consumen tokens de `src/constants/theme.ts` documentado en `04-application-design.md`

---

## 7. Matriz de Restricciones Técnicas y Operativas

| Categoría | Restricción / Límite | Impacto | Estándar asociado |
| :--- | :--- | :--- | :--- |
| **Tecnología** | Expo SDK 52, RN 0.76.x, TypeScript, `~` en expo/RN | `Alto` | `standards/coding-standards.md` |
| **Plataforma V1** | Android APK release sin Metro + web de prueba Node | `Alto` | WIKA-ARCH-03 |
| **Backend V1** | API HTTP local (no cloud). URL configurable `EXPO_PUBLIC_API_URL` | `Alto` | Este documento |
| **Diseño / UX** | Theme local documentado | `Medio` | `standards/design-system.md` |
| **Seguridad** | Landing pública no muestra dirección ni teléfono; token opaco | `Alto` | coding-standards |
| **Librerías prohibidas** | `^` en expo/react-native | `Bloqueante` | WIKA-ARCH-02 |

---

## 8. Supuestos y Riesgos

- **Supuestos clave:** el extraño tiene cámara + navegador; la web de prueba es alcanzable (LAN o localhost); GPS del navegador puede denegarse (alerta igual, sin coords).
- **Riesgos identificados:** QR impreso apunta a localhost y no sirve en la calle; HTTP claro en LAN; sin push el dueño debe tener la app abierta o poll.
- **Plan de mitigación:** documentar URL base; semilla `demo-luna`; ubicación de prueba en la landing; polling 5s en la app.

---

## 9. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist de criterios de aceptación

- [x] YAML frontmatter completado (`id`, `status`, `owner`, fechas).
- [x] Problemas `ERR-XX` mapeados a `FEAT-XX` y módulos sugeridos en RTM.
- [x] Criterios de éxito en formato BDD (Dado / Cuando / Entonces).
- [x] Out-of-scope explícito documentado.
- [x] Restricciones técnicas alineadas a `standards/coding-standards.md`.
- [x] Auditoría registrada en `audits/auditoria-documentacion.md` con resultado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** Vissiuss (solicitud de generación V1)
- **Fecha de aprobación:** 2026-08-31
- **audit_1_passed:** `true`
