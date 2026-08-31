export const SPECIES = ['perro', 'gato', 'ave', 'otro'] as const;
export type Species = (typeof SPECIES)[number];

export type Pet = {
  id: string;
  publicToken: string;
  name: string;
  species: Species;
  address: string;
  homeLat: number;
  homeLng: number;
  createdAt: string;
};

export type FindAlert = {
  id: string;
  petId: string;
  publicToken: string;
  foundLat: number | null;
  foundLng: number | null;
  accuracyMeters: number | null;
  createdAt: string;
  status: 'new' | 'seen';
  usedDemoLocation: boolean;
};

export type AppStore = {
  pets: Pet[];
  alerts: FindAlert[];
};

export type EngineError = { code: string; message: string };

export type EngineResult<T> = { ok: true; state: T } | { ok: false; error: EngineError };

export type CreatePetInput = {
  name: string;
  species: string;
  address: string;
  homeLat: number;
  homeLng: number;
  publicToken?: string;
  id?: string;
  now?: Date;
};

export type ReportFoundInput = {
  token: string;
  foundLat?: number | null;
  foundLng?: number | null;
  accuracyMeters?: number | null;
  usedDemoLocation?: boolean;
  now?: Date;
  cooldownMs?: number;
};

export const DEFAULT_ALERT_COOLDOWN_MS = 5 * 60 * 1000;

export function emptyStore(): AppStore {
  return { pets: [], alerts: [] };
}
