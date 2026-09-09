import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { biomeForMotif } from '../../design-system/biome';
import {
  biomeAccents,
  borderWidth,
  colors,
  fontWeight,
  motion,
  radius,
  spacing,
  typography,
} from '../../design-system/tokens';
import { BiomeThumb } from './BiomeThumb';

type Props = {
  level: number;
  name: string;
  motif: string;
  unlocked: boolean;
  onPress: () => void;
};

export function MapCard({ level, name, motif, unlocked, onPress }: Props) {
  const biome = biomeForMotif(motif);
  const accent = biomeAccents[biome];
  return (
    <Pressable
      disabled={!unlocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        !unlocked && styles.locked,
        pressed && unlocked && styles.pressed,
      ]}
    >
      <View style={[styles.tab, { backgroundColor: accent }]} />
      <BiomeThumb biome={biome} />
      <View style={styles.info}>
        <Text style={[styles.level, { color: accent }]}>N{level}</Text>
        <Text style={styles.name}>{name}</Text>
        {unlocked ? (
          <View style={styles.chip}>
            <Text style={styles.chipText}>Disponible</Text>
          </View>
        ) : (
          <View style={styles.lock}>
            <View style={styles.lockBody} />
            <View style={styles.lockShackle} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.stone,
    borderRadius: radius.md,
    borderWidth: borderWidth.medium,
    borderColor: colors.stoneHi,
    overflow: 'hidden',
    minHeight: 80,
    gap: spacing.sm,
    paddingRight: spacing.md,
    paddingVertical: spacing.sm,
  },
  locked: { opacity: 0.42 },
  pressed: { opacity: motion.pressOpacity },
  tab: {
    width: 8,
    alignSelf: 'stretch',
    marginVertical: -spacing.sm,
    marginRight: 0,
  },
  info: { flex: 1, gap: 2 },
  level: {
    fontWeight: fontWeight.extrabold,
    fontSize: typography.sm,
    letterSpacing: 0.8,
  },
  name: {
    color: colors.mist,
    fontSize: typography.subtitle,
    fontWeight: fontWeight.extrabold,
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.archerGreen,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: 4,
  },
  chipText: {
    color: colors.mist,
    fontSize: typography.xs,
    fontWeight: fontWeight.extrabold,
    textTransform: 'uppercase',
  },
  lock: {
    width: 16,
    height: 18,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  lockShackle: {
    position: 'absolute',
    top: 0,
    left: 3,
    width: 10,
    height: 8,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: colors.muted,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  lockBody: {
    position: 'absolute',
    bottom: 0,
    left: 1,
    width: 14,
    height: 10,
    backgroundColor: colors.muted,
    borderRadius: 2,
  },
});
