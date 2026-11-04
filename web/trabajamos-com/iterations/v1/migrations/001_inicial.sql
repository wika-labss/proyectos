-- Esquema inicial de trabajamos.com. Debe coincidir con idea/06-modelo-datos.md.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE contacto_tipo AS ENUM ('telefono', 'correo', 'url');
CREATE TYPE oferta_tipo AS ENUM ('proyecto', 'servicio', 'oficio');

CREATE TABLE usuarios (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correo            citext NOT NULL UNIQUE CHECK (correo ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  password_hash     text NOT NULL CHECK (password_hash LIKE '$argon2id$%'),
  intentos_fallidos integer NOT NULL DEFAULT 0 CHECK (intentos_fallidos >= 0),
  bloqueado_hasta   timestamptz,
  creado_en         timestamptz NOT NULL DEFAULT now(),
  ultimo_acceso_en  timestamptz
);

CREATE TABLE sesiones (
  token_hash text PRIMARY KEY,
  usuario_id uuid NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  creado_en  timestamptz NOT NULL DEFAULT now(),
  expira_en  timestamptz NOT NULL
);
CREATE INDEX sesiones_usuario_idx ON sesiones (usuario_id);

CREATE TABLE perfiles (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id     uuid NOT NULL UNIQUE REFERENCES usuarios (id) ON DELETE CASCADE,
  slug           text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nombre         text NOT NULL CHECK (char_length(nombre) BETWEEN 1 AND 120 AND nombre = btrim(nombre)),
  contacto_tipo  contacto_tipo NOT NULL,
  contacto_valor text NOT NULL CHECK (char_length(btrim(contacto_valor)) > 0),
  punto          geography(Point, 4326),
  punto_etiqueta text CHECK (punto_etiqueta IS NULL OR char_length(btrim(punto_etiqueta)) BETWEEN 1 AND 160),
  creado_en      timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT perfiles_punto_con_etiqueta CHECK ((punto IS NULL) = (punto_etiqueta IS NULL))
);
CREATE INDEX perfiles_punto_gist ON perfiles USING gist (punto);

CREATE TABLE redes (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id uuid NOT NULL REFERENCES perfiles (id) ON DELETE CASCADE,
  nombre    text NOT NULL CHECK (char_length(btrim(nombre)) BETWEEN 1 AND 60),
  url       text NOT NULL CHECK (url LIKE 'https://%'),
  orden     integer NOT NULL,
  creado_en timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX redes_perfil_idx ON redes (perfil_id, orden);

CREATE TABLE ofertas (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id uuid NOT NULL REFERENCES perfiles (id) ON DELETE CASCADE,
  tipo      oferta_tipo NOT NULL,
  titulo    text NOT NULL CHECK (char_length(btrim(titulo)) BETWEEN 1 AND 120),
  tag       text NOT NULL CHECK (
              tag ~ '^#[^#[:space:]]'
              AND tag !~ '[[:space:]]$'
              AND tag !~ '[[:space:]]{2}'
              AND char_length(tag) <= 61
            ),
  creado_en timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ofertas_tag_idx ON ofertas (tag);
CREATE INDEX ofertas_perfil_idx ON ofertas (perfil_id, creado_en);

CREATE TABLE imagenes (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id uuid NOT NULL REFERENCES perfiles (id) ON DELETE CASCADE,
  archivo   text NOT NULL UNIQUE,
  alt       text NOT NULL CHECK (char_length(btrim(alt)) BETWEEN 1 AND 300),
  ancho     integer NOT NULL CHECK (ancho > 0),
  alto      integer NOT NULL CHECK (alto > 0),
  bytes     integer NOT NULL CHECK (bytes > 0),
  creado_en timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX imagenes_perfil_idx ON imagenes (perfil_id, creado_en);

CREATE TABLE geocache (
  clave     text PRIMARY KEY,
  respuesta jsonb NOT NULL,
  creado_en timestamptz NOT NULL DEFAULT now()
);
