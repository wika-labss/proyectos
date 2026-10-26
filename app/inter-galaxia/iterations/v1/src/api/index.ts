import type { ApiClient } from './types';
import { HttpProvider } from '../http/HttpProvider';
import { MockProvider } from '../mock/MockProvider';

export * from './types';

let singleton: ApiClient | null = null;

export function getApiClient(): ApiClient {
  if (!singleton) {
    const useMock = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';
    singleton = useMock
      ? new MockProvider()
      : new HttpProvider(process.env.EXPO_PUBLIC_API_URL ?? '');
  }
  return singleton as ApiClient;
}

export function setApiClient(client: ApiClient): void {
  singleton = client;
}
