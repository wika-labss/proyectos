import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameBoard } from '../../../src/components/GameBoard';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { COLS, PANIC_USES_PER_LEVEL } from '../../../src/constants/game';
import { colors, fonts, spacing } from '../../../src/constants/theme';
import { getCountry, type CountryId } from '../../../src/data/countries';
import { getLevel } from '../../../src/data/levels';
import {
  createGame,
  hasValidMoves,
  trySwap,
  usePanic,
  type Cell,
  type GameState,
} from '../../../src/engine/match3Engine';
import { useProgress } from '../../../src/hooks/ProgressProvider';
import { useIdleHint } from '../../../src/modules/hint/useIdleHint';

export default function PlayScreen() {
  const { countryId, level } = useLocalSearchParams<{
    countryId: string;
    level: string;
  }>();
  const levelIndex = Number(level);
  const country = getCountry(countryId ?? '');
  const { width } = useWindowDimensions();
  const { recordVictory } = useProgress();

  const cfg = useMemo(() => {
    if (!country || Number.isNaN(levelIndex)) return null;
    return getLevel(country.id, levelIndex);
  }, [country, levelIndex]);

  const [state, setState] = useState<GameState | null>(null);
  const [selected, setSelected] = useState<Cell | null>(null);
  const [rewarded, setRewarded] = useState(false);

  useEffect(() => {
    if (!cfg) return;
    setState(
      createGame(cfg.moves, cfg.minScore, PANIC_USES_PER_LEVEL),
    );
    setSelected(null);
    setRewarded(false);
  }, [cfg]);

  // Auto-reshuffle if stuck without moves
  useEffect(() => {
    if (!state || state.status !== 'playing') return;
    if (!hasValidMoves(state.board)) {
      setState((s) => (s ? usePanic(s) : s));
    }
  }, [state]);

  const { hint, bumpActivity, clearHint } = useIdleHint(
    state?.board ?? createGame(1, 1, 0).board,
    state?.status === 'playing',
  );

  useEffect(() => {
    if (!state || state.status !== 'won' || rewarded || !country) return;
    setRewarded(true);
    void recordVictory(country.id as CountryId, levelIndex, state.score);
  }, [state, rewarded, country, levelIndex, recordVictory]);

  const cellSize = Math.floor(
    Math.min((width - 32) / COLS, 42),
  );

  if (!cfg || !country || !state) {
    return (
      <View style={styles.center}>
        <Text style={styles.hudText}>Cargando…</Text>
      </View>
    );
  }

  const onSelect = (cell: Cell) => {
    if (state.status !== 'playing') return;
    clearHint();
    bumpActivity();
    if (!selected) {
      setSelected(cell);
      return;
    }
    if (selected.r === cell.r && selected.c === cell.c) {
      setSelected(null);
      return;
    }
    const next = trySwap(state, selected, cell);
    setState(next);
    setSelected(null);
    bumpActivity();
  };

  const onPanic = () => {
    if (state.status !== 'playing') return;
    setState(usePanic(state));
    setSelected(null);
    bumpActivity();
  };

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>
        {country.name} · Nivel {cfg.levelNumber}/10
      </Text>
      <View style={styles.hud}>
        <Text style={styles.hudText}>
          Score {state.score}/{cfg.minScore}
        </Text>
        <Text style={styles.hudText}>Mov {state.movesLeft}</Text>
        <Text style={styles.hudText}>Pánico {state.panicUsesLeft}</Text>
      </View>

      <View style={styles.boardWrap}>
        <GameBoard
          board={state.board}
          selected={selected}
          hint={hint}
          cellSize={cellSize}
          onSelect={onSelect}
        />
      </View>

      {state.status === 'won' && (
        <Text style={styles.result}>¡Nivel superado! +1 recompensa</Text>
      )}
      {state.status === 'lost' && (
        <Text style={styles.result}>Sin movimientos — inténtalo de nuevo</Text>
      )}

      <View style={styles.actions}>
        <PrimaryButton
          label="Pánico"
          variant="danger"
          disabled={
            state.status !== 'playing' ||
            (state.panicUsesLeft <= 0 && hasValidMoves(state.board))
          }
          onPress={onPanic}
        />
        <PrimaryButton
          label="Salir"
          variant="ghost"
          onPress={() => router.back()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: fonts.brand,
    fontSize: 22,
    color: colors.textOnDark,
    marginBottom: 8,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  hudText: {
    color: colors.textOnDark,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  boardWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
    marginTop: spacing.md,
  },
  result: {
    textAlign: 'center',
    color: colors.accent,
    fontFamily: fonts.body,
    fontSize: 16,
    marginVertical: 8,
    fontWeight: '700',
  },
});
