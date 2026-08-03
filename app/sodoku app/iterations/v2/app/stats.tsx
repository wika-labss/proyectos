import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getTheme, spacing, typography } from '../src/constants/theme';
import { formatTime } from '../src/hooks/useTimer';
import { useProgressStore } from '../src/stores/progressStore';
import { useSettingsStore } from '../src/stores/settingsStore';

export default function StatsScreen() {
  const darkMode = useSettingsStore((state) => state.darkMode);
  const statistics = useProgressStore((state) => state.statistics);
  const levelProgress = useProgressStore((state) => state.levelProgress);
  const colors = getTheme(darkMode ? 'dark' : 'light');

  const completedLevels = Object.values(levelProgress).filter((item) => item.completed).length;
  const averageTime =
    statistics.gamesWon > 0
      ? Math.round(statistics.totalTimeSeconds / statistics.gamesWon)
      : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatCard label="Niveles completados" value={`${completedLevels} / 20`} colors={colors} />
      <StatCard label="Partidas jugadas" value={`${statistics.gamesPlayed}`} colors={colors} />
      <StatCard label="Partidas ganadas" value={`${statistics.gamesWon}`} colors={colors} />
      <StatCard label="Tiempo promedio" value={formatTime(averageTime)} colors={colors} />
      <StatCard label="Mejor racha" value={`${statistics.bestStreak}`} colors={colors} />
      <StatCard label="Racha actual" value={`${statistics.currentStreak}`} colors={colors} />
    </View>
  );
}

function StatCard({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof getTheme>;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  card: {
    borderRadius: 12,
    padding: spacing.md,
  },
  label: {
    fontSize: typography.small,
  },
  value: {
    marginTop: spacing.xs,
    fontSize: typography.title,
    fontWeight: '700',
  },
});
