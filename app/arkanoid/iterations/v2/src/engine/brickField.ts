import {
  BOSS_LEVEL_INDEX,
  BRICK_COLS,
  BRICK_GAP,
  BRICK_HEIGHT,
  BRICK_SIDE_PAD,
  BRICK_TOP,
  LEVEL_COUNT,
  WORLD_WIDTH,
} from '../constants/game';
import { isBossAlive } from './boss';
import type { Boss, Brick, BrickType } from './types';

export { LEVEL_COUNT };

export function brickWidth(worldW: number = WORLD_WIDTH): number {
  return (
    (worldW - BRICK_SIDE_PAD * 2 - BRICK_GAP * (BRICK_COLS - 1)) / BRICK_COLS
  );
}

function makeBrick(
  col: number,
  row: number,
  type: BrickType,
  worldW: number,
): Brick {
  const w = brickWidth(worldW);
  return {
    id: `b-${row}-${col}`,
    x: BRICK_SIDE_PAD + col * (w + BRICK_GAP),
    y: BRICK_TOP + row * (BRICK_HEIGHT + BRICK_GAP),
    w,
    h: BRICK_HEIGHT,
    type,
    hitsLeft: type === 'hard' ? 2 : 1,
    row,
  };
}

export function isBossLevel(levelIndex: number): boolean {
  return levelIndex === BOSS_LEVEL_INDEX;
}

/**
 * Layouts:
 * 0 — 8×5 all normal
 * 1 — 8×6, top two rows hard
 * 2 — 8×6 checkerboard hard, gaps in the middle of rows 2–3
 * 3 — guardian flanks + moving boss (V2)
 */
export function loadLevel(levelIndex: number, worldW: number = WORLD_WIDTH): Brick[] {
  const idx = Math.max(0, Math.min(LEVEL_COUNT - 1, Math.floor(levelIndex)));
  const bricks: Brick[] = [];

  if (idx === 0) {
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < BRICK_COLS; col += 1) {
        bricks.push(makeBrick(col, row, 'normal', worldW));
      }
    }
    return bricks;
  }

  if (idx === 1) {
    for (let row = 0; row < 6; row += 1) {
      for (let col = 0; col < BRICK_COLS; col += 1) {
        const type: BrickType = row < 2 ? 'hard' : 'normal';
        bricks.push(makeBrick(col, row, type, worldW));
      }
    }
    return bricks;
  }

  if (idx === 2) {
    for (let row = 0; row < 6; row += 1) {
      for (let col = 0; col < BRICK_COLS; col += 1) {
        const gap =
          (row === 2 || row === 3) && (col === 3 || col === 4);
        if (gap) continue;
        const type: BrickType = (row + col) % 2 === 0 ? 'hard' : 'normal';
        bricks.push(makeBrick(col, row, type, worldW));
      }
    }
    return bricks;
  }

  for (let row = 0; row < 2; row += 1) {
    for (const col of [0, 1, 6, 7]) {
      bricks.push(makeBrick(col, row, 'hard', worldW));
    }
  }
  return bricks;
}

export function isCleared(bricks: Brick[]): boolean {
  return bricks.length > 0 && bricks.every((b) => b.hitsLeft <= 0);
}

export function isLevelCleared(bricks: Brick[], boss: Boss | null, levelIndex: number): boolean {
  if (isBossLevel(levelIndex)) return !isBossAlive(boss);
  return isCleared(bricks);
}

export function hitBrick(
  bricks: Brick[],
  id: string,
): {
  bricks: Brick[];
  destroyed: boolean;
  cleared: boolean;
  type: BrickType | null;
  hitsLeft: number;
} {
  let destroyed = false;
  let type: BrickType | null = null;
  let hitsLeft = 0;
  const next = bricks.map((b) => {
    if (b.id !== id || b.hitsLeft <= 0) return b;
    const left = b.hitsLeft - 1;
    hitsLeft = left;
    type = b.type;
    if (left <= 0) destroyed = true;
    return { ...b, hitsLeft: left };
  });
  return {
    bricks: next,
    destroyed,
    cleared: isCleared(next),
    type,
    hitsLeft,
  };
}

export function aliveBricks(bricks: Brick[]): Brick[] {
  return bricks.filter((b) => b.hitsLeft > 0);
}
