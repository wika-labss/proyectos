import {
  BRICK_COLS,
  BRICK_GAP,
  BRICK_HEIGHT,
  BRICK_ROWS_BASE,
  BRICK_TOP,
  WORLD_WIDTH,
} from '../constants/game';

export type BrickType = 'normal' | 'hard';

export type Brick = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: BrickType;
  hitsLeft: number;
  row: number;
};

export function brickWidth(): number {
  const totalGap = BRICK_GAP * (BRICK_COLS + 1);
  return (WORLD_WIDTH - totalGap) / BRICK_COLS;
}

/** Build a level layout. Levels 0..2 with increasing difficulty. */
export function loadLevel(levelIndex: number): Brick[] {
  const rows = BRICK_ROWS_BASE + Math.min(levelIndex, 1);
  const bw = brickWidth();
  const bricks: Brick[] = [];
  let n = 0;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < BRICK_COLS; col += 1) {
      // Skip some cells on higher levels for patterns
      if (levelIndex >= 2 && row % 2 === 1 && col % 3 === 1) continue;

      const useHard = levelIndex >= 1 && row < 2;
      const type: BrickType = useHard ? 'hard' : 'normal';
      bricks.push({
        id: `b${n++}`,
        x: BRICK_GAP + col * (bw + BRICK_GAP),
        y: BRICK_TOP + row * (BRICK_HEIGHT + BRICK_GAP),
        w: bw,
        h: BRICK_HEIGHT,
        type,
        hitsLeft: type === 'hard' ? 2 : 1,
        row,
      });
    }
  }
  return bricks;
}

export type HitResult = {
  bricks: Brick[];
  destroyed: Brick | null;
  cleared: boolean;
};

export function hitBrick(bricks: Brick[], id: string): HitResult {
  let destroyed: Brick | null = null;
  const next = bricks
    .map((b) => {
      if (b.id !== id) return b;
      const hitsLeft = b.hitsLeft - 1;
      if (hitsLeft <= 0) {
        destroyed = { ...b, hitsLeft: 0 };
        return null;
      }
      return { ...b, hitsLeft };
    })
    .filter((b): b is Brick => b != null);

  return {
    bricks: next,
    destroyed,
    cleared: next.length === 0,
  };
}

export function isCleared(bricks: Brick[]): boolean {
  return bricks.length === 0;
}
