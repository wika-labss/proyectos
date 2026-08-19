import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography, fontWeight, radius, lineWidth } from '../../design-system';

interface StatProps {
  icon: string;
  label: string;
  value: string;
}

function StatChip({ icon, label, value }: StatProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

interface Props {
  levelId: number;
  score: number;
  hintsLabel: string;
}

/** Barra estado V4 — paneles blancos con iconos (mockup game.png) */
export function GameStatusBar({ levelId, score, hintsLabel }: Props) {
  return (
    <View style={styles.row}>
      <StatChip icon="⭐" label="Nivel" value={String(levelId)} />
      <StatChip icon="🏆" label="Puntaje" value={String(score)} />
      <StatChip icon="💡" label="Pistas" value={hintsLabel} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: lineWidth.medium,
    borderColor: colors.secondary,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    minHeight: 72,
    justifyContent: 'center',
  },
  icon: { fontSize: 16, marginBottom: 2 },
  label: {
    color: colors.active,
    fontSize: typography.xs,
    fontWeight: '700',
  },
  value: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
    marginTop: 2,
  },
});
