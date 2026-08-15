/**
 * Smoke V1 — pure engine gates (no React Native).
 * Run: npm run smoke
 */
import assert from 'node:assert/strict';
import {
  createWorld,
  launchBall,
  setPaddleX,
  step,
} from '../src/engine/arkanoidEngine';
import { considerHighScore, scoreForBrick } from '../src/engine/arkanoidScore';
import { hitBrick, isCleared, loadLevel } from '../src/engine/brickField';
import { onLevelCleared } from '../src/engine/levelProgress';
import { createLives, onBallLost } from '../src/engine/livesSystem';

function testLevelLayouts() {
  const l0 = loadLevel(0);
  const l1 = loadLevel(1);
  const l2 = loadLevel(2);
  assert.ok(l0.length > 0);
  assert.ok(l1.length > 0);
  assert.ok(l2.length > 0);
  assert.ok(l1.some((b) => b.type === 'hard'));
}

function testHitBrick() {
  const bricks = loadLevel(0);
  const first = bricks[0]!;
  const r = hitBrick(bricks, first.id);
  assert.ok(r.destroyed);
  assert.equal(r.bricks.length, bricks.length - 1);
}

function testHardBrickTwoHits() {
  const bricks = loadLevel(1).filter((b) => b.type === 'hard');
  assert.ok(bricks.length > 0);
  const hard = bricks[0]!;
  const all = loadLevel(1);
  const mid = hitBrick(all, hard.id);
  assert.equal(mid.destroyed, null);
  const still = mid.bricks.find((b) => b.id === hard.id);
  assert.ok(still);
  assert.equal(still!.hitsLeft, 1);
  const done = hitBrick(mid.bricks, hard.id);
  assert.ok(done.destroyed);
}

function testPaddleBounceAngle() {
  let world = createWorld(loadLevel(0));
  world = setPaddleX(world, world.width / 2);
  world = launchBall(world);
  // Place ball on paddle center moving down
  world = {
    ...world,
    ball: {
      ...world.ball,
      launched: true,
      pos: {
        x: world.paddle.x + world.paddle.w / 2,
        y: world.paddle.y - world.ball.r - 1,
      },
      vel: { x: 0, y: 200 },
    },
  };
  const result = step(world, 16);
  assert.ok(result.events.includes('paddleBounce'));
  assert.ok(result.state.ball.vel.y < 0);
}

function testBallLost() {
  let world = createWorld([]);
  world = launchBall(world);
  world = {
    ...world,
    ball: {
      ...world.ball,
      launched: true,
      pos: { x: world.width / 2, y: world.height + 20 },
      vel: { x: 0, y: 100 },
    },
  };
  const result = step(world, 16);
  assert.ok(result.events.includes('ballLost'));
}

function testWallBounce() {
  let world = createWorld([]);
  world = {
    ...world,
    ball: {
      ...world.ball,
      launched: true,
      pos: { x: 2, y: 100 },
      vel: { x: -200, y: 0 },
      r: 6,
    },
  };
  const result = step(world, 16);
  assert.ok(result.events.includes('wallBounce'));
  assert.ok(result.state.ball.vel.x > 0);
}

function testLevelClearEvent() {
  const one = loadLevel(0).slice(0, 1);
  let world = createWorld(one);
  const b = one[0]!;
  world = {
    ...world,
    ball: {
      ...world.ball,
      launched: true,
      pos: { x: b.x + b.w / 2, y: b.y + b.h + 6 },
      vel: { x: 0, y: -300 },
      r: 6,
    },
  };
  const result = step(world, 20);
  assert.ok(
    result.events.includes('brickDestroyed') || result.events.includes('levelCleared')
  );
  if (result.events.includes('brickDestroyed')) {
    assert.ok(isCleared(result.state.bricks) || result.events.includes('levelCleared'));
  }
}

function testLives() {
  let lives = createLives(3);
  let r = onBallLost(lives);
  assert.equal(r.lives, 2);
  assert.equal(r.gameOver, false);
  r = onBallLost(r.lives);
  assert.equal(r.lives, 1);
  r = onBallLost(r.lives);
  assert.equal(r.lives, 0);
  assert.equal(r.gameOver, true);
}

function testScore() {
  assert.equal(scoreForBrick('normal'), 100);
  assert.equal(scoreForBrick('hard'), 200);
  assert.equal(considerHighScore(500, 100), 500);
  assert.equal(considerHighScore(50, 100), 100);
}

function testLevelProgress() {
  const a = onLevelCleared(0);
  assert.equal(a.levelIndex, 1);
  assert.equal(a.victory, false);
  const b = onLevelCleared(2);
  assert.equal(b.victory, true);
}

function main() {
  testLevelLayouts();
  testHitBrick();
  testHardBrickTwoHits();
  testPaddleBounceAngle();
  testBallLost();
  testWallBounce();
  testLevelClearEvent();
  testLives();
  testScore();
  testLevelProgress();
  console.log(
    'smoke-v1: PASSED (bricks, bounce, ballLost, lives, score, levels)'
  );
}

main();
