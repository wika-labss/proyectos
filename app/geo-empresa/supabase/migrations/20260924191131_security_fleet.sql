-- Flota de seguridad: enrollment, Device Owner y cola de comandos.
-- Exportado desde supabase_migrations (proyecto ugzprmopgmbjjxsbjmti).

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
