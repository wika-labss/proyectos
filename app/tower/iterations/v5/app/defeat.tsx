import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  fontWeight,
  spacing,
  typography,
} from '../src/design-system/tokens';
import { useGame } from '../src/hooks/GameProvider';
import {
  KeepBackdrop,
  OrnamentKicker,
  StoneButton,
} from '../src/modules/tower-ui-kit';

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
        <View style={styles.cluster}>
          <OrnamentKicker
            tone="breach"
            label={
              infinite
                ? waveReached
                  ? `Oleada ${waveReached}∞`
                  : 'Infinito'
                : 'Derrota'
            }
          />
          <Text style={styles.title}>Base caída</Text>
          <Text style={styles.sub}>
            {infinite
              ? 'Las oleadas escalaron hasta romper la muralla.'
              : 'Las oleadas rompieron la muralla.'}
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
        </View>
      </SafeAreaView>
    </KeepBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: spacing.lg },
  cluster: {
    marginTop: 'auto',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    color: colors.mist,
    fontSize: 44,
    fontWeight: fontWeight.black,
    textAlign: 'center',
  },
  sub: {
    color: colors.muted,
    fontSize: typography.body,
    textAlign: 'center',
  },
});
