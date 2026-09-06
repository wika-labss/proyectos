import React from 'react';
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import type { TowerKind } from '../../engine/types';
import {
  borderWidth,
  colors,
  radius,
  spacing,
  towerTint,
  typography,
} from '../../design-system/tokens';
import { towerSprites } from './assets';

type Props = {
  kind: TowerKind;
  name: string;
  cost: number;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function TowerSlot({
  kind,
  name,
  cost,
  selected,
  disabled,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.item,
        selected && { borderColor: towerTint[kind] },
        disabled && styles.disabled,
      ]}
    >
      <Image source={towerSprites[kind]} style={styles.sprite} />
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.cost}>{cost}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flex: 1,
    backgroundColor: colors.stone,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: borderWidth.medium,
    borderColor: 'transparent',
  },
  disabled: { opacity: 0.45 },
  sprite: { width: 36, height: 36 },
  name: {
    color: colors.mist,
    fontSize: typography.xs,
    fontWeight: '800',
  },
  cost: {
    color: colors.torchGold,
    fontSize: typography.sm,
    fontWeight: '800',
  },
});
