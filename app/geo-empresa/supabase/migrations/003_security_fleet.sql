-- Contrato V2 seguridad de flota + panel TI.
-- NO aplicar al proyecto remoto ugzprmopgmbjjxsbjmti hasta ready_for_construction: true.

-- ---------------------------------------------------------------------------
-- Tablas / columnas
-- ---------------------------------------------------------------------------

ALTER TABLE public.dispositivos
  ADD COLUMN IF NOT EXISTS estado_enrollment text NOT NULL DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS es_device_owner boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_activo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS politica_autolock boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS ultimo_lock_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'dispositivos_estado_enrollment_check'
  ) THEN
    ALTER TABLE public.dispositivos
      ADD CONSTRAINT dispositivos_estado_enrollment_check
      CHECK (estado_enrollment IN ('pendiente', 'aprobado', 'rechazado'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.perfiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  rol text NOT NULL CHECK (rol IN ('ti')),
  nombre text,
  creado_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.comandos_dispositivo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispositivo_id uuid NOT NULL REFERENCES public.dispositivos (id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('lock', 'unlock_policy', 'reset_pin', 'reboot')),
  estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'ejecutado', 'fallido')),
  payload jsonb,
  solicitado_por uuid REFERENCES auth.users (id),
  solicitado_at timestamptz NOT NULL DEFAULT now(),
  ejecutado_at timestamptz,
  error_mensaje text
);

CREATE INDEX IF NOT EXISTS comandos_dispositivo_pendiente_idx
  ON public.comandos_dispositivo (dispositivo_id, estado, solicitado_at)
  WHERE estado = 'pendiente';

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comandos_dispositivo ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_ti()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol = 'ti'
  );
$$;

-- ---------------------------------------------------------------------------
-- RPCs agente (anon, acotadas a fingerprint)
-- ---------------------------------------------------------------------------

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
    nombre_registrado, device_fingerprint, base_lat, base_lng, modelo, radio_metros,
    estado_enrollment
  ) VALUES (
    trim(p_nombre_registrado), trim(p_device_fingerprint), p_base_lat, p_base_lng, p_modelo,
    COALESCE(p_radio_metros, 120),
    'pendiente'
  )
  ON CONFLICT (device_fingerprint) DO UPDATE SET
    nombre_registrado = excluded.nombre_registrado,
    base_lat = excluded.base_lat,
    base_lng = excluded.base_lng,
    modelo = COALESCE(excluded.modelo, public.dispositivos.modelo),
    radio_metros = excluded.radio_metros
    -- no resetear estado_enrollment ni política en re-registro
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
  v_debe_bloquear boolean;
