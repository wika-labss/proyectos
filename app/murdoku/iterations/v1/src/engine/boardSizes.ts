/** Board size geometry — MOD-03 */
export type BoardSize = 4 | 6 | 9;

export type BoardConfig = {
  n: BoardSize;
  boxRows: number;
  boxCols: number;
  mode: 'basic' | 'advanced';
};

const CONFIGS: Record<BoardSize, BoardConfig> = {
  4: { n: 4, boxRows: 2, boxCols: 2, mode: 'basic' },
  6: { n: 6, boxRows: 2, boxCols: 3, mode: 'basic' },
  9: { n: 9, boxRows: 3, boxCols: 3, mode: 'advanced' },
};

export function getBoardConfig(size: BoardSize): BoardConfig {
  return CONFIGS[size];
}

export function regionOf(
  row: number,
  col: number,
  size: BoardSize,
): { br: number; bc: number } {
  const { boxRows, boxCols } = getBoardConfig(size);
  return {
    br: Math.floor(row / boxRows),
    bc: Math.floor(col / boxCols),
  };
}

export function isSupportedSize(n: number): n is BoardSize {
  return n === 4 || n === 6 || n === 9;
}
