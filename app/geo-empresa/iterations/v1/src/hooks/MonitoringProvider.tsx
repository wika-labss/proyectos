import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { appConfig, type RegistrationRecord } from '../constants/config';
import { validatePin } from '../engine';
import {
  loadPhoneOn,
  loadRegistration,
  savePhoneOn,
  type LastLocation,
} from '../modules/registration/store';
import { sendPowerStateReport } from '../modules/location-agent/task';
import { isAirplaneModeOnNative } from '../modules/device-admin/native';

type MonitoringContextValue = {
  registration: RegistrationRecord | null;
  loading: boolean;
  phoneOn: boolean;
  airplaneMode: boolean;
  lastReportAt: string | null;
  refreshRegistration: () => Promise<void>;
  reportPowerState: (phoneOn: boolean) => Promise<void>;
  verifyPin: (pin: string) => boolean;
};

const MonitoringContext = createContext<MonitoringContextValue | null>(null);

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const [registration, setRegistration] = useState<RegistrationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneOn, setPhoneOn] = useState(true);
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [lastReportAt, setLastReportAt] = useState<string | null>(null);

  const refreshRegistration = useCallback(async () => {
    const record = await loadRegistration();
    setRegistration(record);
    setPhoneOn(await loadPhoneOn());
    setLoading(false);
  }, []);

  const reportPowerState = useCallback(async (nextPhoneOn: boolean) => {
    setPhoneOn(nextPhoneOn);
    await savePhoneOn(nextPhoneOn);
    try {
      await sendPowerStateReport(nextPhoneOn);
      setLastReportAt(new Date().toISOString());
    } catch (error) {
      console.warn('[geo-empresa] power state report failed', error);
    }
  }, []);

  useEffect(() => {
    void refreshRegistration();
  }, [refreshRegistration]);

  useEffect(() => {
    const onAppStateChange = (next: AppStateStatus) => {
      const nextPhoneOn = next === 'active' || next === 'background';
      void reportPowerState(nextPhoneOn);
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, [reportPowerState]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      let airplane = state.type === 'none' || state.isConnected === false;
      const nativeAirplane = await isAirplaneModeOnNative();
      if (nativeAirplane === true) {
        airplane = true;
      }
      setAirplaneMode(airplane);
      if (airplane) {
        await reportPowerState(false);
      }
    });
    return () => unsubscribe();
  }, [reportPowerState]);

  const value = useMemo<MonitoringContextValue>(
    () => ({
      registration,
      loading,
      phoneOn,
      airplaneMode,
      lastReportAt,
      refreshRegistration,
      reportPowerState,
      verifyPin: (pin: string) => validatePin(pin, appConfig.defaultPin),
    }),
    [registration, loading, phoneOn, airplaneMode, lastReportAt, refreshRegistration, reportPowerState],
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

export type { LastLocation };
