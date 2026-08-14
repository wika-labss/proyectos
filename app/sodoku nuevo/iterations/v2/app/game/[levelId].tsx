import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { NumberPad } from '../../src/components/NumberPad';
import { SudokuBoard } from '../../src/components/SudokuBoard';
import { colors, spacing, typography } from '../../src/modules/app-theme';
import { CellValue } from '../../src/types';
import { useGameStore } from '../../src/stores/gameStore';
import { useProgressStore } from '../../src/stores/progressStore';

export default function GameScreen() {
  const { levelId: levelParam } = useLocalSearchParams<{ levelId: string }>();
  const levelId = Number(levelParam);

  const board = useGameStore((s) => s.board);
  const givens = useGameStore((s) => s.givens);
  const selected = useGameStore((s) => s.selected);
  const conflicts = useGameStore((s) => s.conflicts);
  const score = useGameStore((s) => s.score);
  const hintsLeft = useGameStore((s) => s.hintsLeft);
  const loading = useGameStore((s) => s.loading);
  const startLevel = useGameStore((s) => s.startLevel);
  const resetLevel = useGameStore((s) => s.resetLevel);
  const selectCell = useGameStore((s) => s.selectCell);
  const placeNumber = useGameStore((s) => s.placeNumber);
  const useHint = useGameStore((s) => s.useHint);
  const clearCell = useGameStore((s) => s.clearCell);
  const markCompleted = useProgressStore((s) => s.markCompleted);

  useEffect(() => {
    if (!Number.isFinite(levelId) || levelId < 1) return;
    void startLevel(levelId);
  }, [levelId, startLevel]);

  const goVictory = () => {
    void markCompleted(levelId, useGameStore.getState().score).then(() => {
      router.push({ pathname: '/victory', params: { levelId: String(levelId) } });
    });
  };

  const onPlace = (value: CellValue) => {
    const result = placeNumber(value);
    if (result.won) goVictory();
  };

  const onHint = () => {
    const ok = useHint();
    if (ok && useGameStore.getState().won) goVictory();
  };

  if (loading || !board || !givens) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.text} />
        <Text style={styles.meta}>Validando puzzle nivel {levelId}…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.meta}>Nivel {levelId}</Text>
        <Text style={styles.meta}>Puntaje: {score}</Text>
        <Text style={styles.meta}>Pistas: {hintsLeft}/3</Text>
      </View>
      <SudokuBoard
        board={board}
        givens={givens}
        selected={selected}
        conflicts={conflicts}
        onSelect={selectCell}
      />
      <NumberPad onPress={onPlace} onClear={clearCell} />
      <Pressable
        style={[styles.action, hintsLeft <= 0 && styles.disabled]}
        onPress={onHint}
        disabled={hintsLeft <= 0}
      >
        <Text style={styles.actionText}>Pista ({hintsLeft})</Text>
      </Pressable>
      <Pressable style={styles.action} onPress={() => void resetLevel()}>
        <Text style={styles.actionText}>Reiniciar nivel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  meta: { color: colors.text, fontSize: typography.body, fontWeight: '600' },
  action: {
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  disabled: { opacity: 0.4 },
  actionText: { color: colors.text, fontSize: typography.body, fontWeight: '700' },
});
