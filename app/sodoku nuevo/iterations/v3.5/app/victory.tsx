import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { TOTAL_LEVELS } from '../src/constants/levels';
import { spacing } from '../src/modules/app-theme';
import { buildVictoryMessage } from '../src/modules/victory-feedback';
import { isRewardName } from '../src/modules/rewards';
import { SodokuUiButton } from '../src/modules/sodoku-ui-kit';
import { BrandHeader, CuteScreenBackground, VictoryCelebration } from '../src/modules/sodoku-visual';
import { useGameStore } from '../src/stores/gameStore';

/** Victory V3.5 — celebración visual-expectation + ui-v5 */
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
    <CuteScreenBackground variant="home">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <BrandHeader badge="v3.5 · victoria" showBanner />
        <VictoryCelebration message={message} score={score} reward={reward} />
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
      </ScrollView>
    </CuteScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    minHeight: '100%',
  },
});
