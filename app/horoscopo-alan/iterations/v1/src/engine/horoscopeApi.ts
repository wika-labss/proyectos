import type { ZodiacSlug } from './zodiac';

export type HoroscopeSignPayload = {
  slug: string;
  nombre: string;
  amor: string;
  salud: string;
  dinero: string;
  color: string;
  numero: number;
  elemento: string;
  rango: string;
  animo: number;
};

export type HoroscopeResponse = {
  titulo: string;
  fecha: string;
  zona_horaria: string;
  vigente: boolean;
  signo: HoroscopeSignPayload;
};

export type HoroscopeApiErrorCode = 'network' | 'not_found' | 'invalid_response' | 'config';

export class HoroscopeApiError extends Error {
  constructor(
    public readonly code: HoroscopeApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'HoroscopeApiError';
  }
}

import { config } from '../constants/config';

function getConfig(): { baseUrl: string; anonKey: string } {
  const baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? config.supabaseUrl;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? config.supabaseAnonKey;

  if (!anonKey) {
    throw new HoroscopeApiError(
      'config',
      'Falta EXPO_PUBLIC_SUPABASE_ANON_KEY en la configuración de la app.',
    );
  }

  return { baseUrl, anonKey };
}

function isHoroscopeSignPayload(value: unknown): value is HoroscopeSignPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const sign = value as Record<string, unknown>;
  return (
    typeof sign.slug === 'string' &&
    typeof sign.nombre === 'string' &&
    typeof sign.amor === 'string' &&
    typeof sign.salud === 'string' &&
    typeof sign.dinero === 'string' &&
    typeof sign.color === 'string' &&
    typeof sign.numero === 'number' &&
    typeof sign.elemento === 'string' &&
    typeof sign.rango === 'string' &&
    typeof sign.animo === 'number'
  );
}

function parseHoroscopeResponse(payload: unknown): HoroscopeResponse {
  if (!payload || typeof payload !== 'object') {
    throw new HoroscopeApiError('invalid_response', 'Respuesta vacía del servidor.');
  }

  const data = payload as Record<string, unknown>;
  if (!isHoroscopeSignPayload(data.signo)) {
    throw new HoroscopeApiError('invalid_response', 'Formato de horóscopo inválido.');
  }

  return {
    titulo: String(data.titulo ?? ''),
    fecha: String(data.fecha ?? ''),
    zona_horaria: String(data.zona_horaria ?? 'America/Santiago'),
    vigente: Boolean(data.vigente),
    signo: data.signo,
  };
}

export async function fetchHoroscopeToday(
  slug: ZodiacSlug,
  zonaHoraria = 'America/Santiago',
): Promise<HoroscopeResponse> {
  const { baseUrl, anonKey } = getConfig();
  const url = `${baseUrl}/functions/v1/horoscopo?signo=${encodeURIComponent(slug)}&zona_horaria=${encodeURIComponent(zonaHoraria)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
        Accept: 'application/json',
      },
    });
  } catch {
    throw new HoroscopeApiError(
      'network',
      'No se pudo conectar. Revisa tu conexión a internet.',
    );
  }

  if (response.status === 404) {
    throw new HoroscopeApiError(
      'not_found',
      'No hay horóscopo disponible para hoy. Intenta más tarde.',
    );
  }

  if (!response.ok) {
    throw new HoroscopeApiError(
      'network',
      `Error del servidor (${response.status}). Intenta de nuevo.`,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new HoroscopeApiError('invalid_response', 'Respuesta JSON inválida.');
  }

  return parseHoroscopeResponse(payload);
}
