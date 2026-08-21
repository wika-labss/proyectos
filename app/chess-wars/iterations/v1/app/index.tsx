import React from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, spacing, typography } from '../src/constants/theme';
import { useProgress } from '../src/hooks/ProgressProvider';

export default function HomeScreen() {
  const { progress } = useProgress();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.bg}>
        <View style={styles.glow} />
        <Text style={styles.brand}>CHESS WARS</Text>
        <Text style={styles.sub}>Estrategia offline · VISSIUSS</Text>
        <Text style={styles.meta}>
          Campaña: batalla {progress.maxUnlockedBattle}/10 · victorias {progress.wins}
        </Text>

        <View style={styles.actions}>
          <PrimaryButton
            label="Partida rápida (Fácil)"
            onPress={() => router.push({ pathname: '/play', params: { difficulty: 'easy' } })}
          />
          <PrimaryButton
            label="Partida rápida (Media)"
            variant="secondary"
            onPress={() => router.push({ pathname: '/play', params: { difficulty: 'medium' } })}
            style={{ marginTop: spacing.md }}
          />
          <PrimaryButton
            label="Campaña Wars"
            variant="secondary"
            onPress={() => router.push('/campaign')}
            style={{ marginTop: spacing.md }}
          />
          <PrimaryButton
            label="Cómo jugar"
            variant="secondary"
            onPress={() => router.push('/how-to')}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  bg: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  glow: {
    position: 'absolute',
    top: -40,
    left: -20,
    right: -20,
    height: 280,
    backgroundColor: colors.backgroundWarm,
    opacity: 0.45,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },
  brand: {
    ...typography.brand,
    color: colors.accent,
    textAlign: 'center',
  },
  sub: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  actions: {
    marginTop: spacing.lg,
  },
});
