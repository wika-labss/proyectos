import React, { createContext, useContext } from 'react';
import { SnakeGameApi, useSnakeGame } from '../hooks/useSnakeGame';

const GameContext = createContext<SnakeGameApi | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const api = useSnakeGame();
  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}

export function useGame(): SnakeGameApi {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within GameProvider');
  }
  return ctx;
}
