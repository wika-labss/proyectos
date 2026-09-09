import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameBoard } from '../../../src/components/GameBoard';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import {
  CAMEO_DELAY_MAX_MS,
  CAMEO_MS,
  COLS,
  LEVEL_TIME_MS,
  PANIC_USES_PER_LEVEL,
  ROWS,
} from '../../../src/constants/game';
import { colors, fonts, layout, spacing, typography } from '../../../src/constants/theme';
import { getCountry, type CountryId } from '../../../src/data/countries';
import { cameoBeats, pickRandomPlaySuitor } from '../../../src/data/dialogues';
import { getLevel } from '../../../src/data/levels';
import type { Suitor } from '../../../src/data/suitors';
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
import { Match3PlayCameo } from '../../../src/modules/match3-ui-kit/Match3PlayCameo';
import { NightScreen } from '../../../src/modules/match3-visual/NightScreen';

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function snapCell(n: number): number {
  return Math.max(16, Math.floor(n));
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
  const [cameo, setCameo] = useState<{
    suitor: Suitor;
    beats: [string, string, string];
    side: 'left' | 'right';
  } | null>(null);
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
    setCameo(null);
  }, [cfg]);

  useEffect(() => {
    if (!state || state.status !== 'playing' || !country) return;
    const pref = progress.profile?.preference ?? 'ambos';
    const suitor = pickRandomPlaySuitor(country.id, pref);
    if (!suitor) return;
    const startIn = Math.floor(Math.random() * CAMEO_DELAY_MAX_MS);
    const show = setTimeout(() => {
      setCameo({
        suitor,
        beats: cameoBeats(suitor),
        side: Math.random() < 0.5 ? 'left' : 'right',
      });
    }, startIn);
    const hide = setTimeout(() => setCameo(null), startIn + CAMEO_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [cfg, country, progress.profile?.preference, state?.status]);

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
    await delay(90);
    for (let i = 0; i < 40; i++) {
      const matches = findMatches(s.board);
      if (matches.length === 0) break;
      setClearing(matches);
      await delay(120);
      s = resolveOnce(s);
      setClearing([]);
      setState(s);
      await delay(110);
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

  const panicOff =
    state.status !== 'playing' ||
    busy ||
    (state.panicUsesLeft <= 0 && hasValidMoves(state.board));

  return (
    <NightScreen>
      <SafeAreaView style={styles.root}>
        <View style={styles.stage} onLayout={onBoardLayout}>
          <View style={styles.boardChrome}>
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
          </View>
        </View>

        <View pointerEvents="box-none" style={styles.hudLayer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Salir"
            onPress={() => router.back()}
            style={styles.cornerBtn}
          >
            <Text style={styles.cornerLabel}>X</Text>
          </Pressable>
          <View pointerEvents="none" style={styles.hudTextWrap}>
            <Text style={styles.hudText}>
              {state.score}/{cfg.minScore} · {formatTime(remainingMs)}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Pánico"
            disabled={panicOff}
            onPress={onPanic}
            style={[styles.cornerBtn, styles.panicBtn, panicOff && styles.cornerOff]}
          >
            <Text style={styles.panicLabel}>PÁNICO</Text>
          </Pressable>
        </View>

        {cameo && state.status === 'playing' ? (
          <Match3PlayCameo
            suitor={cameo.suitor}
            beats={cameo.beats}
            side={cameo.side}
          />
        ) : null}

        {state.status !== 'playing' ? (
          <View style={styles.endOverlay}>
            <Text style={styles.result}>
              {state.status === 'won'
                ? `¡Nivel superado! +${payout} monedas${cfg.rewardOnClear ? ' · +1 regalo' : ''}`
                : remainingMs <= 0
                  ? 'Se acabó el tiempo'
                  : 'Sin movimientos — inténtalo de nuevo'}
            </Text>
            <PrimaryButton
              large
              label="Siguiente nivel"
              disabled={state.status !== 'won' || levelIndex >= 9}
              onPress={() => {
                if (state.status !== 'won' || levelIndex >= 9) return;
                router.replace(`/play/${country.id}/${levelIndex + 1}`);
              }}
            />
            <PrimaryButton
              large
              label="Salir al mapa"
              variant="ghost"
              onPress={() => router.replace('/map')}
            />
          </View>
        ) : null}
      </SafeAreaView>
    </NightScreen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.sm,
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
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardChrome: {
    borderWidth: 2,
    borderColor: colors.cyan,
    backgroundColor: colors.nightDeep,
  },
  boardPlaceholder: {
    width: COLS * 24,
    height: ROWS * 24,
  },
  hudLayer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  hudTextWrap: {
    flex: 1,
    marginTop: 12,
  },
  hudText: {
    textAlign: 'center',
    fontFamily: fonts.pixel,
    fontSize: 8,
    color: colors.star,
  },
  cornerBtn: {
    minWidth: layout.touchMin,
    minHeight: layout.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.cyan,
    backgroundColor: colors.night,
  },
  panicBtn: {
    borderColor: colors.panic,
    paddingHorizontal: 6,
  },
  cornerOff: {
    opacity: 0.4,
  },
  cornerLabel: {
    fontFamily: fonts.pixel,
    fontSize: typography.body,
    color: colors.cyanHi,
  },
  panicLabel: {
    fontFamily: fonts.pixel,
    fontSize: 7,
    color: colors.panic,
  },
  endOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.scrim,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    zIndex: 20,
  },
  result: {
    textAlign: 'center',
    color: colors.cyanHi,
    fontFamily: fonts.pixel,
    fontSize: typography.body,
    marginBottom: spacing.sm,
  },
});
