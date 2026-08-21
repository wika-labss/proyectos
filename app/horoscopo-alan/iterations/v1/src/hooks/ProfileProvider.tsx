import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { HoroscopeResponse } from '../engine';
import { fetchHoroscopeToday, HoroscopeApiError } from '../engine';
import { loadUserProfile, saveUserProfile, type UserProfile } from '../modules/user-profile';

type ProfileContextValue = {
  ready: boolean;
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => Promise<void>;
  reloadProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfileState] = useState<UserProfile | null>(null);

  const reloadProfile = useCallback(async () => {
    const stored = await loadUserProfile();
    setProfileState(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    void reloadProfile();
  }, [reloadProfile]);

  const setProfile = useCallback(async (next: UserProfile) => {
    await saveUserProfile(next);
    setProfileState(next);
  }, []);

  const value = useMemo(
    () => ({ ready, profile, setProfile, reloadProfile }),
    [ready, profile, setProfile, reloadProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return ctx;
}

type HoroscopeState = {
  data: HoroscopeResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useHoroscope(profile: UserProfile | null, enabled: boolean): HoroscopeState {
  const [data, setData] = useState<HoroscopeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!profile || !enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetchHoroscopeToday(profile.signSlug);
      setData(response);
    } catch (err) {
      if (err instanceof HoroscopeApiError) {
        setError(err.message);
      } else {
        setError('No se pudo cargar el horóscopo.');
      }
    } finally {
      setLoading(false);
    }
  }, [profile, enabled]);

  useEffect(() => {
    if (profile && enabled) {
      void refresh();
    }
  }, [profile, enabled, refresh]);

  return { data, loading, error, refresh };
}
