import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  borderWidth,
  colors,
  radius,
  spacing,
  typography,
} from '../../design-system/tokens';

type Props = {
  level: number;
  name: string;
  motif: string;
  unlocked: boolean;
  accent: string;
  onPress: () => void;
};

export function MapCard({
  level,
  name,
  motif,
  unlocked,
  accent,
  onPress,
}: Props) {
  return (
    <Pressable
      disabled={!unlocked}
      onPress={onPress}
      style={[
        styles.card,
        { borderLeftColor: accent },
        !unlocked && styles.locked,
      ]}
    >
      <View style={styles.top}>
        <Text style={styles.level}>N{level}</Text>
        <Text style={styles.name}>{name}</Text>
      </View>
      <Text style={styles.motif}>{motif}</Text>
      <Text style={styles.status}>{unlocked ? 'Disponible' : 'Bloqueado'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.stone,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderWidth: borderWidth.thin,
    borderColor: colors.stoneHi,
    gap: spacing.xs,
  },
  locked: { opacity: 0.4 },
  top: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  level: {
    color: colors.torchGold,
    fontWeight: '800',
    fontSize: typography.body,
  },
  name: {
    color: colors.mist,
    fontSize: typography.subtitle,
    fontWeight: '800',
  },
  motif: {
    color: colors.muted,
    fontSize: typography.xs,
    textTransform: 'uppercase',
  },
  status: { color: colors.mist, fontSize: typography.sm },
});
