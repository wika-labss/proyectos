-- Contrato reproducible V1 monitoreo (aplicado en remoto como create_geo_empresa_rpcs_and_rls).
-- Las firmas de 003_security_fleet.sql reemplazan estas RPCs. No aplicar remoto en este paso.

ALTER TABLE public.dispositivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ubicacion_reportes ENABLE ROW LEVEL SECURITY;

-- Sin políticas SELECT/INSERT/UPDATE/DELETE para anon/authenticated.
-- Solo SECURITY DEFINER.

CREATE OR REPLACE FUNCTION public.registrar_dispositivo(
  p_nombre_registrado text,
  p_device_fingerprint text,
  p_base_lat double precision,
  p_base_lng double precision,
  p_modelo text DEFAULT NULL,
  p_radio_metros integer DEFAULT 120
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    nombre_registrado, device_fingerprint, base_lat, base_lng, modelo, radio_metros
  ) VALUES (
    trim(p_nombre_registrado), trim(p_device_fingerprint), p_base_lat, p_base_lng, p_modelo,
    COALESCE(p_radio_metros, 120)
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
    'radio_metros', v_row.radio_metros
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.reportar_ubicacion(
  p_device_fingerprint text,
  p_lat double precision,
  p_lng double precision,
  p_precision_m double precision DEFAULT NULL,
  p_telefono_encendido boolean DEFAULT true
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.dispositivos;
  v_dist double precision;
  v_inside boolean;
BEGIN
  SELECT * INTO v_row
  FROM public.dispositivos
  WHERE device_fingerprint = trim(p_device_fingerprint);

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'dispositivo no registrado';
  END IF;

  v_dist := public.distancia_metros(v_row.base_lat, v_row.base_lng, p_lat, p_lng);
  v_inside := v_dist <= v_row.radio_metros;

  UPDATE public.dispositivos SET
    telefono_encendido = COALESCE(p_telefono_encendido, true),
    dentro_perimetro = v_inside,
    ultima_lat = p_lat,
    ultima_lng = p_lng,
    ultima_precision_m = p_precision_m,
    distancia_base_m = v_dist,
    ultimo_ping_at = now()
  WHERE id = v_row.id
  RETURNING * INTO v_row;

  INSERT INTO public.ubicacion_reportes (
    dispositivo_id, lat, lng, precision_m, distancia_base_m,
    telefono_encendido, dentro_perimetro
  ) VALUES (
    v_row.id, p_lat, p_lng, p_precision_m, v_dist,
    v_row.telefono_encendido, v_inside
  );

  RETURN jsonb_build_object(
    'id', v_row.id,
    'nombre_registrado', v_row.nombre_registrado,
    'telefono_encendido', v_row.telefono_encendido,
    'dentro_perimetro', v_row.dentro_perimetro,
    'distancia_base_m', v_row.distancia_base_m,
    'radio_metros', v_row.radio_metros,
    'ultimo_ping_at', v_row.ultimo_ping_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.obtener_dispositivo(
  p_device_fingerprint text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.dispositivos;
BEGIN
  SELECT * INTO v_row
  FROM public.dispositivos
  WHERE device_fingerprint = trim(p_device_fingerprint);

  IF v_row.id IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id', v_row.id,
    'nombre_registrado', v_row.nombre_registrado,
    'telefono_encendido', v_row.telefono_encendido,
    'dentro_perimetro', v_row.dentro_perimetro,
    'distancia_base_m', v_row.distancia_base_m,
    'radio_metros', v_row.radio_metros,
    'ultimo_ping_at', v_row.ultimo_ping_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.registrar_dispositivo(text, text, double precision, double precision, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reportar_ubicacion(text, double precision, double precision, double precision, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.obtener_dispositivo(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.registrar_dispositivo(text, text, double precision, double precision, text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reportar_ubicacion(text, double precision, double precision, double precision, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_dispositivo(text) TO anon, authenticated;
