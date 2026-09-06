import React from 'react';
import { HudPlaques } from '../modules/tower-ui-kit';

type Props = {
  lives: number;
  gold: number;
  wave: number;
  waveCount: number;
  level: number;
  mapName: string;
  onPause: () => void;
};

export function Hud({
  lives,
  gold,
  wave,
  waveCount,
  level,
  mapName,
  onPause,
}: Props) {
  const waveLabel =
    wave === 0 ? 'Prep' : waveCount === 0 ? `${wave}∞` : `${wave}/${waveCount}`;
  return (
    <HudPlaques
      lives={lives}
      gold={gold}
      waveLabel={waveLabel}
      mapName={mapName}
      levelLabel={level === 0 ? 'Modo' : `N${level}`}
      onPause={onPause}
    />
  );
}
