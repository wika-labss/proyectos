import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { DEFAULT_AVATAR, type AvatarId } from '../constants/avatars';
import { loadAvatarId, saveAvatarId } from '../storage/avatar';

type AvatarApi = {
  avatarId: AvatarId;
  loaded: boolean;
  setAvatarId: (id: AvatarId) => void;
};

const AvatarContext = createContext<AvatarApi | null>(null);

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const [avatarId, setId] = useState<AvatarId>(DEFAULT_AVATAR);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void loadAvatarId().then((id) => {
      setId(id);
      setLoaded(true);
    });
  }, []);

  const setAvatarId = useCallback((id: AvatarId) => {
    setId(id);
    void saveAvatarId(id);
  }, []);

  return (
    <AvatarContext.Provider value={{ avatarId, loaded, setAvatarId }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar(): AvatarApi {
  const ctx = useContext(AvatarContext);
  if (!ctx) {
    throw new Error('useAvatar must be used within AvatarProvider');
  }
  return ctx;
}
