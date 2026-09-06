import { applyCapsule, fireLaser } from '../capsules';
import { createWorld, step } from '../arkanoidEngine';
import { PADDLE_Y, PADDLE_WIDTH, PADDLE_WIDTH_ENLARGED } from '../../constants/game';
import type { World } from '../types';

function flyingWorld(): World {
  const world = createWorld();
  world.ball.launched = true;
  world.ball.y = 200;
  world.ball.vy = -4;
  world.ball.vx = 3;
  return world;
}

describe('classic capsules', () => {
  it('E Enlarge widens the paddle and replaces other exclusive powers', () => {
    const world = applyCapsule(flyingWorld(), 'E');
    expect(world.paddle.w).toBe(PADDLE_WIDTH_ENLARGED);
    expect(world.power).toBe('enlarge');
    expect(world.slow).toBe(false);
  });

  it('S Slow marks the world and later steps keep a reduced speed', () => {
    let world = applyCapsule(flyingWorld(), 'S');
    expect(world.slow).toBe(true);
    expect(world.power).toBe('slow');
    world = step(world, 16, 1);
    const speed = Math.hypot(world.ball.vx, world.ball.vy);
    expect(speed).toBeLessThan(5.6);
  });

  it('C Catch sticks the ball to the paddle on contact', () => {
    let world = applyCapsule(createWorld(), 'C');
    world.ball.launched = true;
    world.ball.x = world.paddle.x;
    world.ball.y = PADDLE_Y - world.ball.r - 1;
    world.ball.vy = 6;
    world.ball.vx = 0;
    world = step(world, 16, 1);
    expect(world.ball.launched).toBe(false);
    expect(world.ball.y).toBeLessThan(PADDLE_Y);
  });

  it('D Disrupt splits the launched ball into three', () => {
    const world = applyCapsule(flyingWorld(), 'D');
    expect(world.extraBalls).toHaveLength(2);
    expect(world.power).toBe('disrupt');
  });

  it('last extra ball falling is the only life loss under Disrupt', () => {
    let world = applyCapsule(flyingWorld(), 'D');
    world.ball.x = 80;
    world.ball.y = 300;
    world.ball.vy = 12;
    world.extraBalls = [
      { ...world.extraBalls[0], y: 620, vy: 10, launched: true },
      { ...world.extraBalls[1], y: 200, vy: -3, launched: true },
    ];
    const events = { ballLost: false };
    world = step(world, 32, 2, (kind) => {
      if (kind === 'ballLost') events.ballLost = true;
    });
    expect(events.ballLost).toBe(false);
    expect(world.extraBalls.length + (world.ball.y < 600 ? 1 : 0)).toBeGreaterThanOrEqual(1);
  });

  it('B Break opens the door and exiting the right edge emits breakExit', () => {
    let world = applyCapsule(createWorld(), 'B');
    expect(world.doorOpen).toBe(true);
    world.paddle.x = 400;
    world.doorExit = true;
    const events: string[] = [];
    world = step(world, 16, 1, (kind) => events.push(kind));
    expect(events).toContain('breakExit');
  });

  it('P Player emits extraLife without clearing other powers', () => {
    let world = applyCapsule(flyingWorld(), 'E');
    const events: string[] = [];
    world.capsules = [
      {
        id: 'p',
        kind: 'P',
        x: world.paddle.x,
        y: PADDLE_Y - 6,
        w: 28,
        h: 14,
        vy: 2,
      },
    ];
    world = step(world, 16, 1, (kind) => events.push(kind));
    expect(events).toContain('extraLife');
    expect(world.power).toBe('enlarge');
    expect(world.paddle.w).toBe(PADDLE_WIDTH_ENLARGED);
  });

  it('L Laser fires a shot that can destroy a brick', () => {
    let world = applyCapsule(createWorld(), 'L');
    expect(world.power).toBe('laser');
    expect(world.paddle.w).toBe(PADDLE_WIDTH);
    world = fireLaser(world);
    expect(world.lasers).toHaveLength(1);
    world.lasers[0].y = world.bricks[0].y + 4;
    world.lasers[0].x = world.bricks[0].x + world.bricks[0].w / 2;
    const before = world.bricks.filter((brick) => brick.alive).length;
    world = step(world, 16, 1);
    const after = world.bricks.filter((brick) => brick.alive).length;
    expect(after).toBeLessThan(before);
  });
});
