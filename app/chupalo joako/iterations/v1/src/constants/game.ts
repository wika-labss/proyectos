export const COLS = 10;
export const ROWS = 20;
export const SPAWN_X = 3;
export const SPAWN_Y = 0;
export const LOCK_DELAY_MS = 500;
export const SCORE_PER_LEVEL = 500;
export const MAX_LEVEL = 10;
export const SOFT_DROP_PTS = 1;
export const HARD_DROP_PTS = 2;
export const DAS_MS = 200;
export const ARR_MS = 80;
export const DT_CLAMP_MS = 50;
export const HIGH_SCORE_KEY = 'chupalo-joako:v1:highScore';

export const LINE_SCORES: Record<1 | 2 | 3 | 4, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

export const GRAVITY_MS = [800, 650, 520, 400, 300, 220, 160, 120, 90, 70] as const;
