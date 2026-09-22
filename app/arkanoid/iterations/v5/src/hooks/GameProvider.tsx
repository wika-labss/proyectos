import React, { createContext, useContext } from 'react';
import { ArkanoidGameApi, useArkanoidGame } from './useArkanoidGame';

const GameContext = createContext<ArkanoidGameApi | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const api = useArkanoidGame();
  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}

export function useGame(): ArkanoidGameApi {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within GameProvider');
  }
  return ctx;
}
