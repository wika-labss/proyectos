---
id: "PROB-001"
title: "Horóscopo de Alan el Farmeador de aura"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-08-21"
updated_at: "2026-08-21"
audit_1_passed: true
---

# [01] Definición del Problema, Alcance y Metas

## 1. Identificación

- **Nombre del Proyecto:** Horóscopo de Alan el Farmeador de aura
- **Repositorio:** `proyectos/app/horoscopo-alan/`
- **Stakeholders:** Vissiuss (producto), usuario final (consulta diaria de horóscopo)

---

## 2. Problema

El usuario quiere consultar su horóscopo diario personalizado según su signo zodiacal, sin depender de buscar manualmente en la web. Necesita una app que:

1. Registre nombre y fecha de nacimiento **una sola vez**
2. Calcule el signo automáticamente
3. Muestre el horóscopo del día (amor, salud, dinero, color, número, elemento, rango, ánimo)
4. Requiera conexión a internet para obtener datos actualizados desde la API propia (Supabase)

---

## 3. Gap Analysis

| Estado actual | Estado deseado V1 |
|---------------|-------------------|
| Sin app | App Android con registro único y horóscopo diario |
| Datos en web externa | API propia en Supabase Edge Function |
| Sin identidad visual | Splash vissiuss + imagen Alan + tema místico |

---

## 4. RTM Inicial

| ID | Dolor | Feature | Módulo |
|----|-------|---------|--------|
| ERR-01 | No hay registro persistente de usuario | FEAT-01 | mod-user-profile |
| ERR-02 | Signo no se calcula desde fecha nacimiento | FEAT-02 | mod-zodiac-engine |
| ERR-03 | No se consulta horóscopo del día | FEAT-03 | mod-horoscope-api |
| ERR-04 | No hay refresh de datos | FEAT-04 | mod-horoscope-ui |
| ERR-05 | App falla sin internet | FEAT-05 | mod-network-guard |

---

## 5. Alcance V1

**Incluido:** splash 4s, registro único, home horóscopo, refresh, guard de red, cálculo 12 signos.

**Excluido:** editar perfil, notificaciones push, historial, iOS, login Supabase Auth.
