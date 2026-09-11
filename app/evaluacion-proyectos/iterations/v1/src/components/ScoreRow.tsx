import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SCORE_VALUES, type Score } from '../engine/types';
import { colors, fonts, radius, spacing, touchMin } from '../constants/theme';

type ScoreRowProps = {
  label: string;
  value: Score | null;
  onChange: (value: Score) => void;
};

export function ScoreRow({ label, value, onChange }: ScoreRowProps) {
  return (
    <View style={styles.block}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {SCORE_VALUES.map((score) => {
          const selected = value === score;
          return (
            <Pressable
              key={score}
              onPress={() => onChange(score)}
              style={[styles.cell, selected && styles.cellSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${label} ${score}`}
            >
              <Text style={[styles.cellText, selected && styles.cellTextSelected]}>{score}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.text,
    fontSize: fonts.heading,
    fontWeight: '400',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cell: {
    flex: 1,
    minHeight: touchMin,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  cellSelected: {
    backgroundColor: colors.accent,
  },
  cellText: {
    color: colors.text,
    fontSize: fonts.body,
    fontWeight: '400',
  },
  cellTextSelected: {
    color: colors.background,
  },
});
