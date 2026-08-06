/** Timeouts v3 — v2 usaba 700 ms y el escaneo terminaba demasiado rápido / fallaba en WiFi lenta. */
export const PROBE_TIMEOUT_MS = 2500;
export const CONNECT_TIMEOUT_MS = 5000;
export const COMMAND_TIMEOUT_MS = 3500;
export const BATCH_SIZE = 16;
/** Tiempo mínimo de escaneo visible para que el usuario no vea un "flash" de "sin TV". */
export const MIN_SCAN_DURATION_MS = 10000;

export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = PROBE_TIMEOUT_MS,
): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function parseSubnet(ip: string): string | null {
  const parts = ip.split('.');
  if (parts.length !== 4) {
    return null;
  }
  if (parts.some((part) => Number.isNaN(Number(part)))) {
    return null;
  }
  // 0.0.0.0 / 127.x no son subredes LAN útiles
  if (parts[0] === '0' || parts[0] === '127') {
    return null;
  }
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

export async function mapInBatches<T, R>(
  items: T[],
  batchSize: number,
  mapper: (item: T) => Promise<R>,
  onBatchDone?: (done: number, total: number) => void,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(mapper));
    results.push(...batchResults);
    onBatchDone?.(Math.min(i + batch.length, items.length), items.length);
  }
  return results;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
