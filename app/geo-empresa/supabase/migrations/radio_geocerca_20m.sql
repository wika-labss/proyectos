-- Radio de geocerca 20 m (live: ugzprmopgmbjjxsbjmti, migration radio_geocerca_20m)
-- Alinea dispositivos existentes y el default de registrar_dispositivo con el APK V2.

ALTER TABLE public.dispositivos
  ALTER COLUMN radio_metros SET DEFAULT 20;

UPDATE public.dispositivos
SET radio_metros = 20,
    dentro_perimetro = CASE
      WHEN distancia_base_m IS NULL THEN dentro_perimetro
      ELSE distancia_base_m <= 20
    END,
    updated_at = now()
WHERE radio_metros IS DISTINCT FROM 20
   OR (distancia_base_m IS NOT NULL AND dentro_perimetro IS DISTINCT FROM (distancia_base_m <= 20));

CREATE OR REPLACE FUNCTION public.registrar_dispositivo(
  p_nombre_registrado text,
  p_device_fingerprint text,
  p_base_lat double precision,
  p_base_lng double precision,
  p_modelo text DEFAULT NULL,
  p_radio_metros integer DEFAULT 20
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_row public.dispositivos;
BEGIN
  IF p_nombre_registrado IS NULL OR length(trim(p_nombre_registrado)) = 0 THEN
    RAISE EXCEPTION 'nombre_registrado requerido';
  END IF;
  IF p_device_fingerprint IS NULL OR length(trim(p_device_fingerprint)) = 0 THEN
    RAISE EXCEPTION 'device_fingerprint requerido';
  END IF;

  INSERT INTO public.dispositivos (
    nombre_registrado, device_fingerprint, base_lat, base_lng, modelo, radio_metros,
    estado_enrollment
  ) VALUES (
    trim(p_nombre_registrado), trim(p_device_fingerprint), p_base_lat, p_base_lng, p_modelo,
    COALESCE(p_radio_metros, 20),
    'pendiente'
  )
  ON CONFLICT (device_fingerprint) DO UPDATE SET
    nombre_registrado = excluded.nombre_registrado,
    base_lat = excluded.base_lat,
    base_lng = excluded.base_lng,
    modelo = COALESCE(excluded.modelo, public.dispositivos.modelo),
    radio_metros = excluded.radio_metros
  RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'id', v_row.id,
    'nombre_registrado', v_row.nombre_registrado,
    'telefono_encendido', v_row.telefono_encendido,
    'dentro_perimetro', v_row.dentro_perimetro,
    'radio_metros', v_row.radio_metros,
    'estado_enrollment', v_row.estado_enrollment,
    'politica_autolock', v_row.politica_autolock,
    'es_device_owner', v_row.es_device_owner
  );
END;
$function$;
