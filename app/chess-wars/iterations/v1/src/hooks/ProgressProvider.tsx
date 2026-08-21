import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Progress, loadProgress, markBattleWon } from '../modules/progress';

type ProgressContextValue = {
  progress: Progress;
  refreshing: boolean;
  reload: () => Promise<void>;
  onBattleWon: (battleId: number) => Promise<void>;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>({ maxUnlockedBattle: 1, wins: 0 });
  const [refreshing, setRefreshing] = useState(true);

  const reload = useCallback(async () => {
    setRefreshing(true);
    const p = await loadProgress();
    setProgress(p);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const onBattleWon = useCallback(async (battleId: number) => {
    const next = await markBattleWon(battleId);
    setProgress(next);
  }, []);

  const value = useMemo(
    () => ({ progress, refreshing, reload, onBattleWon }),
    [progress, refreshing, reload, onBattleWon],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
