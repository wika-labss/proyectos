-- Geo Empresa: dispositivos corporativos con geocerca
-- Exportado desde supabase_migrations (proyecto ugzprmopgmbjjxsbjmti).

CREATE OR REPLACE FUNCTION public.distancia_metros(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
)
RETURNS double precision
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT 6371000.0 * 2 * atan2(
    sqrt(
      power(sin(radians(lat2 - lat1) / 2), 2)
      + cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lon2 - lon1) / 2), 2)
    ),
    sqrt(
      1 - (
        power(sin(radians(lat2 - lat1) / 2), 2)
        + cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lon2 - lon1) / 2), 2)
      )
    )
  );
$$;

CREATE TABLE public.dispositivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_registrado text NOT NULL CHECK (char_length(trim(nombre_registrado)) >= 2),
  device_fingerprint text NOT NULL UNIQUE,
  modelo text,
  base_lat double precision NOT NULL CHECK (base_lat BETWEEN -90 AND 90),
  base_lng double precision NOT NULL CHECK (base_lng BETWEEN -180 AND 180),
  radio_metros integer NOT NULL DEFAULT 120 CHECK (radio_metros > 0 AND radio_metros <= 5000),
  telefono_encendido boolean NOT NULL DEFAULT true,
  dentro_perimetro boolean NOT NULL DEFAULT true,
  ultima_lat double precision,
  ultima_lng double precision,
  ultima_precision_m double precision,
  distancia_base_m double precision,
  ultimo_ping_at timestamptz,
  registrado_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  activo boolean NOT NULL DEFAULT true
);

CREATE TABLE public.ubicacion_reportes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispositivo_id uuid NOT NULL REFERENCES public.dispositivos(id) ON DELETE CASCADE,
  lat double precision NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng double precision NOT NULL CHECK (lng BETWEEN -180 AND 180),
  precision_m double precision,
  distancia_base_m double precision NOT NULL,
  telefono_encendido boolean NOT NULL,
  dentro_perimetro boolean NOT NULL,
  registrado_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ubicacion_reportes_dispositivo_idx
  ON public.ubicacion_reportes (dispositivo_id, registrado_at DESC);

CREATE INDEX dispositivos_estado_idx
  ON public.dispositivos (activo, dentro_perimetro, telefono_encendido);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER dispositivos_set_updated_at
  BEFORE UPDATE ON public.dispositivos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
