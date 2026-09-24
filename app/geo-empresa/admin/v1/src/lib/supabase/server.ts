import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { publicEnv } from '../env';

export function createServerSupabase() {
  const { url, anonKey } = publicEnv();
  const cookieStore = cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Server Component: set is a no-op; middleware refreshes session.
          }
        });
      },
    },
  });
}
