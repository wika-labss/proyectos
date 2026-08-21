---
id: "MOD-001"
title: "[Descubrimiento y Arquitectura de Módulos]"
status: "BORRADOR"
version: "1.0.0"
owner: "[Nombre del Responsable / Arquitecto]"
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
audit_1_passed: false
audit_2_passed: false
---

# [03] Descubrimiento y Especificación de Arquitectura Modular

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y `02-features.md`.  
> **Equivalencia:** Auditoría de Módulos → `docs/auditoria-modulos.md`.

## 1. Identificación y Documentos Base

- **Nombre del Proyecto:** `[Ej. Tower Defense - WIKA]`
- **Especificaciones base:** `01-problem.md` (`PROB-001`) | `02-features.md` (`FEAT-001`)
- **Estado de gatekeeping:** `[PENDIENTE_AUDITORIA_MODULOS]`

---

## 2. Matriz de Trazabilidad Modular (RTM 1:1)

| ID Módulo | ID Feature (`02-features.md`) | ID Problema (`01-problem.md`) | Nombre del Módulo | Tipo | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MOD-01` | `FEAT-01` | `ERR-01` | `mod-[nombre]` | `engine / lógica` | `[Capacidad principal]` |
| `MOD-02` | `FEAT-02` | `ERR-02` | `mod-[nombre]` | `UI / presentación` | `[Renderizado y navegación]` |

---

## 3. Desglose de Arquitectura Modular

### Módulo `MOD-01`: [Nombre]

**Patrón:** `[Ej. Pure engine / Repository / Feature module]`  
**Ruta en repositorio:** `src/engine/` o `src/modules/[nombre]/`

#### Contrato

- **Entradas:** `[Tipos / eventos que recibe]`
- **Salidas:** `[Estado / eventos que emite]`
- **Dependencias:** `[AsyncStorage, otros módulos, permisos Android]`
- **Reutilizable:** `Sí / No`

#### Reglas de aislamiento

- `[Ej. No importa React ni componentes de MOD-02]`
- `[Ej. Expone funciones puras testeables]`

---

### Módulo `MOD-02`: [Nombre]

**Patrón:** `[Ej. Feature folder / UI kit]`  
**Ruta:** `src/modules/[nombre]/` o `src/components/`

#### Contrato

- **Componentes exportados:** `[Ej. GameScreen, HudPanel]`
- **Props y tokens:** mapeo a `standards/design-system.md` o `theme.ts`
- **Eventos:** `onPress`, `onComplete`, etc.

#### Dependencias

- **Internas:** `MOD-01` (estado/lógica), `constants/theme`
- **Prohibidas:** llamadas directas inversas desde `MOD-01`

---

## 4. Grafo de Dependencias y Reglas de Importación

```text
[app/ screens — expo-router]
       │
       ▼ consume
[MOD-02 UI / components]
       │
       ▼ consume
[MOD-01 engine / services]
       │
       ▼ alineación
[standards/ + theme.ts]
```

**Reglas:**

- Prohibidas importaciones circulares.
- `src/engine/` sin imports de React.
- Estilos solo vía tokens/theme documentados.

---

## 5. Matriz de Riesgos Arquitectónicos

| ID Módulo | Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| `MOD-01` | `[Ej. Estado inconsistente]` | `Alto` | Smoke tests en `scripts/` |
| `MOD-02` | `[Ej. Acoplamiento UI-lógica]` | `Medio` | Hooks/providers como frontera |

---

## 6. Evaluación de Reutilización WIKA

| Módulo | ¿Existe equivalente WIKA? | Decisión |
| :--- | :--- | :--- |
| `MOD-01` | `[Ej. offline-progress en sodoku]` | `Reutilizar / Crear nuevo` |
| `MOD-02` | `[Ej. sodoku-ui-kit en design-system V3+]` | `Diferir a V3+ / Theme local V1` |

---

## 7. Puerta de Enlace y Firma de Auditoría de Módulos

### Checklist

- [ ] Toda feature obligatoria tiene al menos un módulo.
- [ ] Sin módulos duplicados ni responsabilidades superpuestas.
- [ ] Dependencias y riesgos documentados.
- [ ] Reutilización WIKA evaluada.
- [ ] Grafo sin ciclos.
- [ ] `audits/auditoria-modulos.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `________________________`
- **Fecha:** `YYYY-MM-DD`
- **audit_2_passed:** `false` → `true` al aprobar
