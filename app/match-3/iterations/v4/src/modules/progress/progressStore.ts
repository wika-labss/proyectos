import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GIFT_STOCK_CAP,
  REWARD_POOL_SIZE,
  SHOP_PRICE,
  STARTING_COINS,
  STORAGE_KEY,
} from '../../constants/game';
import { COUNTRIES, type CountryId } from '../../data/countries';
import { isAvatarId, type AvatarId } from '../../data/avatarIds';
import { rewardIdFromGiftN } from '../../data/gifts';
import { getLevel } from '../../data/levels';
import { getSuitor, type Preference } from '../../data/suitors';
import {
  applyGift,
  emptyAffinity,
  giftNumberFromRewardId,
  type AffinityState,
} from '../../engine/affinity';
import { coinsAwarded, travelCost } from '../../engine/economy';

export type RewardItem = {
  id: string;
  grantedAt: number;
};

export type HistoryEntry = {
  countryId: CountryId;
  levelIndex: number;
  score: number;
  at: number;
};

export type Profile = {
  username: string;
  preference: Preference;
  avatarId: AvatarId;
};

export type ProgressState = AffinityState & {
  profile: Profile | null;
  unlockedCountryIndex: number;
  unlockedLevelByCountry: Record<CountryId, number>;
  countryCleared: Record<CountryId, boolean>;
  totalScore: number;
  inventory: RewardItem[];
  history: HistoryEntry[];
  rewardsGranted: number;
  coins: number;
};

const emptyCleared = (): Record<CountryId, boolean> => ({
  mx: false,
  co: false,
  pe: false,
  br: false,
  ar: false,
});

export function defaultProgress(): ProgressState {
  return {
    profile: null,
    unlockedCountryIndex: 0,
    unlockedLevelByCountry: {
      mx: 0,
      co: -1,
      pe: -1,
      br: -1,
      ar: -1,
    },
    countryCleared: emptyCleared(),
    totalScore: 0,
    inventory: [],
    history: [],
    rewardsGranted: 0,
    coins: STARTING_COINS,
    ...emptyAffinity(),
  };
}

function sanitizeProfile(raw: unknown): Profile | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Partial<Profile>;
  if (typeof p.username !== 'string' || p.username.trim().length === 0) {
    return null;
  }
  if (
    p.preference !== 'hombre' &&
    p.preference !== 'mujer' &&
    p.preference !== 'ambos'
  ) {
    return null;
  }
  if (typeof p.avatarId !== 'string' || !isAvatarId(p.avatarId)) return null;
  return {
    username: p.username.trim(),
    preference: p.preference,
    avatarId: p.avatarId,
  };
}

export async function loadProgress(): Promise<ProgressState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    const base = defaultProgress();
    return {
      ...base,
      ...parsed,
      profile: sanitizeProfile(parsed.profile),
      unlockedLevelByCountry: {
        ...base.unlockedLevelByCountry,
        ...parsed.unlockedLevelByCountry,
      },
      countryCleared: {
        ...base.countryCleared,
        ...parsed.countryCleared,
      },
      inventory: parsed.inventory ?? [],
      history: parsed.history ?? [],
      affinityBySuitor: parsed.affinityBySuitor ?? {},
      partnerId: parsed.partnerId ?? null,
      rewardsGranted: parsed.rewardsGranted ?? 0,
      coins:
        typeof parsed.coins === 'number' ? parsed.coins : STARTING_COINS,
    };
  } catch {
    return defaultProgress();
  }
}

