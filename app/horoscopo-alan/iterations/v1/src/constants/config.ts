export const config = {
  supabaseUrl:
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    'https://tljzwyfmyjylfqcpggzc.supabase.co',
  supabaseAnonKey:
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsanp3eWZteWp5bGZxY3BnZ3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzIyMDIsImV4cCI6MjEwMjkwODIwMn0.V-NBy5dThYbuHvVhjqr1jKeiIBlDbkQBkBNP19kDW4w',
  defaultTimeZone: 'America/Santiago',
} as const;
