-- Prioriza lock sobre ping y evita duplicar pendientes.
-- Live: heartbeat_prioriza_lock_dedupe

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
    AND v_dev.ultimo_admin_ping_at < now() - interval '90 seconds';

  SELECT * INTO v_cmd FROM public.comandos_dispositivo
  WHERE dispositivo_id = v_dev.id AND estado = 'pendiente'
  ORDER BY CASE WHEN tipo = 'lock' THEN 0 ELSE 1 END, solicitado_at ASC
  LIMIT 1;

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

CREATE OR REPLACE FUNCTION public.ti_solicitar_comando(p_clave text, p_dispositivo_id uuid, p_tipo text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_dev public.dispositivos;
  v_cmd public.comandos_dispositivo;
BEGIN
  IF NOT public.is_consola(p_clave) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF p_tipo NOT IN ('lock', 'ping') THEN
    RAISE EXCEPTION 'tipo inválido';
  END IF;
  SELECT * INTO v_dev FROM public.dispositivos WHERE id = p_dispositivo_id;
  IF v_dev.id IS NULL THEN
    RAISE EXCEPTION 'dispositivo no existe';
  END IF;
  IF p_tipo = 'lock' THEN
    UPDATE public.dispositivos SET politica_autolock = true WHERE id = v_dev.id;
  END IF;
  IF p_tipo = 'ping' THEN
    UPDATE public.dispositivos SET ultimo_admin_ping_at = now() WHERE id = v_dev.id;
  END IF;

  SELECT * INTO v_cmd
  FROM public.comandos_dispositivo
  WHERE dispositivo_id = v_dev.id AND tipo = p_tipo AND estado = 'pendiente'
  ORDER BY solicitado_at ASC
  LIMIT 1;

  IF v_cmd.id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'id', v_cmd.id,
      'tipo', v_cmd.tipo,
      'estado', v_cmd.estado,
      'solicitado_at', v_cmd.solicitado_at,
      'dedup', true
    );
  END IF;

  INSERT INTO public.comandos_dispositivo (dispositivo_id, tipo, payload, solicitado_por)
  VALUES (v_dev.id, p_tipo, NULL, NULL)
  RETURNING * INTO v_cmd;

  RETURN jsonb_build_object(
    'id', v_cmd.id,
    'tipo', v_cmd.tipo,
    'estado', v_cmd.estado,
    'solicitado_at', v_cmd.solicitado_at,
    'dedup', false
  );
END;
$function$;
