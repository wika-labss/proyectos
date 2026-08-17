/**
 * Smoke V1 — pure engine gates (no React Native).
 * Run: npm run smoke
 */
import assert from 'node:assert/strict';
import { gravityMs, levelFromScore, softDropMs } from '../src/engine/scoreDifficulty';
import { createBag, nextPiece } from '../src/engine/pieceBag';
import {
  considerHighScore,
  onHardDrop,
  onLinesCleared,
  onSoftDrop,
} from '../src/engine/tetrisScore';
import {
  createBoard,
  fillCell,
  hardDropDistance,
  lock,
  spawn,
  tryMove,
  tryRotateCW,
  type Board,
  type Piece,
} from '../src/engine/tetrisEngine';

function fillRowExcept(board: Board, y: number, exceptX: number, value: 'I' = 'I'): Board {
  let next = board;
  for (let x = 0; x < board.cols; x += 1) {
    if (x === exceptX) continue;
    next = fillCell(next, x, y, value);
  }
  return next;
}

function testTetrisClear() {
  let board = createBoard();
  for (let y = 16; y <= 19; y += 1) {
    board = fillRowExcept(board, y, 5);
  }
  const piece: Piece = { type: 'I', rot: 1, x: 3, y: 16 };
  const result = lock(board, piece);
  assert.equal(result.linesCleared, 4);
  assert.equal(onLinesCleared(result.linesCleared), 800);
  assert.ok(result.board.cells.every((c) => c === 0));
}

function testWallKick() {
  const board = createBoard();
  const againstWall: Piece = { type: 'T', rot: 1, x: -1, y: 0 };
  const rotated = tryRotateCW(board, againstWall);
  assert.ok(rotated, 'wall kick ±1 should allow T rotate at left wall');
  assert.equal(rotated!.rot, 2);
  assert.equal(rotated!.x, 0);
}

function testTopOut() {
  let board = createBoard();
  for (let x = 0; x < board.cols; x += 1) {
    board = fillCell(board, x, 0, 'O');
    board = fillCell(board, x, 1, 'O');
  }
  const result = spawn(board, 'T');
  assert.equal(result.topOut, true);
  assert.equal(result.piece, null);
}

function testNoClipStack() {
  let board = createBoard();
  board = fillCell(board, 4, 10, 'Z');
  const overlapping: Piece = { type: 'O', rot: 0, x: 3, y: 9 };
  assert.equal(tryMove(board, overlapping, 0, 0), null);
  const above: Piece = { type: 'O', rot: 0, x: 3, y: 8 };
  assert.equal(tryMove(board, above, 0, 1), null);
}

function testBagSevenUnique() {
  const bag0 = createBag(() => 0.42);
  const seen: string[] = [];
  let bag = bag0;
  for (let i = 0; i < 7; i += 1) {
    const n = nextPiece(bag, () => 0.17);
    seen.push(n.piece);
    bag = n.bag;
  }
  assert.equal(new Set(seen).size, 7, `7-bag must contain all pieces, got ${seen.join(',')}`);
}

function testScoreTable() {
  assert.equal(onLinesCleared(1), 100);
  assert.equal(onLinesCleared(2), 300);
  assert.equal(onLinesCleared(3), 500);
  assert.equal(onLinesCleared(4), 800);
  assert.equal(onLinesCleared(0), 0);
  assert.equal(onSoftDrop(7), 7);
  assert.equal(onHardDrop(12), 24);
  assert.equal(considerHighScore(34, 10), 34);
  assert.equal(considerHighScore(5, 10), 10);
}

function testDifficultyFromScore() {
  assert.equal(levelFromScore(0), 1);
  assert.equal(gravityMs(1), 800);
  assert.equal(levelFromScore(499), 1);
  assert.equal(levelFromScore(500), 2);
  assert.equal(gravityMs(2), 650);
  assert.equal(levelFromScore(1000), 3);
  assert.equal(levelFromScore(4500), 10);
  assert.equal(levelFromScore(99999), 10);
  assert.equal(gravityMs(10), 70);
  assert.equal(softDropMs(1), 50);
}

function testDifficultyIgnoresLines() {
  // Contract: lines do not raise level; only score does.
  const scoreAfterFakeEightLines = 100;
  assert.equal(levelFromScore(scoreAfterFakeEightLines), 1);
  assert.equal(gravityMs(levelFromScore(100)), 800);
}

function testHardDropDistance() {
  const board = createBoard();
  const piece: Piece = { type: 'O', rot: 0, x: 3, y: 0 };
  assert.equal(hardDropDistance(board, piece), 18);
}

function main() {
  testTetrisClear();
  testWallKick();
  testTopOut();
  testNoClipStack();
  testBagSevenUnique();
  testScoreTable();
  testDifficultyFromScore();
  testDifficultyIgnoresLines();
  testHardDropDistance();
  console.log('smoke-v1: PASSED (engine, bag, score, difficulty-by-score)');
}

main();
