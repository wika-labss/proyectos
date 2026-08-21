import React from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, radius, spacing, typography } from '../src/constants/theme';
import { BATTLES } from '../src/data/battles';
import { useProgress } from '../src/hooks/ProgressProvider';

export default function CampaignScreen() {
  const { progress } = useProgress();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <PrimaryButton label="← Home" variant="secondary" onPress={() => router.back()} />
        <Text style={styles.title}>Campaña Wars</Text>
        <Text style={styles.sub}>Desbloqueadas hasta la batalla {progress.maxUnlockedBattle}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {BATTLES.map((b) => {
          const locked = b.battleId > progress.maxUnlockedBattle;
          return (
            <Pressable
              key={b.battleId}
              disabled={locked}
              onPress={() =>
                router.push({ pathname: '/play/[battleId]', params: { battleId: String(b.battleId) } })
              }
              style={[styles.row, locked && styles.rowLocked]}
            >
              <View>
                <Text style={styles.rowTitle}>{b.title}</Text>
                <Text style={styles.rowMeta}>
                  IA {b.difficulty === 'easy' ? 'Fácil' : 'Media'}
                  {locked ? ' · Bloqueada' : ' · Disponible'}
                </Text>
              </View>
              <Text style={styles.cta}>{locked ? '🔒' : 'Jugar'}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, gap: spacing.sm },
  title: { ...typography.title, color: colors.text },
  sub: { ...typography.caption, color: colors.textMuted },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLocked: { opacity: 0.45 },
  rowTitle: { ...typography.body, color: colors.text, fontWeight: '700' },
  rowMeta: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  cta: { color: colors.accent, fontWeight: '700' },
});
