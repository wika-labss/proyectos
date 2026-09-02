import { AFFINITY } from '../engine/affinity';
import type { CountryId } from './countries';
import { preferredGiftTitles } from './gifts';
import {
  matchesPreference,
  suitorsForCountry,
  type Preference,
  type Suitor,
} from './suitors';

const GIFT_LIKED = [
  '¡Ay, muchas gracias! Eres muy detallista. Me encanta.',
  'Esto es justo lo que quería. Gracias.',
  '¡Qué detalle! De verdad me llega al corazón.',
] as const;

const GIFT_OK = [
  'Gracias, qué detalle.',
  'Qué amable, lo voy a guardar.',
  'Gracias. Un gesto siempre se agradece.',
] as const;

const COUNTRY_LINES: Record<CountryId, readonly string[]> = {
  mx: [
    '¡Tú puedes! Este tablero es de México.',
    'Ánimo: México te mira desde el tablero.',
    'Un movimiento más y brillamos como en México.',
  ],
  co: [
    '¡Tú puedes! Este tablero es de Colombia.',
    'Colombia va contigo. Encuentra el trío.',
    'Sigue, que este tablero sabe a Colombia.',
  ],
  pe: [
    '¡Tú puedes! Este tablero es de Perú.',
    'Perú no se rinde. Tampoco tú.',
    'Un buen swap y Perú avanza.',
  ],
  br: [
    '¡Tú puedes! Este tablero es de Brasil.',
    'Brasil está contigo. Arma el combo.',
    'Respira. Este tablero es de Brasil.',
  ],
  ar: [
    '¡Tú puedes! Este tablero es de Argentina.',
    'Argentina te alienta. No pares.',
    'Un último esfuerzo: el tablero es de Argentina.',
  ],
};

const LOVE_LINES = [
  'Te quiero. Juntos llegamos más lejos.',
  'Contigo el viaje pesa menos. Te quiero.',
  'Mi lugar es a tu lado. Vamos juntos.',
] as const;

function pick<T>(list: readonly T[], salt: number): T {
  return list[Math.abs(salt) % list.length]!;
}

export function giftReaction(preferred: boolean, salt = 0): string {
  return preferred ? pick(GIFT_LIKED, salt) : pick(GIFT_OK, salt);
}

export function countryLine(countryId: CountryId, salt = 0): string {
  return pick(COUNTRY_LINES[countryId], salt);
}

export function loveLine(salt = 0): string {
  return pick(LOVE_LINES, salt);
}

export function pickPlaySuitor(
  countryId: CountryId,
  preference: Preference,
  partnerId: string | null,
  affinityBySuitor: Record<string, number>,
): Suitor | undefined {
  const pool = suitorsForCountry(countryId).filter((s) =>
    matchesPreference(s, preference),
  );
  if (pool.length === 0) return undefined;
  if (partnerId) {
    const partner = pool.find((s) => s.id === partnerId);
    if (partner) return partner;
  }
  return [...pool].sort(
    (a, b) =>
      (affinityBySuitor[b.id] ?? 0) - (affinityBySuitor[a.id] ?? 0),
  )[0];
}

export function isMarriedTo(
  suitor: Suitor,
  partnerId: string | null,
  affinityBySuitor: Record<string, number>,
): boolean {
  return (
    partnerId === suitor.id &&
    (affinityBySuitor[suitor.id] ?? 0) >= AFFINITY.matrimonio
  );
}

export function playLine(
  countryId: CountryId,
  married: boolean,
  salt = 0,
): string {
  return married ? loveLine(salt) : countryLine(countryId, salt);
}

export function pickRandomPlaySuitor(
  countryId: CountryId,
  preference: Preference,
  rng: () => number = Math.random,
): Suitor | undefined {
  const pool = suitorsForCountry(countryId).filter((s) =>
    matchesPreference(s, preference),
  );
  if (pool.length === 0) return undefined;
  const i = Math.floor(rng() * pool.length);
  return pool[Math.min(i, pool.length - 1)];
}

export function cameoBeats(suitor: Suitor): [string, string, string] {
  const gifts = preferredGiftTitles(suitor.slot);
  const a = gifts[0] ?? 'Rosa';
  const b = gifts[1] ?? a;
  return [
    `Hola, soy ${suitor.name}.`,
    `Si me regalas ${a} o ${b}, +10 de afinidad.`,
    'Suerte. Nos vemos.',
  ];
}
