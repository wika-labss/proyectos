import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LevelCard } from '../src/components/LevelCard';
import { LEVELS } from '../src/constants/levels';
import { getTheme, spacing, typography } from '../src/constants/theme';
import { useProgressStore } from '../src/stores/progressStore';
import { useSettingsStore } from '../src/stores/settingsStore';

export default function LevelsScreen() {
  const router = useRouter();
  const darkMode = useSettingsStore((state) => state.darkMode);
  const isLevelUnlocked = useProgressStore((state) => state.isLevelUnlocked);
  const getLevelProgress = useProgressStore((state) => state.getLevelProgress);
  const colors = getTheme(darkMode ? 'dark' : 'light');

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Completa cada nivel para desbloquear el siguiente.
      </Text>
      <View style={styles.grid}>
        {LEVELS.map((level) => (
          <LevelCard
            key={level.id}
            level={level}
            progress={getLevelProgress(level.id)}
            unlocked={isLevelUnlocked(level.id)}
            colors={colors}
            onPress={(levelId) => router.push(`/game/${levelId}`)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  description: {
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
