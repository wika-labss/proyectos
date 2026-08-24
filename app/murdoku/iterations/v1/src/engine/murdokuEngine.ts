/** Murdoku pure engine — MOD-01 */
import { getBoardConfig, regionOf, type BoardSize } from './boardSizes';

export type CellValue = number | null;
export type Grid = CellValue[][];

export type Conflict = {
  row: number;
  col: number;
  reason: 'row' | 'col' | 'region';
};

export type BoardState = {
  size: BoardSize;
  cells: Grid;
  givens: boolean[][];
  conflicts: Conflict[];
  isComplete: boolean;
  solved: boolean;
};

export function emptyGrid(n: BoardSize): Grid {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => null));
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.slice());
}

export function createBoardState(
  size: BoardSize,
  givensGrid: Grid,
): BoardState {
  const n = size;
  const cells = cloneGrid(givensGrid);
  const givens = cells.map((row) => row.map((v) => v !== null));
  return evaluate({ size: n, cells, givens, conflicts: [], isComplete: false, solved: false });
}

function evaluate(state: BoardState): BoardState {
  const conflicts = findConflicts(state.cells, state.size);
  const isComplete = state.cells.every((row) => row.every((c) => c !== null));
  const solved = isComplete && conflicts.length === 0;
  return { ...state, conflicts, isComplete, solved };
}

export function findConflicts(cells: Grid, size: BoardSize): Conflict[] {
  const n = size;
  const conflicts: Conflict[] = [];
  const seen = new Set<string>();

  const mark = (r: number, c: number, reason: Conflict['reason']) => {
    const key = `${r},${c},${reason}`;
    if (seen.has(key)) return;
    seen.add(key);
    conflicts.push({ row: r, col: c, reason });
  };

  // rows
  for (let r = 0; r < n; r++) {
    const map = new Map<number, number[]>();
    for (let c = 0; c < n; c++) {
      const v = cells[r]![c];
      if (v === null) continue;
      const list = map.get(v) ?? [];
      list.push(c);
      map.set(v, list);
    }
    for (const cols of map.values()) {
      if (cols.length > 1) cols.forEach((c) => mark(r, c, 'row'));
    }
  }

  // cols
  for (let c = 0; c < n; c++) {
    const map = new Map<number, number[]>();
    for (let r = 0; r < n; r++) {
      const v = cells[r]![c];
      if (v === null) continue;
      const list = map.get(v) ?? [];
      list.push(r);
      map.set(v, list);
    }
    for (const rows of map.values()) {
      if (rows.length > 1) rows.forEach((r) => mark(r, c, 'col'));
    }
  }

  // regions
  const { boxRows, boxCols } = getBoardConfig(size);
  for (let br = 0; br < n / boxRows; br++) {
    for (let bc = 0; bc < n / boxCols; bc++) {
      const map = new Map<number, Array<{ r: number; c: number }>>();
      for (let dr = 0; dr < boxRows; dr++) {
        for (let dc = 0; dc < boxCols; dc++) {
          const r = br * boxRows + dr;
          const c = bc * boxCols + dc;
          const v = cells[r]![c];
          if (v === null) continue;
          const list = map.get(v) ?? [];
          list.push({ r, c });
          map.set(v, list);
        }
      }
      for (const cellsIn of map.values()) {
        if (cellsIn.length > 1) cellsIn.forEach(({ r, c }) => mark(r, c, 'region'));
      }
    }
  }

  return conflicts;
}

export function placePiece(
  state: BoardState,
  row: number,
  col: number,
  pieceId: number,
): BoardState {
  if (state.givens[row]![col]) return state;
  if (pieceId < 0 || pieceId >= state.size) return state;
  const cells = cloneGrid(state.cells);
  cells[row]![col] = pieceId;
  return evaluate({ ...state, cells });
}

export function clearCell(state: BoardState, row: number, col: number): BoardState {
  if (state.givens[row]![col]) return state;
  const cells = cloneGrid(state.cells);
  cells[row]![col] = null;
  return evaluate({ ...state, cells });
}

function isValidAt(
  cells: Grid,
  size: BoardSize,
  row: number,
  col: number,
  value: number,
): boolean {
  const n = size;
  for (let c = 0; c < n; c++) {
    if (c !== col && cells[row]![c] === value) return false;
  }
  for (let r = 0; r < n; r++) {
    if (r !== row && cells[r]![col] === value) return false;
  }
  const { boxRows, boxCols } = getBoardConfig(size);
  const { br, bc } = regionOf(row, col, size);
  const r0 = br * boxRows;
  const c0 = bc * boxCols;
  for (let r = r0; r < r0 + boxRows; r++) {
    for (let c = c0; c < c0 + boxCols; c++) {
      if ((r !== row || c !== col) && cells[r]![c] === value) return false;
    }
  }
  return true;
}

/** Count solutions up to `limit` (typically 2 for uniqueness). */
export function countSolutions(puzzle: Grid, size: BoardSize, limit = 2): number {
  const cells = cloneGrid(puzzle);
  const n = size;
  let count = 0;

  function findEmpty(): { r: number; c: number } | null {
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (cells[r]![c] === null) return { r, c };
      }
    }
    return null;
  }

  function dfs(): void {
    if (count >= limit) return;
    const empty = findEmpty();
    if (!empty) {
      count += 1;
      return;
    }
    const { r, c } = empty;
    for (let v = 0; v < n; v++) {
      if (!isValidAt(cells, size, r, c, v)) continue;
      cells[r]![c] = v;
      dfs();
      cells[r]![c] = null;
      if (count >= limit) return;
    }
  }

  dfs();
  return count;
}

export function validatePuzzle(
  puzzle: Grid,
  size: BoardSize,
): { ok: boolean; solutions: number } {
  const solutions = countSolutions(puzzle, size, 2);
  return { ok: solutions === 1, solutions };
}

export function gridsEqual(a: Grid, b: Grid): boolean {
  return a.every((row, r) => row.every((v, c) => v === b[r]![c]));
}
