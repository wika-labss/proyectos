import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';

type MoodIndicatorProps = {
  animo: number;
};

export function MoodIndicator({ animo }: MoodIndicatorProps) {
  const safe = Math.max(1, Math.min(5, Math.round(animo)));

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Ánimo</Text>
      <View style={styles.row}>
        {Array.from({ length: 5 }, (_, index) => {
          const active = index < safe;
          return (
            <View key={index} style={[styles.dot, active && styles.dotActive]} />
          );
        })}
      </View>
      <Text style={styles.value}>{safe}/5</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.accent,
    fontSize: fonts.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
  value: {
    color: colors.textMuted,
    fontSize: fonts.caption,
  },
});
