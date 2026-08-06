import { useSyncExternalStore } from 'react';
import { Share } from 'react-native';
import {
  clearLogs,
  exportLogsAsJson,
  exportLogsAsText,
  getLogEntries,
  subscribeLogs,
} from '../diagnostics/logger';
import type { LogEntry } from '../diagnostics/types';

export function useDiagnosticsLog() {
  const entries = useSyncExternalStore(subscribeLogs, getLogEntries, getLogEntries);

  const exportText = async (): Promise<boolean> => {
    const message = exportLogsAsText();
    const result = await Share.share({
      title: 'Vissiuss diagnosticos',
      message,
    });
    return result.action !== Share.dismissedAction;
  };

  const exportJson = async (): Promise<boolean> => {
    const message = exportLogsAsJson();
    const result = await Share.share({
      title: 'Vissiuss diagnosticos.json',
      message,
    });
    return result.action !== Share.dismissedAction;
  };

  return {
    entries: entries as LogEntry[],
    clear: clearLogs,
    exportText,
    exportJson,
    count: entries.length,
  };
}
