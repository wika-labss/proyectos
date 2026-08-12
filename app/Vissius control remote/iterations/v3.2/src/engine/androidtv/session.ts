import { Buffer } from 'buffer';
import CryptoJS from 'crypto-js';
import TcpSocket from 'react-native-tcp-socket';
import { logExec, logFail, logOk } from '../../diagnostics/logger';
import type { PemCertificate } from './certs';
import { pairingMessages } from './pairingMessages';
import { RemoteDirection, RemoteKeyCode, remoteMessages } from './remoteMessages';

const PAIRING_PORT = 6467;
const REMOTE_PORT = 6466;

type TlsClient = ReturnType<typeof TcpSocket.connectTLS>;

function isCompleteFrame(chunks: Buffer): boolean {
  return chunks.length > 0 && chunks.readInt8(0) === chunks.length - 1;
}

function hexStringToBytes(hex: string): number[] {
  const clean = hex.replace(/\s/g, '');
  const out: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    out.push(parseInt(clean.slice(i, i + 2), 16));
  }
  return out;
}

function connectTls(
  host: string,
  port: number,
  certs: PemCertificate,
): Promise<TlsClient> {
  logExec('androidtv.tls', `connecting ${host}:${port}`);
  return new Promise((resolve, reject) => {
    const client = TcpSocket.connectTLS(
      {
        host,
        port,
        key: certs.key,
        cert: certs.cert,
      } as Parameters<typeof TcpSocket.connectTLS>[0],
      () => {
        // connected (may still handshake)
      },
    );

    const onError = (error: Error) => {
      cleanup();
      logFail('androidtv.tls', `fail ${host}:${port} ${error.message}`);
      reject(error);
    };

    const onSecure = () => {
      cleanup();
      logOk('androidtv.tls', `secure ${host}:${port}`);
      resolve(client);
    };

    const cleanup = () => {
      client.off('error', onError);
      client.off('secureConnect', onSecure);
    };

    client.on('error', onError);
    client.on('secureConnect', onSecure);

    setTimeout(() => {
      cleanup();
      logFail('androidtv.tls', `timeout ${host}:${port}`);
      reject(new Error(`Timeout TLS ${host}:${port}`));
    }, 8000);
  });
}

export async function probeAndroidTvPort(host: string, timeoutMs = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      try {
        client.destroy();
      } catch {
        // ignore
      }
      resolve(value);
    };

    const client = TcpSocket.connect(
      { host, port: PAIRING_PORT, reuseAddress: true },
      () => finish(true),
    );
    client.on('error', () => finish(false));
    setTimeout(() => finish(false), timeoutMs);
  });
}

export async function fetchCastFriendlyName(host: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    const response = await fetch(`http://${host}:8008/ssdp/device-desc.xml`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) {
      return null;
    }
    const xml = await response.text();
    const match = xml.match(/<friendlyName>([^<]+)<\/friendlyName>/i);
    return match?.[1]?.trim() ?? null;
  } catch {
    return null;
  }
}

/**
 * Emparejamiento Android TV: la TV muestra un PIN hex de 6 dígitos.
 * onNeedPin se llama cuando hay que pedir el código al usuario.
 */
export async function pairAndroidTv(
  host: string,
  certs: PemCertificate,
  onNeedPin: () => Promise<string>,
  serviceName = 'vissiuss-remote',
): Promise<boolean> {
  logExec('androidtv.pairSession', `host=${host} port=${PAIRING_PORT}`);
  const client = await connectTls(host, PAIRING_PORT, certs);
  let chunks = Buffer.from([]);

  return new Promise((resolve, reject) => {
    let settled = false;
    const done = (ok: boolean, error?: Error) => {
      if (settled) return;
      settled = true;
      try {
        client.destroy();
      } catch {
        // ignore
      }
      if (error) {
        logFail('androidtv.pairSession', error.message);
        reject(error);
      } else if (ok) {
        logOk('androidtv.pairSession', 'secret_ack');
        resolve(ok);
      } else {
        logFail('androidtv.pairSession', 'failed');
        resolve(ok);
      }
    };

    client.write(Buffer.from(pairingMessages.createPairingRequest(serviceName)));

    client.on('data', (data: Buffer | string) => {
      void (async () => {
        chunks = Buffer.concat([chunks, Buffer.from(data)]);
        if (!isCompleteFrame(chunks)) {
          return;
        }

        const message = pairingMessages.parse(chunks);
        chunks = Buffer.from([]);

        if (message.status !== pairingMessages.Status.STATUS_OK) {
          done(false, new Error(`Pairing status ${message.status}`));
          return;
        }

        if (message.pairingRequestAck) {
          client.write(Buffer.from(pairingMessages.createPairingOption()));
        } else if (message.pairingOption) {
          client.write(Buffer.from(pairingMessages.createPairingConfiguration()));
        } else if (message.pairingConfigurationAck) {
          logExec('androidtv.pairSession.pin', 'requesting_user_pin');
          const code = (await onNeedPin()).trim().toUpperCase();
          if (!code) {
            done(false, new Error('PIN cancelado'));
            return;
          }
          if (!/^[0-9A-F]{6}$/.test(code)) {
            logFail('androidtv.pairSession.pin', 'formato_invalido');
            done(false, new Error('PIN inválido (6 caracteres hex)'));
            return;
          }
          logOk('androidtv.pairSession.pin', 'formato_ok len=6');
          const ok = sendPairingSecret(client, code);
          if (!ok) {
            done(false, new Error('PIN incorrecto'));
          }
        } else if (message.pairingSecretAck) {
          done(true);
        }
      })();
    });

    client.on('error', (error: Error) => done(false, error));
    client.on('close', () => {
      if (!settled) {
        done(false, new Error('Conexión de emparejamiento cerrada'));
      }
    });
  });
}

