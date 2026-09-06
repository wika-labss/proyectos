import type { EnemyKind, EnemyTypeDef } from './types';

export const ENEMY_TYPES: EnemyTypeDef[] = [
  {
    id: 'grunt',
    name: 'Grunt',
    hp: 40,
    speed: 12,
    rewardGold: 8,
    baseDamage: 1,
    radius: 2.2,
    color: '#E57373',
  },
  {
    id: 'runner',
    name: 'Runner',
    hp: 22,
    speed: 22,
    rewardGold: 10,
    baseDamage: 1,
    radius: 1.8,
    color: '#FFB74D',
  },
  {
    id: 'tank',
    name: 'Tank',
    hp: 120,
    speed: 7,
    rewardGold: 18,
    baseDamage: 1,
    radius: 3.2,
    color: '#90A4AE',
  },
  {
    id: 'boss',
    name: 'Boss',
    hp: 400,
    speed: 6,
    rewardGold: 60,
    baseDamage: 3,
    radius: 4.5,
    color: '#CE93D8',
  },
];

export function getEnemyType(id: EnemyKind): EnemyTypeDef {
  const e = ENEMY_TYPES.find((x) => x.id === id);
  if (!e) throw new Error(`Unknown enemy ${id}`);
  return e;
}
