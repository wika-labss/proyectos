import { isLikelyHttpUrl, normalizeBaseUrl, type EngineError } from '../../engine';

export const DEFAULT_API_URL = normalizeBaseUrl(
  process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8787',
);

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text };
  }
}

export async function apiRequest<T>(
  apiBaseUrl: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${normalizeBaseUrl(apiBaseUrl)}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      accept: 'application/json',
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  const payload = await parseBody(res);
  if (!res.ok) {
    const err = (payload as { error?: EngineError }).error;
    throw new ApiError(err?.code ?? 'HTTP_ERROR', err?.message ?? `HTTP ${res.status}`, res.status);
  }
  return payload as T;
}

export function validateApiBase(url: string): string | null {
  const trimmed = url.trim();
  if (!isLikelyHttpUrl(trimmed)) return null;
  return normalizeBaseUrl(trimmed);
}
