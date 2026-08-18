import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TOTAL_LEVELS } from '../src/constants/levels';
import { colors, spacing, typography } from '../src/modules/app-theme';
import { buildVictoryMessage } from '../src/modules/victory-feedback';
import { isRewardName } from '../src/modules/rewards';
import { SodokuUiButton } from '../src/modules/sodoku-ui-kit';
import { useGameStore } from '../src/stores/gameStore';

export default function VictoryScreen() {
  const { levelId: levelParam, reward: rewardParam } = useLocalSearchParams<{
    levelId: string;
    reward?: string;
  }>();
  const levelId = Number(levelParam) || 1;
  const score = useGameStore((s) => s.score);
  const message = useMemo(() => buildVictoryMessage(levelId), [levelId]);
  const reward =
    typeof rewardParam === 'string' && isRewardName(rewardParam) ? rewardParam : null;

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
      {reward ? (
        <View style={styles.rewardBox}>
          <Text style={styles.rewardLabel}>Regalo ganado</Text>
          <Text style={styles.rewardName}>{reward}</Text>
        </View>
      ) : null}
      <SodokuUiButton
        label={levelId < TOTAL_LEVELS ? 'Siguiente nivel' : 'Ver niveles'}
        variant="ctaFull"
        onPress={goNext}
      />
      <SodokuUiButton
        label="Repetir"
        variant="ctaMedium"
        onPress={() => router.replace(`/game/${levelId}`)}
      />
      <SodokuUiButton
        label="Inventario"
        variant="ctaMedium"
        onPress={() => router.replace('/inventory')}
      />
      <SodokuUiButton label="Inicio" variant="ctaMedium" onPress={() => router.replace('/')} />
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
    color: colors.accent,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  score: { color: colors.text, fontSize: typography.body, fontWeight: '600' },
  rewardBox: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minWidth: 220,
  },
  rewardLabel: { color: colors.active, fontSize: typography.small, fontWeight: '700' },
  rewardName: {
    color: colors.accent,
    fontSize: typography.subtitle,
    fontWeight: '800',
    marginTop: 4,
  },
});
