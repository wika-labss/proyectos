import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  completeRoom,
  type CampaignState,
  type RoomId,
} from '../engine/roomCampaign';
import {
  defaultProgress,
  loadProgress,
  saveProgress,
  type ProgressState,
} from '../storage/offlineProgress';

type Ctx = {
  progress: ProgressState;
  ready: boolean;
  refresh: () => Promise<void>;
  markRoomComplete: (id: RoomId) => Promise<CampaignState>;
};

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(defaultProgress());
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const p = await loadProgress();
    setProgress(p);
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const markRoomComplete = useCallback(async (id: RoomId) => {
    const nextCampaign = completeRoom(progress.campaign, id);
    const next: ProgressState = { version: 1, campaign: nextCampaign };
    setProgress(next);
    await saveProgress(next);
    return nextCampaign;
  }, [progress.campaign]);

  const value = useMemo(
    () => ({ progress, ready, refresh, markRoomComplete }),
    [progress, ready, refresh, markRoomComplete],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress(): Ctx {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress outside ProgressProvider');
  return ctx;
}
