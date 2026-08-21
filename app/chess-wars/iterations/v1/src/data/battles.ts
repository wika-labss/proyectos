import { AiDifficulty } from '../engine/types';

export type Battle = {
  battleId: number;
  title: string;
  difficulty: AiDifficulty;
};

export const BATTLES: Battle[] = Array.from({ length: 10 }, (_, i) => {
  const battleId = i + 1;
  return {
    battleId,
    title: `Batalla ${battleId}`,
    difficulty: battleId <= 4 ? 'easy' : 'medium',
  };
});

export function getBattle(battleId: number): Battle | undefined {
  return BATTLES.find((b) => b.battleId === battleId);
}
