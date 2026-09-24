import { config } from '../../constants/config';
import { acusarComando, obtenerComandoPendiente } from '../../engine';
import {
  getPolicyStatus,
  lockNow,
  reboot,
  resetPin,
} from '../device-policy';

export async function processPendingCommand(fingerprint: string): Promise<void> {
  const cmd = await obtenerComandoPendiente(fingerprint);
  if (!cmd) return;

  const policy = getPolicyStatus();
  try {
    switch (cmd.tipo) {
      case 'lock':
        if (!policy.isAdminActive && !policy.isDeviceOwner) {
          throw new Error('Admin no activo');
        }
        lockNow();
        break;
      case 'unlock_policy':
        break;
      case 'reset_pin': {
        const pin = cmd.payload?.pin;
        if (!pin) throw new Error('PIN ausente');
        if (!policy.isDeviceOwner) throw new Error('Requiere Device Owner');
        await resetPin(pin);
        break;
      }
      case 'reboot':
        if (!policy.isDeviceOwner) throw new Error('Requiere Device Owner');
        reboot();
        break;
      default:
        throw new Error(`Tipo desconocido: ${cmd.tipo}`);
    }
    await acusarComando({ comandoId: cmd.id, fingerprint, ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'error';
    await acusarComando({ comandoId: cmd.id, fingerprint, ok: false, error: message });
  }
}

export function startCommandLoop(fingerprint: string): () => void {
  let cancelled = false;
  const run = async () => {
    if (cancelled) return;
    try {
      await processPendingCommand(fingerprint);
    } catch {
      // siguiente ciclo
    }
  };
  void run();
  const id = setInterval(() => {
    void run();
  }, config.commandIntervalMs);
  return () => {
    cancelled = true;
    clearInterval(id);
  };
}
