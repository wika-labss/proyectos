---
id: "DES-001"
title: "Control Central ACD — Diseño V1"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Arquitecto WIKA"
created_at: "2026-08-25"
updated_at: "2026-08-25"
audit_1_passed: true
audit_2_passed: true
visual_approval_passed: true
audit_3_passed: true
---

# [04] Diseño de Aplicación, Navegación y Aprobación Visual

> **Pre-requisito:** `audit_2_passed: true` en `03-module-discovery.md`.  
> **Gate visual:** `visual_approval_passed: true` requiere visto bueno del arquitecto/stakeholder.  
> **Equivalencia:** Auditoría de Ensamblado (parte visual) → `docs/auditoria-ensamblado.md`.

## 1. Identificación y Antecedentes

- **Nombre del Proyecto:** `Control Central ACD`
- **Documentos base:** `01-problem.md` | `02-features.md` | `03-module-discovery.md`
- **Estado de gatekeeping:** `VISUAL_Y_ENSAMBLADO_APROBADO`

---

## 2. Arquitectura General

V1 ensambla capas WIKA:

1. **`app/` (expo-router)** — pantallas; sin fetch directo.
2. **`src/hooks/FiltersProvider`** — filtro + llamadas a `acdApi`.
3. **`src/engine/`** — filtros, API, mappers (sin React).
4. **`src/modules/filters-store/`** — AsyncStorage.
5. **`src/constants/theme.ts`** — tokens dashboard.
6. **`src/components/`** — UI (`MOD-07`, `MOD-08`).

API: `POST https://wdpvlmuescstqnliorkx.supabase.co/rest/v1/rpc/consultar_*` con anon JWT.

---

## 3. Módulos Utilizados en V1

| ID Módulo | Nombre | Rol en V1 |
| :--- | :--- | :--- |
| `MOD-01` | `mod-mp-query` | Filtros |
| `MOD-02` | `mod-mp-api` | RPCs |
| `MOD-03` | `mod-resumen` | Series tablero |
| `MOD-04` | `mod-licitaciones` | Cards |
| `MOD-05` | `mod-ganador` | Perfil |
| `MOD-06` | `mod-filters-store` | Persistencia |
| `MOD-07` | `mod-consultas-ui` | Pantallas |
| `MOD-08` | `mod-charts` | Barras |
| `MOD-09` | `mod-android-release` | APK |

---

## 4. Relaciones entre Módulos

Flujo: **pantalla → FiltersProvider → MOD-01 → MOD-02 → mappers 03/04/05 → UI**. Persistencia MOD-06 al cambiar filtro.

Estados de pantalla: `loading` · `empty` · `partial` (adjudicada sin RUT) · `error` · `success` · `offline`.

---

## 5. Flujo Principal de Usuario

```text
[Tablero + filtros]
    → tap segmento estado/rubro
        → [Listado filtrado]
            → [Detalle código]
                → si tiene_ganador → [Perfil]
                    → CTA acta / ficha
```

---

## 6. Navegación (expo-router)

| Ruta | Pantalla | Módulos | Feature |
| :--- | :--- | :--- | :--- |
| `/` | Tablero | MOD-03, 07, 08 | FEAT-01, FEAT-02 |
| `/licitaciones` | Listado | MOD-04, 07 | FEAT-03 |
| `/licitaciones/[codigo]` | Detalle | MOD-04, 07 | FEAT-03, FEAT-07 |
| `/licitaciones/[codigo]/ganador` | Perfil | MOD-05, 07 | FEAT-04, FEAT-05 |

Tabs inferiores: Tablero · Listado (touch ≥ 44 dp).

---

## 7. Consumo de Tokens y Theme

> Hex **solo** en `src/constants/theme.ts`.

### Tokens clave V1

