import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TOTAL_LEVELS } from '../src/constants/levels';
import { colors, spacing, typography } from '../src/modules/app-theme';
import { buildVictoryMessage } from '../src/modules/victory-feedback';
import { useGameStore } from '../src/stores/gameStore';

export default function VictoryScreen() {
  const { levelId: levelParam } = useLocalSearchParams<{ levelId: string }>();
  const levelId = Number(levelParam) || 1;
  const score = useGameStore((s) => s.score);
  const message = useMemo(() => buildVictoryMessage(levelId), [levelId]);

  const goNext = () => {
    if (levelId < TOTAL_LEVELS) {
      router.replace(`/game/${levelId + 1}`);
    } else {
      router.replace('/levels');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.score}>Puntaje del nivel: {score}</Text>
      <Pressable style={styles.btn} onPress={goNext}>
        <Text style={styles.btnText}>{levelId < TOTAL_LEVELS ? 'Siguiente nivel' : 'Ver niveles'}</Text>
      </Pressable>
      <Pressable style={styles.btn} onPress={() => router.replace(`/game/${levelId}`)}>
        <Text style={styles.btnText}>Repetir</Text>
      </Pressable>
      <Pressable style={styles.btn} onPress={() => router.replace('/')}>
        <Text style={styles.btnText}>Inicio</Text>
      </Pressable>
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
    gap: spacing.md,
  },
  message: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  score: { color: colors.text, fontSize: typography.body },
  btn: {
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  btnText: { color: colors.text, fontWeight: '700', fontSize: typography.body },
});
