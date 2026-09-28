import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState, BackHandler, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { appConfig, type LockReason, type RegistrationRecord } from '../constants/config';
import { validatePin } from '../engine';
import {
  hideSecurityLock,
  isAirplaneModeOnNative,
  lockDevice,
  startWatchdog,
  stopLockTask,
} from '../modules/device-admin/native';
import { evaluateLockState } from '../modules/lock-engine/evaluate';
import { sendPowerStateReport } from '../modules/location-agent/task';
import {
  loadLockSnoozeUntil,
  loadLockState,
  loadPhoneOn,
  loadRegistration,
  saveLockSnoozeUntil,
  saveLockState,
  savePhoneOn,
} from '../modules/registration/store';

type MonitoringContextValue = {
  registration: RegistrationRecord | null;
  loading: boolean;
  phoneOn: boolean;
  airplaneMode: boolean;
  lockActive: boolean;
  lockReason: LockReason;
  distanciaBaseM: number;
  lastReportAt: string | null;
  lockError: string | null;
  refreshRegistration: () => Promise<void>;
  reportPowerState: (phoneOn: boolean) => Promise<void>;
  verifyPin: (pin: string) => boolean;
  unlockWithPin: (pin: string) => Promise<boolean>;
  syncLockFromStorage: () => Promise<void>;
};

const MonitoringContext = createContext<MonitoringContextValue | null>(null);

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const [registration, setRegistration] = useState<RegistrationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneOn, setPhoneOn] = useState(true);
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [lockActive, setLockActive] = useState(false);
  const [lockReason, setLockReason] = useState<LockReason>('outside_fence');
  const [distanciaBaseM, setDistanciaBaseM] = useState(0);
  const [lastReportAt, setLastReportAt] = useState<string | null>(null);
  const [lockError, setLockError] = useState<string | null>(null);

  const applyLockState = useCallback(async (active: boolean, reason: LockReason, distance: number) => {
    const snoozeUntil = await loadLockSnoozeUntil();
    const snoozed = snoozeUntil !== null && Date.now() < snoozeUntil;
    const shouldLock = active && !snoozed;

    setLockActive(shouldLock);
    setLockReason(reason);
    setDistanciaBaseM(distance);

    if (shouldLock) {
      const message =
        reason === 'airplane_mode'
          ? 'Modo avión detectado. Ingresa el PIN corporativo.'
          : reason === 'phone_off'
            ? 'El teléfono reporta estado apagado o inactivo.'
            : `Fuera del perímetro autorizado (${Math.round(distance)} m / máx ${appConfig.fenceRadiusM} m).`;
      await lockDevice('Teléfono bloqueado', message);
    } else {
      await stopLockTask();
      await hideSecurityLock();
    }
  }, []);

  const syncLockFromStorage = useCallback(async () => {
    const stored = await loadLockState();
    if (!stored) {
      setLockActive(false);
      return;
    }
    await applyLockState(stored.active, stored.reason, stored.distanciaBaseM);
  }, [applyLockState]);

  const refreshRegistration = useCallback(async () => {
    const record = await loadRegistration();
    setRegistration(record);
    setPhoneOn(await loadPhoneOn());
    await syncLockFromStorage();
    setLoading(false);
  }, [syncLockFromStorage]);

  const reportPowerState = useCallback(
    async (nextPhoneOn: boolean) => {
      setPhoneOn(nextPhoneOn);
      await savePhoneOn(nextPhoneOn);
      try {
        await sendPowerStateReport(nextPhoneOn, airplaneMode);
        setLastReportAt(new Date().toISOString());
        await syncLockFromStorage();
      } catch (error) {
        console.warn('[geo-empresa] power state report failed', error);
      }
    },
    [airplaneMode, syncLockFromStorage],
  );

  const unlockWithPin = useCallback(
    async (pin: string) => {
      if (!validatePin(pin, appConfig.defaultPin)) {
        setLockError('PIN incorrecto.');
        return false;
      }

      setLockError(null);
      await saveLockSnoozeUntil(Date.now() + appConfig.lockSnoozeMs);
      await applyLockState(false, lockReason, distanciaBaseM);
      return true;
    },
    [applyLockState, distanciaBaseM, lockReason],
  );

  useEffect(() => {
    void refreshRegistration();
  }, [refreshRegistration]);

  useEffect(() => {
    if (!registration) {
      return;
    }
    void startWatchdog();
  }, [registration]);

  useEffect(() => {
    const onAppStateChange = (next: AppStateStatus) => {
      const nextPhoneOn = next === 'active' || next === 'background';
      void reportPowerState(nextPhoneOn);
      if (next === 'active') {
        void syncLockFromStorage();
      }
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, [reportPowerState, syncLockFromStorage]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      let airplane = state.type === 'none' || state.isConnected === false;
      const nativeAirplane = await isAirplaneModeOnNative();
      if (nativeAirplane === true) {
        airplane = true;
      }
      setAirplaneMode(airplane);

      const record = await loadRegistration();
      if (!record) {
        return;
      }

      if (airplane) {
        const lockState = evaluateLockState({
          registration: record,
          lat: record.baseLat,
          lng: record.baseLng,
          telefonoEncendido: false,
          airplaneMode: true,
        });
        await saveLockState(lockState);
        await applyLockState(true, lockState.reason, lockState.distanciaBaseM);
        await sendPowerStateReport(false, true);
        setLastReportAt(new Date().toISOString());
      }
    });
    return () => unsubscribe();
  }, [applyLockState]);

  useEffect(() => {
    if (!lockActive) {
      return;
    }

    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [lockActive]);

  const value = useMemo<MonitoringContextValue>(
    () => ({
      registration,
      loading,
      phoneOn,
      airplaneMode,
      lockActive,
      lockReason,
      distanciaBaseM,
      lastReportAt,
      lockError,
      refreshRegistration,
      reportPowerState,
      verifyPin: (pin: string) => validatePin(pin, appConfig.defaultPin),
      unlockWithPin,
      syncLockFromStorage,
    }),
    [
      registration,
      loading,
      phoneOn,
      airplaneMode,
      lockActive,
      lockReason,
      distanciaBaseM,
      lastReportAt,
      lockError,
      refreshRegistration,
      reportPowerState,
      unlockWithPin,
      syncLockFromStorage,
    ],
  );

  return <MonitoringContext.Provider value={value}>{children}</MonitoringContext.Provider>;
}

export function useMonitoring(): MonitoringContextValue {
  const ctx = useContext(MonitoringContext);
  if (!ctx) {
    throw new Error('useMonitoring must be used within MonitoringProvider');
  }
  return ctx;
}
