export function publicEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://ugzprmopgmbjjxsbjmti.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (!anonKey) {
    throw new Error('Falta NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return { url, anonKey };
}
