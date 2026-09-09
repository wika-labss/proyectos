import {
  CREATOR_MAP_MAX,
  CREATOR_VISSIUSS_COINS,
  CREATOR_VISSIUSS_MAX,
} from '../../constants/game';
import { COUNTRIES } from '../../data/countries';
import type { ProgressState } from '../progress/progressStore';
import { normalizeCode } from './catalog';

export type ApplyCodeResult = {
  state: ProgressState;
  ok: boolean;
  message: string;
};

function usesOf(state: ProgressState, key: 'vissiuss' | 'map'): number {
  return state.creatorCodeUses[key] ?? 0;
}

function applyVissiuss(state: ProgressState): ApplyCodeResult {
  const used = usesOf(state, 'vissiuss');
  if (used >= CREATOR_VISSIUSS_MAX) {
    return { state, ok: false, message: 'Sin usos' };
  }
  return {
    state: {
      ...state,
      coins: state.coins + CREATOR_VISSIUSS_COINS,
      creatorCodeUses: { ...state.creatorCodeUses, vissiuss: used + 1 },
    },
    ok: true,
    message: '+1.000.000',
  };
}

function applyMap(state: ProgressState): ApplyCodeResult {
  const used = usesOf(state, 'map');
  if (used >= CREATOR_MAP_MAX || state.unlockedAllCountries) {
    return { state, ok: false, message: 'Código usado' };
  }
  const unlockedLevelByCountry = { ...state.unlockedLevelByCountry };
  for (const c of COUNTRIES) {
    unlockedLevelByCountry[c.id] = Math.max(unlockedLevelByCountry[c.id] ?? -1, 0);
  }
  return {
    state: {
      ...state,
      unlockedAllCountries: true,
      unlockedLevelByCountry,
      creatorCodeUses: { ...state.creatorCodeUses, map: used + 1 },
    },
    ok: true,
    message: 'Países desbloqueados',
  };
}

export function applyCreatorCode(
  state: ProgressState,
  raw: string,
): ApplyCodeResult {
  const code = normalizeCode(raw);
  if (code === 'vissiuss') return applyVissiuss(state);
  if (code === 'map') return applyMap(state);
  return { state, ok: false, message: 'Código inválido' };
}
