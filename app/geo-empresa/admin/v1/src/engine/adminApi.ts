import type { SupabaseClient } from '@supabase/supabase-js';

export type FlotaRow = {
  id: string;
  nombre_registrado: string;
  modelo: string | null;
  estado_enrollment: string;
  telefono_encendido: boolean;
  dentro_perimetro: boolean;
  distancia_base_m: number | null;
  radio_metros: number;
  es_device_owner: boolean;
  admin_activo: boolean;
  politica_autolock: boolean;
  ultimo_ping_at: string | null;
  ultimo_lock_at: string | null;
  activo: boolean;
};

export type ComandoRow = {
  id: string;
  tipo: string;
  estado: string;
  solicitado_at: string;
  ejecutado_at: string | null;
  error_mensaje: string | null;
};

export type DeviceDetail = FlotaRow & {
  device_fingerprint: string;
  base_lat: number;
  base_lng: number;
  ultima_lat: number | null;
  ultima_lng: number | null;
  reportes: Array<{
    lat: number;
    lng: number;
    distancia_base_m: number | null;
    telefono_encendido: boolean;
    dentro_perimetro: boolean;
    registrado_at: string;
  }>;
};

async function rpc<T>(client: SupabaseClient, name: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export function listarFlota(client: SupabaseClient): Promise<FlotaRow[]> {
  return rpc<FlotaRow[]>(client, 'listar_flota');
}

export function obtenerDispositivoAdmin(client: SupabaseClient, id: string): Promise<DeviceDetail | null> {
  return rpc<DeviceDetail | null>(client, 'obtener_dispositivo_admin', {
    p_dispositivo_id: id,
  });
}

export function aprobarDispositivo(
  client: SupabaseClient,
  id: string,
  estado: 'aprobado' | 'rechazado',
): Promise<{ id: string; estado_enrollment: string }> {
  return rpc(client, 'aprobar_dispositivo', {
    p_dispositivo_id: id,
    p_estado: estado,
  });
}

export function solicitarComando(
  client: SupabaseClient,
  id: string,
  tipo: 'lock' | 'unlock_policy' | 'reset_pin' | 'reboot',
  pin?: string,
): Promise<{ id: string; tipo: string; estado: string }> {
  return rpc(client, 'solicitar_comando', {
    p_dispositivo_id: id,
    p_tipo: tipo,
    p_pin: pin ?? null,
  });
}

export function listarComandos(client: SupabaseClient, id: string): Promise<ComandoRow[]> {
  return rpc<ComandoRow[]>(client, 'listar_comandos', { p_dispositivo_id: id });
}
