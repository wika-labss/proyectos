import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TOTAL_LEVELS } from '../src/constants/levels';
import { colors, spacing, typography } from '../src/modules/app-theme';
import { SodokuUiButton } from '../src/modules/sodoku-ui-kit';
import { useProgressStore } from '../src/stores/progressStore';

export default function ScoreScreen() {
  const totalScore = useProgressStore((s) => s.totalScore);
  const completedCount = useProgressStore((s) => s.completedCount());
  const giftsCount = useProgressStore((s) => s.giftsCount());

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Puntaje</Text>
      <Text style={styles.score}>{totalScore}</Text>
      <Text style={styles.meta}>
        Niveles completados: {completedCount}/{TOTAL_LEVELS}
      </Text>
      <Text style={styles.meta}>Regalos ganados: {giftsCount}</Text>
      <SodokuUiButton label="Volver" variant="ctaMedium" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: { color: colors.active, fontSize: typography.subtitle, fontWeight: '700' },
  score: {
    color: colors.accent,
    fontSize: 48,
    fontWeight: '800',
    marginVertical: spacing.md,
  },
  meta: { color: colors.text, fontSize: typography.body },
});
