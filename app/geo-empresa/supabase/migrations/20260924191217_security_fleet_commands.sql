-- Política de Device Owner y cola de comandos del agente.
-- Cuerpo vigente en el proyecto ugzprmopgmbjjxsbjmti.

CREATE OR REPLACE FUNCTION public.reportar_politica(
  p_device_fingerprint text,
  p_es_device_owner boolean,
  p_admin_activo boolean,
  p_locked boolean DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.dispositivos;
BEGIN
  UPDATE public.dispositivos SET
    es_device_owner = COALESCE(p_es_device_owner, es_device_owner),
    admin_activo = COALESCE(p_admin_activo, admin_activo),
    ultimo_lock_at = CASE WHEN p_locked IS TRUE THEN now() ELSE ultimo_lock_at END
  WHERE device_fingerprint = trim(p_device_fingerprint)
  RETURNING * INTO v_row;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'dispositivo no registrado'; END IF;
  RETURN jsonb_build_object(
    'id', v_row.id,
    'es_device_owner', v_row.es_device_owner,
    'admin_activo', v_row.admin_activo,
    'ultimo_lock_at', v_row.ultimo_lock_at,
    'estado_enrollment', v_row.estado_enrollment,
    'politica_autolock', v_row.politica_autolock
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.obtener_comando_pendiente(p_device_fingerprint text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_dev public.dispositivos; v_cmd public.comandos_dispositivo;
BEGIN
  SELECT * INTO v_dev FROM public.dispositivos WHERE device_fingerprint = trim(p_device_fingerprint);
  IF v_dev.id IS NULL THEN RETURN NULL; END IF;
  SELECT * INTO v_cmd FROM public.comandos_dispositivo
  WHERE dispositivo_id = v_dev.id AND estado = 'pendiente'
  ORDER BY solicitado_at ASC LIMIT 1;
  IF v_cmd.id IS NULL THEN RETURN NULL; END IF;
  RETURN jsonb_build_object(
    'id', v_cmd.id, 'tipo', v_cmd.tipo, 'payload', v_cmd.payload,
    'solicitado_at', v_cmd.solicitado_at,
    'estado_enrollment', v_dev.estado_enrollment,
    'politica_autolock', v_dev.politica_autolock
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.acusar_comando(
  p_comando_id uuid, p_device_fingerprint text, p_ok boolean, p_error text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_dev public.dispositivos; v_cmd public.comandos_dispositivo;
BEGIN
  SELECT * INTO v_dev FROM public.dispositivos WHERE device_fingerprint = trim(p_device_fingerprint);
  IF v_dev.id IS NULL THEN RAISE EXCEPTION 'dispositivo no registrado'; END IF;
  SELECT * INTO v_cmd FROM public.comandos_dispositivo WHERE id = p_comando_id AND dispositivo_id = v_dev.id;
  IF v_cmd.id IS NULL THEN RAISE EXCEPTION 'comando no pertenece al dispositivo'; END IF;
  UPDATE public.comandos_dispositivo SET
    estado = CASE WHEN p_ok THEN 'ejecutado' ELSE 'fallido' END,
    ejecutado_at = now(),
    error_mensaje = CASE WHEN p_ok THEN NULL ELSE p_error END,
    payload = CASE WHEN p_ok AND tipo = 'reset_pin' THEN NULL ELSE payload END
  WHERE id = v_cmd.id RETURNING * INTO v_cmd;
  IF p_ok AND v_cmd.tipo = 'lock' THEN UPDATE public.dispositivos SET ultimo_lock_at = now() WHERE id = v_dev.id; END IF;
  IF p_ok AND v_cmd.tipo = 'unlock_policy' THEN UPDATE public.dispositivos SET politica_autolock = false WHERE id = v_dev.id; END IF;
  RETURN jsonb_build_object('id', v_cmd.id, 'tipo', v_cmd.tipo, 'estado', v_cmd.estado, 'ejecutado_at', v_cmd.ejecutado_at);
END;
$$;
