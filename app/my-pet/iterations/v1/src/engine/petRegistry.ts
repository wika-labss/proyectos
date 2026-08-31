import { isValidLat, isValidLng } from './geo';
import { newId, newPublicToken } from './ids';
import {
  SPECIES,
  emptyStore,
  type AppStore,
  type CreatePetInput,
  type EngineResult,
  type Pet,
  type Species,
} from './types';

export function isSpecies(value: string): value is Species {
  return (SPECIES as readonly string[]).includes(value);
}

export function createPet(input: CreatePetInput): EngineResult<Pet> {
  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: { code: 'PET_NAME_REQUIRED', message: 'El nombre es obligatorio' } };
  }
  if (!isSpecies(input.species)) {
    return { ok: false, error: { code: 'PET_SPECIES_INVALID', message: 'Especie no válida' } };
  }
  const address = input.address.trim();
  if (!address) {
    return {
      ok: false,
      error: { code: 'PET_ADDRESS_REQUIRED', message: 'La dirección es obligatoria' },
    };
  }
  if (!isValidLat(input.homeLat) || !isValidLng(input.homeLng)) {
    return {
      ok: false,
      error: { code: 'PET_COORDS_INVALID', message: 'Coordenadas de casa inválidas' },
    };
  }

  const token = (input.publicToken ?? newPublicToken()).trim();
  if (token.length < 6) {
    return {
      ok: false,
      error: { code: 'PET_TOKEN_INVALID', message: 'Token público demasiado corto' },
    };
  }

  const pet: Pet = {
    id: input.id ?? newId('pet'),
    publicToken: token,
    name,
    species: input.species,
    address,
    homeLat: input.homeLat,
    homeLng: input.homeLng,
    createdAt: (input.now ?? new Date()).toISOString(),
  };
  return { ok: true, state: pet };
}

export function createPetInStore(store: AppStore, input: CreatePetInput): EngineResult<AppStore> {
  const created = createPet(input);
  if (!created.ok) return created;
  const tokenTaken = store.pets.some((p) => p.publicToken === created.state.publicToken);
  if (tokenTaken) {
    return { ok: false, error: { code: 'PET_TOKEN_TAKEN', message: 'Token público ya existe' } };
  }
  return { ok: true, state: { ...store, pets: [...store.pets, created.state] } };
}

export function getPetById(store: AppStore, id: string): Pet | undefined {
  return store.pets.find((p) => p.id === id);
}

export function getPetByToken(store: AppStore, token: string): Pet | undefined {
  return store.pets.find((p) => p.publicToken === token);
}

export function publicPetView(pet: Pet): { name: string; species: Species } {
  return { name: pet.name, species: pet.species };
}

export function demoLunaPet(): Pet {
  const created = createPet({
    id: 'pet_demo_luna',
    publicToken: 'demo-luna',
    name: 'Luna',
    species: 'perro',
    address: 'Av. Demo 123, Santiago',
    homeLat: -33.4372,
    homeLng: -70.6506,
    now: new Date('2026-08-31T12:00:00.000Z'),
  });
  if (!created.ok) throw new Error('demo seed must be valid');
  return created.state;
}

export function seedDemoStore(): AppStore {
  const store = emptyStore();
  const seeded = createPetInStore(store, {
    id: 'pet_demo_luna',
    publicToken: 'demo-luna',
    name: 'Luna',
    species: 'perro',
    address: 'Av. Demo 123, Santiago',
    homeLat: -33.4372,
    homeLng: -70.6506,
    now: new Date('2026-08-31T12:00:00.000Z'),
  });
  if (!seeded.ok) throw new Error('demo seed must be valid');
  return seeded.state;
}
