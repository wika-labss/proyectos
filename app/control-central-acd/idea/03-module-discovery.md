---
id: "MOD-001"
title: "Control Central ACD — Módulos V1"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Arquitecto WIKA"
created_at: "2026-08-25"
updated_at: "2026-08-25"
audit_1_passed: true
audit_2_passed: true
---

# [03] Descubrimiento y Especificación de Arquitectura Modular

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y `02-features.md`.  
> **Equivalencia:** Auditoría de Módulos → `docs/auditoria-modulos.md`.

## 1. Identificación y Documentos Base

- **Nombre del Proyecto:** `Control Central ACD`
- **Especificaciones base:** `01-problem.md` (`PROB-001`) | `02-features.md` (`FEAT-001`)
- **Estado de gatekeeping:** `AUDIT_2_APROBADO`

---

## 2. Matriz de Trazabilidad Modular (RTM 1:1)

| ID Módulo | ID Feature (`02-features.md`) | ID Problema (`01-problem.md`) | Nombre del Módulo | Tipo | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MOD-01` | `FEAT-01` | `ERR-01` | `mod-mp-query` | engine | Serializar / validar filtros |
| `MOD-02` | `FEAT-01` | `ERR-01` | `mod-mp-api` | client | HTTP a RPCs `consultar_*` |
| `MOD-03` | `FEAT-02` | `ERR-02` | `mod-resumen` | engine | Mapear resumen a series de chart |
| `MOD-04` | `FEAT-03` | `ERR-03` | `mod-licitaciones` | engine | Lista, paginación, flags |
| `MOD-05` | `FEAT-04`, `FEAT-05`, `FEAT-07` | `ERR-04`, `ERR-05` | `mod-ganador` | engine | Ítems, %, urls ficha/acta |
| `MOD-06` | `FEAT-06` | `ERR-06` | `mod-filters-store` | persist | AsyncStorage del filtro |
| `MOD-07` | `FEAT-01`–`FEAT-07` | todos | `mod-consultas-ui` | UI | Pantallas, chips, cards |
| `MOD-08` | `FEAT-02` | `ERR-02` | `mod-charts` | UI | Barras con `View` |
| `MOD-09` | `FEAT-08` | `ERR-01` | `mod-android-release` | build | APK / verify-build |

---

## 3. Desglose de Arquitectura Modular

### Módulo `MOD-01`: `mod-mp-query`

**Patrón:** Pure engine  
**Ruta:** `src/engine/filters.ts`

#### Contrato

- **Entradas:** fechas ISO, rubro, tipo `L1|LE|LP`, estados `smallint[]`, limit/offset
- **Salidas:** `QueryFilter` serializable a body JSON de RPC
- **Dependencias:** ninguna
- **Reutilizable:** Sí (web V1.1)

#### Reglas de aislamiento

- Sin React. Sin fetch.

---

### Módulo `MOD-02`: `mod-mp-api`

**Patrón:** HTTP client  
**Ruta:** `src/engine/acdApi.ts`

#### Contrato

- **Entradas:** `QueryFilter`, `codigo`
- **Salidas:** JSON tipado de `consultar_rubros|estados|resumen|licitaciones|ganador`
- **Dependencias:** `EXPO_PUBLIC_SUPABASE_URL` + anon key de **mercado-publico**
- **Reutilizable:** Sí

#### Reglas de aislamiento

- Sin React. **Prohibido** host `api.mercadopublico.cl`. Solo `/rest/v1/rpc/consultar_*`.

---

### Módulo `MOD-03`: `mod-resumen`

**Patrón:** Pure mapper  
**Ruta:** `src/engine/resumen.ts`

- **Entradas:** payload `consultar_resumen`
- **Salidas:** series `{ label, value, codigo? }[]` para barras; máximo para escala
- Sin React.

---

### Módulo `MOD-04`: `mod-licitaciones`

**Patrón:** Pure mapper  
**Ruta:** `src/engine/licitaciones.ts`

- **Entradas:** filas RPC
- **Salidas:** cards con `tiene_ganador`, `tiene_acta`, `url_ficha`
- Sin React.

---

### Módulo `MOD-05`: `mod-ganador`

**Patrón:** Pure mapper  
**Ruta:** `src/engine/ganador.ts`

- **Entradas:** payload `consultar_ganador`
- **Salidas:** totales, `pctEstimado`, `canOpenActa`, `canOpenFicha`
- Sin React.

---

### Módulo `MOD-06`: `mod-filters-store`

**Patrón:** Persistencia  
**Ruta:** `src/modules/filters-store/`

- **Entradas / salidas:** `QueryFilter` JSON
- **Dependencias:** AsyncStorage clave `acd:v1:filters`
- UI no habla con AsyncStorage directo (vía hook/provider).

---

### Módulo `MOD-07`: `mod-consultas-ui`

**Patrón:** Feature UI  
**Ruta:** `app/`, `src/components/`, `src/hooks/`

- **Componentes:** `Screen`, `FilterBar`, `EstadoChip`, `LicitacionCard`, `PrimaryButton`, `TabBar`
- **Tokens:** `theme.ts` (04)
- **Eventos:** aplicar filtro, tap estado, abrir perfil, abrir acta/ficha

---

### Módulo `MOD-08`: `mod-charts`

**Patrón:** UI kit mínimo  
**Ruta:** `src/components/BarChart.tsx`

- Barras horizontales con `View`. Sin librería de charts.
- Props: series + `onPressBar`.

---

### Módulo `MOD-09`: `mod-android-release`

**Patrón:** Toolchain WIKA  
**Ruta:** `scripts/verify-build.sh`, `scripts/build-apk.sh`, `app.json`

- Package `com.wika.controlcentralacd`. Starter tower.

---

## 4. Grafo de Dependencias y Reglas de Importación

```text
[app/ screens — expo-router]
       │
       ▼ consume
