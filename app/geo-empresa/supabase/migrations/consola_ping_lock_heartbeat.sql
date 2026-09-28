-- Consola TI: ping/lock, heartbeat agente y vínculo de administrador.
-- Live: ugzprmopgmbjjxsbjmti (migration consola_ping_lock_heartbeat)

ALTER TABLE public.dispositivos
  ADD COLUMN IF NOT EXISTS ultimo_admin_ping_at timestamptz,
  ADD COLUMN IF NOT EXISTS ultimo_agente_at timestamptz;

CREATE TABLE IF NOT EXISTS public.consola_config (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  clave text NOT NULL
);

ALTER TABLE public.consola_config ENABLE ROW LEVEL SECURITY;

INSERT INTO public.consola_config (id, clave)
VALUES (1, 'geo-ti-consola-1982')
ON CONFLICT (id) DO UPDATE SET clave = EXCLUDED.clave;

CREATE OR REPLACE FUNCTION public.is_consola(p_clave text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.consola_config
    WHERE id = 1 AND clave = trim(p_clave) AND length(trim(p_clave)) >= 8
  );
$function$;

CREATE OR REPLACE FUNCTION public.heartbeat_agente(p_device_fingerprint text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_dev public.dispositivos;
  v_cmd public.comandos_dispositivo;
  v_stale boolean;
BEGIN
  SELECT * INTO v_dev FROM public.dispositivos WHERE device_fingerprint = trim(p_device_fingerprint);
  IF v_dev.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'dispositivo no registrado');
  END IF;

  UPDATE public.dispositivos SET ultimo_agente_at = now() WHERE id = v_dev.id RETURNING * INTO v_dev;

  v_stale := v_dev.ultimo_admin_ping_at IS NOT NULL
    AND v_dev.ultimo_admin_ping_at < now() - interval '45 seconds';

  SELECT * INTO v_cmd FROM public.comandos_dispositivo
  WHERE dispositivo_id = v_dev.id AND estado = 'pendiente'
  ORDER BY solicitado_at ASC LIMIT 1;

  RETURN jsonb_build_object(
    'ok', true,
    'id', v_dev.id,
    'radio_metros', v_dev.radio_metros,
    'base_lat', v_dev.base_lat,
    'base_lng', v_dev.base_lng,
    'ultima_lat', v_dev.ultima_lat,
    'ultima_lng', v_dev.ultima_lng,
    'distancia_base_m', v_dev.distancia_base_m,
    'dentro_perimetro', v_dev.dentro_perimetro,
    'politica_autolock', v_dev.politica_autolock,
    'estado_enrollment', v_dev.estado_enrollment,
    'admin_ping_at', v_dev.ultimo_admin_ping_at,
    'admin_stale', v_stale,
    'comando', CASE WHEN v_cmd.id IS NULL THEN NULL ELSE jsonb_build_object(
      'id', v_cmd.id,
      'tipo', v_cmd.tipo,
      'payload', v_cmd.payload,
      'solicitado_at', v_cmd.solicitado_at
    ) END
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.ti_listar_flota(p_clave text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_consola(p_clave) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id', d.id,
      'nombre_registrado', d.nombre_registrado,
      'modelo', d.modelo,
      'estado_enrollment', d.estado_enrollment,
      'telefono_encendido', d.telefono_encendido,
      'dentro_perimetro', d.dentro_perimetro,
      'distancia_base_m', d.distancia_base_m,
      'radio_metros', d.radio_metros,
      'ultima_lat', d.ultima_lat,
      'ultima_lng', d.ultima_lng,
      'politica_autolock', d.politica_autolock,
      'ultimo_ping_at', d.ultimo_ping_at,
      'ultimo_lock_at', d.ultimo_lock_at,
      'ultimo_admin_ping_at', d.ultimo_admin_ping_at,
      'ultimo_agente_at', d.ultimo_agente_at,
      'activo', d.activo
    ) ORDER BY d.registrado_at DESC) FROM public.dispositivos d
  ), '[]'::jsonb);
END;
$function$;

CREATE OR REPLACE FUNCTION public.ti_solicitar_comando(p_clave text, p_dispositivo_id uuid, p_tipo text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE v_dev public.dispositivos; v_cmd public.comandos_dispositivo;
BEGIN
  IF NOT public.is_consola(p_clave) THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF p_tipo NOT IN ('lock', 'ping') THEN RAISE EXCEPTION 'tipo inválido'; END IF;
  SELECT * INTO v_dev FROM public.dispositivos WHERE id = p_dispositivo_id;
  IF v_dev.id IS NULL THEN RAISE EXCEPTION 'dispositivo no existe'; END IF;
  IF p_tipo = 'lock' THEN UPDATE public.dispositivos SET politica_autolock = true WHERE id = v_dev.id; END IF;
  IF p_tipo = 'ping' THEN UPDATE public.dispositivos SET ultimo_admin_ping_at = now() WHERE id = v_dev.id; END IF;
  INSERT INTO public.comandos_dispositivo (dispositivo_id, tipo, payload, solicitado_por)
  VALUES (v_dev.id, p_tipo, NULL, NULL) RETURNING * INTO v_cmd;
  RETURN jsonb_build_object('id', v_cmd.id, 'tipo', v_cmd.tipo, 'estado', v_cmd.estado, 'solicitado_at', v_cmd.solicitado_at);
END;
$function$;

CREATE OR REPLACE FUNCTION public.ti_heartbeat_admin(p_clave text, p_dispositivo_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE v_at timestamptz;
BEGIN
  IF NOT public.is_consola(p_clave) THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.dispositivos
  SET ultimo_admin_ping_at = now()
  WHERE id = p_dispositivo_id
  RETURNING ultimo_admin_ping_at INTO v_at;
  IF v_at IS NULL THEN RAISE EXCEPTION 'dispositivo no existe'; END IF;
  RETURN jsonb_build_object('ok', true, 'ultimo_admin_ping_at', v_at);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.is_consola(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.heartbeat_agente(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ti_listar_flota(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ti_solicitar_comando(text, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ti_heartbeat_admin(text, uuid) TO anon, authenticated;
