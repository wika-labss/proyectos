-- Delta de la interfaz del emprendedor.
-- descripcion y foto_archivo: delta de FEAT-01, sin firma de Vissiuss.
-- categoria: lista provisional pendiente de confirmación de Vissiuss.
-- No es un catálogo firmado. La aplicación exige categoría al crear un oficio nuevo;
-- las filas de oficio que ya existían pueden seguir con categoria NULL.

ALTER TABLE perfiles
  ADD COLUMN descripcion text,
  ADD COLUMN foto_archivo text UNIQUE,
  ADD CONSTRAINT perfiles_descripcion_chk CHECK (
    descripcion IS NULL
    OR (
      char_length(descripcion) BETWEEN 1 AND 500
      AND descripcion = btrim(descripcion)
    )
  ),
  ADD CONSTRAINT perfiles_foto_archivo_chk CHECK (
    foto_archivo IS NULL OR foto_archivo ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.webp$'
  );

ALTER TABLE ofertas
  ADD COLUMN categoria text,
  ADD CONSTRAINT ofertas_categoria_lista CHECK (
    categoria IS NULL OR categoria IN (
      'Gasfitería',
      'Electricidad',
      'Carpintería',
      'Pintura',
      'Albañilería',
      'Jardinería',
      'Cerrajería',
      'Limpieza',
      'Mudanzas',
      'Maestro chasquilla'
    )
  ),
  ADD CONSTRAINT ofertas_categoria_solo_oficio CHECK (
    tipo = 'oficio' OR categoria IS NULL
  );
