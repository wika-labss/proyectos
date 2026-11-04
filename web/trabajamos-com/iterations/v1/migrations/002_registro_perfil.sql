-- Delta de registro: teléfono y correo públicos, y oferta de tipo producto.
-- ALTER TYPE ... ADD VALUE puede ir en esta transacción (PostgreSQL 16);
-- el valor nuevo no se usa en este archivo.

ALTER TYPE oferta_tipo ADD VALUE IF NOT EXISTS 'producto';

ALTER TABLE perfiles
  ADD COLUMN telefono text,
  ADD COLUMN correo_publico citext;

UPDATE perfiles
SET telefono = btrim(contacto_valor)
WHERE contacto_tipo = 'telefono' AND telefono IS NULL;

UPDATE perfiles
SET correo_publico = btrim(contacto_valor)::citext
WHERE contacto_tipo = 'correo' AND correo_publico IS NULL;

INSERT INTO redes (perfil_id, nombre, url, orden)
SELECT p.id,
       'Sitio',
       p.contacto_valor,
       COALESCE((SELECT max(r.orden) + 1 FROM redes r WHERE r.perfil_id = p.id), 0)
FROM perfiles p
WHERE p.contacto_tipo = 'url'
  AND p.contacto_valor LIKE 'https://%'
  AND NOT EXISTS (
    SELECT 1 FROM redes r WHERE r.perfil_id = p.id AND r.url = p.contacto_valor
  );

ALTER TABLE perfiles DROP COLUMN contacto_valor;
ALTER TABLE perfiles DROP COLUMN contacto_tipo;

ALTER TABLE perfiles
  ADD CONSTRAINT perfiles_telefono_chk CHECK (
    telefono IS NULL OR (char_length(btrim(telefono)) BETWEEN 1 AND 40 AND telefono = btrim(telefono))
  ),
  ADD CONSTRAINT perfiles_correo_publico_chk CHECK (
    correo_publico IS NULL OR (
      char_length(correo_publico::text) BETWEEN 3 AND 254
      AND correo_publico::text ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    )
  );

DROP TYPE contacto_tipo;
