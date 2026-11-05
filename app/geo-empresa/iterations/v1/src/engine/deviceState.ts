import type { ShouldLockInput } from './types';

export function inferTelefonoEncendido(agentAlive: boolean): boolean {
  return agentAlive;
}

export function shouldLock(input: ShouldLockInput): boolean {
  return (
    input.estadoEnrollment === 'aprobado' &&
    input.politicaAutolock &&
    !input.dentroPerimetro &&
    input.esDeviceOwner
  );
}
