import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../src/design-system/tokens';
import { useGame } from '../src/hooks/GameProvider';
import { KeepBackdrop, StoneButton } from '../src/modules/tower-ui-kit';

export default function LevelVictoryScreen() {
  const router = useRouter();
  const { run, campaign, startLevel } = useGame();
  const level = run ? run.levelIndex + 1 : campaign.maxUnlockedLevel - 1;
  const next = Math.min(25, level + 1);

  return (
    <KeepBackdrop variant="victory">
      <SafeAreaView style={styles.safe}>
        <Text style={styles.kicker}>Nivel {level}</Text>
        <Text style={styles.title}>Victoria</Text>
        <Text style={styles.sub}>
          {run?.map.name ?? 'Frente'} asegurado. Siguiente: N{next}.
        </Text>
        <StoneButton
          label="Continuar"
          onPress={() => {
            startLevel(next);
            router.replace('/game');
          }}
        />
        <StoneButton
          label="Selector de niveles"
          variant="ghost"
          onPress={() => router.replace('/levels')}
        />
      </SafeAreaView>
    </KeepBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.md,
  },
  kicker: {
    color: colors.torchGold,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    color: colors.mist,
    fontSize: 48,
    fontWeight: '900',
  },
  sub: {
    color: colors.muted,
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
});
