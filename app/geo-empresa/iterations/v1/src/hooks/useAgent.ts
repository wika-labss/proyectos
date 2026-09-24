import { useEffect, useState } from 'react';
import { obtenerDispositivo, reportarPolitica } from '../engine';
import type { DispositivoSnapshot } from '../engine';
import { startCommandLoop } from '../modules/command-agent';
import { ensureResetPasswordToken, getPolicyStatus } from '../modules/device-policy';
import { requestLocationPermission, startLocationLoop } from '../modules/location-agent';
import { loadRegistration, type RegistrationRecord } from '../modules/registration/store';

export function useAgent() {
  const [registration, setRegistration] = useState<RegistrationRecord | null>(null);
  const [snapshot, setSnapshot] = useState<DispositivoSnapshot | null>(null);
  const [owner, setOwner] = useState(false);
  const [adminActive, setAdminActive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const rec = await loadRegistration();
      if (!alive) return;
      setRegistration(rec);
      setLoaded(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!registration?.fingerprint) return undefined;
    let stopLoc: (() => void) | undefined;
    let stopCmd: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      const policy = getPolicyStatus();
      if (cancelled) return;
      setOwner(policy.isDeviceOwner);
      setAdminActive(policy.isAdminActive);
      try {
        await ensureResetPasswordToken();
        await reportarPolitica({
          fingerprint: registration.fingerprint,
          esDeviceOwner: policy.isDeviceOwner,
          adminActivo: policy.isAdminActive,
        });
        const snap = await obtenerDispositivo(registration.fingerprint);
        if (!cancelled) setSnapshot(snap);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error de red');
        }
      }
      const ok = await requestLocationPermission();
      if (!ok || cancelled) return;
      stopLoc = startLocationLoop(registration.fingerprint);
      stopCmd = startCommandLoop(registration.fingerprint);
    })();

    return () => {
      cancelled = true;
      stopLoc?.();
      stopCmd?.();
    };
  }, [registration?.fingerprint]);

  return { registration, snapshot, owner, adminActive, loaded, error, setRegistration };
}
