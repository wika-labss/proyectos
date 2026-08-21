import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  MetaProgress,
  loadMeta,
  markTutorialDone,
  recordGame,
} from '../modules/progress';

type Ctx = {
  meta: MetaProgress;
  reload: () => Promise<void>;
  onGameEnd: (won: boolean) => Promise<void>;
  completeTutorial: () => Promise<void>;
};

const MetaContext = createContext<Ctx | null>(null);

export function MetaProvider({ children }: { children: React.ReactNode }) {
  const [meta, setMeta] = useState<MetaProgress>({
    gamesPlayed: 0,
    wins: 0,
    tutorialDone: false,
  });

  const reload = useCallback(async () => {
    setMeta(await loadMeta());
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const onGameEnd = useCallback(async (won: boolean) => {
    setMeta(await recordGame(won));
  }, []);

  const completeTutorial = useCallback(async () => {
    setMeta(await markTutorialDone());
  }, []);

  const value = useMemo(
    () => ({ meta, reload, onGameEnd, completeTutorial }),
    [meta, reload, onGameEnd, completeTutorial],
  );

  return <MetaContext.Provider value={value}>{children}</MetaContext.Provider>;
}

export function useMeta() {
  const ctx = useContext(MetaContext);
  if (!ctx) throw new Error('useMeta requires MetaProvider');
  return ctx;
}
