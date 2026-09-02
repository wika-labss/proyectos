import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  PixelRatio,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameBoard } from '../../../src/components/GameBoard';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import {
  COLS,
  LEVEL_TIME_MS,
  PANIC_USES_PER_LEVEL,
  ROWS,
} from '../../../src/constants/game';
import { colors, fonts, layout, spacing, typography } from '../../../src/constants/theme';
import { getCountry, type CountryId } from '../../../src/data/countries';
import {
  isMarriedTo,
  pickPlaySuitor,
  playLine,
} from '../../../src/data/dialogues';
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
import { Match3PlayOverlay } from '../../../src/modules/match3-ui-kit/Match3PlayOverlay';
import { NightScreen } from '../../../src/modules/match3-visual/NightScreen';
import { PixelPanel } from '../../../src/modules/match3-visual/PixelPanel';

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function snapCell(n: number): number {
  return PixelRatio.roundToNearestPixel(Math.max(16, Math.floor(n)));
}

export default function PlayScreen() {
  const { countryId, level } = useLocalSearchParams<{
    countryId: string;
    level: string;
  }>();
  const levelIndex = Number(level);
  const country = getCountry(countryId ?? '');
  const { progress, recordVictory } = useProgress();

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
  const [boardBox, setBoardBox] = useState({ w: 0, h: 0 });
  const [lineSalt, setLineSalt] = useState(0);
  const remainingRef = useRef(LEVEL_TIME_MS);
  const resolving = useRef(false);

  const playSuitor = useMemo(() => {
    if (!country) return undefined;
    const pref = progress.profile?.preference ?? 'ambos';
    return pickPlaySuitor(
      country.id,
      pref,
      progress.partnerId,
      progress.affinityBySuitor,
    );
  }, [country, progress.profile?.preference, progress.partnerId, progress.affinityBySuitor]);

  const married = playSuitor
    ? isMarriedTo(playSuitor, progress.partnerId, progress.affinityBySuitor)
    : false;

  const overlayLine = country
    ? playLine(country.id, married, lineSalt)
    : '';

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
    setLineSalt(0);
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
    if (!state || state.status !== 'playing') return;
    const id = setInterval(() => {
      setLineSalt((n) => n + 1);
    }, 8000);
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

  const cellSize = useMemo(() => {
    if (!boardBox.w || !boardBox.h) return 0;
    const chrome = layout.boardPanelChrome;
    const byW = (boardBox.w - chrome) / COLS;
    const byH = (boardBox.h - chrome) / ROWS;
    return snapCell(Math.min(byW, byH, layout.boardCellMax));
  }, [boardBox]);

  const onBoardLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBoardBox({ w: width, h: height });
  };

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
    setLineSalt((n) => n + 1);
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

        <View style={styles.playRow}>
          <View style={styles.boardWrap} onLayout={onBoardLayout}>
            <PixelPanel padded={false}>
              {cellSize > 0 ? (
                <GameBoard
                  board={state.board}
                  selected={selected}
                  hint={hint}
                  clearing={clearing}
                  cellSize={cellSize}
                  onSelect={onSelect}
                />
              ) : (
                <View style={styles.boardPlaceholder} />
              )}
            </PixelPanel>
          </View>
          {playSuitor ? (
            <Match3PlayOverlay
              countryId={playSuitor.countryId}
              slot={playSuitor.slot}
              speaker={playSuitor.name}
              line={overlayLine}
            />
          ) : null}
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
  playRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  boardWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  boardPlaceholder: {
    width: COLS * 24,
    height: ROWS * 24,
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
