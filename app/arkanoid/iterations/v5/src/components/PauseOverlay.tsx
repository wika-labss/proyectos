import React from 'react';
import { StyleSheet, View } from 'react-native';
import { bit, chrome } from '../design-system/tokens';
import { ChromeButton } from '../modules/arkanoid-ui-kit';
import { PixelText } from './pixel/PixelText';

type Props = {
  onResume: () => void;
  onMenu: () => void;
};

export function PauseOverlay({ onResume, onMenu }: Props) {
  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <PixelText size="lg" color={bit.cyan}>
          PAUSA
        </PixelText>
        <View style={styles.actions}>
          <ChromeButton label="REANUDAR" onPress={onResume} />
          <ChromeButton label="MENU" variant="ghost" onPress={onMenu} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: bit.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    paddingHorizontal: 16,
  },
  panel: {
    width: '100%',
    borderWidth: chrome.outline,
    borderColor: bit.pink,
    backgroundColor: bit.panel,
    padding: 16,
    alignItems: 'center',
    gap: 16,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
});
