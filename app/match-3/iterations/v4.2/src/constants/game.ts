export const COLS = 8;
export const ROWS = 10;
export const GEM_TYPES = 5;
export const IDLE_HINT_MS = 5000;
export const PANIC_USES_PER_LEVEL = 1;
export const REWARD_POOL_SIZE = 8;
export const STORAGE_KEY = 'match3:v3:progress';

export const LEVEL_TIME_MS = 150_000;
export const LEVEL_TIME_SEC = 150;
export const COIN_MIN = 3;
export const COIN_MAX = 200;
export const TRAVEL_COST = 500;
export const TRAVEL_COST_PARTNER = 1000;
export const STARTING_COINS = 1_000_000;
export const SHOP_PRICE = 20_000;
export const GIFT_STOCK_CAP = 10;
export const CAMEO_MS = 17_000;
export const CAMEO_BEAT_MS = 5666;
export const CAMEO_DELAY_MAX_MS = 4000;
export const SCORE_TO_WIN_MULT = 3;

export const CREATOR_VISSIUSS_COINS = 1_000_000;
export const CREATOR_VISSIUSS_MAX = 3;
export const CREATOR_MAP_MAX = 1;

export const SCORE = {
  match3: 10,
  match4: 20,
  match5: 50,
  cascadeMultiplier: 1.5,
} as const;
