import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, spacing, typography } from '../src/constants/theme';

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    outcome?: string;
    mode?: string;
    battleId?: string;
    difficulty?: string;
  }>();

  const outcome = params.outcome ?? 'draw';
  const title =
    outcome === 'win' ? 'Victoria' : outcome === 'loss' ? 'Derrota' : 'Tablas';
  const color =
    outcome === 'win' ? colors.success : outcome === 'loss' ? colors.danger : colors.accent;

  const retry = () => {
    if (params.mode === 'campaign' && params.battleId) {
      router.replace({
        pathname: '/play/[battleId]',
        params: { battleId: params.battleId },
      });
      return;
    }
    router.replace({
      pathname: '/play',
      params: { difficulty: params.difficulty === 'medium' ? 'medium' : 'easy' },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.box}>
        <Text style={[styles.title, { color }]}>{title}</Text>
        <Text style={styles.sub}>
          {params.mode === 'campaign'
            ? `Batalla ${params.battleId ?? ''}`
            : `Partida rápida (${params.difficulty === 'medium' ? 'Media' : 'Fácil'})`}
        </Text>
        <PrimaryButton label="Reintentar" onPress={retry} style={{ marginTop: spacing.xl }} />
        {params.mode === 'campaign' ? (
          <PrimaryButton
            label="Campaña"
            variant="secondary"
            onPress={() => router.replace('/campaign')}
            style={{ marginTop: spacing.md }}
          />
        ) : null}
        <PrimaryButton
          label="Home"
          variant="secondary"
          onPress={() => router.replace('/')}
          style={{ marginTop: spacing.md }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  box: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: { ...typography.brand, fontSize: 36, textAlign: 'center' },
  sub: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
