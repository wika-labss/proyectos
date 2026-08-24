/**
 * Smoke V1 — pure engine + rooms (no React Native).
 * Run: npm run smoke
 */
import assert from 'node:assert/strict';
import {
  clearCell,
  completeRoom,
  createBoardState,
  defaultCampaign,
  findConflicts,
  getPieceSet,
  getRoom,
  placePiece,
  ROOMS,
  ROOM_ORDER,
  validatePuzzle,
  gridsEqual,
} from '../src/engine';

function testPieceSets() {
  for (const n of [4, 6, 9] as const) {
    const set = getPieceSet(n);
    assert.equal(set.length, n);
    assert.equal(set.filter((p) => p.kind === 'victim').length, 1);
    assert.equal(set.filter((p) => p.kind === 'killer').length, 1);
  }
}

function testRoomsUnique() {
  for (const room of ROOMS) {
    const { ok, solutions } = validatePuzzle(room.puzzle, room.size);
    assert.equal(
      ok,
      true,
      `${room.id}: expected unique solution, got ${solutions}`,
    );
    assert.equal(
      validatePuzzle(room.solution, room.size).solutions,
      1,
      `${room.id}: solution grid must be complete unique`,
    );
    const conflicts = findConflicts(room.solution, room.size);
    assert.equal(conflicts.length, 0, `${room.id}: solution has conflicts`);
    // Solution must extend puzzle givens
    for (let r = 0; r < room.size; r++) {
      for (let c = 0; c < room.size; c++) {
        const g = room.puzzle[r]![c];
        if (g !== null) {
          assert.equal(
            room.solution[r]![c],
            g,
            `${room.id}: solution mismatches given at ${r},${c}`,
          );
        }
      }
    }
  }
}

function testPlaceAndSolveLibrary() {
  const room = getRoom('library');
  let state = createBoardState(room.size, room.puzzle);
  for (let r = 0; r < room.size; r++) {
    for (let c = 0; c < room.size; c++) {
      if (room.puzzle[r]![c] !== null) continue;
      state = placePiece(state, r, c, room.solution[r]![c]!);
    }
  }
  assert.equal(state.solved, true);
  assert.ok(gridsEqual(state.cells, room.solution));
}

function testConflictFeedback() {
  const room = getRoom('library');
  let state = createBoardState(room.size, room.puzzle);
  // Place duplicate of given 0 in row 0 if empty cell exists
  const emptyCol = room.puzzle[0]!.findIndex((v) => v === null);
  assert.ok(emptyCol >= 0);
  state = placePiece(state, 0, emptyCol, 0);
  assert.ok(state.conflicts.length > 0);
  assert.equal(state.solved, false);
  state = clearCell(state, 0, emptyCol);
  assert.equal(state.cells[0]![emptyCol], null);
}

function testCampaignUnlock() {
  let camp = defaultCampaign();
  assert.deepEqual(camp.unlocked, ['library']);
  camp = completeRoom(camp, 'library');
  assert.ok(camp.completed.includes('library'));
  assert.ok(camp.unlocked.includes('kitchen'));
  camp = completeRoom(camp, 'kitchen');
  assert.ok(camp.unlocked.includes('basement'));
  camp = completeRoom(camp, 'basement');
  assert.ok(camp.unlocked.includes('garden'));
  camp = completeRoom(camp, 'garden');
  assert.equal(camp.completed.length, 4);
  assert.equal(ROOM_ORDER.length, 4);
}

function main() {
  testPieceSets();
  testRoomsUnique();
  testPlaceAndSolveLibrary();
  testConflictFeedback();
  testCampaignUnlock();
  console.log('smoke-v1: OK');
}

main();
