import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  fontWeight,
  spacing,
} from '../src/design-system/tokens';
import { useGame } from '../src/hooks/GameProvider';
import {
  KeepBackdrop,
  OrnamentKicker,
  OrnamentSub,
  StoneButton,
} from '../src/modules/tower-ui-kit';

export default function LevelVictoryScreen() {
  const router = useRouter();
  const { run, campaign, startLevel } = useGame();
  const level = run ? run.levelIndex + 1 : campaign.maxUnlockedLevel - 1;
  const next = Math.min(25, level + 1);

  return (
    <KeepBackdrop variant="victory">
      <SafeAreaView style={styles.safe}>
        <View style={styles.cluster}>
          <OrnamentKicker label={`Nivel ${level}`} />
          <Text style={styles.title}>Victoria</Text>
          <OrnamentSub label="Frente asegurado" />
          <StoneButton
            label="Continuar"
            onPress={() => {
              startLevel(next);
              router.replace('/game');
            }}
          />
          <StoneButton
            label="Selector"
            variant="ghost"
            onPress={() => router.replace('/levels')}
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
    fontSize: 48,
    fontWeight: fontWeight.black,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
