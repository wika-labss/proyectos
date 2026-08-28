export const appConfig = {
  supabaseUrl:
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    'https://ugzprmopgmbjjxsbjmti.supabase.co',
  supabaseAnonKey:
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnenBybW9wZ21iamp4c2JqbXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NzA1OTQsImV4cCI6MjEwMzQ0NjU5NH0.p9dukYuXqgvp5QdlW8PEaCuBKRQnhfPuwsVdht6bEkw',
  defaultPin: '1312',
  fenceRadiusM: 120,
  pingIntervalMs: 5 * 60 * 1000,
  splashDurationMs: 3000,
  lockSnoozeMs: 15 * 60 * 1000,
  backgroundLocationTask: 'GEO_EMPRESA_LOCATION_PING',
  storageKeys: {
    registration: '@geo-empresa:v2:registration',
    lastLocation: '@geo-empresa:v2:last-location',
    phoneOn: '@geo-empresa:v2:phone-on',
    lockState: '@geo-empresa:v2:lock-state',
    lockSnoozeUntil: '@geo-empresa:v2:lock-snooze-until',
  },
} as const;

export type RegistrationRecord = {
  nombreRegistrado: string;
  deviceFingerprint: string;
  baseLat: number;
  baseLng: number;
  radioMetros: number;
  registeredAt: string;
};

export type LockReason = 'outside_fence' | 'airplane_mode' | 'phone_off';

export type LockState = {
  active: boolean;
  reason: LockReason;
  distanciaBaseM: number;
  dentroPerimetro: boolean;
  telefonoEncendido: boolean;
  updatedAt: string;
};
