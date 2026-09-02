import type { SuitorSlot } from '../data/suitors';

export type RelationshipStatus =
  | 'none'
  | 'amigos'
  | 'ligue'
  | 'pareja'
  | 'matrimonio'
  | 'amorio'
  | 'infidelidad_culposa';

export type AffinityState = {
  affinityBySuitor: Record<string, number>;
  partnerId: string | null;
};

export const AFFINITY = {
  amigos: 50,
  ligue: 69,
  pareja: 120,
  matrimonio: 200,
} as const;

const PREFERRED_SLOT: Record<number, SuitorSlot> = {
  1: 'h1',
  2: 'h2',
  3: 'm1',
  4: 'm2',
  5: 'h1',
  6: 'h2',
  7: 'm1',
  8: 'm2',
};

export function preferredSlot(giftN: number): SuitorSlot {
  return PREFERRED_SLOT[giftN] ?? 'h1';
}

export function giftDelta(giftN: number, slot: SuitorSlot): 10 | 2 {
  return preferredSlot(giftN) === slot ? 10 : 2;
}

export function giftNumberFromRewardId(rewardId: string): number {
  const m = /recompensa\s+(\d+)/i.exec(rewardId);
  const n = m ? Number(m[1]) : 1;
  if (n < 1 || n > 8) return 1;
  return n;
}

export function relationshipStatus(
  affinity: number,
  isPartner: boolean,
  hasPartner: boolean,
): RelationshipStatus {
  const primary = !hasPartner || isPartner;
  if (primary) {
    if (affinity >= AFFINITY.matrimonio) return 'matrimonio';
    if (affinity >= AFFINITY.pareja) return 'pareja';
    if (affinity >= AFFINITY.ligue) return 'ligue';
    if (affinity >= AFFINITY.amigos) return 'amigos';
    return 'none';
  }
  if (affinity >= AFFINITY.matrimonio) return 'infidelidad_culposa';
  if (affinity >= AFFINITY.pareja) return 'amorio';
  if (affinity >= AFFINITY.ligue) return 'ligue';
  if (affinity >= AFFINITY.amigos) return 'amigos';
  return 'none';
}

export function statusLabel(status: RelationshipStatus): string {
  switch (status) {
    case 'amigos':
      return 'Amigos';
    case 'ligue':
      return 'Ligue';
    case 'pareja':
      return 'Pareja';
    case 'matrimonio':
      return 'Matrimonio';
    case 'amorio':
      return 'Amorio';
    case 'infidelidad_culposa':
      return 'Infidelidad culposa';
    default:
      return 'Sin vínculo';
  }
}

export function applyGift(
  state: AffinityState,
  suitorId: string,
  giftN: number,
  slot: SuitorSlot,
): AffinityState {
  const delta = giftDelta(giftN, slot);
  const nextAff = (state.affinityBySuitor[suitorId] ?? 0) + delta;
  const affinityBySuitor = {
    ...state.affinityBySuitor,
    [suitorId]: nextAff,
  };
  let partnerId = state.partnerId;
  if (partnerId == null && nextAff >= AFFINITY.pareja) {
    partnerId = suitorId;
  }
  return { affinityBySuitor, partnerId };
}

export function emptyAffinity(): AffinityState {
  return { affinityBySuitor: {}, partnerId: null };
}
