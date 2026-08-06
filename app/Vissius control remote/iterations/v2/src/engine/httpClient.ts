const PROBE_TIMEOUT_MS = 700;
const BATCH_SIZE = 40;

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
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

export async function mapInBatches<T, R>(
  items: T[],
  batchSize: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(mapper));
    results.push(...batchResults);
  }
  return results;
}

export { BATCH_SIZE, PROBE_TIMEOUT_MS };
