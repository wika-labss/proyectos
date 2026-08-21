/**
 * Smoke V1 — pure engine gates (no React Native).
 * Run: npm run smoke
 */
import assert from 'node:assert/strict';
import {
  addPreventiveInState,
  ageFromBirthDate,
  createPetInState,
  deletePetInState,
  dueStatus,
  emptyState,
  getDaySummary,
  logBathroom,
  logFeed,
  logNote,
  logWalk,
  requiresStool,
  setPetHealth,
  toLocalDateKey,
} from '../src/engine';

function testAge() {
  const age = ageFromBirthDate('2023-01-15', new Date('2026-08-21'));
  assert.equal(age.years, 3);
  assert.equal(age.months, 7);
}

function testCreatePet() {
  let state = emptyState();
  const r = createPetInState(state, {
    name: 'Luna',
    type: 'perro',
    birthDate: '2023-01-01',
    now: new Date('2026-08-21T10:00:00'),
  });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  state = r.state;
  assert.equal(state.pets.length, 1);
  assert.equal(state.activePetId, state.pets[0]!.id);
  assert.equal(state.healthByPetId[state.pets[0]!.id]?.status, 'sano');
}

function testBathroomRequiresStool() {
  assert.equal(requiresStool('heces'), true);
  assert.equal(requiresStool('orina'), false);
  let state = emptyState();
  const created = createPetInState(state, {
    name: 'Mora',
    type: 'gato',
    birthDate: '2022-06-01',
  });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  state = created.state;
  const petId = state.activePetId!;
  const bad = logBathroom(state, { petId, payload: { bathroomType: 'heces' } });
  assert.equal(bad.ok, false);
  const good = logBathroom(state, {
    petId,
    payload: { bathroomType: 'heces', stool: 'blanda' },
  });
  assert.equal(good.ok, true);
}

function testIsolationAndDay() {
  let state = emptyState();
  const a = createPetInState(state, { name: 'A', type: 'perro', birthDate: '2020-01-01' });
  assert.equal(a.ok, true);
  if (!a.ok) return;
  state = a.state;
  const idA = state.activePetId!;
  const b = createPetInState(state, { name: 'B', type: 'gato', birthDate: '2021-01-01' });
  assert.equal(b.ok, true);
  if (!b.ok) return;
  state = b.state;
  const idB = state.activePetId!;

  const fed = logFeed(state, {
    petId: idB,
    at: '2026-08-20T08:10:00.000Z',
    payload: { foodType: 'seco' },
  });
  assert.equal(fed.ok, true);
  if (!fed.ok) return;
  state = fed.state;

  const dayA = getDaySummary(state, idA, '2026-08-20');
  const dayB = getDaySummary(state, idB, '2026-08-20');
  assert.equal(dayA.feedCount, 0);
  assert.equal(dayB.feedCount, 1);
}

function testHealthAndWalkNote() {
  let state = emptyState();
  const created = createPetInState(state, {
    name: 'Luna',
    type: 'perro',
    birthDate: '2023-01-01',
  });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  state = created.state;
  const petId = state.activePetId!;

  const badHealth = setPetHealth(state, petId, { status: 'enfermo', symptoms: [] });
  assert.equal(badHealth.ok, false);

  const okHealth = setPetHealth(state, petId, {
    status: 'enfermo',
    symptoms: ['vomito'],
    now: new Date('2026-08-21T12:00:00'),
  });
  assert.equal(okHealth.ok, true);
  if (!okHealth.ok) return;
  state = okHealth.state;

  const walk = logWalk(state, { petId, payload: { durationMin: 30 } });
  assert.equal(walk.ok, true);
  if (!walk.ok) return;
  state = walk.state;

  const note = logNote(state, { petId, payload: { text: 'Visitó al vet' } });
  assert.equal(note.ok, true);
  if (!note.ok) return;
  state = note.state;

  const today = toLocalDateKey();
  const day = getDaySummary(state, petId, today);
  assert.ok(day.walkCount >= 1);
  assert.ok(day.noteCount >= 1);
  assert.equal(day.health?.status, 'enfermo');
}

function testPreventiveAndCascade() {
  let state = emptyState();
  const created = createPetInState(state, {
    name: 'Luna',
    type: 'perro',
    birthDate: '2023-01-01',
  });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  state = created.state;
  const petId = state.activePetId!;

  const prv = addPreventiveInState(state, {
    petId,
    kind: 'vacuna',
    name: 'Antirrábica',
    appliedAt: '2026-01-10',
    nextDueAt: '2026-08-25',
  });
  assert.equal(prv.ok, true);
  if (!prv.ok) return;
  state = prv.state;
  assert.equal(dueStatus('2026-08-25', '2026-08-21'), 'soon');
  assert.equal(dueStatus('2026-08-01', '2026-08-21'), 'overdue');

  const fed = logFeed(state, { petId, payload: { foodType: 'humedo' } });
  assert.equal(fed.ok, true);
  if (!fed.ok) return;
  state = fed.state;

  const deleted = deletePetInState(state, petId);
  assert.equal(deleted.ok, true);
  if (!deleted.ok) return;
  state = deleted.state;
  assert.equal(state.pets.length, 0);
  assert.equal(state.events.length, 0);
  assert.equal(state.preventives.length, 0);
  assert.equal(Object.keys(state.healthByPetId).length, 0);
}

function main() {
  testAge();
  testCreatePet();
  testBathroomRequiresStool();
  testIsolationAndDay();
  testHealthAndWalkNote();
  testPreventiveAndCascade();
  console.log('smoke-v1: all passed');
}

main();
