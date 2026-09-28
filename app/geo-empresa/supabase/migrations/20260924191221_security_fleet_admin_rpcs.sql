-- Consola TI: flota, enrollment y comandos.
-- is_ti() exige auth.uid() con fila en perfiles.rol = 'ti'.
-- Cuerpo vigente en el proyecto ugzprmopgmbjjxsbjmti.

CREATE OR REPLACE FUNCTION public.listar_flota()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_ti() THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id', d.id, 'nombre_registrado', d.nombre_registrado, 'modelo', d.modelo,
      'estado_enrollment', d.estado_enrollment, 'telefono_encendido', d.telefono_encendido,
      'dentro_perimetro', d.dentro_perimetro, 'distancia_base_m', d.distancia_base_m,
      'radio_metros', d.radio_metros, 'es_device_owner', d.es_device_owner,
      'admin_activo', d.admin_activo, 'politica_autolock', d.politica_autolock,
      'ultimo_ping_at', d.ultimo_ping_at, 'ultimo_lock_at', d.ultimo_lock_at, 'activo', d.activo
    ) ORDER BY d.registrado_at DESC) FROM public.dispositivos d
  ), '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.obtener_dispositivo_admin(p_dispositivo_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.dispositivos; v_reportes jsonb;
BEGIN
  IF NOT public.is_ti() THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT * INTO v_row FROM public.dispositivos WHERE id = p_dispositivo_id;
  IF v_row.id IS NULL THEN RETURN NULL; END IF;
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'lat', r.lat, 'lng', r.lng, 'precision_m', r.precision_m,
    'distancia_base_m', r.distancia_base_m, 'telefono_encendido', r.telefono_encendido,
    'dentro_perimetro', r.dentro_perimetro, 'registrado_at', r.registrado_at
  ) ORDER BY r.registrado_at DESC), '[]'::jsonb)
  INTO v_reportes FROM (
    SELECT * FROM public.ubicacion_reportes WHERE dispositivo_id = v_row.id ORDER BY registrado_at DESC LIMIT 20
  ) r;
  RETURN jsonb_build_object(
    'id', v_row.id, 'nombre_registrado', v_row.nombre_registrado, 'device_fingerprint', v_row.device_fingerprint,
    'modelo', v_row.modelo, 'base_lat', v_row.base_lat, 'base_lng', v_row.base_lng, 'radio_metros', v_row.radio_metros,
    'estado_enrollment', v_row.estado_enrollment, 'telefono_encendido', v_row.telefono_encendido,
    'dentro_perimetro', v_row.dentro_perimetro, 'ultima_lat', v_row.ultima_lat, 'ultima_lng', v_row.ultima_lng,
    'distancia_base_m', v_row.distancia_base_m, 'es_device_owner', v_row.es_device_owner,
    'admin_activo', v_row.admin_activo, 'politica_autolock', v_row.politica_autolock,
    'ultimo_ping_at', v_row.ultimo_ping_at, 'ultimo_lock_at', v_row.ultimo_lock_at, 'reportes', v_reportes
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.aprobar_dispositivo(p_dispositivo_id uuid, p_estado text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.dispositivos;
BEGIN
  IF NOT public.is_ti() THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF p_estado NOT IN ('aprobado', 'rechazado') THEN RAISE EXCEPTION 'estado inválido'; END IF;
  UPDATE public.dispositivos SET estado_enrollment = p_estado WHERE id = p_dispositivo_id RETURNING * INTO v_row;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'dispositivo no existe'; END IF;
  RETURN jsonb_build_object('id', v_row.id, 'estado_enrollment', v_row.estado_enrollment);
END;
$$;

CREATE OR REPLACE FUNCTION public.solicitar_comando(p_dispositivo_id uuid, p_tipo text, p_pin text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_dev public.dispositivos; v_cmd public.comandos_dispositivo; v_payload jsonb;
BEGIN
  IF NOT public.is_ti() THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF p_tipo NOT IN ('lock', 'unlock_policy', 'reset_pin', 'reboot') THEN RAISE EXCEPTION 'tipo inválido'; END IF;
  SELECT * INTO v_dev FROM public.dispositivos WHERE id = p_dispositivo_id;
  IF v_dev.id IS NULL THEN RAISE EXCEPTION 'dispositivo no existe'; END IF;
  IF v_dev.estado_enrollment <> 'aprobado' THEN RAISE EXCEPTION 'dispositivo no aprobado'; END IF;
  IF p_tipo = 'reset_pin' THEN
    IF p_pin IS NULL OR length(p_pin) < 4 THEN RAISE EXCEPTION 'PIN requerido (mínimo 4)'; END IF;
    v_payload := jsonb_build_object('pin', p_pin);
  ELSE v_payload := NULL; END IF;
  IF p_tipo = 'unlock_policy' THEN UPDATE public.dispositivos SET politica_autolock = false WHERE id = v_dev.id; END IF;
  IF p_tipo = 'lock' THEN UPDATE public.dispositivos SET politica_autolock = true WHERE id = v_dev.id; END IF;
  INSERT INTO public.comandos_dispositivo (dispositivo_id, tipo, payload, solicitado_por)
  VALUES (v_dev.id, p_tipo, v_payload, auth.uid()) RETURNING * INTO v_cmd;
  RETURN jsonb_build_object('id', v_cmd.id, 'tipo', v_cmd.tipo, 'estado', v_cmd.estado, 'solicitado_at', v_cmd.solicitado_at);
END;
$$;

CREATE OR REPLACE FUNCTION public.listar_comandos(p_dispositivo_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_ti() THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id', c.id, 'tipo', c.tipo, 'estado', c.estado,
      'solicitado_at', c.solicitado_at, 'ejecutado_at', c.ejecutado_at, 'error_mensaje', c.error_mensaje
    ) ORDER BY c.solicitado_at DESC)
    FROM public.comandos_dispositivo c WHERE c.dispositivo_id = p_dispositivo_id
  ), '[]'::jsonb);
END;
$$;

REVOKE ALL ON FUNCTION public.is_ti() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reportar_politica(text, boolean, boolean, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.obtener_comando_pendiente(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.acusar_comando(uuid, text, boolean, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.listar_flota() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.obtener_dispositivo_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.aprobar_dispositivo(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.solicitar_comando(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.listar_comandos(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.registrar_dispositivo(text, text, double precision, double precision, text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reportar_ubicacion(text, double precision, double precision, double precision, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_dispositivo(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reportar_politica(text, boolean, boolean, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_comando_pendiente(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.acusar_comando(uuid, text, boolean, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_ti() TO authenticated;
GRANT EXECUTE ON FUNCTION public.listar_flota() TO authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_dispositivo_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.aprobar_dispositivo(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.solicitar_comando(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.listar_comandos(uuid) TO authenticated;
