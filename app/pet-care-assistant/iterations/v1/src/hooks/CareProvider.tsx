import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  addPreventiveInState,
  createPetInState,
  deletePetInState,
  emptyState,
  getActivePet,
  getDaySummary,
  logBathroom,
  logFeed,
  logNote,
  logWalk,
  removePreventiveInState,
  selectPet,
  setPetHealth,
  toLocalDateKey,
  updatePetInState,
  type AppState,
  type BathroomPayload,
  type CreatePetInput,
  type FeedPayload,
  type NotePayload,
  type SetHealthInput,
  type WalkPayload,
  type AddPreventiveInput,
} from '../engine';
import { clearState, loadState, saveState } from '../modules/offline-store';

type CareContextValue = {
  ready: boolean;
  corrupt: boolean;
  state: AppState;
  error: string | null;
  clearError: () => void;
  resetCorrupt: () => Promise<void>;
  createPet: (input: CreatePetInput) => boolean;
  selectPet: (petId: string) => boolean;
  updatePet: (petId: string, patch: Parameters<typeof updatePetInState>[2]) => boolean;
  deletePet: (petId: string) => boolean;
  logFeed: (payload: FeedPayload, at?: string) => boolean;
  logBathroom: (payload: BathroomPayload, at?: string) => boolean;
  logWalk: (payload: WalkPayload, at?: string) => boolean;
  logNote: (payload: NotePayload, at?: string) => boolean;
  setHealth: (input: SetHealthInput) => boolean;
  addPreventive: (input: Omit<AddPreventiveInput, 'petId'> & { petId?: string }) => boolean;
  removePreventive: (id: string) => boolean;
  todayKey: string;
};

const CareContext = createContext<CareContextValue | null>(null);

function apply(
  setState: React.Dispatch<React.SetStateAction<AppState>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  result: { ok: true; state: AppState } | { ok: false; error: { message: string } },
): boolean {
  if (!result.ok) {
    setError(result.error.message);
    return false;
  }
  setState(result.state);
  void saveState(result.state);
  setError(null);
  return true;
}

export function CareProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState());
  const [ready, setReady] = useState(false);
  const [corrupt, setCorrupt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const todayKey = toLocalDateKey();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadState();
      if (cancelled) return;
      setState(loaded.state);
      setCorrupt(!loaded.ok && loaded.corrupt);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const requireActivePetId = useCallback((): string | null => {
    const pet = getActivePet(state);
    if (!pet) {
      setError('Crea o selecciona una mascota primero');
      return null;
    }
    return pet.id;
  }, [state]);

  const value = useMemo<CareContextValue>(
    () => ({
      ready,
      corrupt,
      state,
      error,
      clearError: () => setError(null),
      resetCorrupt: async () => {
        await clearState();
        const fresh = emptyState();
        setState(fresh);
        setCorrupt(false);
        setError(null);
      },
      createPet: (input) => apply(setState, setError, createPetInState(state, input)),
      selectPet: (petId) => apply(setState, setError, selectPet(state, petId)),
      updatePet: (petId, patch) =>
        apply(setState, setError, updatePetInState(state, petId, patch)),
      deletePet: (petId) => apply(setState, setError, deletePetInState(state, petId)),
      logFeed: (payload, at) => {
        const petId = requireActivePetId();
        if (!petId) return false;
        return apply(setState, setError, logFeed(state, { petId, payload, at }));
      },
      logBathroom: (payload, at) => {
        const petId = requireActivePetId();
        if (!petId) return false;
        return apply(setState, setError, logBathroom(state, { petId, payload, at }));
      },
      logWalk: (payload, at) => {
        const petId = requireActivePetId();
        if (!petId) return false;
        return apply(setState, setError, logWalk(state, { petId, payload, at }));
      },
      logNote: (payload, at) => {
        const petId = requireActivePetId();
        if (!petId) return false;
        return apply(setState, setError, logNote(state, { petId, payload, at }));
      },
      setHealth: (input) => {
        const petId = requireActivePetId();
        if (!petId) return false;
        return apply(setState, setError, setPetHealth(state, petId, input));
      },
      addPreventive: (input) => {
        const petId = input.petId ?? requireActivePetId();
        if (!petId) return false;
        return apply(
          setState,
          setError,
          addPreventiveInState(state, { ...input, petId }),
        );
      },
      removePreventive: (id) =>
        apply(setState, setError, removePreventiveInState(state, id)),
      todayKey,
    }),
    [ready, corrupt, state, error, todayKey, requireActivePetId],
  );

  return <CareContext.Provider value={value}>{children}</CareContext.Provider>;
}

export function useCare(): CareContextValue {
  const ctx = useContext(CareContext);
  if (!ctx) throw new Error('useCare must be used within CareProvider');
  return ctx;
}

export function useActiveDaySummary() {
  const { state, todayKey } = useCare();
  const pet = getActivePet(state);
  if (!pet) return null;
  return getDaySummary(state, pet.id, todayKey);
}
