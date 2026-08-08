import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { buildWidgetModel } from './src/engine/widgetRenderer';
import { RetroClockWidget } from './src/widgets/RetroClockWidget';
import { loadPreferences } from './src/utils/storage';
import { WIDGET_NAME } from './src/types';

async function renderClockWidget(renderWidget: WidgetTaskHandlerProps['renderWidget']): Promise<void> {
  const preferences = await loadPreferences();
  const model = buildWidgetModel(new Date(), preferences);
  renderWidget(
    <RetroClockWidget timeText={model.timeText} colorPreset={model.colorPreset} />,
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
    case 'WIDGET_CLICK':
      await renderClockWidget(props.renderWidget);
      break;
    default:
      break;
  }
}

export async function renderWidgetSnapshot(): Promise<React.ReactElement> {
  const preferences = await loadPreferences();
  const model = buildWidgetModel(new Date(), preferences);
  return <RetroClockWidget timeText={model.timeText} colorPreset={model.colorPreset} />;
}
