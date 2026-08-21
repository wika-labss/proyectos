import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { GameScreen } from '../../src/components/GameScreen';
import { AiDifficulty } from '../../src/engine';

export default function QuickPlayRoute() {
  const params = useLocalSearchParams<{ difficulty?: string }>();
  const difficulty: AiDifficulty = params.difficulty === 'medium' ? 'medium' : 'easy';
  return <GameScreen title="Partida rápida" difficulty={difficulty} mode="quick" />;
}
