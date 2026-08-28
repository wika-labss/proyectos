export type DeviceRegistration = {
  id: string;
  nombre_registrado: string;
  device_fingerprint: string;
  base_lat: number;
  base_lng: number;
  radio_metros: number;
  telefono_encendido: boolean;
  dentro_perimetro: boolean;
  registrado_at?: string;
};

export type LocationReport = {
  id: string;
  nombre_registrado: string;
  telefono_encendido: boolean;
  dentro_perimetro: boolean;
  distancia_base_m: number;
  radio_metros: number;
  ultimo_ping_at: string;
};

export type GeoApiErrorCode = 'network' | 'not_registered' | 'invalid_response' | 'config';

export class GeoApiError extends Error {
  constructor(
    public readonly code: GeoApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'GeoApiError';
  }
}

import { appConfig } from '../constants/config';

async function postRpc<T>(rpcName: string, body: Record<string, unknown>): Promise<T> {
  const baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? appConfig.supabaseUrl;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? appConfig.supabaseAnonKey;

  if (!baseUrl || !anonKey) {
    throw new GeoApiError('config', 'Supabase no configurado.');
  }

  const response = await fetch(`${baseUrl}/rest/v1/rpc/${rpcName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 404 || text.includes('Dispositivo no registrado')) {
      throw new GeoApiError('not_registered', 'Dispositivo no registrado en Supabase.');
    }
    throw new GeoApiError('network', `Error RPC ${rpcName}: ${response.status} ${text}`);
  }

  const payload = (await response.json()) as T;
  return payload;
}

export async function registrarDispositivo(input: {
  nombreRegistrado: string;
  deviceFingerprint: string;
  baseLat: number;
  baseLng: number;
  modelo?: string;
  radioMetros?: number;
}): Promise<DeviceRegistration> {
  const result = await postRpc<Record<string, unknown>>('registrar_dispositivo', {
    p_nombre_registrado: input.nombreRegistrado,
    p_device_fingerprint: input.deviceFingerprint,
    p_base_lat: input.baseLat,
    p_base_lng: input.baseLng,
    p_modelo: input.modelo ?? null,
    p_radio_metros: input.radioMetros ?? 120,
  });

  return mapDevice(result);
}

export async function reportarUbicacion(input: {
  deviceFingerprint: string;
  lat: number;
  lng: number;
  precisionM?: number;
  telefonoEncendido: boolean;
}): Promise<LocationReport> {
  const result = await postRpc<Record<string, unknown>>('reportar_ubicacion', {
    p_device_fingerprint: input.deviceFingerprint,
    p_lat: input.lat,
    p_lng: input.lng,
    p_precision_m: input.precisionM ?? null,
    p_telefono_encendido: input.telefonoEncendido,
  });

  return mapReport(result);
}

function mapDevice(value: Record<string, unknown>): DeviceRegistration {
  return {
    id: String(value.id ?? ''),
    nombre_registrado: String(value.nombre_registrado ?? ''),
    device_fingerprint: String(value.device_fingerprint ?? ''),
    base_lat: Number(value.base_lat ?? 0),
    base_lng: Number(value.base_lng ?? 0),
    radio_metros: Number(value.radio_metros ?? 120),
    telefono_encendido: Boolean(value.telefono_encendido ?? true),
    dentro_perimetro: Boolean(value.dentro_perimetro ?? true),
    registrado_at: value.registrado_at ? String(value.registrado_at) : undefined,
  };
}

function mapReport(value: Record<string, unknown>): LocationReport {
  return {
    id: String(value.id ?? ''),
    nombre_registrado: String(value.nombre_registrado ?? ''),
    telefono_encendido: Boolean(value.telefono_encendido ?? true),
    dentro_perimetro: Boolean(value.dentro_perimetro ?? true),
    distancia_base_m: Number(value.distancia_base_m ?? 0),
    radio_metros: Number(value.radio_metros ?? 120),
    ultimo_ping_at: String(value.ultimo_ping_at ?? new Date().toISOString()),
  };
}

export function validatePin(input: string, expectedPin: string): boolean {
  return input.trim() === expectedPin.trim();
}
