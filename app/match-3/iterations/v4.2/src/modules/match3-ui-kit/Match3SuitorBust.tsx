import React from 'react';
import type { CountryId } from '../../data/countries';
import type { SuitorSlot } from '../../data/suitors';
import { layout } from '../../design-system';
import { SLOT_CELL, castSheet } from '../match3-visual/assets';
import { SheetSprite } from '../match3-visual/SheetSprite';

export function Match3SuitorBust({
  countryId,
  slot,
  size = layout.bustSize,
}: {
  countryId: CountryId;
  slot: SuitorSlot;
  size?: number;
}) {
  const cell = SLOT_CELL[slot];
  return (
    <SheetSprite
      source={castSheet(countryId)}
      cols={2}
      rows={2}
      col={cell.col}
      row={cell.row}
      size={size}
    />
  );
}
