import { requiresStool } from './stoolScale';
import type {
  BathroomPayload,
  CareEvent,
  EngineResult,
  FeedPayload,
  NotePayload,
  WalkPayload,
} from './types';
import { BATHROOM_TYPES, FOOD_TYPES, newId, STOOL_CODES } from './types';

export type AddFeedInput = {
  petId: string;
  at?: string;
  payload: FeedPayload;
};

export type AddBathroomInput = {
  petId: string;
  at?: string;
  payload: BathroomPayload;
};

export type AddWalkInput = {
  petId: string;
  at?: string;
  payload: WalkPayload;
};

export type AddNoteInput = {
  petId: string;
  at?: string;
  payload: NotePayload;
};

function resolveAt(at?: string): string {
  return at ?? new Date().toISOString();
}

export function addFeedEvent(input: AddFeedInput): EngineResult<CareEvent> {
  if (!input.petId) {
    return { ok: false, error: { code: 'PET_REQUIRED', message: 'Mascota requerida' } };
  }
  if (!FOOD_TYPES.includes(input.payload.foodType)) {
    return { ok: false, error: { code: 'FOOD_TYPE_INVALID', message: 'Tipo de alimento inválido' } };
  }
  const event: CareEvent = {
    id: newId('evt'),
    petId: input.petId,
    at: resolveAt(input.at),
    kind: 'feed',
    payload: {
      foodType: input.payload.foodType,
      amountLabel: input.payload.amountLabel?.trim() || undefined,
    },
  };
  return { ok: true, state: event };
}

export function addBathroomEvent(input: AddBathroomInput): EngineResult<CareEvent> {
  if (!input.petId) {
    return { ok: false, error: { code: 'PET_REQUIRED', message: 'Mascota requerida' } };
  }
  const { bathroomType, stool } = input.payload;
  if (!BATHROOM_TYPES.includes(bathroomType)) {
    return { ok: false, error: { code: 'BATHROOM_TYPE_INVALID', message: 'Tipo de baño inválido' } };
  }
  if (requiresStool(bathroomType)) {
    if (!stool || !STOOL_CODES.includes(stool)) {
      return {
        ok: false,
        error: { code: 'STOOL_REQUIRED', message: 'Consistencia de heces obligatoria' },
      };
    }
  }
  const event: CareEvent = {
    id: newId('evt'),
    petId: input.petId,
    at: resolveAt(input.at),
    kind: 'bathroom',
    payload: {
      bathroomType,
      stool: requiresStool(bathroomType) ? stool : undefined,
    },
  };
  return { ok: true, state: event };
}

export function addWalkEvent(input: AddWalkInput): EngineResult<CareEvent> {
  if (!input.petId) {
    return { ok: false, error: { code: 'PET_REQUIRED', message: 'Mascota requerida' } };
  }
  const duration = input.payload.durationMin;
  if (duration != null) {
    if (!Number.isFinite(duration) || duration < 0 || duration > 24 * 60) {
      return { ok: false, error: { code: 'WALK_DURATION_INVALID', message: 'Duración inválida' } };
    }
  }
  const event: CareEvent = {
    id: newId('evt'),
    petId: input.petId,
    at: resolveAt(input.at),
    kind: 'walk',
    payload: {
      durationMin: duration != null ? Math.floor(duration) : undefined,
      note: input.payload.note?.trim() || undefined,
    },
  };
  return { ok: true, state: event };
}

export function addNoteEvent(input: AddNoteInput): EngineResult<CareEvent> {
  if (!input.petId) {
    return { ok: false, error: { code: 'PET_REQUIRED', message: 'Mascota requerida' } };
  }
  const text = input.payload.text.trim();
  if (!text) {
    return { ok: false, error: { code: 'NOTE_EMPTY', message: 'La nota no puede estar vacía' } };
  }
  if (text.length > 280) {
    return { ok: false, error: { code: 'NOTE_TOO_LONG', message: 'Máximo 280 caracteres' } };
  }
  const event: CareEvent = {
    id: newId('evt'),
    petId: input.petId,
    at: resolveAt(input.at),
    kind: 'note',
    payload: { text },
  };
  return { ok: true, state: event };
}
