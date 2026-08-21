import React, { useCallback, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChessBoard } from '../components/ChessBoard';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing, typography } from '../constants/theme';
import {
  AiDifficulty,
  applyMove,
  chooseAiMove,
  createInitialState,
  getLegalMoves,
  GameState,
  Move,
  Square,
} from '../engine';
import { useProgress } from '../hooks/ProgressProvider';

type Mode = 'quick' | 'campaign';

type Props = {
  title: string;
  difficulty: AiDifficulty;
  mode: Mode;
  battleId?: number;
};

export function GameScreen({ title, difficulty, mode, battleId }: Props) {
  const { onBattleWon } = useProgress();
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [selected, setSelected] = useState<Square | null>(null);
  const [thinking, setThinking] = useState(false);

  const legalFromSelected = useMemo(() => {
    if (selected === null || state.sideToMove !== 'w') return [] as Move[];
    return getLegalMoves(state, selected);
  }, [selected, state]);

  const finishIfNeeded = useCallback(
    async (next: GameState) => {
      if (next.status === 'checkmate' || next.status === 'stalemate' || next.status === 'draw') {
        const outcome =
          next.status === 'checkmate' ? (next.winner === 'w' ? 'win' : 'loss') : 'draw';
        if (mode === 'campaign' && battleId && outcome === 'win') {
          await onBattleWon(battleId);
        }
        router.replace({
          pathname: '/result',
          params: {
            outcome,
            mode,
            battleId: battleId ? String(battleId) : '',
            difficulty,
          },
        });
      }
    },
    [battleId, difficulty, mode, onBattleWon],
  );

  const playAi = useCallback(
    (current: GameState) => {
      setThinking(true);
      setTimeout(() => {
        const move = chooseAiMove(current, difficulty);
        if (!move) {
          setThinking(false);
          void finishIfNeeded(current);
          return;
        }
        const next = applyMove(current, move);
        setState(next);
        setThinking(false);
        void finishIfNeeded(next);
      }, 120);
    },
    [difficulty, finishIfNeeded],
  );

  const onPressSquare = useCallback(
    (square: Square) => {
      if (thinking || state.sideToMove !== 'w') return;
      if (
        state.status === 'checkmate' ||
        state.status === 'stalemate' ||
        state.status === 'draw'
      ) {
        return;
      }

      const piece = state.board[square];
      if (selected === null) {
        if (piece && piece.color === 'w') setSelected(square);
        return;
      }

      if (square === selected) {
        setSelected(null);
        return;
      }

      const move = legalFromSelected.find((m) => m.to === square);
      if (!move) {
        if (piece && piece.color === 'w') setSelected(square);
        else setSelected(null);
        return;
      }

      const next = applyMove(state, move);
      setSelected(null);
      setState(next);
      if (next.status === 'playing' || next.status === 'check') {
        if (next.sideToMove === 'b') playAi(next);
        else void finishIfNeeded(next);
      } else {
        void finishIfNeeded(next);
      }
    },
    [finishIfNeeded, legalFromSelected, playAi, selected, state, thinking],
  );

  const statusLabel =
    state.status === 'check'
      ? 'Jaque'
      : thinking
        ? 'IA pensando…'
        : state.sideToMove === 'w'
          ? 'Tu turno (Blancas)'
          : 'Turno Negras';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <PrimaryButton label="← Salir" variant="secondary" onPress={() => router.replace('/')} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>
          {statusLabel} · IA {difficulty === 'easy' ? 'Fácil' : 'Media'}
        </Text>
      </View>
      <ChessBoard
        board={state.board}
        selected={selected}
        legalTargets={legalFromSelected.map((m) => m.to)}
        onPressSquare={onPressSquare}
        disabled={thinking || state.sideToMove !== 'w'}
      />
      {thinking ? (
        <View style={styles.thinking}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, gap: spacing.sm },
  title: { ...typography.title, color: colors.text },
  sub: { ...typography.caption, color: colors.textMuted },
  thinking: { alignItems: 'center', marginTop: spacing.md },
});
