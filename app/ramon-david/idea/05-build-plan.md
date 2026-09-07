---
id: "BUILD-001"
title: "Plan de Construcción V1–V2 — Ramon David (web)"
status: "EN_REVISION"
version: "1.1.0"
owner: "Vissiuss / Arquitecto WIKA"
created_at: "2026-09-07"
updated_at: "2026-09-07"
audit_1_passed: false
audit_2_passed: false
visual_approval_passed: false
audit_3_passed: false
ready_for_construction: false
excepcion_web: true
v1_as_built: true
---

# [05] Plan de Construcción V1 (Build Plan)

> **EXCEPCIÓN WIKA-WEB:** No hay `iterations/v1/src/` ni `iterations/v1/app/` de Expo. El bloqueo de `ready_for_construction` aplica a **código nuevo** de producto. El V1 Flask **ya existe** (importado a `iterations/v1/`); este plan es as-built + reglas para v2.
>
> **Activación de código nuevo (v2+):** los cuatro flags anteriores en `true` y `ready_for_construction: true`.

## 1. Verificación de Pre-requisitos

- [ ] Auditoría de Documentación: `audit_1_passed == true`
- [ ] Auditoría de Módulos: `audit_2_passed == true`
- [ ] Aprobación visual: `visual_approval_passed == true`
- [ ] Auditoría de Ensamblado: `audit_3_passed == true`
- [x] V1 as-built presente en `iterations/v1/` (retrofit 2026-09-07)

---

## 2. Alcance de la V1

**Features incluidas:** `FEAT-01` … `FEAT-07`  
**Features excluidas:** `FEAT-08+` (Supabase sync, mail, gunicorn/HTTPS, 2FA)  
**Módulos incluidos:** `MOD-01` … `MOD-09`

Entregable: sitio web servido por Flask, **no** APK.

---

## 3. Cronograma de Ejecución (Build Schedule)

| Paso | Módulo | ID Feature | Archivos | Estándar | Estado | Vista |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `01` | MOD-09 | FEAT-07 | `app.py`, `requirements.txt` | Flask `~=3.0` | COMPLETADO (as-built) | — |
| `02` | MOD-08 | FEAT-01 | `css/main.css`, `componentes.css` | tokens `:root` | COMPLETADO | VIEW-01 |
| `03` | MOD-06 | FEAT-01, FEAT-05 | `index.html`, `nosotros.html`, `contacto.html`, `js/main.js` | 04 | COMPLETADO | VIEW-01/02/04 |
| `04` | MOD-01 | FEAT-03 | `data/products.json` + store | schema catálogo | COMPLETADO | — |
| `05` | MOD-02 | FEAT-02 | `GET /api/products` | NFR-01 | COMPLETADO | — |
| `06` | MOD-07 | FEAT-02 | `productos.html`, `js/product.js` | VIEW-03 | COMPLETADO | VIEW-03 |
| `07` | MOD-03 | FEAT-06 | login / session / CSRF | NFR-03 | COMPLETADO | VIEW-05 |
| `08` | MOD-04 | FEAT-03 | admin CRUD + preview | VIEW-06 | COMPLETADO | VIEW-06 |
| `09` | MOD-05 | FEAT-04 | uploads | 5 MB / whitelist | COMPLETADO | — |
| `10` | integración | BDD | smoke HTTP | NFR-01 | COMPLETADO | — |

| `11` | MOD-10 | FEAT-12 | `users.json`, logins `/portal` `/admin` | roles | V2 |
| `12` | MOD-11 | FEAT-13 | portal categorías / productos / editor | VIEW-07–09 | V2 |
| `13` | MOD-12 | FEAT-14 | stock + movimientos + CSV | VIEW-10–11 | V2 |

`FEAT-08` Supabase sigue fuera. V1 no se modifica.

---

## 4. Orden de Implementación y Justificación

1. **V1:** servidor + páginas + JSON + admin único.
2. **V2 (este corte):** portales + stock en `iterations/v2/` (pedido de producto; gates V1 siguen sin firma).
3. **Después:** `FEAT-08` Supabase.

---

## 5. Desglose por Fases

### Fase 0: Encaje WIKA (documentación)

- **Objetivo:** 01–05 + audits + `iterations/v1/`.
- **Criterio:** un agente encuentra el proyecto en `app/ramon-david/` y lee la excepción web.

### Fase 1: V1 as-built (cerrada)

- **Objetivo:** Público + admin operativos.
- **Criterio:** `python app.py` y `GET /` + `/api/products` = 200.

### Fase 2: v2 (futuro)

- **Objetivo:** `FEAT-08`–`FEAT-10` o refactor de templates.
- **Regla:** no empezar sin `ready_for_construction` de esa iteración.

---

## 6. Dependencias Externas

| Dependencia | Versión | Propósito |
| :--- | :--- | :--- |
| Python | `>=3.11` | Runtime |
| `flask` | `~=3.0.3` | HTTP + sesiones |
| `werkzeug` | `~=3.0.6` | Hash / request |
| Navegador | moderno | Cliente |
| `expo` / `react-native` | — | **N/A (excepción web)** |

Opcional ops: `cloudflared` para túnel de demo.

---

## 7. Estrategia de Pruebas

| Tipo | Alcance | Comando / método |
| :--- | :--- | :--- |
| Smoke HTTP | Home, API, redirect admin | `curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:5003/` |
| Catálogo | 19 ítems | `GET /api/products` |
| Auth | CRUD sin sesión | esperar `401` |
| BDD manual | Escenarios `02-features.md` | Home → Productos → Admin |
| APK / typecheck | — | **N/A** |

```bash
cd proyectos/app/ramon-david/iterations/v1
python3 -m pip install -r requirements.txt
python3 app.py --host 0.0.0.0 --port 5003
```

- Público: http://127.0.0.1:5003/
- Admin: http://127.0.0.1:5003/admin

Producción: definir `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `FLASK_SECRET_KEY`, `FLASK_ENV=production`. Generar hash: `python3 app.py --hash-password`.

---

## 8. Riesgos Técnicos

| Riesgo | Probabilidad | Mitigación |
| :--- | :--- | :--- |
| Agente aplica stack Expo por default | `Alta` | `excepcion_web: true` en todos los YAML |
| Credenciales de prueba en túnel | `Alta` | Aviso en README; rotar antes de prod |
| Dos catálogos (JSON vs Supabase) | `Media` | V1.1 `FEAT-08` |
| Servidor Flask de desarrollo | `Media` | `FEAT-10` gunicorn |

---

## 9. Criterios de Aprobación V1

- [x] Features obligatorias implementadas en `iterations/v1/`.
- [x] Smoke HTTP (home + API) verificado.
- [ ] `review.md` firmado por arquitecto.
- [ ] Auditorías 01–03 en `APROBADO`.
- [ ] N/A: APK release.

---

## 10. Checklist por Incremento (Quality Gate)

Antes de marcar un paso v2 como `COMPLETADO`:

- [ ] Estilos nuevos vía tokens `:root` (o CSS admin extraído).
- [ ] Trazabilidad RTM (feature → módulo → archivo).
- [ ] Escenario BDD verificado en navegador.
- [ ] Sin añadir Expo «porque WIKA-ARCH lo pide» — excepción vigente.

---

## 11. Cierre de Fase de Construcción

- **Revisado por (Arquitecto):** `________________________`
- **Fecha de finalización V1 as-built:** `2026-09-07`
- **ready_for_construction:** `false` (V1 ya importada; no abrir v2 sin gates)
- **Siguiente:** firma de audits → `review.md` → v2 solo con flags
