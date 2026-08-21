import { useEffect } from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';

import { renderWidgetSnapshot } from '../../widget-task-handler';
import { WIDGET_NAME } from '../types';
import { useClockStore } from '../stores/clockStore';

export async function refreshWidget(): Promise<void> {
  await requestWidgetUpdate({
    widgetName: WIDGET_NAME,
    renderWidget: () => renderWidgetSnapshot(),
  });
}

export function useWidgetSync(): void {
  const loaded = useClockStore((state) => state.loaded);
  const format24h = useClockStore((state) => state.format24h);
  const colorPreset = useClockStore((state) => state.colorPreset);

  useEffect(() => {
    if (!loaded) {
      return;
    }
    void refreshWidget();
  }, [loaded, format24h, colorPreset]);

  useEffect(() => {
    if (!loaded) {
      return;
    }
    const id = setInterval(() => {
      void refreshWidget();
    }, 60_000);
    return () => clearInterval(id);
  }, [loaded]);
}
