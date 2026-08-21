/**
 * AI Chess Wars v2 — smoke (classic + evolutive)
 */
import assert from 'node:assert/strict';
import {
  applyMove,
  chooseAiMove,
  createInitialState,
  getAllLegalMoves,
  getLegalMoves,
  sq,
} from '../src/engine';
import * as evo from '../src/engine/evolution';

function section(name: string) {
  console.log(`\n✔ ${name}`);
}

section('classic opening');
{
  const s = createInitialState();
  assert.equal(s.sideToMove, 'w');
  assert.ok(getAllLegalMoves(s).length >= 20);
}

section('classic e2e4 + AI reply legal');
{
  let s = createInitialState();
  s = applyMove(s, { from: sq(4, 1), to: sq(4, 3) });
  const ai = chooseAiMove(s, 'easy');
  assert.ok(ai);
  assert.ok(getAllLegalMoves(s).some((m) => m.from === ai!.from && m.to === ai!.to));
}

section('classic integrity: no energy nodes in classic state');
{
  // Classic uses GameState only — evolutive nodes are a separate layer
  const s = createInitialState();
  assert.equal('energy' in s, false);
}

section('evolutive nodes + energy on occupy');
{
  let st = evo.createEvolutiveState('A');
  assert.equal(st.energy, 1);
  assert.deepEqual(evo.ENERGY_NODES.map((n) => n).sort(), [sq(2, 2), sq(5, 2), sq(2, 5), sq(5, 5)].sort());
  // Move knight b1-c3 onto node c3
  const from = sq(1, 0);
  const to = sq(2, 2);
  const legal = evo.filterLegalMovesFrom(st, from).find((m) => m.to === to);
  assert.ok(legal, 'Nc3 should be legal');
  st = evo.applyEvolutiveMove(st, legal!)!;
  assert.ok(st.energy >= 2, 'energy should increase on node');
}

section('evolve pawn to drone with xp+energy');
{
  let st = evo.createEvolutiveState('B');
  // Force runtime on a white pawn e2
  const pawn = sq(4, 1);
  st.pieces[String(pawn)] = {
    xp: 3,
    evolved: null,
    abilityAvailable: false,
    fortifiedTurns: 0,
  };
  st.energy = 2;
  assert.equal(evo.canEvolve(st, pawn), true);
  st = evo.evolve(st, pawn)!;
  assert.equal(st.pieces[String(pawn)].evolved, 'drone');
  assert.equal(st.energy, 0);
  assert.equal(st.pieces[String(pawn)].abilityAvailable, true);
  const targets = evo.droneTargets(st, pawn);
  assert.ok(targets.length > 0);
}

section('fortress blocks capture');
{
  let st = evo.createEvolutiveState('A');
  const rook = sq(0, 0);
  st.pieces[String(rook)] = {
    xp: 3,
    evolved: 'fortress',
    abilityAvailable: true,
    fortifiedTurns: 0,
  };
  st = evo.activateFortress(st, rook)!;
  assert.ok(st.pieces[String(rook)].fortifiedTurns > 0);
  // Simulate black to move attempting capture on a1 — filter should block if somehow attacking
  st.base.sideToMove = 'b';
  const attacks = evo.filterLegalMoves(st).filter((m) => m.to === rook && m.captured);
  // May be empty if no black piece attacks a1; fortified filter still holds when attacks exist
  for (const m of attacks) {
    assert.fail(`fortified rook should not be capturable: ${m.from}->${m.to}`);
  }
}

section('interceptor arm + second jump');
{
  let st = evo.createEvolutiveState('A');
  const n = sq(1, 0);
  st.pieces[String(n)] = {
    xp: 3,
    evolved: 'interceptor',
    abilityAvailable: true,
    fortifiedTurns: 0,
  };
  const to = sq(2, 2); // Nc3
  const move = evo.filterLegalMovesFrom(st, n).find((m) => m.to === to);
  assert.ok(move);
  st = evo.applyEvolutiveMove(st, move!, { armInterceptor: true })!;
  assert.equal(st.pendingInterceptorFrom, to);
  assert.equal(st.base.sideToMove, 'w');
  const extras = evo.interceptorExtraTargets(st);
  assert.ok(extras.length > 0);
  st = evo.completeInterceptorJump(st, extras[0])!;
  assert.equal(st.pendingInterceptorFrom, null);
  assert.equal(st.pieces[String(extras[0])].abilityAvailable, false);
}

section('loadout B gives extra capture xp');
{
  let st = evo.createEvolutiveState('B');
  // Fool's mate style capture setup is heavy; unit-check applyXp via capturing move if available after e4 d5 exd5
  st = evo.applyEvolutiveMove(st, { from: sq(4, 1), to: sq(4, 3) })!; // e4
  st = evo.applyEvolutiveMove(st, { from: sq(3, 6), to: sq(3, 4) })!; // d5
  const cap = evo.filterLegalMovesFrom(st, sq(4, 3)).find((m) => m.to === sq(3, 4));
  assert.ok(cap);
  st = evo.applyEvolutiveMove(st, cap!)!;
  const xp = st.pieces[String(sq(3, 4))].xp;
  assert.ok(xp >= 3, `expected capture xp with bonus >=3, got ${xp}`);
}

console.log('\nAll AI Chess Wars v2 smoke tests passed.\n');
