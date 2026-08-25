---
id: "FEAT-001"
title: "Control Central ACD — Features V1"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-08-25"
updated_at: "2026-08-25"
audit_1_passed: true
audit_2_passed: true
---

# [02] Especificación de Características y Requerimientos Funcionales

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y este documento.  
> **Equivalencia:** Auditoría de Documentación → `docs/auditoria-documentacion.md`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `Control Central ACD`
- **Documento base:** `idea/01-problem.md` (ID: `PROB-001`)
- **Estado de gatekeeping:** `AUDIT_1_APROBADO`

---

## 2. Matriz de Trazabilidad de Requerimientos (RTM 1:1)

| ID Feature | ID Problema (`01-problem.md`) | Nombre de la Característica | Prioridad | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-01` | `ERR-01` | Filtro fecha + rubro + tipo (+ estado) | `Crítica` | `mod-mp-query`, `mod-mp-api` |
| `FEAT-02` | `ERR-02` | Tablero con resumen gráfico | `Crítica` | `mod-resumen`, `mod-charts` |
| `FEAT-03` | `ERR-03` | Listado de licitaciones con estado | `Crítica` | `mod-licitaciones` |
| `FEAT-04` | `ERR-04` | Perfil de ganador (propuesta + ítems) | `Crítica` | `mod-ganador` |
| `FEAT-05` | `ERR-05` | CTA acta si hay URL | `Alta` | `mod-ganador` |
| `FEAT-06` | `ERR-06` | Persistir último filtro | `Media` | `mod-filters-store` |
| `FEAT-07` | `ERR-01` | Link ficha pública (url_ficha de la API) | `Alta` | `mod-ganador`, `mod-licitaciones` |
| `FEAT-08` | `ERR-01` | APK Release Android | `Crítica` | `mod-android-release` |

---

## 3. Funcionalidades Obligatorias

### Feature `FEAT-01`: Filtros de consulta

**Descripción:** El usuario acota el universo (fecha desde/hasta, rubro UNSPSC 2 dígitos, tipo L1/LE/LP, estado). El engine serializa el filtro; `mod-mp-api` llama `consultar_rubros`, `consultar_estados` y pasa el mismo filtro a resumen/listado.

#### Escenario 1.1: Flujo exitoso (Happy Path)

- **Dado que** `la API propia responde rubros y estados`
- **Cuando** `el usuario elige un rubro, un tipo y un rango de fechas`
- **Entonces** `tablero y listado se recargan con ese filtro; no hay fetch a ChileCompra`

#### Escenario 1.2: Manejo de errores

- **Dado que** `no hay red o la RPC falla`
- **Cuando** `se intenta aplicar el filtro`
- **Entonces** `se muestra mensaje de error con token error; la app no crashea`

---

### Feature `FEAT-02`: Tablero

**Descripción:** Gráficos de barras (View) a partir de `consultar_resumen`: por estado, por rubro (top), por día. Tap en un segmento aplica ese filtro y navega al listado.

#### Escenario 2.1: Happy Path

- **Dado que** `hay datos en el rango`
- **Cuando** `abre el tablero`
- **Entonces** `ve conteos por estado y top rubros; tap en Adjudicada abre el listado con estado=8`

#### Escenario 2.2: Vacío

- **Dado que** `el filtro no tiene filas`
- **Cuando** `abre el tablero`
- **Entonces** `ve estado empty, no un gráfico inventado`

---

### Feature `FEAT-03`: Listado con estados

**Descripción:** Cards paginadas desde `consultar_licitaciones`: código, nombre, chip de estado, organismo, monto si hay, flags `tiene_ganador` / `tiene_acta`.

#### Escenario 3.1: Happy Path

- **Dado que** `el filtro actual tiene licitaciones`
- **Cuando** `abre el listado`
- **Entonces** `cada card muestra estado con token `estado.*`; si `tiene_ganador` hay botón Ver perfil`

#### Escenario 3.2: Adjudicada sin ganador en BD

- **Dado que** `codigo_estado=8 y tiene_ganador=false`
- **Cuando** `ve la card`
- **Entonces** `muestra chip Sin perfil; no ofrece botón de perfil`

---

### Feature `FEAT-04`: Perfil de ganador

**Descripción:** `consultar_ganador(codigo)` arma RUT, nombre, ítems (cantidad × unitario), total, % del estimado, número de oferentes.

#### Escenario 4.1: Happy Path

- **Dado que** `1035-20-LE26 tiene adjudicación en BD`
- **Cuando** `abre `/licitaciones/1035-20-LE26/ganador``
- **Entonces** `ve proveedor, ítems y % vs estimado`

#### Escenario 4.2: Sin ganador

- **Dado que** `la RPC no encuentra adjudicación`
- **Cuando** `se abre la ruta de perfil`
- **Entonces** `mensaje “Ganador aún no cargado”; sin inventar RUT`

---

### Feature `FEAT-05`: CTA acta

**Descripción:** Si `url_acta` viene en la API, botón **Descargar acta** abre la URL con `Linking.openURL`. No se parsea el PDF.

#### Escenario 5.1: Happy Path

- **Dado que** `tiene_acta=true`
- **Cuando** `pulsa Descargar acta`
- **Entonces** `el sistema abre `url_acta``

#### Escenario 5.2: Sin acta

- **Dado que** `url_acta es null`
- **Cuando** `ve el perfil`
- **Entonces** `CTA deshabilitado y texto “Aún no hay acta en Mercado Público”`

---

### Feature `FEAT-06`: Persistir filtros

**Descripción:** Último filtro en AsyncStorage; al reabrir la app se rehidrata.

#### Escenario 6.1

- **Dado que** `el usuario cambió rubro y fechas`
- **Cuando** `cierra y vuelve a abrir`
- **Entonces** `el tablero usa ese filtro`

---

### Feature `FEAT-07`: Link ficha pública

**Descripción:** `url_ficha` la calcula la API propia (no ChileCompra live). Botón **Abrir ficha MP** en detalle y perfil.

#### Escenario 7.1

- **Dado que** `la fila tiene codigo_externo`
- **Cuando** `pulsa Abrir ficha MP`
- **Entonces** `abre la URL devuelta por la API`

---

### Feature `FEAT-08`: APK Release

**Descripción:** Artefacto Android instalable sin Metro (`scripts/build-apk.sh`).

#### Escenario 8.1

- **Dado que** `JDK 17 y Android SDK están configurados`
- **Cuando** `corre `npm run verify``
- **Entonces** `typecheck, smoke, export y assembleRelease pasan`

---

## 4. Funcionalidades Deseables (V1.1+)

| ID Feature | Nombre | Prioridad | Notas |
| :--- | :--- | :--- | :--- |
| `FEAT-09` | Página web (mismas RPCs, tabla densa) | `Alta` | Fuera de V1 |
| `FEAT-10` | Ranking de proveedores | `Media` | Post-V1 |
| `FEAT-11` | Órdenes de compra como 2.ª fuente de ganador | `Media` | Requiere ingest OC |
| `FEAT-12` | Parseo del PDF del acta | `Baja` | No en V1 |

---

## 5. Fuera de Alcance

- iOS, web V1, login.
- `fetch` a `api.mercadopublico.cl` desde Expo.
- Ticket ChileCompra en `EXPO_PUBLIC_*` o `app.json`.
- Ingest/cron/backfill, OC, cargar ficha on-demand contra ChileCompra.

---

## 6. Requerimientos No Funcionales (NFRs) Medibles

| ID NFR | Categoría | Criterio aceptable | Método de validación |
| :--- | :--- | :--- | :--- |
| `NFR-01` | **Rendimiento** | Engine smoke &lt; 30s | `npm run smoke` |
| `NFR-02` | **Build** | APK release sin Metro | `scripts/build-apk.sh` |
| `NFR-03` | **Fidelidad visual** | 100% tokens en theme | `04-application-design.md` |
| `NFR-04` | **Red** | Sin crash offline; mensaje | `expo-network` + QA |
| `NFR-05` | **Seguridad** | Cero llamadas a ChileCompra en cliente | grep + revisión `acdApi.ts` |
| `NFR-06` | **API** | Solo `consultar_*` | PostgREST |

---

## 7. Mapeo de UI y Componentes (si aplica)

| Componente UI | Pantalla / Vista | Tokens | Estado mockup |
| :--- | :--- | :--- | :--- |
| `FilterBar` | Tablero / Listado | `surface`, `accent` | Wireframe 04 |
| `EstadoChip` | Listado | `estado.*` | Wireframe 04 |
| `BarChart` | Tablero | `accent`, `estado.*` | View bars |
| `LicitacionCard` | Listado | `surface`, `text` | Wireframe 04 |
| `PrimaryButton` | Perfil (acta) | `accent` | CTA |

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

- **Aprobado por (Arquitecto):** `Vissiuss`
- **Fecha:** `2026-08-25`
- **audit_1_passed:** `true`
