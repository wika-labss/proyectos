import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { CountryId } from '../data/countries';
import {
  applyVictory,
  defaultProgress,
  loadProgress,
  saveProgress,
  type ProgressState,
} from '../modules/progress/progressStore';

type ProgressContextValue = {
  progress: ProgressState;
  ready: boolean;
  refresh: () => Promise<void>;
  recordVictory: (
    countryId: CountryId,
    levelIndex: number,
    score: number,
  ) => Promise<ProgressState>;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(defaultProgress());
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const p = await loadProgress();
    setProgress(p);
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const recordVictory = useCallback(
    async (countryId: CountryId, levelIndex: number, score: number) => {
      const next = applyVictory(progress, countryId, levelIndex, score);
      setProgress(next);
      await saveProgress(next);
      return next;
    },
    [progress],
  );

  const value = useMemo(
    () => ({ progress, ready, refresh, recordVictory }),
    [progress, ready, refresh, recordVictory],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress outside ProgressProvider');
  return ctx;
}
