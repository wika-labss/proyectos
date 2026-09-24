import { config } from '../constants/config';
import type { ComandoPendiente, DispositivoSnapshot } from './types';

export type GeoApiErrorCode = 'network' | 'not_found' | 'invalid_response' | 'config';

export class GeoApiError extends Error {
  constructor(
    public readonly code: GeoApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'GeoApiError';
  }
}

const RPC_PREFIX = '/rest/v1/rpc/';

function getConfig(): { baseUrl: string; anonKey: string } {
  const baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? config.supabaseUrl;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? config.supabaseAnonKey;
  if (!anonKey) {
    throw new GeoApiError('config', 'Falta EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }
  return { baseUrl: baseUrl.replace(/\/$/, ''), anonKey };
}

async function rpc<T>(name: string, body: Record<string, unknown> = {}): Promise<T> {
  const { baseUrl, anonKey } = getConfig();
  const url = `${baseUrl}${RPC_PREFIX}${name}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new GeoApiError('network', 'No se pudo conectar. Revisa tu conexión.');
  }

  if (response.status === 404) {
    throw new GeoApiError('not_found', 'RPC no encontrada.');
  }
  if (!response.ok) {
    throw new GeoApiError('network', `Error del servidor (${response.status}).`);
  }

  try {
    const text = await response.text();
    return (text ? JSON.parse(text) : null) as T;
  } catch {
    throw new GeoApiError('invalid_response', 'Respuesta JSON inválida.');
  }
}

export function registrarDispositivo(input: {
  nombre: string;
  fingerprint: string;
  baseLat: number;
  baseLng: number;
  modelo?: string;
  radioMetros?: number;
}): Promise<DispositivoSnapshot> {
  return rpc<DispositivoSnapshot>('registrar_dispositivo', {
    p_nombre_registrado: input.nombre,
    p_device_fingerprint: input.fingerprint,
    p_base_lat: input.baseLat,
    p_base_lng: input.baseLng,
    p_modelo: input.modelo ?? null,
    p_radio_metros: input.radioMetros ?? 120,
  });
}

export function reportarUbicacion(input: {
  fingerprint: string;
  lat: number;
  lng: number;
  precisionM?: number;
  telefonoEncendido: boolean;
}): Promise<DispositivoSnapshot> {
  return rpc<DispositivoSnapshot>('reportar_ubicacion', {
    p_device_fingerprint: input.fingerprint,
    p_lat: input.lat,
    p_lng: input.lng,
    p_precision_m: input.precisionM ?? null,
    p_telefono_encendido: input.telefonoEncendido,
  });
}

export function obtenerDispositivo(fingerprint: string): Promise<DispositivoSnapshot | null> {
  return rpc<DispositivoSnapshot | null>('obtener_dispositivo', {
    p_device_fingerprint: fingerprint,
  });
}

export function reportarPolitica(input: {
  fingerprint: string;
  esDeviceOwner: boolean;
  adminActivo: boolean;
  locked?: boolean;
}): Promise<DispositivoSnapshot> {
  return rpc<DispositivoSnapshot>('reportar_politica', {
    p_device_fingerprint: input.fingerprint,
    p_es_device_owner: input.esDeviceOwner,
    p_admin_activo: input.adminActivo,
    p_locked: input.locked ?? null,
  });
}

export function obtenerComandoPendiente(fingerprint: string): Promise<ComandoPendiente | null> {
  return rpc<ComandoPendiente | null>('obtener_comando_pendiente', {
    p_device_fingerprint: fingerprint,
  });
}

export function acusarComando(input: {
  comandoId: string;
  fingerprint: string;
  ok: boolean;
  error?: string;
}): Promise<{ id: string; tipo: string; estado: string }> {
  return rpc('acusar_comando', {
    p_comando_id: input.comandoId,
    p_device_fingerprint: input.fingerprint,
    p_ok: input.ok,
    p_error: input.error ?? null,
  });
}
