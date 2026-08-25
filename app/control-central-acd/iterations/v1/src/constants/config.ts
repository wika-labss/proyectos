export const config = {
  supabaseUrl:
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    'https://wdpvlmuescstqnliorkx.supabase.co',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkcHZsbXVlc2NzdHFubGlvcmt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2Nzg0MzEsImV4cCI6MjEwMzI1NDQzMX0.NXH5_Go08L3XeNSnWdGopljFmks5vJ_u37MNtvoEXho',
} as const;
