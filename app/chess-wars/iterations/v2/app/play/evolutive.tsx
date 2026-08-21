import React, { useCallback, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChessBoard } from '../../src/components/ChessBoard';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors, spacing, typography } from '../../src/constants/theme';
import {
  AiDifficulty,
  EvolutiveState,
  LoadoutId,
  Move,
  Square,
  squareKey,
} from '../../src/engine';
import { evolution } from '../../src/engine';
import { useMeta } from '../../src/hooks/MetaProvider';

type AbilityMode = 'none' | 'drone' | 'interceptor-arm';

export default function EvolutivePlayScreen() {
  const params = useLocalSearchParams<{ difficulty?: string; loadout?: string }>();
  const difficulty: AiDifficulty = params.difficulty === 'medium' ? 'medium' : 'easy';
  const loadout: LoadoutId = params.loadout === 'B' ? 'B' : 'A';
  const { meta, onGameEnd, completeTutorial } = useMeta();

  const [state, setState] = useState<EvolutiveState>(() =>
    evolution.createEvolutiveState(loadout),
  );
  const [selected, setSelected] = useState<Square | null>(null);
  const [thinking, setThinking] = useState(false);
  const [abilityMode, setAbilityMode] = useState<AbilityMode>('none');
  const [showTutorial, setShowTutorial] = useState(!meta.tutorialDone);

  const legal = useMemo(() => {
    if (state.pendingInterceptorFrom !== null) {
      return evolution.interceptorExtraTargets(state).map((to) => ({
        from: state.pendingInterceptorFrom!,
        to,
      })) as Move[];
    }
    if (abilityMode === 'drone' && selected !== null) {
      return evolution.droneTargets(state, selected).map((to) => ({
        from: selected,
        to,
      })) as Move[];
    }
    if (selected === null || state.base.sideToMove !== 'w') return [] as Move[];
    return evolution.filterLegalMovesFrom(state, selected);
  }, [abilityMode, selected, state]);

  const selectedRt = selected !== null ? state.pieces[squareKey(selected)] : undefined;
  const canEvo = selected !== null && evolution.canEvolve(state, selected);
  const branch =
    selected !== null && state.base.board[selected]
      ? evolution.getBranchForType(state.base.board[selected]!.type)
      : null;

  const finish = useCallback(
    async (next: EvolutiveState) => {
      const st = next.base.status;
      if (st === 'checkmate' || st === 'stalemate' || st === 'draw') {
        const outcome = st === 'checkmate' ? (next.base.winner === 'w' ? 'win' : 'loss') : 'draw';
        await onGameEnd(outcome === 'win');
        router.replace({
          pathname: '/result',
          params: { outcome, mode: 'evolutive', difficulty, loadout },
        });
      }
    },
    [difficulty, loadout, onGameEnd],
  );

  const playAi = useCallback(
    (current: EvolutiveState) => {
      setThinking(true);
      setTimeout(() => {
        const next = evolution.applyEvolutiveAiAction(current, difficulty) ?? current;
        setState(next);
        setThinking(false);
        void finish(next);
      }, 120);
    },
    [difficulty, finish],
  );

  const afterPlayer = (next: EvolutiveState) => {
    setState(next);
    setSelected(null);
    setAbilityMode('none');
    if (next.pendingInterceptorFrom !== null) {
      setSelected(next.pendingInterceptorFrom);
      return;
    }
    if (next.base.status === 'playing' || next.base.status === 'check') {
      if (next.base.sideToMove === 'b') playAi(next);
      else void finish(next);
    } else void finish(next);
  };

  const onPressSquare = (square: Square) => {
    if (thinking || state.base.sideToMove !== 'w') return;
    if (
      state.base.status === 'checkmate' ||
      state.base.status === 'stalemate' ||
      state.base.status === 'draw'
    ) {
      return;
    }

    if (state.pendingInterceptorFrom !== null) {
      const next = evolution.completeInterceptorJump(state, square);
      if (next) afterPlayer(next);
      return;
    }

    if (abilityMode === 'drone' && selected !== null) {
      const next = evolution.useDroneTeleport(state, selected, square);
      if (next) afterPlayer(next);
      return;
    }

    const piece = state.base.board[square];
    if (selected === null) {
      if (piece?.color === 'w') setSelected(square);
      return;
    }
    if (square === selected) {
      setSelected(null);
      setAbilityMode('none');
      return;
    }
    const move = legal.find((m) => m.to === square);
    if (!move) {
      if (piece?.color === 'w') {
        setSelected(square);
        setAbilityMode('none');
      } else {
        setSelected(null);
      }
      return;
    }

    const armInterceptor =
      selectedRt?.evolved === 'interceptor' &&
      selectedRt.abilityAvailable &&
      abilityMode === 'interceptor-arm';

    const next = evolution.applyEvolutiveMove(state, move, { armInterceptor });
    if (next) afterPlayer(next);
  };

  const onEvolve = () => {
    if (selected === null) return;
    const next = evolution.evolve(state, selected);
    if (next) setState(next);
  };

  const onAbility = () => {
    if (selected === null || !selectedRt?.evolved || !selectedRt.abilityAvailable) return;
    if (selectedRt.evolved === 'drone') {
      setAbilityMode('drone');
      return;
    }
    if (selectedRt.evolved === 'fortress') {
      const next = evolution.activateFortress(state, selected);
      if (next) setState(next);
      return;
    }
    if (selectedRt.evolved === 'interceptor') {
      setAbilityMode('interceptor-arm');
    }
  };

  const skipExtra = () => {
    const next = evolution.skipInterceptorExtra(state);
    afterPlayer(next);
  };

  const closeTutorial = async () => {
    await completeTutorial();
    setShowTutorial(false);
  };

  const energyPips = '◆'.repeat(state.energy) + '◇'.repeat(Math.max(0, state.maxEnergy - state.energy));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <PrimaryButton label="← Salir" variant="secondary" onPress={() => router.replace('/')} />
        <Text style={styles.title}>Evolutive Quick</Text>
        <Text style={styles.sub}>
          Energía {energyPips} ·{' '}
          {thinking
            ? 'IA…'
            : state.pendingInterceptorFrom !== null
              ? 'Segundo salto Interceptor'
              : state.base.status === 'check'
                ? 'Jaque'
                : 'Tu turno'}
        </Text>
        {selected !== null ? (
          <Text style={styles.sub}>
            Pieza XP {selectedRt?.xp ?? 0}/{evolution.XP_THRESHOLD}
            {selectedRt?.evolved ? ` · ${selectedRt.evolved}` : branch ? ` · evo→${branch}` : ''}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Evolucionar"
          variant="secondary"
          disabled={!canEvo}
          onPress={onEvolve}
          style={{ flex: 1 }}
        />
        <PrimaryButton
          label={
            abilityMode === 'drone'
              ? 'Dron: elige casilla'
              : abilityMode === 'interceptor-arm'
                ? 'Interceptor armado'
                : 'Habilidad'
          }
          variant="secondary"
          disabled={!selectedRt?.abilityAvailable}
          onPress={onAbility}
          style={{ flex: 1 }}
        />
      </View>
      {state.pendingInterceptorFrom !== null ? (
        <PrimaryButton
          label="Saltar segundo salto"
          variant="secondary"
          onPress={skipExtra}
          style={{ marginHorizontal: spacing.lg, marginBottom: spacing.sm }}
        />
      ) : null}

      <ChessBoard
        board={state.base.board}
        selected={selected}
        legalTargets={legal.map((m) => m.to)}
        onPressSquare={onPressSquare}
        showNodes
        disabled={thinking}
      />
      {thinking ? <ActivityIndicator color={colors.accent} style={{ marginTop: 12 }} /> : null}

      <Modal visible={showTutorial} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.title}>Tutorial rápido</Text>
            <Text style={styles.modalText}>
              ★ Nodos dan Energía y XP. Con 3 XP y 2 Energía puedes evolucionar peón/torre/caballo.
              Habilidades: 1 uso (Dron teleport, Fortaleza escudo, Interceptor doble salto).
            </Text>
            <PrimaryButton label="Entendido" onPress={() => void closeTutorial()} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: 4 },
  title: { ...typography.title, color: colors.text },
  sub: { ...typography.caption, color: colors.textMuted },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalText: { ...typography.body, color: colors.textMuted, lineHeight: 22 },
});
