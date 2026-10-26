import type { FormationPreset, Player } from '../api/types';
import { FORMATION_PRESETS } from './presets';

const GROUP_RANK: Record<string, number> = {
  POR: 0,
  LIB: 1,
  DFC: 2,
  LD: 3,
  LI: 3,
  MCD: 4,
  MC: 5,
  MCO: 6,
  MD: 7,
  MI: 7,
  ED: 8,
  EI: 8,
  SD: 9,
  DC: 10,
};

function rankForPosition(code: string): number {
  return GROUP_RANK[code] ?? 5;
}

export function suggestFormationPreset(players: Player[]): FormationPreset {
  const starters = players.filter((p) => p.active);
  const defs = starters.filter((p) => rankForPosition(p.positionCode) <= 3).length;
  const mids = starters.filter(
    (p) => rankForPosition(p.positionCode) >= 4 && rankForPosition(p.positionCode) <= 7,
  ).length;
  const fwds = starters.filter((p) => rankForPosition(p.positionCode) >= 8).length;

  if (defs >= 4 && mids >= 4) return FORMATION_PRESETS[0];
  if (defs >= 4 && fwds >= 2) return FORMATION_PRESETS[1];
  if (defs >= 3 && mids >= 4) return FORMATION_PRESETS[3];
  if (defs >= 5) return FORMATION_PRESETS[5];
  if (mids >= 5) return FORMATION_PRESETS[6];
  return FORMATION_PRESETS[2];
}

export function suggestLineupForPreset(
  preset: FormationPreset,
  players: Player[],
): { slotId: string; playerId?: string }[] {
  const pool = [...players].filter((p) => p.active).sort((a, b) => {
    const dr = rankForPosition(a.positionCode) - rankForPosition(b.positionCode);
    if (dr !== 0) return dr;
    return (a.jerseyNumber ?? 99) - (b.jerseyNumber ?? 99);
  });
  const used = new Set<string>();

  return preset.slots.map((slot) => {
    const matchIdx = pool.findIndex(
      (p) => !used.has(p.id) && p.positionCode === slot.positionCode,
    );
    const idx =
      matchIdx >= 0
        ? matchIdx
        : pool.findIndex((p) => !used.has(p.id) && rankForPosition(p.positionCode) === rankForPosition(slot.positionCode));
    const fallbackIdx = pool.findIndex((p) => !used.has(p.id));
    const pick = idx >= 0 ? pool[idx] : fallbackIdx >= 0 ? pool[fallbackIdx] : undefined;
    if (pick) used.add(pick.id);
    return { slotId: slot.id, playerId: pick?.id };
  });
}
