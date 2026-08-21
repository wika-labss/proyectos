---
id: "FEAT-001"
title: "Especificación de Requerimientos — Pet Care Assistant"
status: "BORRADOR"
version: "1.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-08-21"
updated_at: "2026-08-21"
audit_1_passed: false
audit_2_passed: false
---

# [02] Especificación de Características y Requerimientos Funcionales

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y este documento.  
> **Equivalencia:** Auditoría de Documentación → `docs/auditoria-documentacion.md`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `Pet Care Assistant`
- **Documento base:** `idea/01-problem.md` (ID: `PROB-001`)
- **Estado de gatekeeping:** `PENDIENTE_AUDITORIA_DOCUMENTACION`

---

## 2. Matriz de Trazabilidad de Requerimientos (RTM 1:1)

| ID Feature | ID Problema (`01-problem.md`) | Nombre de la Característica | Prioridad | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-01` | `ERR-07` | Ficha de mascota (nombre, tipo, nacimiento/edad, sexo, peso) | `Crítica` | `mod-pet-profile` |
| `FEAT-02` | `ERR-01` | Registrar comidas | `Crítica` | `mod-care-events` |
| `FEAT-03` | `ERR-02` | Registrar baño y consistencia de heces | `Crítica` | `mod-care-events`, `mod-stool-scale` |
| `FEAT-04` | `ERR-03` | Registrar paseos | `Crítica` | `mod-care-events` |
| `FEAT-05` | `ERR-04` | Estado de salud / enfermo | `Crítica` | `mod-health-status` |
| `FEAT-06` | `ERR-05` | Histórico por fecha | `Crítica` | `mod-day-history` |
| `FEAT-07` | `ERR-06` | Calendario preventivo (vacunas + desparasitación) | `Crítica` | `mod-preventive-calendar` |
| `FEAT-08` | `ERR-08` | Persistencia local offline | `Crítica` | `mod-offline-store` |
| `FEAT-09` | `ERR-09` | Multi-mascota con registros aislados | `Alta` | `mod-pet-profile` |
| `FEAT-10` | `ERR-05` | Dashboard del día (hoy) | `Alta` | `mod-day-history`, `mod-care-ui` |
| `FEAT-11` | `ERR-01`–`ERR-04` | Nota / observación libre del día | `Media` | `mod-care-events` |
| `FEAT-12` | — | APK Release sin Metro | `Crítica` | `mod-android-release` |

---

## 3. Funcionalidades Obligatorias

### Feature `FEAT-01`: Ficha de mascota

**Descripción:** Alta y edición de la identidad de la mascota: nombre, tipo, raza (opcional), sexo, fecha de nacimiento (edad calculada), peso opcional. Sin ficha no se pueden crear eventos.

**Tipos V1 (catálogo cerrado):** `perro` | `gato` | `ave` | `conejo` | `otro`.

**Regla de edad:** la edad visible (años + meses) se calcula siempre desde `birthDate`. Si el usuario solo conoce la edad aproximada, el alta pide una fecha de nacimiento estimada (p. ej. 1 de enero del año inferido) y marca `birthDateEstimated: true`.

#### Escenario 1.1: Flujo exitoso (Happy Path)

- **Dado que** `es el primer uso o el usuario elige “Nueva mascota”`
- **Cuando** `completa nombre, tipo y fecha de nacimiento y guarda`
- **Entonces** `la mascota queda activa, se muestra edad calculada y el dashboard usa esa ficha`

#### Escenario 1.2: Manejo de errores

- **Dado que** `el nombre está vacío o falta el tipo o la fecha de nacimiento`
- **Cuando** `el usuario confirma`
- **Entonces** `no se guarda; feedback con token error y foco en el campo inválido`

---

### Feature `FEAT-02`: Registrar comidas

**Descripción:** Anotar cada toma: fecha/hora (default ahora), tipo de alimento y cantidad opcional. Queda asociada a la mascota activa.

**Tipos de alimento V1:** `seco` | `húmedo` | `casero` | `premio` | `otro`.

#### Escenario 2.1: Flujo exitoso

- **Dado que** `hay una mascota activa`
- **Cuando** `el cuidador registra una comida (tipo + hora)`
- **Entonces** `el evento aparece en el dashboard de hoy y en el histórico de esa fecha`

#### Escenario 2.2: Manejo de errores

- **Dado que** `no hay mascota activa, o la hora es futura inválida (más de 10 min respecto al reloj del dispositivo, opcional V1: bloquear futuro > 24 h)`
- **Cuando** `intenta guardar`
- **Entonces** `se bloquea el guardado con mensaje claro; la app no crashea`

---

### Feature `FEAT-03`: Registrar baño y consistencia de heces

**Descripción:** Anotar deposición y/o orina. Si hay heces, la consistencia es **obligatoria** (catálogo cerrado). Sangre o moco se marcan como alerta visual (token `error` / `warning`), no como diagnóstico.

**Tipo de baño V1:** `orina` | `heces` | `ambos`.

**Consistencia V1 (`mod-stool-scale`):**

| Código | Etiqueta | Semántica UI |
|--------|----------|--------------|
| `firme` | Firme / normal | OK (`accent`) |
| `dura` | Dura / seca | Atención (`warning`) |
| `blanda` | Blanda | Atención (`warning`) |
| `liquida` | Líquida / diarrea | Alerta (`error`) |
| `moco` | Con moco | Alerta (`error`) |
| `sangre` | Con sangre | Alerta crítica (`error`) |

Si el tipo es solo `orina`, la consistencia no se pide.

#### Escenario 3.1: Flujo exitoso

- **Dado que** `hay mascota activa`
- **Cuando** `registra baño tipo heces con consistencia “blanda”`
- **Entonces** `el evento queda en el día con la etiqueta de consistencia y el color de atención`

#### Escenario 3.2: Manejo de errores

- **Dado que** `el tipo incluye heces y no se eligió consistencia`
- **Cuando** `confirma`
- **Entonces** `no guarda; pide consistencia (token error)`

---

### Feature `FEAT-04`: Registrar paseos

**Descripción:** Anotar un paseo: hora de inicio (default ahora), duración en minutos (opcional) y nota corta opcional. Sin GPS.

#### Escenario 4.1: Flujo exitoso

- **Dado que** `hay mascota activa`
- **Cuando** `registra un paseo de 30 minutos`
- **Entonces** `aparece en el día con hora y duración`

#### Escenario 4.2: Manejo de errores

- **Dado que** `la duración es negativa, no numérica o > 24 h`
- **Cuando** `confirma`
- **Entonces** `se rechaza la entrada con feedback; no se persiste basura`

---

### Feature `FEAT-05`: Estado de salud / enfermo

**Descripción:** La mascota tiene un estado: `sano` | `enfermo` | `en_recuperacion`. Al marcar enfermo se exige al menos un síntoma del catálogo y una nota opcional. El cambio de estado genera un evento de salud en el histórico.

**Síntomas V1 (multi-select):** `vómito` | `diarrea` | `letargo` | `sin_apetito` | `tos` | `cojera` | `otro`.

**Disclaimer UI (obligatorio, no clínico):** texto fijo “Registro del cuidador. No sustituye consulta veterinaria.”

#### Escenario 5.1: Flujo exitoso

- **Dado que** `la mascota está sana`
- **Cuando** `el cuidador marca “está enfermo”, elige “vómito” y guarda`
- **Entonces** `el dashboard muestra badge de enfermo, el histórico del día incluye el evento y el perfil refleja el estado`

#### Escenario 5.2: Manejo de errores

- **Dado que** `marca enfermo sin síntomas`
- **Cuando** `confirma`
- **Entonces** `no cambia el estado; pide al menos un síntoma`

---

### Feature `FEAT-06`: Histórico por fecha

**Descripción:** El usuario selecciona una fecha (calendario o stepper día anterior/siguiente) y ve **todo lo ocurrido ese día** para la mascota activa: comidas, baños (con consistencia), paseos, notas, cambios de salud y preventivos aplicados ese día. Días sin datos muestran estado vacío, no error.

#### Escenario 6.1: Flujo exitoso

- **Dado que** `existen eventos el 2026-08-20`
- **Cuando** `el usuario selecciona esa fecha`
- **Entonces** `ve la lista ordenada por hora con tipo, detalle y consistencia si aplica`

#### Escenario 6.2: Manejo de errores

- **Dado que** `la fecha no tiene eventos o está fuera de un rango razonable (p. ej. anterior al nacimiento)`
- **Cuando** `consulta el día`
- **Entonces** `ve empty state “Sin registros este día” o aviso de fecha anterior al nacimiento; sin crash`

---

### Feature `FEAT-07`: Calendario preventivo (vacunas + desparasitación)

**Descripción:** Lista de preventivos por mascota. Cada ítem: tipo (`vacuna` | `desparasitacion`), nombre, fecha aplicada, próxima fecha opcional, notas. En perfil/home se destaca si hay una próxima fecha **vencida** o en los próximos 14 días (aviso visual, **sin push** en V1).

#### Escenario 7.1: Flujo exitoso

- **Dado que** `hay mascota activa`
- **Cuando** `carga vacuna “Antirrábica” aplicada el 2026-01-10 con próxima el 2027-01-10`
- **Entonces** `aparece en el calendario preventivo y, si la próxima está cerca o vencida, el dashboard muestra aviso`

#### Escenario 7.2: Manejo de errores

- **Dado que** `falta nombre o fecha aplicada, o la próxima es anterior a la aplicada`
- **Cuando** `guarda`
- **Entonces** `se bloquea con mensaje de validación`

---

### Feature `FEAT-08`: Persistencia local offline

**Descripción:** Perfiles, eventos, salud y preventivos se guardan en el dispositivo (AsyncStorage). Al matar la app y reabrir, el estado se rehidrata. 100% offline; sin red.

#### Escenario 8.1: Flujo exitoso

- **Dado que** `el cuidador registró datos y cierra la app`
- **Cuando** `la vuelve a abrir`
- **Entonces** `mascota activa, eventos del día y vacunas siguen disponibles sin red`

#### Escenario 8.2: Manejo de errores

- **Dado que** `el storage está corrupto o ilegible`
- **Cuando** `arranca la app`
- **Entonces** `no crashea; empty state seguro y opción de reiniciar datos locales (confirmación destructiva)`

---

### Feature `FEAT-09`: Multi-mascota

**Descripción:** El usuario puede tener N mascotas. Selector en home. Todo evento, salud y preventivo lleva `petId`. Cambiar de mascota cambia dashboard, histórico y calendario.

#### Escenario 9.1: Flujo exitoso

- **Dado que** `existen “Luna” y “Mora”`
- **Cuando** `el usuario selecciona “Mora” y registra una comida`
- **Entonces** `esa comida no aparece en el histórico de Luna`

#### Escenario 9.2: Manejo de errores

- **Dado que** `intenta borrar la mascota activa`
- **Cuando** `confirma el borrado (doble confirmación)`
- **Entonces** `se eliminan ficha + eventos + preventivos de esa mascota; si quedan otras, se activa otra; si no, onboarding de alta`

---

### Feature `FEAT-10`: Dashboard del día (hoy)

**Descripción:** Pantalla home: mascota activa, edad, estado de salud, contadores de hoy (comidas, baños, paseos), última consistencia de heces, avisos de preventivo, CTAs de registro rápido.

#### Escenario 10.1: Flujo exitoso

- **Dado que** `hoy se registraron 2 comidas y 1 paseo`
- **Cuando** `abre el home`
- **Entonces** `ve esos contadores y puede ir a registrar o al histórico`

#### Escenario 10.2: Empty / primer uso

- **Dado que** `no hay mascotas`
- **Cuando** `abre la app`
- **Entonces** `ve onboarding de alta (FEAT-01), no un dashboard vacío confuso`

---

### Feature `FEAT-11`: Nota / observación del día

**Descripción:** Evento libre de texto corto (máx. 280 caracteres) asociado a fecha/hora y mascota. Sirve para “durmió mal”, “visitó al vet”, etc. sin abrir un módulo nuevo.

#### Escenario 11.1: Flujo exitoso

- **Dado que** `hay mascota activa`
- **Cuando** `guarda una nota “Visitó al vet, recetó dieta blanda”`
- **Entonces** `aparece en el histórico del día`

#### Escenario 11.2: Manejo de errores

- **Dado que** `la nota está vacía o supera 280 caracteres`
- **Cuando** `confirma`
- **Entonces** `se rechaza o se recorta con aviso; no guarda vacío`

---

### Feature `FEAT-12`: APK Release sin Metro

**Descripción:** Entregable nativo Android según pipeline WIKA (Expo prebuild + release), instalable por sideload sin PC.

#### Escenario 12.1: Flujo exitoso

- **Dado que** `el toolchain WIKA está configurado (JDK 17, SDK)`
- **Cuando** `se ejecuta el pipeline de APK`
- **Entonces** `existe un APK release instalable que arranca el flujo de ficha/registros`

#### Escenario 12.2: Manejo de errores

- **Dado que** `falta JDK 17 o el prebuild falla`
- **Cuando** `corre verify/apk`
- **Entonces** `el script falla de forma explícita (no APK a medias)`

---

## 4. Funcionalidades Deseables (V1.1+)

| ID Feature | Nombre | Prioridad | Notas |
| :--- | :--- | :--- | :--- |
| `FEAT-13` | Recordatorios push (vacuna / desparasitación / comida) | `Alta` | Requiere `expo-notifications`; fuera de V1 |
| `FEAT-14` | Medicación con horarios (dosis dadas / pendientes) | `Alta` | Encaja con “está enfermo”; post-V1 |
| `FEAT-15` | Foto de la mascota en ficha | `Media` | Permiso cámara/galería |
| `FEAT-16` | Curva de peso (histórico) | `Media` | FEAT-01 ya guarda peso puntual |
| `FEAT-17` | Exportar día / periodo (texto o PDF) para el vet | `Media` | Compartir nativo |
| `FEAT-18` | Registro de agua / grooming / celo | `Baja` | No bloquea V1 |
| `FEAT-19` | GPS / mapa del paseo | `Baja` | Permiso ubicación; explícitamente fuera de V1 |
| `FEAT-20` | Sync nube / multi-dispositivo | `Baja` | Requiere backend |

---

## 5. Fuera de Alcance

- iOS, landscape obligatorio, cuentas, backend, ads, IAP.
- Diagnóstico, triaje automático o chat veterinario.
- Fotos de heces, GPS, notificaciones push.
- Editor de informes clínicos, integraciones con clínicas.
- Más tipos de evento que los definidos en V1 (comida, baño, paseo, salud, nota, preventivo).

---

## 6. Requerimientos No Funcionales (NFRs) Medibles

| ID NFR | Categoría | Criterio aceptable | Método de validación |
| :--- | :--- | :--- | :--- |
| `NFR-01` | **Rendimiento** | Engine smoke tests pasan en &lt; 30s | `npm run verify` |
| `NFR-02` | **Build** | APK release compila sin Metro | `scripts/build-apk.sh` |
| `NFR-03` | **Fidelidad visual** | 100% tokens documentados (0% hex en componentes) | Revisión en `04-application-design.md` |
| `NFR-04` | **Offline** | Flujo principal sin red | Prueba manual / smoke test |
| `NFR-05` | **Aislamiento** | Eventos de mascota A no aparecen en B | Smoke `petId` |
| `NFR-06` | **Privacidad** | Sin llamadas de red ni analytics | Inspección dependencias / manifest |
| `NFR-07` | **Usabilidad** | CTA de registro rápido &lt; 3 taps desde home | Recorrido QA BDD |

---

## 7. Mapeo de UI y Componentes (si aplica)

| Componente UI | Pantalla / Vista | Tokens (`standards/design-system.md`) | Estado mockup |
| :--- | :--- | :--- | :--- |
| `PrimaryButton` | Home, formularios | `accent`, `spacing.md`, touch 44 dp | `PENDIENTE` (wireframe ASCII en 04) |
| `PetSwitcher` | Home, header | `surface`, `text`, `border` | `PENDIENTE` |
| `TodaySummary` | Home (`VIEW-01`) | `surface`, `accent`, `warning`, `error` | `PENDIENTE` |
| `QuickLogRow` | Home | `accent`, `spacing.sm` | `PENDIENTE` |
| `EventList` | Histórico (`VIEW-08`) | `text`, `textMuted`, `border` | `PENDIENTE` |
| `StoolBadge` | Baño, histórico | `accent` / `warning` / `error` | `PENDIENTE` |
| `HealthBanner` | Home, salud | `error` o `accent` según estado | `PENDIENTE` |
| `DatePager` | Histórico | `text`, `accent` | `PENDIENTE` |
| `PreventiveCard` | Vacunas (`VIEW-09`) | `surface`, `warning` si vencido | `PENDIENTE` |
| `ProfileForm` | Ficha (`VIEW-02`) | `background`, `border`, `error` | `PENDIENTE` |

---

## 8. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist

- [x] Frontmatter YAML vinculado a `PROB-001`.
- [x] RTM 1:1 con IDs `ERR-XX` de `01-problem.md`.
- [x] Escenarios BDD por feature obligatoria.
- [x] NFRs con métricas verificables.
- [x] Deseables y fuera de alcance diferenciados.
- [ ] `audits/auditoria-documentacion.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `________________________`
- **Fecha:** `YYYY-MM-DD`
- **audit_1_passed:** `false` → `true` al aprobar
