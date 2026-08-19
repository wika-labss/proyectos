import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import { listTowerTypes } from '../engine/towerTypes';
import type { TowerKind } from '../engine/types';

type Props = {
  selected: TowerKind | null;
  gold: number;
  onSelect: (kind: TowerKind) => void;
};

export function TowerBar({ selected, gold, onSelect }: Props) {
  return (
    <View style={styles.row}>
      {listTowerTypes().map((t) => {
        const active = selected === t.id;
        const canAfford = gold >= t.cost;
        return (
          <Pressable
            key={t.id}
            onPress={() => onSelect(t.id)}
            style={[
              styles.item,
              active && styles.itemActive,
              !canAfford && styles.itemDisabled,
            ]}
          >
            <View style={[styles.swatch, { backgroundColor: t.color }]} />
            <Text style={styles.name}>{t.name}</Text>
            <Text style={styles.cost}>{t.cost}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
  },
  item: {
    flex: 1,
    backgroundColor: colors.steel,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemActive: {
    borderColor: colors.ember,
  },
  itemDisabled: {
    opacity: 0.45,
  },
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  name: {
    color: colors.mist,
    fontSize: 11,
    fontWeight: '700',
  },
  cost: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '800',
  },
});
