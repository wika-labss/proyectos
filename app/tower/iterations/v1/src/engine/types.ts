export type Vec2 = { x: number; y: number };

export type TowerKind = 'archer' | 'cannon' | 'frost' | 'sniper';

export type EnemyKind = 'grunt' | 'runner' | 'tank' | 'boss';

export type TowerTypeDef = {
  id: TowerKind;
  name: string;
  cost: number;
  damage: number;
  range: number;
  fireCooldownMs: number;
  splashRadius?: number;
  slowFactor?: number;
  slowDurationMs?: number;
  color: string;
};

export type EnemyTypeDef = {
  id: EnemyKind;
  name: string;
  hp: number;
  speed: number;
  rewardGold: number;
  baseDamage: number;
  radius: number;
  color: string;
};

export type MapPad = { id: string; x: number; y: number };

export type MapDefinition = {
  id: string;
  name: string;
  levelIndex: number;
  path: Vec2[];
  pads: MapPad[];
  palette: { bg: string; path: string; accent: string; deco: string };
  motif: string;
};

export type WaveSpawn = {
  kind: EnemyKind;
  count: number;
  intervalMs: number;
};

export type Wave = {
  index: number;
  spawns: WaveSpawn[];
};

export type PlacedTower = {
  id: string;
  kind: TowerKind;
  padId: string;
  pos: Vec2;
  cooldownUntil: number;
};

export type Enemy = {
  id: string;
  kind: EnemyKind;
  hp: number;
  maxHp: number;
  speed: number;
  pathT: number;
  slowUntil: number;
  slowFactor: number;
  rewardGold: number;
  baseDamage: number;
  radius: number;
  color: string;
};

export type Projectile = {
  id: string;
  from: Vec2;
  to: Vec2;
  kind: TowerKind;
  bornAt: number;
  ttlMs: number;
};

export type PendingSpawn = {
  kind: EnemyKind;
  atMs: number;
};

export type TdStatus =
  | 'playing'
  | 'waveBreak'
  | 'levelVictory'
  | 'defeat';

export type TdState = {
  status: TdStatus;
  levelIndex: number;
  waveIndex: number;
  lives: number;
  gold: number;
  towers: PlacedTower[];
  occupiedPads: Set<string>;
  enemies: Enemy[];
  projectiles: Projectile[];
  pendingSpawns: PendingSpawn[];
  waveActive: boolean;
  nowMs: number;
  map: MapDefinition;
  waves: Wave[];
};

export type TdEvent =
  | { type: 'enemyKilled'; kind: EnemyKind; gold: number }
  | { type: 'enemyLeaked'; kind: EnemyKind; damage: number }
  | { type: 'waveCleared'; waveIndex: number }
  | { type: 'levelWon' }
  | { type: 'levelLost' }
  | { type: 'towerPlaced'; kind: TowerKind; cost: number };

export type CampaignProgress = {
  maxUnlockedLevel: number;
  campaignComplete: boolean;
};
