import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { GameScreen } from '../../src/components/GameScreen';
import { getBattle } from '../../src/data/battles';
import { useProgress } from '../../src/hooks/ProgressProvider';

export default function CampaignBattleRoute() {
  const { battleId: raw } = useLocalSearchParams<{ battleId: string }>();
  const battleId = Number(raw);
  const battle = getBattle(battleId);
  const { progress } = useProgress();

  if (!battle || Number.isNaN(battleId)) {
    return <Redirect href="/campaign" />;
  }
  if (battleId > progress.maxUnlockedBattle) {
    return <Redirect href="/campaign" />;
  }

  return (
    <GameScreen
      title={battle.title}
      difficulty={battle.difficulty}
      mode="campaign"
      battleId={battle.battleId}
    />
  );
}
