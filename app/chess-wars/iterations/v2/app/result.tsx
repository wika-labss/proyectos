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
    difficulty?: string;
    loadout?: string;
  }>();
  const outcome = params.outcome ?? 'draw';
  const title = outcome === 'win' ? 'Victoria' : outcome === 'loss' ? 'Derrota' : 'Tablas';
  const color =
    outcome === 'win' ? colors.success : outcome === 'loss' ? colors.danger : colors.accent;

  const rematch = () => {
    if (params.mode === 'evolutive') {
      router.replace({
        pathname: '/play/evolutive',
        params: {
          difficulty: params.difficulty === 'medium' ? 'medium' : 'easy',
          loadout: params.loadout === 'B' ? 'B' : 'A',
        },
      });
      return;
    }
    router.replace({
      pathname: '/play/classic',
      params: { difficulty: params.difficulty === 'medium' ? 'medium' : 'easy' },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.box}>
        <Text style={[styles.title, { color }]}>{title}</Text>
        <Text style={styles.sub}>
          {params.mode === 'evolutive' ? 'Evolutive Quick' : 'Clásico'} · IA{' '}
          {params.difficulty === 'medium' ? 'Media' : 'Fácil'}
        </Text>
        <PrimaryButton label="Rematch" onPress={rematch} style={{ marginTop: spacing.xl }} />
        <PrimaryButton
          label="Lobby"
          variant="secondary"
          onPress={() => router.replace('/lobby')}
          style={{ marginTop: spacing.md }}
        />
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
  box: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg },
  title: { ...typography.brand, fontSize: 36, textAlign: 'center' },
  sub: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
