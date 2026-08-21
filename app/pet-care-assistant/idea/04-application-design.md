---
id: "DES-001"
title: "Diseño de Aplicación — Pet Care Assistant"
status: "BORRADOR"
version: "1.0.0"
owner: "Vissiuss / Arquitecto WIKA"
created_at: "2026-08-21"
updated_at: "2026-08-21"
audit_1_passed: false
audit_2_passed: false
visual_approval_passed: false
audit_3_passed: false
---

# [04] Diseño de Aplicación, Navegación y Aprobación Visual

> **Pre-requisito:** `audit_2_passed: true` en `03-module-discovery.md`.  
> **Gate visual:** `visual_approval_passed: true` requiere visto bueno del arquitecto/stakeholder.  
> **Equivalencia:** Auditoría de Ensamblado (parte visual) → `docs/auditoria-ensamblado.md`.

## 1. Identificación y Antecedentes

- **Nombre del Proyecto:** `Pet Care Assistant`
- **Documentos base:** `01-problem.md` | `02-features.md` | `03-module-discovery.md`
- **Estado de gatekeeping:** `PENDIENTE_APROBACION_VISUAL`

---

## 2. Arquitectura General

V1 ensambla capas WIKA:

1. **`app/` (expo-router)** — pantallas; sin lógica de dominio.
2. **`src/hooks/CareProvider`** — hidrata `MOD-08`, despacha comandos a `MOD-07`.
3. **`src/engine/`** — `mod-pet-engine` + perfiles, eventos, heces, salud, histórico, preventivos (sin React).
4. **`src/modules/offline-store/`** — serializa `AppState`.
5. **`src/constants/theme.ts`** — tokens semánticos de esta sección (warm care).
6. **`src/components/`** — UI reutilizable (`MOD-09`).

---

## 3. Módulos Utilizados en V1

| ID Módulo | Nombre | Rol en V1 |
| :--- | :--- | :--- |
| `MOD-01` | `mod-pet-profile` | Ficha y selector de mascota |
| `MOD-02` | `mod-care-events` | Comida, baño, paseo, nota |
| `MOD-03` | `mod-stool-scale` | Badge de consistencia |
| `MOD-04` | `mod-health-status` | Banner enfermo / sano |
| `MOD-05` | `mod-day-history` | Home (hoy) + histórico por fecha |
| `MOD-06` | `mod-preventive-calendar` | Lista vacunas / desparasitación |
| `MOD-07` | `mod-pet-engine` | Estado único |
| `MOD-08` | `mod-offline-store` | Rehidratación |
| `MOD-09` | `mod-care-ui` | Todas las vistas |
| `MOD-10` | `mod-android-release` | APK |

---

## 4. Relaciones entre Módulos

Flujo de datos: **pantalla → hook/provider → engine (comando puro) → nuevo estado → persistencia → re-render**.

| Emisor | Evento / dato | Consumidor |
|--------|---------------|------------|
| `VIEW-04..07`, `VIEW-10` | `addEvent` / `createPet` / `setHealth` | `CareProvider` → `MOD-07` |
| `MOD-07` | `AppState` | `MOD-05` (query), `MOD-09` (render) |
| `CareProvider` | `save(state)` | `MOD-08` |
| `MOD-08` | `load()` al boot | `CareProvider` |
| `MOD-03` | `severity` | `StoolBadge` |
| `MOD-06` | `dueStatus` | banner home + `VIEW-09` |

---

## 5. Flujo Principal de Usuario

```text
[Onboarding / alta ficha]
    → [Home hoy]
        → [Registrar comida | baño | paseo | salud | nota]
        → [Histórico: elegir fecha → detalle del día]
        → [Vacunas / preventivos]
        → [Perfil / otra mascota]
    → persistencia local automática
```

Estados a documentar:

| Estado | Cuándo | UI |
|--------|--------|-----|
| `loading` | Boot / rehidratación | Splash corto o skeleton home |
| `empty-pets` | Sin fichas | Onboarding FEAT-01 |
| `success` | Estado válido | Home / listados |
| `error` | Validación de form o storage corrupto | Inline error token; reset si corrupto |
| `empty-day` | Fecha sin eventos | “Sin registros este día” + CTA registrar |

---

## 6. Navegación (expo-router)

