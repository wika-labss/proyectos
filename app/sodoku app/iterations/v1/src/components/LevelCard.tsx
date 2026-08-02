import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DIFFICULTY_LABELS } from '../constants/levels';
import { spacing, typography } from '../constants/theme';
import { LevelConfig, LevelProgress, ThemeColors } from '../types';

interface LevelCardProps {
  level: LevelConfig;
  progress: LevelProgress;
  unlocked: boolean;
  colors: ThemeColors;
  onPress: (levelId: number) => void;
}

function renderStars(stars: number, color: string): string {
  return `${'★'.repeat(stars)}${'☆'.repeat(Math.max(3 - stars, 0))}`.trim();
}

export function LevelCard({ level, progress, unlocked, colors, onPress }: LevelCardProps) {
  return (
    <Pressable
      disabled={!unlocked}
      accessibilityRole="button"
      accessibilityLabel={`${level.name}, ${DIFFICULTY_LABELS[level.difficulty]}`}
      onPress={() => onPress(level.id)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          opacity: unlocked ? 1 : 0.55,
          transform: [{ scale: pressed && unlocked ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.levelNumber, { color: colors.text }]}>{level.id}</Text>
        {!unlocked ? <Text style={{ color: colors.locked }}>🔒</Text> : null}
      </View>
      <Text style={[styles.difficulty, { color: colors.textSecondary }]}>
        {DIFFICULTY_LABELS[level.difficulty]}
      </Text>
      {progress.completed ? (
        <Text style={[styles.stars, { color: colors.accent }]}>{renderStars(progress.stars, colors.accent)}</Text>
      ) : (
        <Text style={[styles.placeholder, { color: colors.textSecondary }]}>—</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: typography.title,
    fontWeight: '700',
  },
  difficulty: {
    fontSize: typography.small,
    marginTop: spacing.xs,
  },
  stars: {
    fontSize: typography.body,
    marginTop: spacing.sm,
  },
  placeholder: {
    marginTop: spacing.sm,
  },
});
