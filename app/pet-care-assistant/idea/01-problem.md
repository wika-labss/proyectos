---
id: "PROB-001"
title: "Pet Care Assistant"
status: "BORRADOR"
version: "1.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-08-21"
updated_at: "2026-08-21"
audit_1_passed: false
---

# [01] Definición del Problema, Alcance y Metas

> **Equivalencia de auditoría:** `audit_1_passed: true` requiere aprobación formal en `docs/auditoria-documentacion.md`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `Pet Care Assistant`
- **Repositorio de aplicación:** `proyectos/app/pet-care-assistant/`
- **Stakeholders clave:** Vissiuss (producto / ingeniería), Arquitecto WIKA (gates), cuidador de mascota (usuario final)
- **Estado de gatekeeping:** `PENDIENTE_AUDITORIA_DOCUMENTACION`

---

## 2. Definición del Problema y Justificación

- **¿Qué problema se intenta resolver?**  
  El cuidador no tiene un registro diario, local y consultable del cuidado de su mascota. Hoy las comidas, el baño (incluida la consistencia de las heces), los paseos, un episodio de enfermedad, las vacunas y la ficha básica (tipo, edad) se recuerdan de memoria, se anotan en notas sueltas o se pierden. Cuando hay que explicar al veterinario “qué pasó ayer” o “cuándo fue la última vacuna”, no existe un histórico por fecha.

- **Impacto actual / costo de oportunidad:**  
  Se olvidan tomas de alimento, se detecta tarde un cambio de heces o un brote de enfermedad, se vencen vacunas y no hay evidencia del día a día. El cuidador no puede reconstruir un día concreto ni comparar patrones (menos apetito, heces blandas, menos paseos).

- **Análisis de brecha (Gap Analysis):**
  - **Estado actual (hoy):** App inexistente. Cuidado registrado de forma informal o nula.
  - **Estado deseado (mañana):** App Android offline V1 con ficha de mascota, registro rápido de comida / baño+heces / paseo / enfermedad, calendario de vacunas (y desparasitación), e histórico por fecha seleccionable.

---

## 3. Matriz de Trazabilidad de Requerimientos (RTM Inicial)

