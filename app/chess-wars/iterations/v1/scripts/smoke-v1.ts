/**
 * Chess Wars V1 — smoke tests (engine + AI + campaign data)
 */
import assert from 'node:assert/strict';
import {
  applyMove,
  chooseAiMove,
  createInitialState,
  getAllLegalMoves,
  getLegalMoves,
  inCheck,
  sq,
} from '../src/engine';
import { BATTLES } from '../src/data/battles';

function section(name: string) {
  console.log(`\n✔ ${name}`);
}

section('initial position');
{
  const s = createInitialState();
  assert.equal(s.sideToMove, 'w');
  assert.equal(s.board[sq(4, 0)]?.type, 'k');
  assert.equal(s.board[sq(4, 7)]?.type, 'k');
  const moves = getAllLegalMoves(s);
  assert.ok(moves.length >= 20, `expected >=20 opening moves, got ${moves.length}`);
}

section('e2e4 legal and applies');
{
  let s = createInitialState();
  const from = sq(4, 1);
  const to = sq(4, 3);
  const legal = getLegalMoves(s, from).find((m) => m.to === to);
  assert.ok(legal);
  s = applyMove(s, legal!);
  assert.equal(s.board[to]?.type, 'p');
  assert.equal(s.board[from], null);
  assert.equal(s.sideToMove, 'b');
}

section('AI returns legal move for black');
{
  let s = createInitialState();
  s = applyMove(s, { from: sq(4, 1), to: sq(4, 3) });
  assert.equal(s.sideToMove, 'b');
  const ai = chooseAiMove(s, 'easy');
  assert.ok(ai);
  const legal = getAllLegalMoves(s).some((m) => m.from === ai!.from && m.to === ai!.to);
  assert.ok(legal, 'AI move must be legal');
  s = applyMove(s, ai!);
  assert.equal(s.sideToMove, 'w');
  assert.equal(inCheck(s, 'b'), false);
}

section('scholars mate sequence ends in checkmate');
{
  // 1.e4 e5 2.Qh5 Nc6 3.Bc4 Nf6?? 4.Qxf7#
  let s = createInitialState();
  const play = (from: number, to: number) => {
    const m = getLegalMoves(s, from).find((x) => x.to === to);
    assert.ok(m, `missing move ${from}->${to}`);
    s = applyMove(s, m!);
  };
  play(sq(4, 1), sq(4, 3)); // e4
  play(sq(4, 6), sq(4, 4)); // e5
  play(sq(3, 0), sq(7, 4)); // Qh5
  play(sq(1, 7), sq(2, 5)); // Nc6
  play(sq(5, 0), sq(2, 3)); // Bc4
  play(sq(6, 7), sq(5, 5)); // Nf6
  play(sq(7, 4), sq(5, 6)); // Qxf7#
  assert.equal(s.status, 'checkmate');
  assert.equal(s.winner, 'w');
}

section('campaign data 10 battles');
{
  assert.equal(BATTLES.length, 10);
  assert.equal(BATTLES[0].difficulty, 'easy');
  assert.equal(BATTLES[3].difficulty, 'easy');
  assert.equal(BATTLES[4].difficulty, 'medium');
  assert.equal(BATTLES[9].difficulty, 'medium');
}

section('castling rights present in opening');
{
  const s = createInitialState();
  assert.equal(s.castling.wK, true);
  assert.equal(s.castling.wQ, true);
}

console.log('\nAll Chess Wars smoke tests passed.\n');
