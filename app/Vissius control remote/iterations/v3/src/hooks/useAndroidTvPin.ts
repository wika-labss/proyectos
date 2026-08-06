import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getAndroidTvCert,
  setAndroidTvPinProvider,
} from '../engine/drivers/androidTvDriver';
import { saveAndroidTvCert } from '../utils/storage';
import type { TvDevice } from '../types';

/** API única para PIN Android TV — la UI no importa el engine directo. */
export function useAndroidTvPin() {
  const [pinVisible, setPinVisible] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const pinResolver = useRef<((code: string) => void) | null>(null);

  useEffect(() => {
    setAndroidTvPinProvider(
      () =>
        new Promise<string>((resolve) => {
          setPinValue('');
          setPinVisible(true);
          pinResolver.current = resolve;
        }),
    );
    return () => setAndroidTvPinProvider(null);
  }, []);

  const submitPin = useCallback(() => {
    const code = pinValue.trim().toUpperCase();
    setPinVisible(false);
    pinResolver.current?.(code);
    pinResolver.current = null;
  }, [pinValue]);

  const cancelPin = useCallback(() => {
    setPinVisible(false);
    pinResolver.current?.('');
    pinResolver.current = null;
  }, []);

  const persistCertIfNeeded = useCallback(async (device: TvDevice) => {
    if (device.protocol !== 'androidtv') {
      return;
    }
    const cert = getAndroidTvCert(device.id);
    if (cert) {
      await saveAndroidTvCert(device.id, cert);
    }
  }, []);

  return {
    pinVisible,
    pinValue,
    setPinValue,
    submitPin,
    cancelPin,
    persistCertIfNeeded,
  };
}