export async function saveProgress(state: ProgressState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function saveProfile(
  state: ProgressState,
  username: string,
  preference: Preference,
  avatarId: AvatarId,
): ProgressState {
  const name = username.trim();
  if (!name || state.profile) return state;
  return {
    ...state,
    profile: { username: name, preference, avatarId },
  };
}

export function updateAvatar(
  state: ProgressState,
  avatarId: AvatarId,
): ProgressState {
  if (!state.profile) return state;
  return {
    ...state,
    profile: { ...state.profile, avatarId },
  };
}

export function grantRandomReward(
  state: ProgressState,
  rng: () => number = Math.random,
): ProgressState {
  const n = 1 + Math.floor(rng() * REWARD_POOL_SIZE);
  const item: RewardItem = {
    id: `recompensa ${n}`,
    grantedAt: Date.now(),
  };
  return {
    ...state,
    inventory: [...state.inventory, item],
    rewardsGranted: state.rewardsGranted + 1,
  };
}

export function isCountryUnlocked(
  state: ProgressState,
  countryIndex: number,
): boolean {
  return countryIndex <= state.unlockedCountryIndex;
}

export function isLevelUnlocked(
  state: ProgressState,
  countryId: CountryId,
  levelIndex: number,
): boolean {
  const max = state.unlockedLevelByCountry[countryId] ?? -1;
  return levelIndex <= max;
}

export function applyVictory(
  state: ProgressState,
  countryId: CountryId,
  levelIndex: number,
  score: number,
  remainingSec: number,
  rng: () => number = Math.random,
): ProgressState {
  const cfg = getLevel(countryId, levelIndex);
  let next = state;
  if (cfg.rewardOnClear) {
    next = grantRandomReward(next, rng);
  }
  const payout = coinsAwarded(remainingSec);
  next = {
    ...next,
    coins: next.coins + payout,
    totalScore: next.totalScore + score,
    history: [
      { countryId, levelIndex, score, at: Date.now() },
      ...next.history,
    ].slice(0, 50),
  };

  const currentUnlock = next.unlockedLevelByCountry[countryId] ?? -1;
  if (levelIndex >= currentUnlock && levelIndex < 9) {
    next = {
      ...next,
      unlockedLevelByCountry: {
        ...next.unlockedLevelByCountry,
        [countryId]: levelIndex + 1,
      },
    };
  } else if (levelIndex === 9) {
    next = {
      ...next,
      countryCleared: {
        ...next.countryCleared,
        [countryId]: true,
      },
    };
  }

  return next;
}

export function currentTravelCost(state: ProgressState): number {
  return travelCost(state.partnerId != null);
}

export function canTravelToNext(state: ProgressState): boolean {
  const current = COUNTRIES[state.unlockedCountryIndex];
  if (!current) return false;
  if (state.unlockedCountryIndex >= COUNTRIES.length - 1) return false;
  if (!state.countryCleared[current.id]) return false;
  return state.coins >= currentTravelCost(state);
}

export function travelToNextCountry(state: ProgressState): ProgressState {
  if (!canTravelToNext(state)) return state;
  const current = COUNTRIES[state.unlockedCountryIndex]!;
  const nextCountry = COUNTRIES[state.unlockedCountryIndex + 1];
  if (!nextCountry) return state;
  const cost = currentTravelCost(state);
  return {
    ...state,
    coins: state.coins - cost,
    unlockedCountryIndex: current.order + 1,
    unlockedLevelByCountry: {
      ...state.unlockedLevelByCountry,
      [nextCountry.id]: 0,
    },
  };
}

export function giveGift(
  state: ProgressState,
  suitorId: string,
  rewardId: string,
): ProgressState {
  const suitor = getSuitor(suitorId);
  if (!suitor) return state;
  const idx = state.inventory.findIndex((item) => item.id === rewardId);
  if (idx < 0) return state;
  const country = COUNTRIES.find((c) => c.id === suitor.countryId);
  if (!country || country.order > state.unlockedCountryIndex) return state;

  const inventory = state.inventory.filter((_, i) => i !== idx);
  const affinity = applyGift(
    {
      affinityBySuitor: state.affinityBySuitor,
      partnerId: state.partnerId,
    },
    suitor.id,
    giftNumberFromRewardId(rewardId),
    suitor.slot,
  );
  return {
    ...state,
    inventory,
    affinityBySuitor: affinity.affinityBySuitor,
    partnerId: affinity.partnerId,
  };
}

export function inventoryCount(
  state: ProgressState,
  rewardId: string,
): number {
  return state.inventory.filter((item) => item.id === rewardId).length;
}

export function canBuyGift(state: ProgressState, giftN: number): boolean {
  if (giftN < 1 || giftN > REWARD_POOL_SIZE) return false;
  if (state.coins < SHOP_PRICE) return false;
  const id = rewardIdFromGiftN(giftN);
  return inventoryCount(state, id) < GIFT_STOCK_CAP;
}

export function buyGift(state: ProgressState, giftN: number): ProgressState {
  if (!canBuyGift(state, giftN)) return state;
  const item: RewardItem = {
    id: rewardIdFromGiftN(giftN),
    grantedAt: Date.now(),
  };
  return {
    ...state,
    coins: state.coins - SHOP_PRICE,
    inventory: [...state.inventory, item],
  };
}