| Token semántico | Uso en app | Valor / referencia |
| :--- | :--- | :--- |
| `background` | Fondo | `#0F1720` |
| `surface` | Cards / filtros | `#1B2733` |
| `text` | Principal | `#F4F7FA` |
| `textMuted` | Meta | `#9AA8B5` |
| `accent` | CTA, chip activo | `#3DDC97` |
| `error` | Errores red | `#F07167` |
| `border` | Bordes | `#2C3A47` |
| `estado.publicada` | Chip 5 | `#5B8DEF` |
| `estado.cerrada` | Chip 6 | `#C9A227` |
| `estado.adjudicada` | Chip 8 | `#3DDC97` |
| `estado.desierta` | Chip 7 | `#F07167` |
| `estado.otro` | 15/16/18/19 | `#9AA8B5` |
| `spacing.md` | Padding | `16` |
| `radius.md` | Cards | `12` |

---

## 8. Matriz Preview Visual vs Componentes de Código

| ID Vista | ID Módulo | Componente / Pantalla | Tokens | Referencia wireframe |
| :--- | :--- | :--- | :--- | :--- |
| `VIEW-01` | MOD-07, 08 | Tablero `/` | background, accent, estado.* | ASCII §9 |
| `VIEW-02` | MOD-07 | Listado `/licitaciones` | surface, estado.* | ASCII §9 |
| `VIEW-03` | MOD-07 | Detalle `[codigo]` | surface, accent | ASCII §9 |
| `VIEW-04` | MOD-07 | Perfil `.../ganador` | accent (CTA) | ASCII §9 |

---

## 9. Layout Visual (wireframe / ASCII)

### VIEW-01 Tablero

```text
┌─────────────────────────────────┐
│  Control Central ACD    filtros │
│  rango fechas · Rubro: todos    │
├─────────────────────────────────┤
│  [L1] [LE] [LP]                 │
├─────────────────────────────────┤
│  Por estado                     │
│   ████ Publicada                │
│   ████ Adjudicada               │
├─────────────────────────────────┤
│  Por rubro (top)                │
├─────────────────────────────────┤
│  Volumen por día                │
├─────────────────────────────────┤
│  Tablero │ Listado              │
└─────────────────────────────────┘
```

### VIEW-02 Listado

```text
┌─────────────────────────────────┐
│  1035-20-LE26            LE · 8 │
│  Compost vivero Chomedahue      │
│  CONAF · O’Higgins              │
│  [Ver perfil]  [Ficha]          │
├─────────────────────────────────┤
│  Tablero │ Listado              │
└─────────────────────────────────┘
```

### VIEW-04 Perfil ganador

```text
┌─────────────────────────────────┐
│  ←  Propuesta ganadora          │
│  RUT + razón social             │
│  ítems · total · % estimado     │
│  [ Descargar acta ]             │
│  [ Abrir ficha MP ]             │
└─────────────────────────────────┘
```

---

## 10. Riesgos de Diseño

| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| Tabla densa no cabe en móvil | Medio | Cards, no 12 columnas (web V1.1) |
| Charts nativos pesados | Medio | `View` bars |
| Theme local vs design-system V3+ | Bajo | Documentado; V3+ pipeline aparte |

---

## 11. Superficie V1.1 (no construir)

Página web: mismas RPCs, filtros persistentes, tabla con sort, drawer de perfil. Expo Router web queda diferido.

---

## 12. Puerta de Enlace — Aprobación Visual y Ensamblado

### Checklist aprobación visual (Gate 3A)

- [x] Navegación y flujo principal definidos.
- [x] Todos los módulos V1 incorporados sin huérfanos.
- [x] Tokens/theme documentados.
- [x] Wireframe revisado por arquitecto.
- [x] Sin dependencias circulares.

### Checklist auditoría de ensamblado (Gate 3B)

- [x] `05-build-plan.md` coherente con este diseño.
- [x] Estrategia de build y riesgos alineados.
- [x] `audits/auditoria-ensamblado.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobación visual (Arquitecto / Stakeholder):** `Vissiuss`
- **Fecha visual:** `2026-08-25`
- **visual_approval_passed:** `true`

- **Aprobación ensamblado (Arquitecto):** `Vissiuss`
- **Fecha ensamblado:** `2026-08-25`
- **audit_3_passed:** `true`
