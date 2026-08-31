export function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

export function buildPublicUrl(apiBaseUrl: string, publicToken: string): string {
  return `${normalizeBaseUrl(apiBaseUrl)}/p/${encodeURIComponent(publicToken)}`;
}

export function buildPrintUrl(apiBaseUrl: string, publicToken: string): string {
  return `${normalizeBaseUrl(apiBaseUrl)}/print/${encodeURIComponent(publicToken)}`;
}

export function buildQrPngUrl(apiBaseUrl: string, publicToken: string): string {
  return `${normalizeBaseUrl(apiBaseUrl)}/qr/${encodeURIComponent(publicToken)}.png`;
}

export function isLikelyHttpUrl(url: string): boolean {
  return /^https?:\/\/.+/i.test(url.trim());
}
