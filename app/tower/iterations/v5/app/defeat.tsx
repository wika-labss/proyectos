import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../src/design-system/tokens';
import { useGame } from '../src/hooks/GameProvider';
import { KeepBackdrop, StoneButton } from '../src/modules/tower-ui-kit';

export default function DefeatScreen() {
  const router = useRouter();
  const { run, startLevel, startInfinite } = useGame();
  const infinite = run?.mode === 'infinite';
  const level = run && run.mode === 'campaign' ? run.levelIndex + 1 : 1;
  const waveReached =
    run && run.mode === 'infinite' ? Math.max(1, run.waveIndex + 1) : null;

  return (
    <KeepBackdrop variant="defeat">
      <SafeAreaView style={styles.safe}>
        <Text style={styles.kicker}>
          {infinite
            ? waveReached
              ? `Oleada ${waveReached}∞`
              : 'Infinito'
            : `Nivel ${level}`}
        </Text>
        <Text style={styles.title}>Base caída</Text>
        <Text style={styles.sub}>
          {infinite
            ? 'Las oleadas escalaron hasta romper la muralla.'
            : 'Las oleadas rompieron la muralla. Reorganiza y reintenta.'}
        </Text>
        <StoneButton
          label="Reintentar"
          onPress={() => {
            if (infinite) startInfinite();
            else startLevel(level);
            router.replace('/game');
          }}
        />
        {!infinite && (
          <StoneButton
            label="Selector"
            variant="ghost"
            onPress={() => router.replace('/levels')}
          />
        )}
        <StoneButton
          label="Menú"
          variant="ghost"
          onPress={() => router.replace('/')}
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
  kicker: { color: colors.breach, fontWeight: '700' },
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
