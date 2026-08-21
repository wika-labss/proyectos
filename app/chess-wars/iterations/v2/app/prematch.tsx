import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, radius, spacing, typography } from '../src/constants/theme';
import { AiDifficulty, LoadoutId } from '../src/engine/types';
import { LOADOUTS } from '../src/modules/loadout';

export default function PrematchScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const evolutive = mode === 'evolutive';
  const [difficulty, setDifficulty] = useState<AiDifficulty>('easy');
  const [loadout, setLoadout] = useState<LoadoutId>('A');

  const start = () => {
    if (evolutive) {
      router.push({
        pathname: '/play/evolutive',
        params: { difficulty, loadout },
      });
    } else {
      router.push({
        pathname: '/play/classic',
        params: { difficulty },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.pad}>
        <PrimaryButton label="← Lobby" variant="secondary" onPress={() => router.back()} />
        <Text style={styles.title}>Prepartida</Text>
        <Text style={styles.sub}>{evolutive ? 'Evolutive Quick' : 'Clásico'}</Text>

        <Text style={styles.label}>Dificultad IA</Text>
        <View style={styles.row}>
          {(['easy', 'medium'] as AiDifficulty[]).map((d) => (
            <Pressable
              key={d}
              onPress={() => setDifficulty(d)}
              style={[styles.chip, difficulty === d && styles.chipOn]}
            >
              <Text style={styles.chipText}>{d === 'easy' ? 'Fácil' : 'Media'}</Text>
            </Pressable>
          ))}
        </View>

        {evolutive ? (
          <>
            <Text style={styles.label}>Loadout (elige 1)</Text>
            {LOADOUTS.map((l) => (
              <Pressable
                key={l.id}
                onPress={() => setLoadout(l.id)}
                style={[styles.loadout, loadout === l.id && styles.loadoutOn]}
              >
                <Text style={styles.cardTitle}>
                  {l.id}. {l.title}
                </Text>
                <Text style={styles.cardBody}>{l.description}</Text>
              </Pressable>
            ))}
          </>
        ) : null}

        <PrimaryButton label="Empezar" onPress={start} style={{ marginTop: spacing.lg }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  pad: { flex: 1, padding: spacing.lg, gap: spacing.sm },
  title: { ...typography.title, color: colors.text, marginTop: spacing.md },
  sub: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.md },
  label: { ...typography.body, color: colors.text, fontWeight: '700', marginTop: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  chipOn: { backgroundColor: colors.accent },
  chipText: { color: colors.text, fontWeight: '700' },
  loadout: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  loadoutOn: { borderWidth: 1, borderColor: colors.accentSecondary },
  cardTitle: { color: colors.text, fontWeight: '700' },
  cardBody: { color: colors.textMuted, marginTop: 4 },
});
