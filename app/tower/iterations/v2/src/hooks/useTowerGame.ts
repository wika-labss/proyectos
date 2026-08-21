import { useCallback, useEffect, useRef, useState } from 'react';
import { LEVEL_COUNT } from '../constants/game';
import {
  createLevel,
  onLevelWon,
  placeTower,
  startNextWave,
  startWaves,
  step,
} from '../engine';
import type { CampaignProgress, TdState, TowerKind } from '../engine/types';
import { loadCampaign, saveCampaign } from '../storage/offlineProgress';

const TICK_MS = 50;

export type TowerGameApi = {
  campaign: CampaignProgress;
  campaignLoaded: boolean;
  refreshCampaign: () => Promise<void>;
  run: TdState | null;
  selectedTower: TowerKind | null;
  paused: boolean;
  lastResult: 'victory' | 'defeat' | 'campaign' | null;
  startLevel: (level: number) => void;
  selectTower: (kind: TowerKind | null) => void;
  tryPlace: (padId: string) => void;
  beginWaves: () => void;
  togglePause: () => void;
  resume: () => void;
  nextWave: () => void;
  clearResult: () => void;
};

export function useTowerGame(): TowerGameApi {
  const [campaign, setCampaign] = useState<CampaignProgress>({
    maxUnlockedLevel: 1,
    campaignComplete: false,
  });
  const [campaignLoaded, setCampaignLoaded] = useState(false);
  const [run, setRun] = useState<TdState | null>(null);
  const [selectedTower, setSelectedTower] = useState<TowerKind | null>(null);
  const [paused, setPaused] = useState(false);
  const [lastResult, setLastResult] = useState<
    'victory' | 'defeat' | 'campaign' | null
  >(null);
  const runRef = useRef<TdState | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    runRef.current = run;
  }, [run]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const refreshCampaign = useCallback(async () => {
    const c = await loadCampaign();
    setCampaign(c);
    setCampaignLoaded(true);
  }, []);

  useEffect(() => {
    void refreshCampaign();
  }, [refreshCampaign]);

  const startLevel = useCallback((level: number) => {
    const idx = Math.max(0, Math.min(LEVEL_COUNT - 1, level - 1));
    const state = createLevel(idx, Date.now());
    setRun(state);
    setPaused(false);
    setSelectedTower(null);
    setLastResult(null);
  }, []);

  const selectTower = useCallback((kind: TowerKind | null) => {
    setSelectedTower(kind);
  }, []);

  const tryPlace = useCallback(
    (padId: string) => {
      const current = runRef.current;
      if (!current || !selectedTower) return;
      const result = placeTower(current, selectedTower, padId);
      if (result.ok) {
        setRun(result.state);
      }
    },
    [selectedTower],
  );

  const beginWaves = useCallback(() => {
    const current = runRef.current;
    if (!current) return;
    setRun(startWaves(current, Date.now()));
  }, []);

  const togglePause = useCallback(() => setPaused((p) => !p), []);
  const resume = useCallback(() => setPaused(false), []);

  const nextWave = useCallback(() => {
    const current = runRef.current;
    if (!current) return;
    setRun(startNextWave(current, Date.now()));
  }, []);

  const clearResult = useCallback(() => setLastResult(null), []);

  useEffect(() => {
    const id = setInterval(() => {
      const current = runRef.current;
      if (!current || pausedRef.current) return;
      if (current.status !== 'playing') return;

      const { state, events } = step(current, TICK_MS);
      setRun(state);

      if (
        events.some((e) => e.type === 'levelLost') ||
        state.status === 'defeat'
      ) {
        setLastResult('defeat');
      }
      if (
        events.some((e) => e.type === 'levelWon') ||
        state.status === 'levelVictory'
      ) {
        const levelNum = state.levelIndex + 1;
        void (async () => {
          const prev = await loadCampaign();
          const next = onLevelWon(levelNum, prev);
          await saveCampaign(next);
          setCampaign(next);
          setLastResult(levelNum >= LEVEL_COUNT ? 'campaign' : 'victory');
        })();
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  return {
    campaign,
    campaignLoaded,
    refreshCampaign,
    run,
    selectedTower,
    paused,
    lastResult,
    startLevel,
    selectTower,
    tryPlace,
    beginWaves,
    togglePause,
    resume,
    nextWave,
    clearResult,
  };
}
