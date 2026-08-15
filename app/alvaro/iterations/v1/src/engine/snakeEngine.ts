export type Direction = 'up' | 'down' | 'left' | 'right';

export type Cell = { x: number; y: number };

export type EngineState = {
  width: number;
  height: number;
  snake: Cell[];
  food: Cell;
  direction: Direction;
};

export type StepEvent = 'moved' | 'ate' | 'hitWall' | 'hitSelf' | 'boardFull';

export type StepResult = {
  state: EngineState;
  event: StepEvent;
};

export function isOpposite(a: Direction, b: Direction): boolean {
  return (
    (a === 'up' && b === 'down') ||
    (a === 'down' && b === 'up') ||
    (a === 'left' && b === 'right') ||
    (a === 'right' && b === 'left')
  );
}

export function cellKey(c: Cell): string {
  return `${c.x},${c.y}`;
}

function sameCell(a: Cell, b: Cell): boolean {
  return a.x === b.x && a.y === b.y;
}

function randomFreeCell(width: number, height: number, occupied: Cell[]): Cell {
  const blocked = new Set(occupied.map(cellKey));
  const free: Cell[] = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!blocked.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  if (free.length === 0) {
    throw new Error('No free cells');
  }
  return free[Math.floor(Math.random() * free.length)]!;
}

export function spawnFood(state: EngineState): Cell {
  return randomFreeCell(state.width, state.height, state.snake);
}

export function createGame(width: number, height: number): EngineState {
  const midX = Math.floor(width / 2);
  const midY = Math.floor(height / 2);
  const snake: Cell[] = [
    { x: midX, y: midY },
    { x: midX, y: midY + 1 },
    { x: midX, y: midY + 2 },
  ];
  const direction: Direction = 'up';
  const food = randomFreeCell(width, height, snake);
  return { width, height, snake, food, direction };
}

export function resolveDirection(
  current: Direction,
  pending: Direction | undefined
): Direction {
  if (!pending) return current;
  if (isOpposite(current, pending)) return current;
  return pending;
}

export function step(state: EngineState, pending?: Direction): StepResult {
  const direction = resolveDirection(state.direction, pending);
  const head = state.snake[0]!;
  const next: Cell = {
    x: head.x + (direction === 'left' ? -1 : direction === 'right' ? 1 : 0),
    y: head.y + (direction === 'up' ? -1 : direction === 'down' ? 1 : 0),
  };

  if (next.x < 0 || next.y < 0 || next.x >= state.width || next.y >= state.height) {
    return { state: { ...state, direction }, event: 'hitWall' };
  }

  const willEat = sameCell(next, state.food);
  const bodyToCheck = willEat ? state.snake : state.snake.slice(0, -1);
  if (bodyToCheck.some((c) => sameCell(c, next))) {
    return { state: { ...state, direction }, event: 'hitSelf' };
  }

  const grown = [next, ...state.snake];
  const snake = willEat ? grown : grown.slice(0, -1);

  if (willEat) {
    if (snake.length >= state.width * state.height) {
      return {
        state: { ...state, snake, direction, food: next },
        event: 'boardFull',
      };
    }
    const food = randomFreeCell(state.width, state.height, snake);
    return {
      state: { ...state, snake, food, direction },
      event: 'ate',
    };
  }

  return {
    state: { ...state, snake, direction },
    event: 'moved',
  };
}
