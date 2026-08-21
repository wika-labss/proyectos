import {
  addBathroomEvent,
  addFeedEvent,
  addNoteEvent,
  addWalkEvent,
  type AddBathroomInput,
  type AddFeedInput,
  type AddNoteInput,
  type AddWalkInput,
} from './careEvents';
import { getDaySummary, describeEvent } from './dayHistory';
import { defaultHealth, setHealth, type SetHealthInput } from './healthStatus';
import { ageFromBirthDate, createPet, formatAge, type CreatePetInput } from './petProfile';
import { addPreventive, dueStatus, type AddPreventiveInput } from './preventiveCalendar';
import { getStoolMeta, listStoolMeta, requiresStool } from './stoolScale';
import type { AppState, EngineResult, Pet } from './types';
import { emptyState, newId } from './types';

export * from './types';
export type { CreatePetInput } from './petProfile';
export type { SetHealthInput } from './healthStatus';
export type { AddPreventiveInput } from './preventiveCalendar';
export type {
  AddBathroomInput,
  AddFeedInput,
  AddNoteInput,
  AddWalkInput,
} from './careEvents';
export {
  ageFromBirthDate,
  formatAge,
  getDaySummary,
  describeEvent,
  getStoolMeta,
  listStoolMeta,
  requiresStool,
  dueStatus,
};

function ensurePet(state: AppState, petId: string): EngineResult<Pet> {
  const pet = state.pets.find((p) => p.id === petId);
  if (!pet) {
    return { ok: false, error: { code: 'PET_NOT_FOUND', message: 'Mascota no encontrada' } };
  }
  return { ok: true, state: pet };
}

export function createPetInState(
  state: AppState,
  input: CreatePetInput,
): EngineResult<AppState> {
  const result = createPet(input);
  if (!result.ok) return result;
  const pet = result.state;
  return {
    ok: true,
    state: {
      ...state,
      pets: [...state.pets, pet],
      activePetId: pet.id,
      healthByPetId: {
        ...state.healthByPetId,
        [pet.id]: defaultHealth(input.now ?? new Date()),
      },
    },
  };
}

export function selectPet(state: AppState, petId: string): EngineResult<AppState> {
  const pet = ensurePet(state, petId);
  if (!pet.ok) return pet;
  return { ok: true, state: { ...state, activePetId: petId } };
}

export function updatePetInState(
  state: AppState,
  petId: string,
  patch: Partial<Omit<Pet, 'id' | 'createdAt'>>,
): EngineResult<AppState> {
  const found = ensurePet(state, petId);
  if (!found.ok) return found;
  if (patch.name != null && !patch.name.trim()) {
    return { ok: false, error: { code: 'PET_NAME_REQUIRED', message: 'El nombre es obligatorio' } };
  }
  return {
    ok: true,
    state: {
      ...state,
      pets: state.pets.map((p) =>
        p.id === petId
          ? {
              ...p,
              ...patch,
              name: patch.name != null ? patch.name.trim() : p.name,
              breed: patch.breed !== undefined ? patch.breed?.trim() || undefined : p.breed,
            }
          : p,
      ),
    },
  };
}

export function deletePetInState(state: AppState, petId: string): EngineResult<AppState> {
  const found = ensurePet(state, petId);
  if (!found.ok) return found;
  const pets = state.pets.filter((p) => p.id !== petId);
  const { [petId]: _removed, ...healthByPetId } = state.healthByPetId;
  const nextActive =
    state.activePetId === petId ? (pets[0]?.id ?? null) : state.activePetId;
  return {
    ok: true,
    state: {
      pets,
      activePetId: nextActive,
      events: state.events.filter((e) => e.petId !== petId),
      healthByPetId,
      preventives: state.preventives.filter((p) => p.petId !== petId),
    },
  };
}

function appendEvent(
  state: AppState,
  petId: string,
  build: () => ReturnType<typeof addFeedEvent>,
): EngineResult<AppState> {
  const pet = ensurePet(state, petId);
  if (!pet.ok) return pet;
  const built = build();
  if (!built.ok) return built;
  return { ok: true, state: { ...state, events: [...state.events, built.state] } };
}

export function logFeed(state: AppState, input: AddFeedInput): EngineResult<AppState> {
  return appendEvent(state, input.petId, () => addFeedEvent(input));
}

export function logBathroom(state: AppState, input: AddBathroomInput): EngineResult<AppState> {
  return appendEvent(state, input.petId, () => addBathroomEvent(input));
}

export function logWalk(state: AppState, input: AddWalkInput): EngineResult<AppState> {
  return appendEvent(state, input.petId, () => addWalkEvent(input));
}

export function logNote(state: AppState, input: AddNoteInput): EngineResult<AppState> {
  return appendEvent(state, input.petId, () => addNoteEvent(input));
}

export function setPetHealth(
  state: AppState,
  petId: string,
  input: SetHealthInput,
): EngineResult<AppState> {
  const pet = ensurePet(state, petId);
  if (!pet.ok) return pet;
  const health = setHealth(input);
  if (!health.ok) return health;
  const event = {
    id: newId('evt'),
    petId,
    at: health.state.updatedAt,
    kind: 'health' as const,
    payload: {
      status: health.state.status,
      symptoms: health.state.symptoms,
      notes: health.state.notes,
    },
  };
  return {
    ok: true,
    state: {
      ...state,
      healthByPetId: { ...state.healthByPetId, [petId]: health.state },
      events: [...state.events, event],
    },
  };
}

export function addPreventiveInState(
  state: AppState,
  input: AddPreventiveInput,
): EngineResult<AppState> {
  const pet = ensurePet(state, input.petId);
  if (!pet.ok) return pet;
  const item = addPreventive(input);
  if (!item.ok) return item;
  return {
    ok: true,
    state: { ...state, preventives: [...state.preventives, item.state] },
  };
}

export function removePreventiveInState(
  state: AppState,
  preventiveId: string,
): EngineResult<AppState> {
  if (!state.preventives.some((p) => p.id === preventiveId)) {
    return { ok: false, error: { code: 'PREVENTIVE_NOT_FOUND', message: 'Preventivo no encontrado' } };
  }
  return {
    ok: true,
    state: {
      ...state,
      preventives: state.preventives.filter((p) => p.id !== preventiveId),
    },
  };
}

export function getActivePet(state: AppState): Pet | null {
  if (!state.activePetId) return null;
  return state.pets.find((p) => p.id === state.activePetId) ?? null;
}

export { emptyState, createPet };
