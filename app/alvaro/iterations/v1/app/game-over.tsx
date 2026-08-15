import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { useGame } from '../src/hooks/GameProvider';

export default function GameOverScreen() {
  const router = useRouter();
  const { score, highScore, startGame } = useGame();

  const onRetry = () => {
    startGame();
    router.replace('/game');
  };

  const onHome = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.title}>Game Over</Text>
        <Text style={styles.label}>Puntaje</Text>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.label}>Máximo</Text>
        <Text style={styles.high}>{highScore}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        >
          <Text style={styles.primaryText}>Reintentar</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onHome}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.arena,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 36,
  },
  center: {
    marginTop: 80,
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: colors.head,
    fontSize: 40,
    fontWeight: '800',
    marginBottom: 24,
  },
  label: {
    color: colors.muted,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  score: {
    color: colors.accent,
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 16,
  },
  high: {
    color: colors.snake,
    fontSize: 32,
    fontWeight: '700',
  },
  actions: {
    gap: 12,
  },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryText: {
    color: colors.arena,
    fontSize: 18,
    fontWeight: '800',
  },
  secondary: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.muted,
  },
  secondaryText: {
    color: colors.hud,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
