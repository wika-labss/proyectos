import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ActionButton } from '../../src/components/ActionButton';
import { Board } from '../../src/components/Board';
import { HintButton } from '../../src/components/HintButton';
import { NumberPad } from '../../src/components/NumberPad';
import { Timer } from '../../src/components/Timer';
import { getTheme, spacing, typography } from '../../src/constants/theme';
import { useGame } from '../../src/hooks/useGame';
import { formatTime, useTimer } from '../../src/hooks/useTimer';
import { useGameStore } from '../../src/stores/gameStore';
import { useProgressStore } from '../../src/stores/progressStore';
import { useSettingsStore } from '../../src/stores/settingsStore';

export default function GameScreen() {
  const router = useRouter();
  const { levelId: levelIdParam } = useLocalSearchParams<{ levelId: string }>();
  const levelId = Number(levelIdParam);
  const darkMode = useSettingsStore((state) => state.darkMode);
  const isLevelUnlocked = useProgressStore((state) => state.isLevelUnlocked);
  const completeLevel = useProgressStore((state) => state.completeLevel);
  const clearActiveGame = useGameStore((state) => state.clearActiveGame);
  const colors = getTheme(darkMode ? 'dark' : 'light');

  const {
    level,
    board,
    givens,
    notes,
    selectedCell,
    noteMode,
    hintsRemaining,
    elapsedSeconds,
    conflictCells,
    completed,
    canUndo,
    canRedo,
    initialize,
    selectCell,
    toggleNoteMode,
    inputNumber,
    clearCell,
    undo,
    redo,
    useHint,
  } = useGame(levelId);

  const [initialized, setInitialized] = useState(false);
  const [showVictory, setShowVictory] = useState(false);

  useTimer(initialized && !completed && !showVictory);

  useEffect(() => {
    if (!Number.isFinite(levelId) || levelId < 1 || levelId > 20) {
      router.replace('/levels');
      return;
    }

    if (!isLevelUnlocked(levelId)) {
      Alert.alert('Nivel bloqueado', 'Completa el nivel anterior para desbloquearlo.');
      router.replace('/levels');
      return;
    }

    void initialize().then(() => setInitialized(true));
  }, [initialize, isLevelUnlocked, levelId, router]);

  useEffect(() => {
    if (completed && !showVictory) {
      setShowVictory(true);
      void completeLevel(levelId, elapsedSeconds, level.maxHints - hintsRemaining);
      void clearActiveGame();
    }
  }, [
    clearActiveGame,
    completeLevel,
    completed,
    elapsedSeconds,
    hintsRemaining,
    level.maxHints,
    levelId,
    showVictory,
  ]);

  if (!initialized) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Generando puzzle...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <Text style={[styles.levelTitle, { color: colors.text }]}>{level.name}</Text>
        <Timer seconds={elapsedSeconds} colors={colors} />
        <HintButton
          remaining={hintsRemaining}
          colors={colors}
          onPress={() => {
            const success = useHint();
            if (!success) {
              Alert.alert('Sin pistas', 'No quedan pistas disponibles.');
            }
          }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Board
          board={board}
          givens={givens}
          notes={notes}
          selectedCell={selectedCell}
          conflictCells={conflictCells}
          colors={colors}
          onCellPress={selectCell}
        />

        <View style={styles.toolbar}>
          <ActionButton label="Notas" colors={colors} active={noteMode} onPress={toggleNoteMode} />
          <ActionButton label="Deshacer" colors={colors} disabled={!canUndo} onPress={undo} />
          <ActionButton label="Rehacer" colors={colors} disabled={!canRedo} onPress={redo} />
        </View>

        <NumberPad
          colors={colors}
          onNumberPress={(value) => inputNumber(value as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)}
          onClear={clearCell}
        />
      </ScrollView>

      <Modal visible={showVictory} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>¡Nivel completado!</Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Tiempo: {formatTime(elapsedSeconds)}
            </Text>
            <Text style={[styles.modalStars, { color: colors.accent }]}>★ ★ ★</Text>

            <View style={styles.modalActions}>
              {levelId < 20 ? (
                <Pressable
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setShowVictory(false);
                    router.replace(`/game/${levelId + 1}`);
                  }}
                >
                  <Text style={{ color: colors.buttonText, fontWeight: '700' }}>Siguiente nivel</Text>
                </Pressable>
              ) : null}

              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.gridLine }]}
                onPress={() => {
                  setShowVictory(false);
                  router.replace('/levels');
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>Volver a niveles</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.gridLine }]}
                onPress={() => {
                  setShowVictory(false);
                  void initialize();
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>Repetir</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  levelTitle: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  content: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.title,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalText: {
    textAlign: 'center',
    fontSize: typography.body,
  },
  modalStars: {
    textAlign: 'center',
    fontSize: 28,
  },
  modalActions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  modalButton: {
    minHeight: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
