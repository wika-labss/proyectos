/** Room campaign + puzzles — MOD-04 / MOD-05 */
import type { BoardSize } from './boardSizes';
import type { Grid } from './murdokuEngine';

export type RoomId = 'library' | 'kitchen' | 'basement' | 'garden';

export type RoomDef = {
  id: RoomId;
  title: string;
  blurb: string;
  skinKey: RoomId;
  size: BoardSize;
  /** null = empty cell (to fill); number = given clue */
  puzzle: Grid;
  solution: Grid;
};

function g(rows: Array<Array<number | null>>): Grid {
  return rows.map((r) => r.slice());
}

/**
 * Hand-crafted unique-solution Murdoku puzzles.
 * Values are piece ids 0..N-1.
 */
export const ROOMS: RoomDef[] = [
  {
    id: 'library',
    title: 'Biblioteca',
    blurb: 'Entre estanterías y libros abiertos, alguien dejó un rastro. Ordena a los presentes.',
    skinKey: 'library',
    size: 4,
    puzzle: g([
      [0, 1, null, 3],
      [null, 3, null, 1],
      [null, 0, null, null],
      [3, 2, null, null],
    ]),
    solution: g([
      [0, 1, 2, 3],
      [2, 3, 0, 1],
      [1, 0, 3, 2],
      [3, 2, 1, 0],
    ]),
  },
  {
    id: 'kitchen',
    title: 'Cocina',
    blurb: 'Utensilios fuera de lugar y una mancha sospechosa. ¿Quién estuvo aquí?',
    skinKey: 'kitchen',
    size: 6,
    puzzle: g([
      [null, 1, null, null, null, 5],
      [3, null, 5, 0, 1, null],
      [1, 2, null, 4, null, 0],
      [null, null, null, null, null, 3],
      [null, 3, 4, null, 0, null],
      [5, 0, null, 2, null, 4],
    ]),
    solution: g([
      [0, 1, 2, 3, 4, 5],
      [3, 4, 5, 0, 1, 2],
      [1, 2, 3, 4, 5, 0],
      [4, 5, 0, 1, 2, 3],
      [2, 3, 4, 5, 0, 1],
      [5, 0, 1, 2, 3, 4],
    ]),
  },
  {
    id: 'basement',
    title: 'Sótano',
    blurb: 'Oscuridad, cajas y herramientas. El eco guarda un secreto.',
    skinKey: 'basement',
    size: 6,
    puzzle: g([
      [null, 1, null, null, null, 5],
      [3, null, 5, 0, 1, null],
      [1, 2, null, null, null, 0],
      [null, null, null, null, null, 3],
      [null, null, 4, null, 0, null],
      [5, 0, null, 2, null, 4],
    ]),
    solution: g([
      [0, 1, 2, 3, 4, 5],
      [3, 4, 5, 0, 1, 2],
      [1, 2, 3, 4, 5, 0],
      [4, 5, 0, 1, 2, 3],
      [2, 3, 4, 5, 0, 1],
      [5, 0, 1, 2, 3, 4],
    ]),
  },
  {
    id: 'garden',
    title: 'Jardín',
    blurb: 'Huellas en el césped y algo enterrado cerca del seto. Cierra el caso.',
    skinKey: 'garden',
    size: 9,
    puzzle: g([
      [null, null, 2, null, 4, null, 6, null, 8],
      [3, 4, null, 6, null, 8, null, null, null],
      [null, 7, 8, null, 1, null, null, null, 5],
      [1, 2, null, null, null, 6, null, null, 0],
      [null, 5, null, null, 8, 0, null, 2, 3],
      [null, 8, null, 1, null, null, 4, null, null],
      [null, 3, null, 5, null, null, 8, 0, null],
      [null, null, null, 8, null, null, null, null, 4],
      [null, 0, 1, 2, null, 4, 5, 6, null],
    ]),
    solution: g([
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [3, 4, 5, 6, 7, 8, 0, 1, 2],
      [6, 7, 8, 0, 1, 2, 3, 4, 5],
      [1, 2, 3, 4, 5, 6, 7, 8, 0],
      [4, 5, 6, 7, 8, 0, 1, 2, 3],
      [7, 8, 0, 1, 2, 3, 4, 5, 6],
      [2, 3, 4, 5, 6, 7, 8, 0, 1],
      [5, 6, 7, 8, 0, 1, 2, 3, 4],
      [8, 0, 1, 2, 3, 4, 5, 6, 7],
    ]),
  },
];

export const ROOM_ORDER: RoomId[] = ROOMS.map((r) => r.id);

export function getRoom(id: RoomId): RoomDef {
  const room = ROOMS.find((r) => r.id === id);
  if (!room) throw new Error(`unknown room ${id}`);
  return room;
}

export type CampaignState = {
  unlocked: RoomId[];
  completed: RoomId[];
};

export function defaultCampaign(): CampaignState {
  return {
    unlocked: ['library'],
    completed: [],
  };
}

export function isUnlocked(state: CampaignState, id: RoomId): boolean {
  return state.unlocked.includes(id);
}

export function isCompleted(state: CampaignState, id: RoomId): boolean {
  return state.completed.includes(id);
}

export function completeRoom(state: CampaignState, id: RoomId): CampaignState {
  if (!isUnlocked(state, id)) return state;
  const completed = state.completed.includes(id)
    ? state.completed
    : [...state.completed, id];
  const idx = ROOM_ORDER.indexOf(id);
  const next = idx >= 0 && idx < ROOM_ORDER.length - 1 ? ROOM_ORDER[idx + 1]! : null;
  const unlocked =
    next && !state.unlocked.includes(next)
      ? [...state.unlocked, next]
      : state.unlocked;
  return { unlocked, completed };
}