BEGIN
  SELECT * INTO v_row
  FROM public.dispositivos
  WHERE device_fingerprint = trim(p_device_fingerprint);

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'dispositivo no registrado';
  END IF;

  v_dist := public.distancia_metros(v_row.base_lat, v_row.base_lng, p_lat, p_lng);
  v_inside := v_dist <= v_row.radio_metros;
  v_debe_bloquear :=
    (NOT v_inside)
    AND v_row.politica_autolock
    AND v_row.estado_enrollment = 'aprobado';

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
    'ultimo_ping_at', v_row.ultimo_ping_at,
    'estado_enrollment', v_row.estado_enrollment,
    'politica_autolock', v_row.politica_autolock,
    'debe_bloquear', v_debe_bloquear
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
    'ultimo_ping_at', v_row.ultimo_ping_at,
    'estado_enrollment', v_row.estado_enrollment,
    'politica_autolock', v_row.politica_autolock,
    'es_device_owner', v_row.es_device_owner,
    'admin_activo', v_row.admin_activo
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.reportar_politica(
  p_device_fingerprint text,
  p_es_device_owner boolean,
  p_admin_activo boolean,
  p_locked boolean DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.dispositivos;
BEGIN
  UPDATE public.dispositivos SET
    es_device_owner = COALESCE(p_es_device_owner, es_device_owner),
    admin_activo = COALESCE(p_admin_activo, admin_activo),
    ultimo_lock_at = CASE
      WHEN p_locked IS TRUE THEN now()
      ELSE ultimo_lock_at
    END
  WHERE device_fingerprint = trim(p_device_fingerprint)
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'dispositivo no registrado';
  END IF;

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

CREATE OR REPLACE FUNCTION public.obtener_comando_pendiente(
  p_device_fingerprint text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dev public.dispositivos;
  v_cmd public.comandos_dispositivo;
BEGIN
  SELECT * INTO v_dev
  FROM public.dispositivos
  WHERE device_fingerprint = trim(p_device_fingerprint);

  IF v_dev.id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_cmd
  FROM public.comandos_dispositivo
  WHERE dispositivo_id = v_dev.id AND estado = 'pendiente'
  ORDER BY solicitado_at ASC
  LIMIT 1;

  IF v_cmd.id IS NULL THEN
    RETURN NULL;
  END IF;

  -- payload (PIN) solo para el fingerprint dueño, por esta RPC.
  RETURN jsonb_build_object(
    'id', v_cmd.id,
    'tipo', v_cmd.tipo,
    'payload', v_cmd.payload,
    'solicitado_at', v_cmd.solicitado_at,
    'estado_enrollment', v_dev.estado_enrollment,
    'politica_autolock', v_dev.politica_autolock
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.acusar_comando(
  p_comando_id uuid,
  p_device_fingerprint text,
  p_ok boolean,
  p_error text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dev public.dispositivos;
  v_cmd public.comandos_dispositivo;
BEGIN
  SELECT * INTO v_dev
  FROM public.dispositivos
  WHERE device_fingerprint = trim(p_device_fingerprint);

  IF v_dev.id IS NULL THEN
    RAISE EXCEPTION 'dispositivo no registrado';
  END IF;

  SELECT * INTO v_cmd
  FROM public.comandos_dispositivo
  WHERE id = p_comando_id AND dispositivo_id = v_dev.id;

  IF v_cmd.id IS NULL THEN
    RAISE EXCEPTION 'comando no pertenece al dispositivo';
  END IF;

  UPDATE public.comandos_dispositivo SET
    estado = CASE WHEN p_ok THEN 'ejecutado' ELSE 'fallido' END,
    ejecutado_at = now(),
    error_mensaje = CASE WHEN p_ok THEN NULL ELSE p_error END,
    payload = CASE
      WHEN p_ok AND tipo = 'reset_pin' THEN NULL
      ELSE payload
    END
  WHERE id = v_cmd.id
  RETURNING * INTO v_cmd;

  IF p_ok AND v_cmd.tipo = 'lock' THEN
    UPDATE public.dispositivos SET ultimo_lock_at = now() WHERE id = v_dev.id;
  END IF;

  IF p_ok AND v_cmd.tipo = 'unlock_policy' THEN
    UPDATE public.dispositivos SET politica_autolock = false WHERE id = v_dev.id;
  END IF;

  RETURN jsonb_build_object(
    'id', v_cmd.id,
    'tipo', v_cmd.tipo,
    'estado', v_cmd.estado,
    'ejecutado_at', v_cmd.ejecutado_at
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- RPCs TI (JWT + perfiles.rol = ti)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.listar_flota()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_ti() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN COALESCE(
    (
      SELECT jsonb_agg(jsonb_build_object(
        'id', d.id,
        'nombre_registrado', d.nombre_registrado,
        'modelo', d.modelo,
        'estado_enrollment', d.estado_enrollment,
        'telefono_encendido', d.telefono_encendido,
        'dentro_perimetro', d.dentro_perimetro,
        'distancia_base_m', d.distancia_base_m,
        'radio_metros', d.radio_metros,
        'es_device_owner', d.es_device_owner,
        'admin_activo', d.admin_activo,
        'politica_autolock', d.politica_autolock,
        'ultimo_ping_at', d.ultimo_ping_at,
        'ultimo_lock_at', d.ultimo_lock_at,
        'activo', d.activo
      ) ORDER BY d.registrado_at DESC)
      FROM public.dispositivos d
    ),
    '[]'::jsonb
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.obtener_dispositivo_admin(
  p_dispositivo_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.dispositivos;
  v_reportes jsonb;
BEGIN
  IF NOT public.is_ti() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO v_row FROM public.dispositivos WHERE id = p_dispositivo_id;
  IF v_row.id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'lat', r.lat,
    'lng', r.lng,
    'precision_m', r.precision_m,
    'distancia_base_m', r.distancia_base_m,
    'telefono_encendido', r.telefono_encendido,
    'dentro_perimetro', r.dentro_perimetro,
    'registrado_at', r.registrado_at
  ) ORDER BY r.registrado_at DESC), '[]'::jsonb)
  INTO v_reportes
  FROM (
    SELECT * FROM public.ubicacion_reportes
    WHERE dispositivo_id = v_row.id
    ORDER BY registrado_at DESC
    LIMIT 20
  ) r;

  RETURN jsonb_build_object(
    'id', v_row.id,
    'nombre_registrado', v_row.nombre_registrado,
    'device_fingerprint', v_row.device_fingerprint,
    'modelo', v_row.modelo,
    'base_lat', v_row.base_lat,
    'base_lng', v_row.base_lng,
    'radio_metros', v_row.radio_metros,
    'estado_enrollment', v_row.estado_enrollment,
    'telefono_encendido', v_row.telefono_encendido,
    'dentro_perimetro', v_row.dentro_perimetro,
    'ultima_lat', v_row.ultima_lat,
    'ultima_lng', v_row.ultima_lng,
    'distancia_base_m', v_row.distancia_base_m,
    'es_device_owner', v_row.es_device_owner,
    'admin_activo', v_row.admin_activo,
    'politica_autolock', v_row.politica_autolock,
    'ultimo_ping_at', v_row.ultimo_ping_at,
    'ultimo_lock_at', v_row.ultimo_lock_at,
    'reportes', v_reportes
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.aprobar_dispositivo(
  p_dispositivo_id uuid,
  p_estado text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.dispositivos;
BEGIN
  IF NOT public.is_ti() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF p_estado NOT IN ('aprobado', 'rechazado') THEN
    RAISE EXCEPTION 'estado inválido';
  END IF;

  UPDATE public.dispositivos
  SET estado_enrollment = p_estado
  WHERE id = p_dispositivo_id
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'dispositivo no existe';
  END IF;

  RETURN jsonb_build_object(
    'id', v_row.id,
    'estado_enrollment', v_row.estado_enrollment
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.solicitar_comando(
  p_dispositivo_id uuid,
  p_tipo text,
  p_pin text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dev public.dispositivos;
  v_cmd public.comandos_dispositivo;
  v_payload jsonb;
BEGIN
  IF NOT public.is_ti() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF p_tipo NOT IN ('lock', 'unlock_policy', 'reset_pin', 'reboot') THEN
    RAISE EXCEPTION 'tipo inválido';
  END IF;

  SELECT * INTO v_dev FROM public.dispositivos WHERE id = p_dispositivo_id;
  IF v_dev.id IS NULL THEN
    RAISE EXCEPTION 'dispositivo no existe';
  END IF;
  IF v_dev.estado_enrollment <> 'aprobado' THEN
    RAISE EXCEPTION 'dispositivo no aprobado';
  END IF;

  IF p_tipo = 'reset_pin' THEN
    IF p_pin IS NULL OR length(p_pin) < 4 THEN
      RAISE EXCEPTION 'PIN requerido (mínimo 4)';
    END IF;
    v_payload := jsonb_build_object('pin', p_pin);
  ELSE
    v_payload := NULL;
  END IF;

  IF p_tipo = 'unlock_policy' THEN
    UPDATE public.dispositivos SET politica_autolock = false WHERE id = v_dev.id;
  END IF;
  IF p_tipo = 'lock' THEN
    UPDATE public.dispositivos SET politica_autolock = true WHERE id = v_dev.id;
  END IF;

  INSERT INTO public.comandos_dispositivo (
    dispositivo_id, tipo, payload, solicitado_por
  ) VALUES (
    v_dev.id, p_tipo, v_payload, auth.uid()
  )
  RETURNING * INTO v_cmd;

  RETURN jsonb_build_object(
    'id', v_cmd.id,
    'tipo', v_cmd.tipo,
    'estado', v_cmd.estado,
    'solicitado_at', v_cmd.solicitado_at
    -- sin payload / PIN
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.listar_comandos(
  p_dispositivo_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_ti() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN COALESCE(
    (
      SELECT jsonb_agg(jsonb_build_object(
        'id', c.id,
        'tipo', c.tipo,
        'estado', c.estado,
        'solicitado_at', c.solicitado_at,
        'ejecutado_at', c.ejecutado_at,
        'error_mensaje', c.error_mensaje
        -- payload omitido a propósito
      ) ORDER BY c.solicitado_at DESC)
      FROM public.comandos_dispositivo c
      WHERE c.dispositivo_id = p_dispositivo_id
    ),
    '[]'::jsonb
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

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
