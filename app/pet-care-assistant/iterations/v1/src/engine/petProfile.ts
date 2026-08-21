import type { EngineResult, Pet, PetSex, PetType } from './types';
import { newId, PET_TYPES } from './types';

export type CreatePetInput = {
  name: string;
  type: PetType;
  breed?: string;
  sex?: PetSex;
  birthDate: string;
  birthDateEstimated?: boolean;
  weightKg?: number;
  now?: Date;
};

export type AgeParts = { years: number; months: number };

export function ageFromBirthDate(birthDate: string, now: Date = new Date()): AgeParts {
  const [y, m, d] = birthDate.split('-').map(Number);
  const birth = new Date(y!, m! - 1, d!);
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return { years: 0, months: 0 };
  return { years, months };
}

export function formatAge(age: AgeParts): string {
  if (age.years === 0) return `${age.months}m`;
  return `${age.years}a ${age.months}m`;
}

export function createPet(input: CreatePetInput): EngineResult<Pet> {
  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: { code: 'PET_NAME_REQUIRED', message: 'El nombre es obligatorio' } };
  }
  if (!PET_TYPES.includes(input.type)) {
    return { ok: false, error: { code: 'PET_TYPE_INVALID', message: 'Tipo de mascota inválido' } };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)) {
    return {
      ok: false,
      error: { code: 'PET_BIRTHDATE_REQUIRED', message: 'Fecha de nacimiento requerida (YYYY-MM-DD)' },
    };
  }
  if (input.weightKg != null && (!Number.isFinite(input.weightKg) || input.weightKg <= 0)) {
    return { ok: false, error: { code: 'PET_WEIGHT_INVALID', message: 'Peso inválido' } };
  }

  const now = input.now ?? new Date();
  const pet: Pet = {
    id: newId('pet'),
    name,
    type: input.type,
    breed: input.breed?.trim() || undefined,
    sex: input.sex ?? 'desconocido',
    birthDate: input.birthDate,
    birthDateEstimated: Boolean(input.birthDateEstimated),
    weightKg: input.weightKg,
    createdAt: now.toISOString(),
  };
  return { ok: true, state: pet };
}
