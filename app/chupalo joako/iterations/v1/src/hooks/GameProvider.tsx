import React, { createContext, useContext } from 'react';
import { TetrisGameApi, useTetrisGame } from './useTetrisGame';

const GameContext = createContext<TetrisGameApi | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const api = useTetrisGame();
  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}

export function useGame(): TetrisGameApi {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within GameProvider');
  }
  return ctx;
}
