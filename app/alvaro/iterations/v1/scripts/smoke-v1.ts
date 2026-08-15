/**
 * Smoke V1 — pure engine gates (no React Native).
 * Run: npm run smoke
 */
import assert from 'node:assert/strict';
import {
  createGame,
  isOpposite,
  resolveDirection,
  step,
} from '../src/engine/snakeEngine';
import { createLives, onCollision } from '../src/engine/livesSystem';
import {
  considerHighScore,
  pauseClock,
  resumeClock,
  startRun,
  tickScore,
} from '../src/engine/survivalScore';

function testGrowth() {
  let state = createGame(10, 10);
  // Place food directly above head and force move up into it.
  const head = state.snake[0]!;
  state = {
    ...state,
    direction: 'up',
    food: { x: head.x, y: head.y - 1 },
  };
  const before = state.snake.length;
  const result = step(state);
  assert.equal(result.event, 'ate');
  assert.equal(result.state.snake.length, before + 1);
}

function testWallCollision() {
  let state = createGame(8, 8);
  state = {
    ...state,
    snake: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
    direction: 'up',
    food: { x: 4, y: 4 },
  };
  const result = step(state);
  assert.equal(result.event, 'hitWall');
}

function testSelfCollision() {
  let state = createGame(10, 10);
  // Compact snake where moving right hits body
  state = {
    ...state,
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 3, y: 2 },
      { x: 3, y: 1 },
    ],
    direction: 'right',
    food: { x: 0, y: 0 },
  };
  const result = step(state);
  assert.equal(result.event, 'hitSelf');
}

function testNo180() {
  assert.equal(isOpposite('up', 'down'), true);
  assert.equal(resolveDirection('up', 'down'), 'up');
  assert.equal(resolveDirection('up', 'left'), 'left');
}

function testLives() {
  let lives = createLives(3);
  let r = onCollision(lives);
  assert.equal(r.lives, 2);
  assert.equal(r.gameOver, false);
  r = onCollision(r.lives);
  assert.equal(r.lives, 1);
  r = onCollision(r.lives);
  assert.equal(r.lives, 0);
  assert.equal(r.gameOver, true);
}

function testScore() {
  const t0 = 1_000_000;
  let clock = startRun(t0);
  assert.equal(tickScore(clock, t0 + 2400), 24);
  clock = pauseClock(clock, t0 + 2400);
  assert.equal(tickScore(clock, t0 + 5400), 24); // paused: no gain
  clock = resumeClock(clock, t0 + 5400);
  assert.equal(tickScore(clock, t0 + 6400), 34); // +1s after resume
  assert.equal(considerHighScore(34, 10), 34);
  assert.equal(considerHighScore(5, 10), 10);
}

function main() {
  testGrowth();
  testWallCollision();
  testSelfCollision();
  testNo180();
  testLives();
  testScore();
  console.log('smoke-v1: PASSED (growth, collisions, lives, score)');
}

main();
