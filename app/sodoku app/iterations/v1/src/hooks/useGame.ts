import { useCallback } from 'react';
import { getLevelConfig } from '../constants/levels';
import { useGameStore } from '../stores/gameStore';

export function useGame(levelId: number) {
  const level = getLevelConfig(levelId);
  const board = useGameStore((state) => state.board);
  const givens = useGameStore((state) => state.givens);
  const notes = useGameStore((state) => state.notes);
  const selectedCell = useGameStore((state) => state.selectedCell);
  const noteMode = useGameStore((state) => state.noteMode);
  const hintsUsed = useGameStore((state) => state.hintsUsed);
  const elapsedSeconds = useGameStore((state) => state.elapsedSeconds);
  const conflictCells = useGameStore((state) => state.conflictCells);
  const completed = useGameStore((state) => state.completed);
  const historyLength = useGameStore((state) => state.history.length);
  const redoLength = useGameStore((state) => state.redoStack.length);

  const selectCell = useGameStore((state) => state.selectCell);
  const toggleNoteMode = useGameStore((state) => state.toggleNoteMode);
  const inputNumber = useGameStore((state) => state.inputNumber);
  const clearCell = useGameStore((state) => state.clearCell);
  const undo = useGameStore((state) => state.undo);
  const redo = useGameStore((state) => state.redo);
  const useHint = useGameStore((state) => state.useHint);
  const startLevel = useGameStore((state) => state.startLevel);

  const hintsRemaining = Math.max(level.maxHints - hintsUsed, 0);

  const initialize = useCallback(async () => {
    const currentLevelId = useGameStore.getState().levelId;
    if (currentLevelId !== levelId) {
      await startLevel(levelId);
    }
  }, [levelId, startLevel]);

  return {
    level,
    board,
    givens,
    notes,
    selectedCell,
    noteMode,
    hintsUsed,
    hintsRemaining,
    elapsedSeconds,
    conflictCells,
    completed,
    canUndo: historyLength > 0,
    canRedo: redoLength > 0,
    initialize,
    selectCell,
    toggleNoteMode,
    inputNumber,
    clearCell,
    undo,
    redo,
    useHint,
  };
}