| Ruta | Pantalla | Módulos | Feature | Vista |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Home / dashboard hoy | `MOD-05`, `MOD-09` | `FEAT-10` | `VIEW-01` |
| `/pets` | Lista / selector de mascotas | `MOD-01`, `MOD-09` | `FEAT-09` | `VIEW-03` |
| `/pets/new` | Alta de mascota | `MOD-01`, `MOD-09` | `FEAT-01` | `VIEW-10` |
| `/pets/[id]` | Ficha / editar perfil | `MOD-01`, `MOD-04`, `MOD-09` | `FEAT-01` | `VIEW-02` |
| `/log/feed` | Registrar comida | `MOD-02`, `MOD-09` | `FEAT-02` | `VIEW-04` |
| `/log/bathroom` | Registrar baño | `MOD-02`, `MOD-03`, `MOD-09` | `FEAT-03` | `VIEW-05` |
| `/log/walk` | Registrar paseo | `MOD-02`, `MOD-09` | `FEAT-04` | `VIEW-06` |
| `/log/health` | Salud / enfermo | `MOD-04`, `MOD-09` | `FEAT-05` | `VIEW-07` |
| `/log/note` | Nota del día | `MOD-02`, `MOD-09` | `FEAT-11` | `VIEW-11` |
| `/history` | Histórico (fecha + lista) | `MOD-05`, `MOD-09` | `FEAT-06` | `VIEW-08` |
| `/preventive` | Vacunas y desparasitación | `MOD-06`, `MOD-09` | `FEAT-07` | `VIEW-09` |

Tab bar inferior (3 destinos, touch ≥ 44 dp): **Hoy** `/` · **Histórico** `/history` · **Ficha** `/pets/[id]` (o `/pets` si N>1). Vacunas se alcanzan desde ficha y desde aviso en home.

---

## 7. Consumo de Tokens y Theme

> **Regla:** Estilos derivados de `standards/design-system.md` o `theme.ts` documentado aquí. Profesionalización V3+ vía repo `design-system/`.

Familia local V1: **warm-care** (crema + sage). Hex **solo** en `src/constants/theme.ts`.

### Tokens clave V1

| Token semántico | Uso en app | Valor / referencia |
| :--- | :--- | :--- |
| `background` | Fondo app | `theme.colors.background` `#F7F1E8` |
| `surface` | Cards, sheets | `theme.colors.surface` `#FFFBF5` |
| `text` | Texto principal | `theme.colors.text` `#2C2416` |
| `textMuted` | Secundario, horas | `theme.colors.textMuted` `#6B5E4E` |
| `accent` | CTA primario, heces firme | `theme.colors.accent` `#4F7A5A` |
| `accentMuted` | Chips seleccionados | `theme.colors.accentMuted` `#DCE8E0` |
| `warning` | Heces blanda/dura; vacuna ≤14 días | `theme.colors.warning` `#C47B1A` |
| `error` | Validación; heces líquida/moco/sangre; enfermo | `theme.colors.error` `#B42318` |
| `border` | Divisores | `theme.colors.border` `#E4D9C8` |
| `spacing.md` | Padding estándar | `16 dp` |
| `spacing.lg` | Secciones | `24 dp` |
| `radius.md` | Cards / botones | `12 dp` |
| `fontSize.md` | Cuerpo | `16` |
| `fontSize.lg` | Título mascota | `22` |

Copy de marca (home): **Pet Care Assistant**. Tagline: “El día de tu mascota, en un vistazo.”

---

## 8. Matriz Preview Visual vs Componentes de Código

| ID Vista | ID Módulo | Componente / Pantalla | Tokens | Referencia wireframe |
| :--- | :--- | :--- | :--- | :--- |
| `VIEW-01` | `MOD-05`, `MOD-09` | `HomeScreen` | `background`, `accent`, `warning`, `error` | ASCII §9 Home |
| `VIEW-02` | `MOD-01`, `MOD-09` | `PetProfileScreen` | `surface`, `text`, `border` | ASCII §9 Ficha |
| `VIEW-03` | `MOD-01`, `MOD-09` | `PetListScreen` | `surface`, `accent` | Lista simple |
| `VIEW-04` | `MOD-02`, `MOD-09` | `LogFeedScreen` | `accent`, `error` | Formulario log |
| `VIEW-05` | `MOD-02`, `MOD-03`, `MOD-09` | `LogBathroomScreen` | `accent`, `warning`, `error` | Form + chips heces |
| `VIEW-06` | `MOD-02`, `MOD-09` | `LogWalkScreen` | `accent`, `border` | Formulario log |
| `VIEW-07` | `MOD-04`, `MOD-09` | `HealthScreen` | `error`, `accent` | Estado + síntomas |
| `VIEW-08` | `MOD-05`, `MOD-09` | `HistoryScreen` | `text`, `textMuted`, `border` | ASCII §9 Histórico |
| `VIEW-09` | `MOD-06`, `MOD-09` | `PreventiveScreen` | `surface`, `warning` | Lista preventivos |
| `VIEW-10` | `MOD-01`, `MOD-09` | `NewPetScreen` | `background`, `error` | Form alta |
| `VIEW-11` | `MOD-02`, `MOD-09` | `LogNoteScreen` | `border`, `text` | Textarea 280 |

