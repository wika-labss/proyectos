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

export type Paddle = { x: number; y: number; w: number; h: number };

export type Ball = {
  id: string;
  pos: Vec2;
  vel: Vec2;
  r: number;
  launched: boolean;
};

export type CapsuleKind = 'L' | 'E' | 'C' | 'S' | 'B' | 'D' | 'P';

export type ExclusivePower = 'laser' | 'enlarge' | 'catch' | 'slow' | 'disrupt';

export type Capsule = {
  id: string;
  kind: CapsuleKind;
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
};

export type Laser = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
};

export type WorldState = {
  width: number;
  height: number;
  paddle: Paddle;
  ball: Ball;
  extraBalls: Ball[];
  bricks: Brick[];
  capsules: Capsule[];
  lasers: Laser[];
  levelIndex: number;
  power: ExclusivePower | null;
  slow: boolean;
  doorOpen: boolean;
  doorExit: boolean;
  laserCooldownMs: number;
};

export type EngineEvent =
  | { type: 'brickHit'; brickId: string; hitsLeft: number }
  | { type: 'brickDestroyed'; brickId: string; brickType: BrickType }
  | { type: 'ballLost' }
  | { type: 'wallBounce' }
  | { type: 'paddleBounce' }
  | { type: 'cleared' }
  | { type: 'capsuleSpawned'; kind: CapsuleKind }
  | { type: 'capsuleCaught'; kind: CapsuleKind }
  | { type: 'extraLife' }
  | { type: 'breakExit' };

export type StepResult = {
  state: WorldState;
  events: EngineEvent[];
};
