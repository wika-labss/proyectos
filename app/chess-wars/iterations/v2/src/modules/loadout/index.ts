import { LoadoutId } from '../../engine/types';

export type LoadoutOption = {
  id: LoadoutId;
  title: string;
  description: string;
};

export const LOADOUTS: LoadoutOption[] = [
  {
    id: 'A',
    title: 'Reactor inicial',
    description: '+1 Energía al empezar',
  },
  {
    id: 'B',
    title: 'Cazador',
    description: '+1 XP extra por captura',
  },
];

export function getLoadout(id: LoadoutId): LoadoutOption {
  return LOADOUTS.find((l) => l.id === id) ?? LOADOUTS[0];
}