> No hay mockups PNG formales en V1. `visual_approval_passed` queda pendiente de revisión arquitectónica de este wireframe textual.

---

## 9. Layout Visual (wireframe / ASCII)

### Home — `VIEW-01`

```text
┌─────────────────────────────────────┐
│ [PetSwitcher ▾ Luna]     [Ficha]    │  MOD-09
├─────────────────────────────────────┤
│ Luna · Perro · 3a 2m                │
│ [Banner] Enfermo · vómito    MOD-04 │
│ [Aviso] Vacuna antirrábica en 5d    │
├─────────────────────────────────────┤
│ Hoy                                 │
│  Comidas 2   Baño 1   Paseos 1      │  MOD-05
│  Última heces: Blanda  (warning)    │  MOD-03
├─────────────────────────────────────┤
│ [+ Comida] [+ Baño] [+ Paseo]       │
│ [+ Salud]  [+ Nota]                 │
├─────────────────────────────────────┤
│ Actividad de hoy (lista corta)      │
│  08:10  Comida  seco                │
│  09:40  Baño    heces · blanda      │
│  18:05  Paseo   30 min              │
├─────────────────────────────────────┤
│  (Hoy)     (Histórico)    (Ficha)   │  tabs
└─────────────────────────────────────┘
```

### Histórico — `VIEW-08`

```text
┌─────────────────────────────────────┐
│  [<]  jueves 20 ago 2026  [>]       │  DatePager
│  [Elegir fecha]                     │
├─────────────────────────────────────┤
│  Resumen: 2 comidas · 1 baño        │
│           1 paseo · enfermo         │
├─────────────────────────────────────┤
│  08:10  Comida   seco               │
│  09:40  Baño     heces · blanda     │
│  18:05  Paseo    30 min             │
│  21:00  Salud    marcado enfermo    │
├─────────────────────────────────────┤
│  empty: “Sin registros este día”    │
│         [Registrar ahora]           │
└─────────────────────────────────────┘
```

### Registrar baño — `VIEW-05`

```text
┌─────────────────────────────────────┐
│  Baño                               │
│  Tipo: (Orina) (Heces) (Ambos)      │
│  Consistencia (si heces):           │
│   (Firme) (Dura) (Blanda)           │
│   (Líquida) (Moco) (Sangre)         │
│  Hora: [ahora ▾]                    │
│  [Guardar]                          │
└─────────────────────────────────────┘
```

### Ficha — `VIEW-02`

```text
┌─────────────────────────────────────┐
│  Luna                               │
│  Tipo perro · hembra · 3a 2m        │
│  Peso 12,4 kg                       │
│  Estado: enfermo                    │
│  [Editar] [Vacunas] [Otra mascota]  │
│  [Eliminar mascota]                 │
└─────────────────────────────────────┘
```

---

## 10. Riesgos de Diseño

| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| Demasiados CTAs en home | `Medio` | Fila de 3 primarios (comida/baño/paseo) + overflow salud/nota |
| Consistencia de heces poco clara | `Alto` | Chips con etiqueta humana + color de severidad; sin jerga clínica |
| Calendario nativo confuso | `Medio` | DatePager ±1 día + picker nativo “Elegir fecha” |
| Theme local vs design-system V3+ | `Medio` | Hex solo en `theme.ts`; migrar familia en V3+ |
| Disclaimer de salud omitido | `Alto` | Banner fijo en `VIEW-07` y pie de `HealthBanner` |

---

## 11. Puerta de Enlace — Aprobación Visual y Ensamblado

### Checklist aprobación visual (Gate 3A)

- [x] Navegación y flujo principal definidos.
- [x] Todos los módulos V1 incorporados sin huérfanos.
- [x] Tokens/theme documentados o N/A justificado.
- [ ] Wireframe o preview revisado por arquitecto.
- [x] Sin dependencias circulares.

### Checklist auditoría de ensamblado (Gate 3B)

- [x] `05-build-plan.md` coherente con este diseño.
- [x] Estrategia de build y riesgos alineados.
- [ ] `audits/auditoria-ensamblado.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobación visual (Arquitecto / Stakeholder):** `________________________`
- **Fecha visual:** `YYYY-MM-DD`
- **visual_approval_passed:** `false` → `true` al aprobar preview

- **Aprobación ensamblado (Arquitecto):** `________________________`
- **Fecha ensamblado:** `YYYY-MM-DD`
- **audit_3_passed:** `false` → `true` al aprobar ensamblado