| ID Problema | Descripción del Dolor | Impacto | ID Feature (`02-features.md`) | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-01` | No queda constancia de las veces que se dio de comer | `Alto` | `FEAT-02` | `mod-care-events` |
| `ERR-02` | No se anota el baño ni la consistencia de las heces | `Alto` | `FEAT-03` | `mod-care-events`, `mod-stool-scale` |
| `ERR-03` | Los paseos no se registran | `Alto` | `FEAT-04` | `mod-care-events` |
| `ERR-04` | No hay forma de marcar si la mascota está enferma ni con qué síntomas | `Alto` | `FEAT-05` | `mod-health-status` |
| `ERR-05` | Imposible reconstruir qué ocurrió un día concreto | `Alto` | `FEAT-06`, `FEAT-10` | `mod-day-history` |
| `ERR-06` | Las fechas de vacunas (y preventivos) se olvidan | `Alto` | `FEAT-07` | `mod-preventive-calendar` |
| `ERR-07` | Ficha incompleta: tipo de mascota, edad, identidad | `Alto` | `FEAT-01` | `mod-pet-profile` |
| `ERR-08` | Los datos no persisten entre sesiones | `Alto` | `FEAT-08` | `mod-offline-store` |
| `ERR-09` | Un hogar con más de una mascota mezcla registros | `Medio` | `FEAT-09` | `mod-pet-profile` |

---

## 4. Audiencia y Casos de Uso Core

- **Usuarios principales:**
  - **Cuidador principal:** registrar en segundos comida, baño, paseo o enfermedad, y consultar el día de hoy.
  - **Cuidador que va al veterinario:** abrir el histórico de una fecha y relatar comidas, heces, paseos y estado de salud.
  - **Hogar con 1–N mascotas:** mantener ficha (tipo, edad) y registros separados por mascota.
  - **Usuario offline:** usar la app sin internet, cuentas ni backend.

- **Fuera de alcance (Out of Scope explícito):**
  - iOS, web y cuentas de usuario / backend / sync en la nube.
  - Telemedicina, diagnóstico automático, recetas o consejo veterinario generado por IA.
  - GPS del paseo, fotos de heces, notificaciones push, IAP y anuncios.
  - Recordatorios programados nativos (deseable post-V1).
  - Medicación con horarios, celo, grooming y control de agua (deseable post-V1).

---

## 5. Objetivo y Beneficios Esperados

- **Objetivo:** Entregar V1 instalable (APK Release, Android, 100% offline) donde el cuidador crea la ficha de su mascota (tipo, fecha de nacimiento/edad, peso), registra comidas, baño con consistencia de heces, paseos y episodios de enfermedad, consulta el histórico seleccionando una fecha, y mantiene un calendario de vacunas y desparasitación.
- **Beneficios esperados:**
  - Registro diario rápido, sin fricción, usable en el momento del cuidado.
  - Histórico consultable por fecha para el cuidador y como apoyo al veterinario.
  - Visibilidad de preventivos (vacuna / desparasitación) y de ficha (tipo + edad calculada).
  - Datos locales, privados, sin dependencia de red.

---

## 6. Criterios de Éxito en Formato BDD (Gherkin)

### Escenario 1: Registrar el día y consultarlo después

- **Dado que** `el cuidador tiene una mascota dada de alta y abre la app en Android`
- **Cuando** `registra una comida, un baño con consistencia de heces, un paseo y, si aplica, marca que está enferma; luego elige esa fecha en el histórico`
- **Entonces** `ve el resumen de ese día (eventos, consistencia, estado de salud) sin errores bloqueantes y los datos siguen ahí al reabrir la app`

### Escenario 2: Ficha y vacunas

- **Dado que** `el cuidador crea o edita la ficha (nombre, tipo, fecha de nacimiento)`
- **Cuando** `consulta el perfil y el calendario preventivo`
- **Entonces** `ve tipo de mascota, edad calculada y las vacunas/desparasitaciones con fecha aplicada y próxima dosis si está cargada`

### Escenario 3: Validación de estándares visuales

- **Dado que** `se renderizan componentes visuales (home, formularios, histórico, perfil)`
- **Cuando** `el agente compile la interfaz`
- **Entonces** `los estilos consumen tokens de standards/design-system.md o theme documentado en 04-application-design.md`

---

## 7. Matriz de Restricciones Técnicas y Operativas

| Categoría | Restricción / Límite | Impacto | Estándar asociado |
| :--- | :--- | :--- | :--- |
| **Tiempo** | V1 documentada y construible tras gates; sin fecha de store | `Medio` | `ROADMAP.md` |
| **Tecnología** | `Expo SDK 52, RN 0.76.x, TypeScript` | `Alto` | `standards/coding-standards.md` |
| **Plataforma V1** | `Android APK release sin Metro` | `Alto` | WIKA-ARCH-03 |
| **Diseño / UX** | Theme local V1 (warm care) mapeado en `04-application-design.md` | `Alto` | `standards/design-system.md` |
| **Seguridad** | Offline-first; datos de mascota solo en dispositivo; sin red ni cuentas | `Alto` | `standards/coding-standards.md` |
| **Librerías prohibidas** | `^` en expo/react-native; diagnóstico médico / LLM; GPS | `Bloqueante` | WIKA-ARCH-02 |
| **Permisos** | Ningún permiso sensible en V1 (sin cámara, ubicación ni internet) | `Alto` | WIKA-ARCH-04 |
| **Package** | `com.wika.petcareassistant` | `Medio` | coding-standards |
| **Orientación** | Portrait | `Medio` | design-system mobile-first |
| **Tamaño** | < 30 MB instalado | `Medio` | WIKA-ARCH-03 |

---

## 8. Supuestos y Riesgos

- **Supuestos clave:** Dispositivo Android 7+ (API 24); un cuidador por dispositivo; el usuario conoce los datos de su mascota (tipo, nacimiento aproximado, vacunas); no se requiere red.
- **Riesgos identificados:** Alcance inflado (recordatorios, fotos, GPS); escala de heces ambigua; edad vs fecha de nacimiento inconsistente; varias mascotas mal aisladas en persistencia.
- **Plan de mitigación:** Out-of-scope explícito; catálogo cerrado de consistencia (`mod-stool-scale`); edad **siempre** derivada de `birthDate` (si falta, se pide fecha o “aproximada”); `petId` obligatorio en cada evento; starter `tower/iterations/v1` para toolchain.

---

## 9. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist de criterios de aceptación

- [x] YAML frontmatter completado (`id`, `status`, `owner`, fechas).
- [x] Problemas `ERR-XX` mapeados a `FEAT-XX` y módulos sugeridos en RTM.
- [x] Criterios de éxito en formato BDD (Dado / Cuando / Entonces).
- [x] Out-of-scope explícito documentado.
- [x] Restricciones técnicas alineadas a `standards/coding-standards.md`.
- [ ] Auditoría registrada en `audits/auditoria-documentacion.md` con resultado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `________________________`
- **Fecha de aprobación:** `YYYY-MM-DD`
- **audit_1_passed:** `false` → cambiar a `true` al aprobar
