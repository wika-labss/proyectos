import React from 'react';
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import type { TowerKind } from '../../engine/types';
import {
  borderWidth,
  colors,
  fontWeight,
  motion,
  radius,
  spacing,
  towerTint,
  typography,
} from '../../design-system/tokens';
import { chromePlaqueHud, towerSprites } from './assets';

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
      style={({ pressed }) => [
        styles.hit,
        selected && { borderColor: towerTint[kind] },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <ImageBackground
        source={chromePlaqueHud}
        style={styles.item}
        imageStyle={styles.img}
        resizeMode="stretch"
      >
        <Image source={towerSprites[kind]} style={styles.sprite} />
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.costRow}>
          <View style={styles.coin} />
          <Text style={styles.cost}>{cost}</Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    flex: 1,
    borderRadius: radius.sm,
    borderWidth: borderWidth.medium,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  item: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    minHeight: 88,
  },
  img: {},
  disabled: { opacity: 0.45 },
  pressed: { opacity: motion.pressOpacity },
  sprite: { width: 40, height: 40 },
  name: {
    color: colors.mist,
    fontSize: typography.xs,
    fontWeight: fontWeight.extrabold,
  },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  coin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.torchGold,
  },
  cost: {
    color: colors.torchGold,
    fontSize: typography.sm,
    fontWeight: fontWeight.extrabold,
  },
});
