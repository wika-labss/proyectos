---
id: "WEB-NOTAS-QA-001"
title: "trabajamos.com — Comentarios para después del QA"
status: "NOTAS"
owner: "Vissiuss"
created_at: "2026-11-07"
updated_at: "2026-11-07"
---

# Comentarios para después del QA — trabajamos.com

Fecha: 7 de noviembre de 2026 (America/Santiago).

El QA de hoy se lanza con `iterations/v1` tal como está. Este archivo no cambia el código ni los documentos ya escritos (`02-features.md`, `04-html-design.md`, `06-modelo-datos.md`). Recoge los comentarios de Vissiuss para la jornada siguiente. El look de Fase 2 sigue sin firma.

## Modo perfil del emprendedor

### Módulo de perfil

En el mapa del perfil aparece un círculo con el límite de atención: el área hasta donde el emprendedor llega a trabajar. El círculo se dibuja sobre el mapa, junto a la localidad del perfil.

### Contacto

El perfil publica métodos de contacto con un mínimo de uno y un máximo de tres. Con cero métodos no se publica. Un cuarto método no se acepta.

### Una sola página

Los datos del perfil van en un mismo módulo y en una misma página: foto de perfil, nombre y contacto.

### Categorías

La lista de categorías incluye un botón **Otro**. Al elegirlo, aparece un campo libre para escribir la categoría que no está en la lista.

### Imágenes

Hay que calcular el tamaño de cada imagen y definir de qué forma se guarda en la base.

En el QA de hoy el archivo queda en disco (`UPLOADS_DIR`): se recodifica a WebP, el lado mayor no pasa de 1600 px y el archivo de entrada no pasa de 5 MB. La tabla `imagenes` guarda la ruta, el texto alternativo, el ancho, el alto y los bytes. El cálculo de tamaño y el guardado en la base quedan abiertos para la siguiente jornada.

### Localidad

La localidad se elige en dos pasos: primero la región y después una comuna de esa región. El emprendedor puede marcar más de una comuna.

En el QA de hoy la localidad es un solo punto confirmado en el mapa.

## Otros módulos

### Perfil del cliente y muro de solicitudes

El cliente tiene un perfil propio. Desde ese perfil publica una solicitud de servicio en un muro.

El muro lo ven solo los emprendedores. Desde ahí un emprendedor puede establecer contacto con el cliente que publicó la solicitud.

Sobre su propia solicitud, el cliente puede:

- Cerrarla.
- Eliminarla.
- Darla por finalizada, indicando quién la solucionó y en cuánto tiempo quedó resuelta.
