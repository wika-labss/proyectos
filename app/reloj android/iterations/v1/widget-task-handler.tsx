import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { formatWidgetTime } from './src/engine/formatTime';
import { RetroClockWidget } from './src/widgets/RetroClockWidget';
import { loadPreferences } from './src/utils/storage';
import { DEFAULT_PREFERENCES, WIDGET_NAME } from './src/types';

async function renderClockWidget(renderWidget: WidgetTaskHandlerProps['renderWidget']): Promise<void> {
  const preferences = await loadPreferences();
  const timeText = formatWidgetTime(new Date(), preferences);
  renderWidget(
    <RetroClockWidget timeText={timeText} colorPreset={preferences.colorPreset} />,
  );
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  if (props.widgetInfo.widgetName !== WIDGET_NAME) {
    return;
  }

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      await renderClockWidget(props.renderWidget);
      break;
    case 'WIDGET_CLICK':
      await renderClockWidget(props.renderWidget);
      break;
    default:
      break;
  }
}

export async function renderWidgetSnapshot(): Promise<React.ReactElement> {
  const preferences = await loadPreferences();
  const timeText = formatWidgetTime(new Date(), preferences);
  return <RetroClockWidget timeText={timeText} colorPreset={preferences.colorPreset} />;
}

export { DEFAULT_PREFERENCES };
