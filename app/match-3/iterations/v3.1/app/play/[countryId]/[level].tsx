import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameBoard } from '../../../src/components/GameBoard';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import {
  COLS,
  LEVEL_TIME_MS,
  PANIC_USES_PER_LEVEL,
} from '../../../src/constants/game';
import { colors, fonts, spacing, typography } from '../../../src/constants/theme';
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
import { Match3HudChip } from '../../../src/modules/match3-ui-kit/Match3HudChip';
import { NightScreen } from '../../../src/modules/match3-visual/NightScreen';
import { PixelPanel } from '../../../src/modules/match3-visual/PixelPanel';

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

  const cellSize = Math.floor(Math.min((width - 40) / COLS, 42));

  if (!cfg || !country || !state) {
    return (
      <NightScreen>
        <View style={styles.center}>
          <Text style={styles.loading}>Cargando…</Text>
        </View>
      </NightScreen>
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

  const diffLabel = cfg.difficulty === 'easy' ? 'FÁCIL' : 'MEDIA';

  return (
    <NightScreen>
      <SafeAreaView style={styles.root}>
        <PixelPanel style={styles.header} padded={false}>
          <View style={styles.headerInner}>
            <Text style={styles.title}>
              {country.name.toUpperCase()} · NIVEL {cfg.levelNumber}/10 ·{' '}
              <Text
                style={{
                  color: cfg.difficulty === 'easy' ? colors.amigos : colors.coin,
                }}
              >
                {diffLabel}
              </Text>
            </Text>
          </View>
        </PixelPanel>

        <View style={styles.hud}>
          <Match3HudChip
            kind="score"
            label="SCORE"
            value={`${state.score}/${cfg.minScore}`}
          />
          <Match3HudChip kind="moves" label="MOVES" value={`${state.movesLeft}`} />
          <Match3HudChip kind="timer" label="TIME" value={formatTime(remainingMs)} />
          <Match3HudChip
            kind="panic"
            label="PÁNICO"
            value={`${state.panicUsesLeft}`}
          />
        </View>

        <View style={styles.boardWrap}>
          <PixelPanel padded={false}>
            <GameBoard
              board={state.board}
              selected={selected}
              hint={hint}
              clearing={clearing}
              cellSize={cellSize}
              onSelect={onSelect}
            />
          </PixelPanel>
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
            inline
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
            inline
            label="Salir"
            variant="ghost"
            onPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    </NightScreen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    color: colors.star,
    fontFamily: fonts.pixel,
    fontSize: typography.body,
  },
  header: {
    width: '100%',
  },
  headerInner: {
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.pixel,
    fontSize: 8,
    color: colors.star,
    textAlign: 'center',
  },
  hud: {
    flexDirection: 'row',
    gap: 4,
  },
  boardWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: spacing.sm,
  },
  result: {
    textAlign: 'center',
    color: colors.cyanHi,
    fontFamily: fonts.pixel,
    fontSize: 8,
    marginVertical: 4,
  },
});
