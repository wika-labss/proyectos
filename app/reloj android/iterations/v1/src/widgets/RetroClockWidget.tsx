import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

import { getPresetTokens } from '../constants/theme';
import { FONT_FAMILY, type ColorPreset } from '../types';

interface RetroClockWidgetProps {
  timeText: string;
  colorPreset: ColorPreset;
}

export function RetroClockWidget({ timeText, colorPreset }: RetroClockWidgetProps) {
  const tokens = getPresetTokens(colorPreset);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#0D0D0D',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
      }}
      clickAction="OPEN_APP"
    >
      <FlexWidget
        style={{
          backgroundColor: '#111111',
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderWidth: 2,
          borderColor: '#444444',
        }}
      >
        <TextWidget
          text={timeText}
          style={{
            fontSize: 36,
            fontFamily: FONT_FAMILY,
            color: tokens.display as `#${string}`,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
