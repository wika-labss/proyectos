import type { CountryId } from './countries';

export type SuitorSlot = 'h1' | 'h2' | 'm1' | 'm2';
export type SuitorGender = 'hombre' | 'mujer';

export type Suitor = {
  id: string;
  countryId: CountryId;
  slot: SuitorSlot;
  gender: SuitorGender;
  name: string;
};

const NAMES: Record<CountryId, Record<SuitorSlot, string>> = {
  mx: { h1: 'Diego', h2: 'Mateo', m1: 'Camila', m2: 'Valentina' },
  co: { h1: 'Santiago', h2: 'Andrés', m1: 'Isabella', m2: 'Sofía' },
  pe: { h1: 'Joaquín', h2: 'Lucas', m1: 'Lucía', m2: 'Emilia' },
  br: { h1: 'Thiago', h2: 'Gabriel', m1: 'Beatriz', m2: 'Ana' },
  ar: { h1: 'Facundo', h2: 'Nicolás', m1: 'Martina', m2: 'Julieta' },
};

const SLOTS: SuitorSlot[] = ['h1', 'h2', 'm1', 'm2'];

function genderOf(slot: SuitorSlot): SuitorGender {
  return slot === 'h1' || slot === 'h2' ? 'hombre' : 'mujer';
}

export function suitorId(countryId: CountryId, slot: SuitorSlot): string {
  return `${countryId}-${slot}`;
}

export function parseSuitorId(
  id: string,
): { countryId: CountryId; slot: SuitorSlot } | undefined {
  const m = /^(mx|co|pe|br|ar)-(h1|h2|m1|m2)$/.exec(id);
  if (!m) return undefined;
  return { countryId: m[1] as CountryId, slot: m[2] as SuitorSlot };
}

export const SUITORS: Suitor[] = (
  Object.keys(NAMES) as CountryId[]
).flatMap((countryId) =>
  SLOTS.map((slot) => ({
    id: suitorId(countryId, slot),
    countryId,
    slot,
    gender: genderOf(slot),
    name: NAMES[countryId][slot],
  })),
);

export function getSuitor(id: string): Suitor | undefined {
  return SUITORS.find((s) => s.id === id);
}

export function suitorsForCountry(countryId: CountryId): Suitor[] {
  return SUITORS.filter((s) => s.countryId === countryId);
}

export type Preference = 'hombre' | 'mujer' | 'ambos';

export function matchesPreference(
  suitor: Suitor,
  preference: Preference,
): boolean {
  if (preference === 'ambos') return true;
  return suitor.gender === preference;
}
