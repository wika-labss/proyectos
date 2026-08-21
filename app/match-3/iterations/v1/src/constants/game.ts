export const COLS = 8;
export const ROWS = 10;
export const GEM_TYPES = 5;
export const IDLE_HINT_MS = 5000;
export const PANIC_USES_PER_LEVEL = 1;
export const REWARDS_TO_UNLOCK_COUNTRY = 3;
export const REWARD_POOL_SIZE = 8;
export const STORAGE_KEY = 'match3:v1:progress';

export const SCORE = {
  match3: 10,
  match4: 20,
  match5: 50,
  cascadeMultiplier: 1.5,
} as const;
