---
id: "DES-001"
title: "[Diseño de Aplicación y Mapeo Visual]"
status: "BORRADOR"
version: "1.0.0"
owner: "[Nombre del Diseñador / Arquitecto]"
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
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

- **Nombre del Proyecto:** `[Ej. Tower Defense - WIKA]`
- **Documentos base:** `01-problem.md` | `02-features.md` | `03-module-discovery.md`
- **Estado de gatekeeping:** `[PENDIENTE_APROBACION_VISUAL]`

---

## 2. Arquitectura General

`[Describir capas: expo-router, engine, modules, theme. Cómo se ensamblan para V1.]`

---

## 3. Módulos Utilizados en V1

| ID Módulo | Nombre | Rol en V1 |
| :--- | :--- | :--- |
| `MOD-01` | `mod-[nombre]` | `[Lógica / engine]` |
| `MOD-02` | `mod-[nombre]` | `[UI / navegación]` |

---

## 4. Relaciones entre Módulos

`[Describir flujo de datos: pantalla → hook/provider → engine → persistencia.]`

---

## 5. Flujo Principal de Usuario

```text
[Home] → [Acción principal] → [Resultado] → [Persistencia / replay]
```

Estados a documentar: loading, success, error, empty (si aplica).

---

## 6. Navegación (expo-router)

| Ruta | Pantalla | Módulos | Feature |
| :--- | :--- | :--- | :--- |
| `/` | `[Home]` | `MOD-02` | `FEAT-01` |
| `/play` | `[Juego]` | `MOD-01`, `MOD-02` | `FEAT-01` |

---

## 6b. Navegación web (si `delivery_channels` incluye `web`)

> Ver [`standards/coding-standards-web.md`](../standards/coding-standards-web.md) y [`solution-types.md`](../standards/solution-types.md).

| Ruta | Pantalla | Módulos | Feature |
| :--- | :--- | :--- | :--- |
| `/` | `[Landing]` | `MOD-02` | `FEAT-01` |

---

## 6c. Evidencia Gate 3A (preview)

| Campo | Valor |
| :--- | :--- |
| `preview_evidence_url` (frontmatter opcional) | `[URL dev/preview o N/A]` |
| Capturas | `[paths bajo assets/previews/]` |
| Modo exploration | Preview en `iterations/prototype/` — ver [`exploration-vs-construction.md`](../workflows/exploration-vs-construction.md) |

---

## 7. Consumo de Tokens y Theme

> **Regla:** Estilos derivados de `standards/design-system.md` o `theme.ts` documentado aquí. Profesionalización V3+ vía repo `design-system/`.

### Tokens clave V1

| Token semántico | Uso en app | Valor / referencia |
| :--- | :--- | :--- |
| `background` | Fondo app | `[theme.colors.background]` |
| `accent` | CTA primario | `[theme.colors.accent]` |
| `text` | Texto principal | `[theme.colors.text]` |
| `spacing.md` | Padding estándar | `16 dp` |

---

## 8. Matriz Preview Visual vs Componentes de Código

| ID Vista | ID Módulo | Componente / Pantalla | Tokens | Referencia wireframe |
| :--- | :--- | :--- | :--- | :--- |
| `VIEW-01` | `MOD-02` | `[HomeScreen]` | `background`, `accent` | `[assets/previews/home.png o N/A]` |
| `VIEW-02` | `MOD-01/02` | `[PlayScreen]` | `surface`, `border` | `[N/A para V1 mínimo]` |

> Si no hay mockups formales, documentar layout ASCII y marcar `visual_approval_passed` tras revisión arquitectónica del wireframe textual.

---

## 9. Layout Visual (wireframe / ASCII)

```text
┌─────────────────────────────────────┐
│ [Header / HUD]          MOD-02      │
├─────────────────────────────────────┤
│                                     │
│   [Área principal — engine MOD-01]  │
│                                     │
├─────────────────────────────────────┤
│ [Controles / CTA]       MOD-02      │
└─────────────────────────────────────┘
```

---

## 10. Riesgos de Diseño

| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| `[Ej. Performance con muchos sprites]` | `Alto` | `[Pool de objetos, tests]` |
| `[Ej. Theme local vs design-system V3+]` | `Medio` | `[Migrar tokens en V3+ pipeline]` |

---

## 11. Puerta de Enlace — Aprobación Visual y Ensamblado

### Checklist aprobación visual (Gate 3A)

- [ ] Navegación y flujo principal definidos.
- [ ] Todos los módulos V1 incorporados sin huérfanos.
- [ ] Tokens/theme documentados o N/A justificado.
- [ ] Wireframe o preview revisado por arquitecto.
- [ ] Sin dependencias circulares.

### Checklist auditoría de ensamblado (Gate 3B)

- [ ] `05-build-plan.md` coherente con este diseño.
- [ ] Estrategia de build y riesgos alineados.
- [ ] `audits/auditoria-ensamblado.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobación visual (Arquitecto / Stakeholder):** `________________________`
- **Fecha visual:** `YYYY-MM-DD`
- **visual_approval_passed:** `false` → `true` al aprobar preview

- **Aprobación ensamblado (Arquitecto):** `________________________`
- **Fecha ensamblado:** `YYYY-MM-DD`
- **audit_3_passed:** `false` → `true` al aprobar ensamblado