[MOD-07 UI / MOD-08 charts]
       │
       ▼ consume
[hooks: FiltersProvider]
       │
       ├── MOD-06 filters-store
       └── MOD-01 query → MOD-02 api → MOD-03/04/05 mappers
       │
       ▼ alineación
[theme.ts]
```

**Reglas:**

- Prohibidas importaciones circulares.
- `src/engine/` sin imports de React.
- Estilos solo vía tokens/theme.

---

## 5. Matriz de Riesgos Arquitectónicos

| ID Módulo | Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| `MOD-02` | Llamar ChileCompra por error | `Alto` | Un solo cliente `acdApi.ts`; smoke + NFR-05 |
| `MOD-02` | Anon key del proyecto horóscopo | `Alto` | Config `wdpvlmuescstqnliorkx` |
| `MOD-04` | Adjudicadas sin ficha | `Medio` | Flag `tiene_ganador` |
| `MOD-08` | Chart lib hincha APK | `Medio` | Solo `View` |
| `MOD-09` | Prebuild Android | `Medio` | `post-prebuild.js` Kotlin 1.9.25 |

---

## 6. Evaluación de Reutilización WIKA

| Módulo | ¿Existe equivalente WIKA? | Decisión |
| :--- | :--- | :--- |
| `MOD-09` | tower `verify-build` / APK | Reutilizar scripts |
| `MOD-02` | horoscopo-alan `horoscopeApi.ts` | Reutilizar patrón fetch + anon; **otro** proyecto Supabase |
| `MOD-06` | AsyncStorage (tower/pet-care) | Reutilizar patrón, clave nueva |
| `MOD-01`–`05` | No hay dominio licitaciones | Crear nuevo |
| `MOD-07`/`08` | design-system V3+ | Theme local V1 |

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

- **Aprobado por (Arquitecto):** `Vissiuss`
- **Fecha:** `2026-08-25`
- **audit_2_passed:** `true`
