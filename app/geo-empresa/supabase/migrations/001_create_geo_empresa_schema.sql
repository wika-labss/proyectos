-- Contrato reproducible V1 monitoreo (aplicado en remoto como create_geo_empresa_schema).
-- No ejecutar contra producción desde este paso documental.
-- Proyecto: geo-empresa (ugzprmopgmbjjxsbjmti)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.distancia_metros(
  p_lat1 double precision,
  p_lng1 double precision,
  p_lat2 double precision,
  p_lng2 double precision
) RETURNS double precision
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_lat1 IS NULL OR p_lng1 IS NULL OR p_lat2 IS NULL OR p_lng2 IS NULL THEN NULL
    ELSE 6371000 * 2 * asin(
      sqrt(
        pow(sin(radians(p_lat2 - p_lat1) / 2), 2)
        + cos(radians(p_lat1)) * cos(radians(p_lat2))
        * pow(sin(radians(p_lng2 - p_lng1) / 2), 2)
      )
    )
  END;
$$;

CREATE TABLE IF NOT EXISTS public.dispositivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_registrado text NOT NULL,
  device_fingerprint text NOT NULL UNIQUE,
  modelo text,
  base_lat double precision NOT NULL,
  base_lng double precision NOT NULL,
  radio_metros integer NOT NULL DEFAULT 120 CHECK (radio_metros > 0),
  telefono_encendido boolean NOT NULL DEFAULT true,
  dentro_perimetro boolean NOT NULL DEFAULT true,
  ultima_lat double precision,
  ultima_lng double precision,
  ultima_precision_m double precision,
  distancia_base_m double precision,
  ultimo_ping_at timestamptz,
  registrado_at timestamptz NOT NULL DEFAULT now(),
  activo boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.ubicacion_reportes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispositivo_id uuid NOT NULL REFERENCES public.dispositivos (id) ON DELETE CASCADE,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  precision_m double precision,
  distancia_base_m double precision,
  telefono_encendido boolean NOT NULL,
  dentro_perimetro boolean NOT NULL,
  registrado_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ubicacion_reportes_dispositivo_id_registrado_at_idx
  ON public.ubicacion_reportes (dispositivo_id, registrado_at DESC);