function sendPairingSecret(client: TlsClient, code: string): boolean {
  const codeBytes = hexStringToBytes(code);
  const clientCert = client.getCertificate?.() as
    | { modulus?: string; exponent?: string }
    | undefined;
  const serverCert = client.getPeerCertificate?.() as
    | { modulus?: string; exponent?: string }
    | undefined;

  if (!clientCert?.modulus || !serverCert?.modulus) {
    // Fallback: algunos builds RN no exponen modulus; intentar con campos alternativos
    throw new Error(
      'No se pudieron leer certificados TLS. Reinstala el APK v3 (tcp-socket nativo).',
    );
  }

  const sha256 = CryptoJS.algo.SHA256.create();
  sha256.update(CryptoJS.enc.Hex.parse(clientCert.modulus));
  sha256.update(CryptoJS.enc.Hex.parse(`0${(clientCert.exponent ?? '010001').replace(/^0x/i, '')}`));
  sha256.update(CryptoJS.enc.Hex.parse(serverCert.modulus));
  sha256.update(CryptoJS.enc.Hex.parse(`0${(serverCert.exponent ?? '010001').replace(/^0x/i, '')}`));
  sha256.update(CryptoJS.enc.Hex.parse(code.slice(2)));
  const hash = sha256.finalize();
  const hashArray = hexStringToBytes(hash.toString());

  if (hashArray[0] !== codeBytes[0]) {
    client.destroy();
    return false;
  }

  client.write(Buffer.from(pairingMessages.createPairingSecret(hashArray)));
  return true;
}

export class AndroidTvRemoteSession {
  private client: TlsClient | null = null;
  private chunks = Buffer.from([]);
  private volume = 25;
  private muted = false;
  private ready = false;

  constructor(
    private host: string,
    private certs: PemCertificate,
  ) {}

  async start(): Promise<void> {
    this.client = await connectTls(this.host, REMOTE_PORT, this.certs);

    await new Promise<void>((resolve, reject) => {
      if (!this.client) {
        reject(new Error('Sin cliente TLS'));
        return;
      }

      const timeout = setTimeout(() => reject(new Error('Timeout remote ready')), 10000);

      this.client.on('data', (data: Buffer | string) => {
        this.chunks = Buffer.concat([this.chunks, Buffer.from(data)]);
        if (!isCompleteFrame(this.chunks)) {
          return;
        }
        const message = remoteMessages.parse(this.chunks);
        this.chunks = Buffer.from([]);

        if (message.remoteConfigure) {
          this.client?.write(Buffer.from(remoteMessages.createRemoteConfigure()));
          this.ready = true;
          clearTimeout(timeout);
          resolve();
        } else if (message.remoteSetActive) {
          this.client?.write(Buffer.from(remoteMessages.createRemoteSetActive(622)));
        } else if (message.remotePingRequest?.val1 != null) {
          this.client?.write(
            Buffer.from(remoteMessages.createRemotePingResponse(message.remotePingRequest.val1)),
          );
        } else if (message.remoteSetVolumeLevel) {
          this.volume = message.remoteSetVolumeLevel.volumeLevel ?? this.volume;
          this.muted = Boolean(message.remoteSetVolumeLevel.volumeMuted);
        }
      });

      this.client.on('error', (error: Error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  getStatus() {
    return { volume: this.volume, muted: this.muted, ready: this.ready };
  }

  sendKey(keyCode: number): void {
    if (!this.client || !this.ready) {
      throw new Error('Android TV no conectada');
    }
    this.client.write(
      Buffer.from(
        remoteMessages.createRemoteKeyInject(keyCode, RemoteDirection.SHORT),
      ),
    );
  }

  sendAppLink(link: string): void {
    if (!this.client || !this.ready) {
      throw new Error('Android TV no conectada');
    }
    this.client.write(Buffer.from(remoteMessages.createAppLink(link)));
  }

  stop(): void {
    try {
      this.client?.destroy();
    } catch {
      // ignore
    }
    this.client = null;
    this.ready = false;
  }
}

export { RemoteKeyCode, PAIRING_PORT, REMOTE_PORT };
