import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { menu } from '../src/constants/theme';
import { useGame } from '../src/hooks/GameProvider';

export default function LevelClearScreen() {
  const router = useRouter();
  const { levelIndex, score, continueAfterLevelClear, status } = useGame();

  useEffect(() => {
    if (status === 'playing') {
      router.replace('/game');
    }
  }, [status, router]);

  const onContinue = () => {
    continueAfterLevelClear();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.title}>Nivel completado</Text>
        <Text style={styles.sub}>Siguiente: nivel {levelIndex + 1}</Text>
        <Text style={styles.label}>Score</Text>
        <Text style={styles.score}>{score}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onContinue}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
      >
        <Text style={styles.ctaText}>Continuar</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: menu.void,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 36,
  },
  center: {
    marginTop: 80,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: menu.neon,
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 8,
  },
  sub: {
    color: menu.muted,
    fontSize: 16,
    marginBottom: 24,
  },
  label: {
    color: menu.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  score: {
    color: menu.magenta,
    fontSize: 44,
    fontWeight: '800',
  },
  cta: {
    backgroundColor: menu.neon,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: {
    color: menu.void,
    fontSize: 18,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.85,
  },
});
