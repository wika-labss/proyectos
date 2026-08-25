import { config } from '../constants/config';
import type { QueryFilter } from './filters';
import { toRpcBody } from './filters';
import type {
  EstadoRef,
  GanadorPayload,
  LicitacionesPayload,
  ResumenPayload,
  RubroRef,
} from './types';

export type AcdApiErrorCode = 'network' | 'not_found' | 'invalid_response' | 'config';

export class AcdApiError extends Error {
  constructor(
    public readonly code: AcdApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AcdApiError';
  }
}

const RPC_PREFIX = '/rest/v1/rpc/';

function getConfig(): { baseUrl: string; anonKey: string } {
  const baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? config.supabaseUrl;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? config.supabaseAnonKey;
  if (!anonKey) {
    throw new AcdApiError('config', 'Falta EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }
  if (baseUrl.includes('mercadopublico.cl')) {
    throw new AcdApiError('config', 'La API propia no puede apuntar a ChileCompra.');
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
    throw new AcdApiError('network', 'No se pudo conectar. Revisa tu conexión a internet.');
  }

  if (response.status === 404) {
    throw new AcdApiError('not_found', 'Recurso no encontrado en la API propia.');
  }
  if (!response.ok) {
    throw new AcdApiError('network', `Error del servidor (${response.status}). Intenta de nuevo.`);
  }

  let payload: unknown;
  try {
    const text = await response.text();
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new AcdApiError('invalid_response', 'Respuesta JSON inválida.');
  }
  return payload as T;
}

export function fetchRubros(): Promise<RubroRef[]> {
  return rpc<RubroRef[]>('consultar_rubros');
}

export function fetchEstados(): Promise<EstadoRef[]> {
  return rpc<EstadoRef[]>('consultar_estados');
}

export function fetchResumen(filter: QueryFilter): Promise<ResumenPayload> {
  return rpc<ResumenPayload>('consultar_resumen', toRpcBody(filter));
}

export function fetchLicitaciones(
  filter: QueryFilter,
  limit = 30,
  offset = 0,
): Promise<LicitacionesPayload> {
  return rpc<LicitacionesPayload>('consultar_licitaciones', {
    ...toRpcBody(filter),
    p_limit: limit,
    p_offset: offset,
  });
}

export function fetchGanador(codigo: string): Promise<GanadorPayload | null> {
  return rpc<GanadorPayload | null>('consultar_ganador', { p_codigo: codigo });
}
