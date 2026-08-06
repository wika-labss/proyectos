import type { LogEntry, LogExportPayload, LogLevel } from './types';

const MAX_ENTRIES = 800;
const APP_NAME = 'Vissius Control Remote';
const APP_VERSION = '3.1.0';

type Listener = () => void;

let entries: LogEntry[] = [];
let seq = 0;
const listeners = new Set<Listener>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

function push(level: LogLevel, execution: string, result: string, detail?: Record<string, unknown>): LogEntry {
  seq += 1;
  const entry: LogEntry = {
    id: `${Date.now()}-${seq}`,
    ts: new Date().toISOString(),
    level,
    execution,
    result,
    detail,
  };
  entries = [entry, ...entries].slice(0, MAX_ENTRIES);
  notify();
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[diag] ${execution} --> ${result}`, detail ?? '');
  }
  return entry;
}

/** Registra ejecución --> resultado (nivel info). */
export function logExec(execution: string, result: string, detail?: Record<string, unknown>): LogEntry {
  return push('info', execution, result, detail);
}

/** Éxito explícito. */
export function logOk(execution: string, result: string, detail?: Record<string, unknown>): LogEntry {
  return push('ok', execution, result, detail);
}

/** Fallo / error. */
export function logFail(execution: string, result: string, detail?: Record<string, unknown>): LogEntry {
  return push('fail', execution, result, detail);
}

/** Advertencia. */
export function logWarn(execution: string, result: string, detail?: Record<string, unknown>): LogEntry {
  return push('warn', execution, result, detail);
}

/**
 * Envuelve una promesa y registra inicio + resultado.
 * Uso: await logged('scan.subnet', () => scanLocalSubnet())
 */
export async function logged<T>(
  execution: string,
  fn: () => Promise<T>,
  formatResult?: (value: T) => string,
): Promise<T> {
  logExec(execution, 'start');
  const t0 = Date.now();
  try {
    const value = await fn();
    const summary = formatResult ? formatResult(value) : summarize(value);
    logOk(execution, summary, { durationMs: Date.now() - t0 });
    return value;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logFail(execution, message, { durationMs: Date.now() - t0 });
    throw error;
  }
}

function summarize(value: unknown): string {
  if (value == null) {
    return 'null';
  }
  if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `array(len=${value.length})`;
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value).slice(0, 200);
    } catch {
      return 'object';
    }
  }
  return typeof value;
}

export function getLogEntries(): LogEntry[] {
  return entries;
}

export function clearLogs(): void {
  entries = [];
  notify();
  logExec('diagnostics.clear', 'ok');
}

export function subscribeLogs(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Línea humana: ejecución --> resultado */
export function formatLogLine(entry: LogEntry): string {
  const level = entry.level.toUpperCase().padEnd(4, ' ');
  return `[${entry.ts}] ${level} ${entry.execution} --> ${entry.result}`;
}

export function exportLogsAsText(): string {
  const header = [
    `${APP_NAME} v${APP_VERSION} — diagnosticos`,
    `exportedAt: ${new Date().toISOString()}`,
    `count: ${entries.length}`,
    'formato: ejecucion --> resultado',
    '---',
  ].join('\n');
  const body = [...entries].reverse().map(formatLogLine).join('\n');
  return `${header}\n${body}\n`;
}

export function exportLogsAsJson(): string {
  const payload: LogExportPayload = {
    app: APP_NAME,
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    count: entries.length,
    entries: [...entries].reverse(),
  };
  return JSON.stringify(payload, null, 2);
}

export const diagnosticsLogger = {
  logExec,
  logOk,
  logFail,
  logWarn,
  logged,
  getLogEntries,
  clearLogs,
  subscribeLogs,
  formatLogLine,
  exportLogsAsText,
  exportLogsAsJson,
};
