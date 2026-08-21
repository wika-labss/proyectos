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

const TAG: Record<TowerKind, string> = {
  archer: '▲ Arq',
  cannon: '■ Cañ',
  frost: '● Hie',
  sniper: '◆ Fra',
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
              { borderColor: active ? t.color : 'transparent' },
            ]}
          >
            <View style={[styles.swatch, { backgroundColor: t.color }]} />
            <Text style={styles.tag}>{TAG[t.id]}</Text>
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
    paddingVertical: 8,
    alignItems: 'center',
    gap: 2,
    borderWidth: 2,
  },
  itemActive: {
    backgroundColor: '#243447',
  },
  itemDisabled: {
    opacity: 0.45,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  tag: {
    color: colors.mist,
    fontSize: 11,
    fontWeight: '800',
  },
  name: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '600',
  },
  cost: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '800',
  },
});
