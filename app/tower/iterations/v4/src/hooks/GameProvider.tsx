import React, { createContext, useContext } from 'react';
import { TowerGameApi, useTowerGame } from './useTowerGame';

const GameContext = createContext<TowerGameApi | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const api = useTowerGame();
  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}

export function useGame(): TowerGameApi {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within GameProvider');
  }
  return ctx;
}
