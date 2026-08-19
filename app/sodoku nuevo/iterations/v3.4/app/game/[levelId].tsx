import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NumberPad } from '../../src/components/NumberPad';
import { SudokuBoard } from '../../src/components/SudokuBoard';
import { formatHintsLabel } from '../../src/modules/hints';
import { colors, spacing, typography } from '../../src/modules/app-theme';
import { SodokuUiButton } from '../../src/modules/sodoku-ui-kit';
import { CuteScreenBackground, GameStatusBar } from '../../src/modules/sodoku-visual';
import { CellValue } from '../../src/types';
import { useGameStore } from '../../src/stores/gameStore';
import { useProgressStore } from '../../src/stores/progressStore';

/** Game V3.4 — layout visual-expectation */
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
    void markCompleted(levelId, useGameStore.getState().score).then((reward) => {
      router.push({
        pathname: '/victory',
        params: { levelId: String(levelId), reward },
      });
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
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.meta}>Preparando nivel {levelId}…</Text>
      </View>
    );
  }

  const hintsLabel = formatHintsLabel(hintsLeft);

  return (
    <CuteScreenBackground variant="game">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GameStatusBar levelId={levelId} score={score} hintsLabel={hintsLabel} />
        <View style={styles.boardWrap}>
          <SudokuBoard
            board={board}
            givens={givens}
            selected={selected}
            conflicts={conflicts}
            onSelect={selectCell}
          />
        </View>
        <NumberPad variant="v4" onPress={onPlace} onClear={clearCell} />
        <SodokuUiButton label={`Pista (${hintsLabel})`} variant="actionBar" onPress={onHint} />
        <SodokuUiButton
          label="Reiniciar nivel"
          variant="actionBarSecondary"
          onPress={() => void resetLevel()}
        />
      </ScrollView>
    </CuteScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  meta: { color: colors.text, fontSize: typography.body, fontWeight: '700' },
  boardWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.active,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
});
