-- V2: registro unico + historial solo anomalias
-- Exportado desde supabase_migrations (proyecto ugzprmopgmbjjxsbjmti).
-- El cuerpo vigente de registrar_dispositivo y reportar_ubicacion
-- lo reemplaza 20260924191149_security_fleet_rpcs.sql.

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

  IF NOT p_device_fingerprint LIKE 'android-%' THEN
    RAISE EXCEPTION 'device_fingerprint debe ser android-{ANDROID_ID}' USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.dispositivos
    WHERE device_fingerprint = trim(p_device_fingerprint)
  ) THEN
    RAISE EXCEPTION 'Dispositivo ya registrado' USING ERRCODE = '23505';
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
  v_telefono boolean;
  v_historial boolean := false;
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
  v_telefono := COALESCE(p_telefono_encendido, true);

  UPDATE public.dispositivos
  SET ultima_lat = p_lat,
      ultima_lng = p_lng,
      ultima_precision_m = p_precision_m,
      distancia_base_m = v_distancia,
      telefono_encendido = v_telefono,
      dentro_perimetro = v_dentro,
      ultimo_ping_at = now()
  WHERE id = v_row.id
  RETURNING * INTO v_row;

  IF NOT v_dentro OR NOT v_telefono THEN
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
      v_telefono,
      v_dentro
    );
    v_historial := true;
  END IF;

  RETURN jsonb_build_object(
    'id', v_row.id,
    'nombre_registrado', v_row.nombre_registrado,
    'telefono_encendido', v_row.telefono_encendido,
    'dentro_perimetro', v_row.dentro_perimetro,
    'distancia_base_m', round(v_distancia::numeric, 2),
    'radio_metros', v_row.radio_metros,
    'ultimo_ping_at', v_row.ultimo_ping_at,
    'historial_registrado', v_historial
  );
END;
$$;

REVOKE ALL ON FUNCTION public.registrar_dispositivo(text, text, double precision, double precision, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reportar_ubicacion(text, double precision, double precision, double precision, boolean) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.registrar_dispositivo(text, text, double precision, double precision, text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reportar_ubicacion(text, double precision, double precision, double precision, boolean) TO anon, authenticated;
