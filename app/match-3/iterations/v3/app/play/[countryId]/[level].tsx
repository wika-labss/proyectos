import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameBoard } from '../../../src/components/GameBoard';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import {
  COLS,
  LEVEL_TIME_MS,
  PANIC_USES_PER_LEVEL,
} from '../../../src/constants/game';
import { colors, fonts, spacing } from '../../../src/constants/theme';
import { getCountry, type CountryId } from '../../../src/data/countries';
import { getLevel } from '../../../src/data/levels';
import { coinsAwarded, formatTime } from '../../../src/engine/economy';
import {
  applySwapIfMatch,
  createGame,
  evaluateEnd,
  findMatches,
  hasValidMoves,
  loseByTime,
  resolveOnce,
  usePanic,
  type Cell,
  type GameState,
} from '../../../src/engine/match3Engine';
import { useProgress } from '../../../src/hooks/ProgressProvider';
import { useIdleHint } from '../../../src/modules/hint/useIdleHint';

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

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
  const [busy, setBusy] = useState(false);
  const [clearing, setClearing] = useState<Cell[]>([]);
  const [remainingMs, setRemainingMs] = useState(LEVEL_TIME_MS);
  const [payout, setPayout] = useState(0);
  const remainingRef = useRef(LEVEL_TIME_MS);
  const resolving = useRef(false);

  useEffect(() => {
    if (!cfg) return;
    setState(createGame(cfg.moves, cfg.minScore, PANIC_USES_PER_LEVEL));
    setSelected(null);
    setRewarded(false);
    setBusy(false);
    setClearing([]);
    setRemainingMs(LEVEL_TIME_MS);
    remainingRef.current = LEVEL_TIME_MS;
    setPayout(0);
  }, [cfg]);

  useEffect(() => {
    if (!state || state.status !== 'playing') return;
    const id = setInterval(() => {
      remainingRef.current = Math.max(0, remainingRef.current - 250);
      setRemainingMs(remainingRef.current);
      if (remainingRef.current <= 0 && !resolving.current) {
        setState((s) => (s ? loseByTime(s) : s));
      }
    }, 250);
    return () => clearInterval(id);
  }, [state?.status]);

  useEffect(() => {
    if (!state || state.status !== 'playing' || busy) return;
    if (!hasValidMoves(state.board)) {
      setState((s) => (s ? usePanic(s) : s));
    }
  }, [state, busy]);

  const { hint, bumpActivity, clearHint } = useIdleHint(
    state?.board ?? createGame(1, 1, 0).board,
    state?.status === 'playing' && !busy,
  );

  useEffect(() => {
    if (!state || state.status !== 'won' || rewarded || !country) return;
    setRewarded(true);
    const remainingSec = remainingRef.current / 1000;
    setPayout(coinsAwarded(remainingSec));
    void recordVictory(
      country.id as CountryId,
      levelIndex,
      state.score,
      remainingSec,
    );
  }, [state, rewarded, country, levelIndex, recordVictory]);

  const cellSize = Math.floor(Math.min((width - 32) / COLS, 42));

  if (!cfg || !country || !state) {
    return (
      <View style={styles.center}>
        <Text style={styles.hudText}>Cargando…</Text>
      </View>
    );
  }

  const runCascades = async (start: GameState) => {
    resolving.current = true;
    setBusy(true);
    let s = start;
    await delay(140);
    for (let i = 0; i < 40; i++) {
      const matches = findMatches(s.board);
      if (matches.length === 0) break;
      setClearing(matches);
      await delay(180);
      s = resolveOnce(s);
      setClearing([]);
      setState(s);
      await delay(160);
    }
    let ended = evaluateEnd(s);
    if (remainingRef.current <= 0 && ended.status === 'playing') {
      ended = loseByTime(ended);
    }
    setState(ended);
    setBusy(false);
    resolving.current = false;
    bumpActivity();
  };

  const onSelect = (cell: Cell) => {
    if (state.status !== 'playing' || busy || resolving.current) return;
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
    const swapped = applySwapIfMatch(state, selected, cell);
    setSelected(null);
    if (!swapped) return;
    setState(swapped);
    void runCascades(swapped);
  };

  const onPanic = () => {
    if (state.status !== 'playing' || busy) return;
    setState(usePanic(state));
    setSelected(null);
    bumpActivity();
  };

  const diffLabel = cfg.difficulty === 'easy' ? 'Fácil' : 'Media';

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>
        {country.name} · Nivel {cfg.levelNumber}/10 · {diffLabel}
      </Text>
      <View style={styles.hud}>
        <Text style={styles.hudText}>
          Score {state.score}/{cfg.minScore}
        </Text>
        <Text style={styles.hudText}>Mov {state.movesLeft}</Text>
        <Text style={styles.timer}>{formatTime(remainingMs)}</Text>
        <Text style={styles.hudText}>Pánico {state.panicUsesLeft}</Text>
      </View>

      <View style={styles.boardWrap}>
        <GameBoard
          board={state.board}
          selected={selected}
          hint={hint}
          clearing={clearing}
          cellSize={cellSize}
          onSelect={onSelect}
        />
      </View>

      {state.status === 'won' && (
        <Text style={styles.result}>
          ¡Nivel superado! +{payout} monedas
          {cfg.rewardOnClear ? ' · +1 regalo' : ''}
        </Text>
      )}
      {state.status === 'lost' && (
        <Text style={styles.result}>
          {remainingMs <= 0
            ? 'Se acabó el tiempo'
            : 'Sin movimientos — inténtalo de nuevo'}
        </Text>
      )}

      <View style={styles.actions}>
        <PrimaryButton
          label="Pánico"
          variant="danger"
          disabled={
            state.status !== 'playing' ||
            busy ||
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
    fontSize: 20,
    color: colors.textOnDark,
    marginBottom: 8,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: 4,
  },
  hudText: {
    color: colors.textOnDark,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  timer: {
    color: colors.accent,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '700',
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
