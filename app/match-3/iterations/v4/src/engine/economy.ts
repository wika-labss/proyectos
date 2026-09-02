import {
  COIN_MAX,
  COIN_MIN,
  LEVEL_TIME_SEC,
  TRAVEL_COST,
  TRAVEL_COST_PARTNER,
} from '../constants/game';

export function coinsAwarded(remainingSec: number): number {
  const t = Math.min(LEVEL_TIME_SEC, Math.max(0, remainingSec));
  const raw = Math.round(COIN_MIN + ((COIN_MAX - COIN_MIN) * t) / LEVEL_TIME_SEC);
  return Math.min(COIN_MAX, Math.max(COIN_MIN, raw));
}

export function travelCost(hasPartner: boolean): number {
  return hasPartner ? TRAVEL_COST_PARTNER : TRAVEL_COST;
}

export function formatTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
