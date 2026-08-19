export type Vec2 = { x: number; y: number };

export type BrickType = 'normal' | 'hard';

export type Brick = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: BrickType;
  hitsLeft: number;
  row: number;
};

export type Boss = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  hitsLeft: number;
  hitsMax: number;
};

export type Paddle = { x: number; y: number; w: number; h: number };

export type Ball = {
  pos: Vec2;
  vel: Vec2;
  r: number;
  launched: boolean;
};

export type WorldState = {
  width: number;
  height: number;
  paddle: Paddle;
  ball: Ball;
  bricks: Brick[];
  boss: Boss | null;
  levelIndex: number;
};

export type EngineEvent =
  | { type: 'brickHit'; brickId: string; hitsLeft: number }
  | { type: 'brickDestroyed'; brickId: string; brickType: BrickType }
  | { type: 'bossHit'; hitsLeft: number }
  | { type: 'bossDefeated' }
  | { type: 'ballLost' }
  | { type: 'wallBounce' }
  | { type: 'paddleBounce' }
  | { type: 'cleared' };

export type StepResult = {
  state: WorldState;
  events: EngineEvent[];
};
