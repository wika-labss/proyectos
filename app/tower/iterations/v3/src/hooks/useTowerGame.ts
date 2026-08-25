import { useCallback, useEffect, useRef, useState } from 'react';
import { LEVEL_COUNT } from '../constants/game';
import {
  createLevel,
  mergeTowers,
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
  selectedPlacedId: string | null;
  mergeHint: string | null;
  paused: boolean;
  lastResult: 'victory' | 'defeat' | 'campaign' | null;
  startLevel: (level: number) => void;
  selectTower: (kind: TowerKind | null) => void;
  tryPlace: (padId: string) => void;
  onTowerPress: (towerId: string) => void;
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
  const [selectedPlacedId, setSelectedPlacedId] = useState<string | null>(null);
  const [mergeHint, setMergeHint] = useState<string | null>(null);
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
    setRun(createLevel(idx, Date.now()));
    setPaused(false);
    setSelectedTower(null);
    setSelectedPlacedId(null);
    setMergeHint(null);
    setLastResult(null);
  }, []);

  const selectTower = useCallback((kind: TowerKind | null) => {
    setSelectedTower(kind);
    setSelectedPlacedId(null);
    setMergeHint(
      kind
        ? 'Coloca en zona libre · o toca torres para fusionar'
        : null,
    );
  }, []);

  const tryPlace = useCallback(
    (padId: string) => {
      const current = runRef.current;
      if (!current || !selectedTower) return;
      const result = placeTower(current, selectedTower, padId);
      if (result.ok) {
        setRun(result.state);
        setMergeHint(null);
      }
    },
    [selectedTower],
  );

  const onTowerPress = useCallback((towerId: string) => {
    const current = runRef.current;
    if (!current) return;

    // Si hay tipo de barra seleccionado, no fusionar (prioridad colocar)
    // Fusión: primera torre → segunda compatible
    if (!selectedPlacedId) {
      setSelectedPlacedId(towerId);
      setSelectedTower(null);
      const t = current.towers.find((x) => x.id === towerId);
      setMergeHint(
        t
          ? `Fusionar: toca otra ${t.kind} Lv.${t.tier}`
          : 'Selecciona otra torre igual',
      );
      return;
    }

    if (selectedPlacedId === towerId) {
      setSelectedPlacedId(null);
      setMergeHint(null);
      return;
    }

    const result = mergeTowers(current, selectedPlacedId, towerId);
    if (result.ok) {
      setRun(result.state);
      setSelectedPlacedId(null);
      const ev = result.events.find((e) => e.type === 'towerMerged');
      setMergeHint(
        ev && ev.type === 'towerMerged'
          ? `Evolucionó a Lv.${ev.tier}`
          : 'Fusión OK',
      );
    } else {
      setMergeHint(result.reason ?? 'No se puede fusionar');
      setSelectedPlacedId(towerId);
    }
  }, [selectedPlacedId]);

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
    selectedPlacedId,
    mergeHint,
    paused,
    lastResult,
    startLevel,
    selectTower,
    tryPlace,
    onTowerPress,
    beginWaves,
    togglePause,
    resume,
    nextWave,
    clearResult,
  };
}
