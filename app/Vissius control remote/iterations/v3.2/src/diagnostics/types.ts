export type LogLevel = 'info' | 'ok' | 'fail' | 'warn';

export interface LogEntry {
  id: string;
  ts: string;
  level: LogLevel;
  /** Qué se ejecutó */
  execution: string;
  /** Resultado de la ejecución */
  result: string;
  /** Datos opcionales (serializados en export) */
  detail?: Record<string, unknown>;
}

export interface LogExportPayload {
  app: string;
  version: string;
  exportedAt: string;
  count: number;
  entries: LogEntry[];
  /** Guía de conexión para preparar v4 (solo en export JSON). */
  connectGuide?: string[];
}
