export const INITIAL_LIVES = 3;
export const LEVEL_COUNT = 3;
export const SCORE_NORMAL = 100;
export const SCORE_HARD = 200;
export const HIGH_SCORE_KEY = 'arkanoid:v1:highScore';

/** Logical playfield size (portrait). */
export const WORLD_WIDTH = 360;
export const WORLD_HEIGHT = 540;

export const PADDLE_WIDTH = 72;
export const PADDLE_HEIGHT = 12;
export const PADDLE_Y = WORLD_HEIGHT - 48;
export const BALL_RADIUS = 6;
export const BALL_SPEED = 280;

export const BRICK_COLS = 8;
export const BRICK_ROWS_BASE = 5;
export const BRICK_GAP = 4;
export const BRICK_TOP = 56;
export const BRICK_HEIGHT = 16;

export const FRAME_MS = 1000 / 60;
export const MAX_DT_MS = 32;
export const BALL_LOST_PAUSE_MS = 700;
export const LEVEL_CLEAR_PAUSE_MS = 900;
