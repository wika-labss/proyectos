import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../design-system/tokens';
import { listTowerTypes } from '../engine/towerTypes';
import type { TowerKind } from '../engine/types';
import { TowerSlot } from '../modules/tower-ui-kit';

type Props = {
  selected: TowerKind | null;
  gold: number;
  onSelect: (kind: TowerKind) => void;
};

export function TowerBar({ selected, gold, onSelect }: Props) {
  return (
    <View style={styles.row}>
      {listTowerTypes().map((t) => (
        <TowerSlot
          key={t.id}
          kind={t.id}
          name={t.name}
          cost={t.cost}
          selected={selected === t.id}
          disabled={gold < t.cost}
          onPress={() => onSelect(t.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
