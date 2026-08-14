import { Link } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LEVELS } from '../src/constants/levels';
import { colors, spacing, typography } from '../src/modules/app-theme';
import { useProgressStore } from '../src/stores/progressStore';

export default function LevelsScreen() {
  const unlockedLevels = useProgressStore((s) => s.unlockedLevels);
  const levelProgress = useProgressStore((s) => s.levelProgress);

  return (
    <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: colors.background }}>
      <Text style={styles.hint}>20 niveles · desbloqueo secuencial</Text>
      <View style={styles.grid}>
        {LEVELS.map((level) => {
          const unlocked = unlockedLevels.includes(level.id);
          const completed = levelProgress[level.id]?.completed;
          const content = (
            <View style={[styles.card, !unlocked && styles.locked]}>
              <Text style={[styles.cardTitle, !unlocked && styles.lockedText]}>{level.id}</Text>
              <Text style={[styles.cardMeta, !unlocked && styles.lockedText]}>
                {!unlocked ? 'Bloqueado' : completed ? 'Completado' : 'Disponible'}
              </Text>
            </View>
          );
          if (!unlocked) return <View key={level.id}>{content}</View>;
          return (
            <Link key={level.id} href={`/game/${level.id}`} asChild>
              <Pressable>{content}</Pressable>
            </Link>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md },
  hint: { color: colors.text, fontSize: typography.body, marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: 72,
    height: 72,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locked: { opacity: 0.45 },
  cardTitle: { color: colors.text, fontSize: 22, fontWeight: '700' },
  cardMeta: { color: colors.text, fontSize: 10 },
  lockedText: { color: colors.locked },
});
