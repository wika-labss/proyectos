import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  unseenCount,
  type CreatePetInput,
  type FindAlert,
  type Pet,
} from '../engine';
import { DEFAULT_API_URL, apiRequest, validateApiBase } from '../modules/api-client';

const API_KEY = 'mypet:v1:apiBase';

type PetContextValue = {
  ready: boolean;
  apiBaseUrl: string;
  pets: Pet[];
  alerts: FindAlert[];
  error: string | null;
  unseen: number;
  setApiBaseUrl: (url: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  createPet: (input: CreatePetInput) => Promise<Pet | null>;
  clearError: () => void;
};

const PetContext = createContext<PetContextValue | null>(null);

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [apiBaseUrl, setApiBase] = useState(DEFAULT_API_URL);
  const [pets, setPets] = useState<Pet[]>([]);
  const [alerts, setAlerts] = useState<FindAlert[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [petsRes, alertsRes] = await Promise.all([
        apiRequest<{ pets: Pet[] }>(apiBaseUrl, '/api/pets'),
        apiRequest<{ alerts: FindAlert[] }>(apiBaseUrl, '/api/alerts'),
      ]);
      setPets(petsRes.pets);
      setAlerts(alertsRes.alerts);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo contactar la API de prueba';
      setError(
        `${message}. Arranca la web con npm run web y revisa la URL en Ajustes (ahora ${apiBaseUrl}).`,
      );
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await AsyncStorage.getItem(API_KEY);
      if (!cancelled && stored) {
        const valid = validateApiBase(stored);
        if (valid) setApiBase(valid);
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void refresh();
    const id = setInterval(() => {
      void refresh();
    }, 5000);
    return () => clearInterval(id);
  }, [ready, refresh]);

  const setApiBaseUrl = useCallback(async (url: string) => {
    const valid = validateApiBase(url);
    if (!valid) {
      setError('La URL debe empezar por http:// o https://');
      return false;
    }
    await AsyncStorage.setItem(API_KEY, valid);
    setApiBase(valid);
    setError(null);
    return true;
  }, []);

  const createPet = useCallback(
    async (input: CreatePetInput) => {
      try {
        const res = await apiRequest<{ pet: Pet }>(apiBaseUrl, '/api/pets', {
          method: 'POST',
          body: JSON.stringify({
            name: input.name,
            species: input.species,
            address: input.address,
            homeLat: input.homeLat,
            homeLng: input.homeLng,
          }),
        });
        await refresh();
        return res.pet;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo registrar');
        return null;
      }
    },
    [apiBaseUrl, refresh],
  );

  const value = useMemo<PetContextValue>(
    () => ({
      ready,
      apiBaseUrl,
      pets,
      alerts,
      error,
      unseen: unseenCount({ pets, alerts }),
      setApiBaseUrl,
      refresh,
      createPet,
      clearError: () => setError(null),
    }),
    [ready, apiBaseUrl, pets, alerts, error, setApiBaseUrl, refresh, createPet],
  );

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}

export function usePets(): PetContextValue {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error('usePets must be used within PetProvider');
  return ctx;
}
