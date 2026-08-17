import { PIECE_TYPES, PieceType } from './tetrisEngine';

export type BagState = {
  queue: PieceType[];
};

export type Rng = () => number;

function shuffleTypes(rng: Rng): PieceType[] {
  const items = [...PIECE_TYPES];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = items[i]!;
    items[i] = items[j]!;
    items[j] = tmp;
  }
  return items;
}

export function createBag(rng: Rng = Math.random): BagState {
  return { queue: shuffleTypes(rng) };
}

export function nextPiece(
  bag: BagState,
  rng: Rng = Math.random
): { piece: PieceType; bag: BagState; preview: PieceType } {
  let queue = bag.queue.length > 0 ? bag.queue : shuffleTypes(rng);
  const piece = queue[0]!;
  let rest = queue.slice(1);
  if (rest.length === 0) rest = shuffleTypes(rng);
  return { piece, bag: { queue: rest }, preview: rest[0]! };
}
