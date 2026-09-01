import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { AvatarId } from '../data/avatarIds';
import type { CountryId } from '../data/countries';
import type { Preference } from '../data/suitors';
import {
  applyVictory,
  defaultProgress,
  giveGift,
  loadProgress,
  saveProfile as persistProfile,
  saveProgress,
  travelToNextCountry,
  updateAvatar as persistAvatar,
  type ProgressState,
} from '../modules/progress/progressStore';

type ProgressContextValue = {
  progress: ProgressState;
  ready: boolean;
  refresh: () => Promise<void>;
  recordVictory: (
    countryId: CountryId,
    levelIndex: number,
    score: number,
    remainingSec: number,
  ) => Promise<ProgressState>;
  completeProfile: (
    username: string,
    preference: Preference,
    avatarId: AvatarId,
  ) => Promise<ProgressState>;
  changeAvatar: (avatarId: AvatarId) => Promise<ProgressState>;
  sendGift: (suitorId: string, rewardId: string) => Promise<ProgressState>;
  travel: () => Promise<ProgressState>;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(defaultProgress());
  const [ready, setReady] = useState(false);

  const persist = useCallback(async (next: ProgressState) => {
    setProgress(next);
    await saveProgress(next);
    return next;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const p = await loadProgress();
      setProgress(p);
    } catch {
      setProgress(defaultProgress());
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const recordVictory = useCallback(
    async (
      countryId: CountryId,
      levelIndex: number,
      score: number,
      remainingSec: number,
    ) => {
      return persist(
        applyVictory(progress, countryId, levelIndex, score, remainingSec),
      );
    },
    [persist, progress],
  );

  const completeProfile = useCallback(
    async (
      username: string,
      preference: Preference,
      avatarId: AvatarId,
    ) => {
      return persist(persistProfile(progress, username, preference, avatarId));
    },
    [persist, progress],
  );

  const changeAvatar = useCallback(
    async (avatarId: AvatarId) => {
      return persist(persistAvatar(progress, avatarId));
    },
    [persist, progress],
  );

  const sendGift = useCallback(
    async (suitorId: string, rewardId: string) => {
      return persist(giveGift(progress, suitorId, rewardId));
    },
    [persist, progress],
  );

  const travel = useCallback(async () => {
    return persist(travelToNextCountry(progress));
  }, [persist, progress]);

  const value = useMemo(
    () => ({
      progress,
      ready,
      refresh,
      recordVictory,
      completeProfile,
      changeAvatar,
      sendGift,
      travel,
    }),
    [
      progress,
      ready,
      refresh,
      recordVictory,
      completeProfile,
      changeAvatar,
      sendGift,
      travel,
    ],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress outside ProgressProvider');
  return ctx;
}
