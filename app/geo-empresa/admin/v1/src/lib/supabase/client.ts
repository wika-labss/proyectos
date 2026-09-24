import { createBrowserClient } from '@supabase/ssr';
import { publicEnv } from '../env';

export function createBrowserSupabase() {
  const { url, anonKey } = publicEnv();
  return createBrowserClient(url, anonKey);
}
