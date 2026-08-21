export type PetType = 'perro' | 'gato' | 'ave' | 'conejo' | 'otro';
export type PetSex = 'macho' | 'hembra' | 'desconocido';
export type FoodType = 'seco' | 'humedo' | 'casero' | 'premio' | 'otro';
export type BathroomType = 'orina' | 'heces' | 'ambos';
export type StoolCode = 'firme' | 'dura' | 'blanda' | 'liquida' | 'moco' | 'sangre';
export type HealthStatus = 'sano' | 'enfermo' | 'en_recuperacion';
export type Symptom =
  | 'vomito'
  | 'diarrea'
  | 'letargo'
  | 'sin_apetito'
  | 'tos'
  | 'cojera'
  | 'otro';
export type PreventiveKind = 'vacuna' | 'desparasitacion';
export type DueStatus = 'ok' | 'soon' | 'overdue';
export type Severity = 'ok' | 'warning' | 'error';

export type Pet = {
  id: string;
  name: string;
  type: PetType;
  breed?: string;
  sex: PetSex;
  birthDate: string; // YYYY-MM-DD
  birthDateEstimated: boolean;
  weightKg?: number;
  createdAt: string; // ISO
};

export type FeedPayload = { foodType: FoodType; amountLabel?: string };
export type BathroomPayload = { bathroomType: BathroomType; stool?: StoolCode };
export type WalkPayload = { durationMin?: number; note?: string };
export type NotePayload = { text: string };
export type HealthPayload = {
  status: HealthStatus;
  symptoms: Symptom[];
  notes?: string;
};

export type CareEvent =
  | { id: string; petId: string; at: string; kind: 'feed'; payload: FeedPayload }
  | { id: string; petId: string; at: string; kind: 'bathroom'; payload: BathroomPayload }
  | { id: string; petId: string; at: string; kind: 'walk'; payload: WalkPayload }
  | { id: string; petId: string; at: string; kind: 'note'; payload: NotePayload }
  | { id: string; petId: string; at: string; kind: 'health'; payload: HealthPayload };

export type PetHealth = {
  status: HealthStatus;
  symptoms: Symptom[];
  notes?: string;
  updatedAt: string;
};

export type PreventiveItem = {
  id: string;
  petId: string;
  kind: PreventiveKind;
  name: string;
  appliedAt: string; // YYYY-MM-DD
  nextDueAt?: string; // YYYY-MM-DD
  notes?: string;
};

export type AppState = {
  pets: Pet[];
  activePetId: string | null;
  events: CareEvent[];
  healthByPetId: Record<string, PetHealth>;
  preventives: PreventiveItem[];
};

export type EngineError = { code: string; message: string };

export type EngineResult<T> = { ok: true; state: T } | { ok: false; error: EngineError };

export type DaySummary = {
  date: string;
  petId: string;
  feedCount: number;
  bathroomCount: number;
  walkCount: number;
  noteCount: number;
  lastStool?: StoolCode;
  health?: PetHealth;
  events: CareEvent[];
  preventivesApplied: PreventiveItem[];
};

export const PET_TYPES: PetType[] = ['perro', 'gato', 'ave', 'conejo', 'otro'];
export const FOOD_TYPES: FoodType[] = ['seco', 'humedo', 'casero', 'premio', 'otro'];
export const BATHROOM_TYPES: BathroomType[] = ['orina', 'heces', 'ambos'];
export const STOOL_CODES: StoolCode[] = ['firme', 'dura', 'blanda', 'liquida', 'moco', 'sangre'];
export const SYMPTOMS: Symptom[] = [
  'vomito',
  'diarrea',
  'letargo',
  'sin_apetito',
  'tos',
  'cojera',
  'otro',
];
export const HEALTH_STATUSES: HealthStatus[] = ['sano', 'enfermo', 'en_recuperacion'];
export const PREVENTIVE_KINDS: PreventiveKind[] = ['vacuna', 'desparasitacion'];

export function emptyState(): AppState {
  return {
    pets: [],
    activePetId: null,
    events: [],
    healthByPetId: {},
    preventives: [],
  };
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function toLocalDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseLocalDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

export function shiftDateKey(key: string, deltaDays: number): string {
  const d = parseLocalDateKey(key);
  d.setDate(d.getDate() + deltaDays);
  return toLocalDateKey(d);
}

export function eventDateKey(iso: string): string {
  return toLocalDateKey(new Date(iso));
}
