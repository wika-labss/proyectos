---
id: "DES-001"
title: "Horóscopo Alan — Diseño V1"
status: "APROBADO"
version: "1.0.0"
visual_approval_passed: true
---

# [04] Application Design

## Arquitectura de pantallas

```
Splash (4s, vissiuss)
  └── ¿perfil? → Register | Home
Register (nombre + fecha) → Home
Home (Alan + horóscopo + refresh)
```

## Theme (`src/constants/theme.ts`)

| Token | Valor | Uso |
|-------|-------|-----|
| background | #1a1028 | Fondo app |
| surface | #2a1f3d | Cards |
| accent | #f5c542 | CTAs, highlights |
| text | #f8f4ff | Texto principal |
| textMuted | #b8a9d4 | Subtítulos |
| error | #ff6b6b | Errores red |

## Home — orden de bloques

1. Amor · 2. Salud · 3. Dinero · 4. Color · 5. Número · 6. Elemento · 7. Rango · 8. Ánimo

## Assets

- `assets/images/alan-home.jpg` — hero home
- Splash: componente animado (no asset estático)

## API

```
GET https://tljzwyfmyjylfqcpggzc.supabase.co/functions/v1/horoscopo?signo={slug}
Headers: Authorization Bearer + apikey (anon)
```
