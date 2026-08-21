import React, { useCallback, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChessBoard } from '../../src/components/ChessBoard';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors, spacing, typography } from '../../src/constants/theme';
import {
  AiDifficulty,
  applyMove,
  chooseAiMove,
  createInitialState,
  getLegalMoves,
  GameState,
  Move,
  Square,
} from '../../src/engine';
import { useMeta } from '../../src/hooks/MetaProvider';

export default function ClassicPlayScreen() {
  const { difficulty: raw } = useLocalSearchParams<{ difficulty?: string }>();
  const difficulty: AiDifficulty = raw === 'medium' ? 'medium' : 'easy';
  const { onGameEnd } = useMeta();
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [selected, setSelected] = useState<Square | null>(null);
  const [thinking, setThinking] = useState(false);

  const legal = useMemo(() => {
    if (selected === null || state.sideToMove !== 'w') return [] as Move[];
    return getLegalMoves(state, selected);
  }, [selected, state]);

  const finish = useCallback(
    async (next: GameState) => {
      if (next.status === 'checkmate' || next.status === 'stalemate' || next.status === 'draw') {
        const outcome =
          next.status === 'checkmate' ? (next.winner === 'w' ? 'win' : 'loss') : 'draw';
        await onGameEnd(outcome === 'win');
        router.replace({
          pathname: '/result',
          params: { outcome, mode: 'classic', difficulty },
        });
      }
    },
    [difficulty, onGameEnd],
  );

  const playAi = useCallback(
    (current: GameState) => {
      setThinking(true);
      setTimeout(() => {
        const move = chooseAiMove(current, difficulty);
        if (!move) {
          setThinking(false);
          void finish(current);
          return;
        }
        const next = applyMove(current, move);
        setState(next);
        setThinking(false);
        void finish(next);
      }, 100);
    },
    [difficulty, finish],
  );

  const onPressSquare = (square: Square) => {
    if (thinking || state.sideToMove !== 'w') return;
    if (state.status === 'checkmate' || state.status === 'stalemate' || state.status === 'draw') {
      return;
    }
    const piece = state.board[square];
    if (selected === null) {
      if (piece?.color === 'w') setSelected(square);
      return;
    }
    if (square === selected) {
      setSelected(null);
      return;
    }
    const move = legal.find((m) => m.to === square);
    if (!move) {
      if (piece?.color === 'w') setSelected(square);
      else setSelected(null);
      return;
    }
    const next = applyMove(state, move);
    setSelected(null);
    setState(next);
    if (next.status === 'playing' || next.status === 'check') {
      if (next.sideToMove === 'b') playAi(next);
      else void finish(next);
    } else void finish(next);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <PrimaryButton label="← Salir" variant="secondary" onPress={() => router.replace('/')} />
        <Text style={styles.title}>Clásico</Text>
        <Text style={styles.sub}>
          {thinking ? 'IA pensando…' : state.status === 'check' ? 'Jaque' : 'Tu turno'} ·{' '}
          {difficulty === 'easy' ? 'Fácil' : 'Media'}
        </Text>
      </View>
      <ChessBoard
        board={state.board}
        selected={selected}
        legalTargets={legal.map((m) => m.to)}
        onPressSquare={onPressSquare}
        showNodes={false}
        disabled={thinking}
      />
      {thinking ? <ActivityIndicator color={colors.accent} style={{ marginTop: 12 }} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, gap: spacing.sm },
  title: { ...typography.title, color: colors.text },
  sub: { ...typography.caption, color: colors.textMuted },
});
