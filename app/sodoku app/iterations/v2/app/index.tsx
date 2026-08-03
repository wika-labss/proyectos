import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing, typography, getTheme } from '../src/constants/theme';
import { useGameStore } from '../src/stores/gameStore';
import { useSettingsStore } from '../src/stores/settingsStore';

export default function HomeScreen() {
  const darkMode = useSettingsStore((state) => state.darkMode);
  const activeLevelId = useGameStore((state) => state.levelId);
  const colors = getTheme(darkMode ? 'dark' : 'light');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.hero}>
        <Text style={[styles.title, { color: colors.text }]}>Sodoku</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          20 niveles progresivos de Sudoku para Android e iOS
        </Text>
      </View>

      <View style={styles.actions}>
        <Link href="/levels" asChild>
          <Pressable style={[styles.primaryButton, { backgroundColor: colors.primary }]}>
            <Text style={[styles.primaryButtonText, { color: colors.buttonText }]}>Jugar</Text>
          </Pressable>
        </Link>

        {activeLevelId ? (
          <Link href={`/game/${activeLevelId}`} asChild>
            <Pressable style={[styles.secondaryButton, { backgroundColor: colors.surface }]}>
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                Continuar nivel {activeLevelId}
              </Text>
            </Pressable>
          </Link>
        ) : null}

        <Link href="/stats" asChild>
          <Pressable style={[styles.secondaryButton, { backgroundColor: colors.surface }]}>
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Estadísticas</Text>
          </Pressable>
        </Link>

        <Link href="/settings" asChild>
          <Pressable style={[styles.secondaryButton, { backgroundColor: colors.surface }]}>
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Ajustes</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: typography.body,
    lineHeight: 24,
  },
  actions: {
    gap: spacing.sm,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
});
