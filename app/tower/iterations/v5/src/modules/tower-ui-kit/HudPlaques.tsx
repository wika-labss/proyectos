import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  colors,
  layout,
  radius,
  spacing,
  typography,
} from '../../design-system/tokens';

type Props = {
  lives: number;
  gold: number;
  waveLabel: string;
  mapName: string;
  levelLabel: string;
  onPause: () => void;
};

export function HudPlaques({
  lives,
  gold,
  waveLabel,
  mapName,
  levelLabel,
  onPause,
}: Props) {
  return (
    <View style={styles.row}>
      <Plaque label="Vidas" value={String(lives)} danger={lives <= 5} />
      <Plaque label="Oro" value={String(gold)} gold />
      <Plaque label="Oleada" value={waveLabel} />
      <Plaque label={levelLabel} value={mapName} compact />
      <Pressable onPress={onPause} style={styles.pause}>
        <Text style={styles.pauseText}>❚❚</Text>
      </Pressable>
    </View>
  );
}

function Plaque({
  label,
  value,
  danger,
  gold,
  compact,
}: {
  label: string;
  value: string;
  danger?: boolean;
  gold?: boolean;
  compact?: boolean;
}) {
  return (
    <View style={styles.block}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[
          styles.value,
          compact && styles.map,
          danger && { color: colors.danger },
          gold && { color: colors.torchGold },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: layout.hudHeight,
    backgroundColor: colors.stone,
  },
  block: { flex: 1 },
  label: {
    color: colors.muted,
    fontSize: typography.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    color: colors.mist,
    fontSize: typography.subtitle,
    fontWeight: '800',
  },
  map: { fontSize: typography.sm, fontWeight: '600' },
  pause: {
    width: layout.touchMin,
    height: layout.touchMin,
    borderRadius: radius.sm,
    backgroundColor: colors.keepVoid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseText: { color: colors.mist, fontSize: typography.sm },
});
