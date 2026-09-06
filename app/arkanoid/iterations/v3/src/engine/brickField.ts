import {
  BRICK_COLS,
  BRICK_GAP,
  BRICK_HEIGHT,
  BRICK_SIDE_PAD,
  BRICK_TOP,
  LEVEL_COUNT,
  WORLD_WIDTH,
} from '../constants/game';
import { LEVEL_LAYOUTS } from './levelLayouts';
import type { Brick, BrickType } from './types';

export { LEVEL_COUNT };

if (LEVEL_LAYOUTS.length !== LEVEL_COUNT) {
  throw new Error(
    `LEVEL_LAYOUTS (${LEVEL_LAYOUTS.length}) must match LEVEL_COUNT (${LEVEL_COUNT})`,
  );
}

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

export function loadLevel(levelIndex: number, worldW: number = WORLD_WIDTH): Brick[] {
  const idx = Math.max(0, Math.min(LEVEL_COUNT - 1, Math.floor(levelIndex)));
  const layout = LEVEL_LAYOUTS[idx] ?? LEVEL_LAYOUTS[0]!;
  const bricks: Brick[] = [];

  layout.forEach((line, row) => {
    const cells = line.padEnd(BRICK_COLS, '.').slice(0, BRICK_COLS);
    for (let col = 0; col < BRICK_COLS; col += 1) {
      const cell = cells[col];
      if (cell === 'h') bricks.push(makeBrick(col, row, 'hard', worldW));
      else if (cell === 'n') bricks.push(makeBrick(col, row, 'normal', worldW));
    }
  });

  return bricks;
}

export function isCleared(bricks: Brick[]): boolean {
  return bricks.length > 0 && bricks.every((b) => b.hitsLeft <= 0);
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
