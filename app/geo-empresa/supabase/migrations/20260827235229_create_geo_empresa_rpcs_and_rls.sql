-- RPCs expuestas a la app agente (anon)
-- Exportado desde supabase_migrations (proyecto ugzprmopgmbjjxsbjmti).
-- Reemplazado después por v2 y por security_fleet_rpcs.

CREATE OR REPLACE FUNCTION public.registrar_dispositivo(
  p_nombre_registrado text,
  p_device_fingerprint text,
  p_base_lat double precision,
  p_base_lng double precision,
  p_modelo text DEFAULT NULL,
  p_radio_metros integer DEFAULT 120
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.dispositivos%ROWTYPE;
BEGIN
  IF p_device_fingerprint IS NULL OR char_length(trim(p_device_fingerprint)) < 8 THEN
    RAISE EXCEPTION 'device_fingerprint inválido' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.dispositivos (
    nombre_registrado,
    device_fingerprint,
    modelo,
    base_lat,
    base_lng,
    radio_metros,
    telefono_encendido,
    dentro_perimetro,
    activo
  )
  VALUES (
    trim(p_nombre_registrado),
    trim(p_device_fingerprint),
    NULLIF(trim(p_modelo), ''),
    p_base_lat,
    p_base_lng,
    COALESCE(p_radio_metros, 120),
    true,
    true,
    true
  )
  ON CONFLICT (device_fingerprint) DO UPDATE
    SET nombre_registrado = EXCLUDED.nombre_registrado,
        modelo = COALESCE(EXCLUDED.modelo, public.dispositivos.modelo),
        base_lat = EXCLUDED.base_lat,
        base_lng = EXCLUDED.base_lng,
        radio_metros = EXCLUDED.radio_metros,
        activo = true,
        updated_at = now()
  RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'id', v_row.id,
    'nombre_registrado', v_row.nombre_registrado,
    'device_fingerprint', v_row.device_fingerprint,
    'base_lat', v_row.base_lat,
    'base_lng', v_row.base_lng,
    'radio_metros', v_row.radio_metros,
    'telefono_encendido', v_row.telefono_encendido,
    'dentro_perimetro', v_row.dentro_perimetro,
    'registrado_at', v_row.registrado_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.reportar_ubicacion(
  p_device_fingerprint text,
  p_lat double precision,
  p_lng double precision,
  p_precision_m double precision DEFAULT NULL,
  p_telefono_encendido boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.dispositivos%ROWTYPE;
  v_distancia double precision;
  v_dentro boolean;
BEGIN
  SELECT * INTO v_row
  FROM public.dispositivos
  WHERE device_fingerprint = trim(p_device_fingerprint)
    AND activo = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Dispositivo no registrado' USING ERRCODE = 'P0002';
  END IF;

  v_distancia := public.distancia_metros(p_lat, p_lng, v_row.base_lat, v_row.base_lng);
  v_dentro := v_distancia <= v_row.radio_metros;

  UPDATE public.dispositivos
  SET ultima_lat = p_lat,
      ultima_lng = p_lng,
      ultima_precision_m = p_precision_m,
      distancia_base_m = v_distancia,
      telefono_encendido = COALESCE(p_telefono_encendido, true),
      dentro_perimetro = v_dentro,
      ultimo_ping_at = now()
  WHERE id = v_row.id
  RETURNING * INTO v_row;

  INSERT INTO public.ubicacion_reportes (
    dispositivo_id,
    lat,
    lng,
    precision_m,
    distancia_base_m,
    telefono_encendido,
    dentro_perimetro
  )
  VALUES (
    v_row.id,
    p_lat,
    p_lng,
    p_precision_m,
    v_distancia,
    v_row.telefono_encendido,
    v_dentro
  );

  RETURN jsonb_build_object(
    'id', v_row.id,
    'nombre_registrado', v_row.nombre_registrado,
    'telefono_encendido', v_row.telefono_encendido,
    'dentro_perimetro', v_row.dentro_perimetro,
    'distancia_base_m', round(v_distancia::numeric, 2),
    'radio_metros', v_row.radio_metros,
    'ultimo_ping_at', v_row.ultimo_ping_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.obtener_dispositivo(
  p_device_fingerprint text
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', d.id,
    'nombre_registrado', d.nombre_registrado,
    'device_fingerprint', d.device_fingerprint,
    'modelo', d.modelo,
    'base_lat', d.base_lat,
    'base_lng', d.base_lng,
    'radio_metros', d.radio_metros,
    'telefono_encendido', d.telefono_encendido,
    'dentro_perimetro', d.dentro_perimetro,
    'ultima_lat', d.ultima_lat,
    'ultima_lng', d.ultima_lng,
    'distancia_base_m', d.distancia_base_m,
    'ultimo_ping_at', d.ultimo_ping_at,
    'registrado_at', d.registrado_at
  )
  FROM public.dispositivos d
  WHERE d.device_fingerprint = trim(p_device_fingerprint)
    AND d.activo = true;
$$;

REVOKE ALL ON FUNCTION public.registrar_dispositivo(text, text, double precision, double precision, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reportar_ubicacion(text, double precision, double precision, double precision, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.obtener_dispositivo(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.registrar_dispositivo(text, text, double precision, double precision, text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reportar_ubicacion(text, double precision, double precision, double precision, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_dispositivo(text) TO anon, authenticated;

ALTER TABLE public.dispositivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ubicacion_reportes ENABLE ROW LEVEL SECURITY;

-- Sin políticas de lectura directa: solo RPCs SECURITY DEFINER
