import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LEVELS, TOTAL_LEVELS } from '../src/constants/levels';
import { colors, spacing, typography } from '../src/modules/app-theme';
import { SodokuLevelTile } from '../src/modules/sodoku-ui-kit';
import { useProgressStore } from '../src/stores/progressStore';

export default function LevelsScreen() {
  const unlockedLevels = useProgressStore((s) => s.unlockedLevels);
  const levelProgress = useProgressStore((s) => s.levelProgress);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      style={{ backgroundColor: colors.background }}
    >
      <Text style={styles.hint}>{TOTAL_LEVELS} niveles · completa y avanza</Text>
      <View style={styles.grid}>
        {LEVELS.map((level) => {
          const unlocked = unlockedLevels.includes(level.id);
          const completed = !!levelProgress[level.id]?.completed;
          return (
            <SodokuLevelTile
              key={level.id}
              levelId={level.id}
              unlocked={unlocked}
              completed={completed}
              onPress={
                unlocked ? () => router.push(`/game/${level.id}`) : undefined
              }
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md },
  hint: {
    color: colors.active,
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
