import React from 'react';
import { StyleSheet, View } from 'react-native';
import { bit } from '../constants/theme';
import { useAmbientAudio } from '../hooks/AmbientAudioProvider';
import { AmbientVolumeControl } from './AmbientVolumeControl';
import { PixelButton } from './pixel/PixelButton';
import { PixelText } from './pixel/PixelText';

type Props = {
  onResume: () => void;
  onMenu: () => void;
};

export function PauseOverlay({ onResume, onMenu }: Props) {
  const { ambientVolume, setAmbientVolume } = useAmbientAudio();
  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <PixelText size="lg" color={bit.gold}>
          PAUSA
        </PixelText>
        <AmbientVolumeControl
          volume={ambientVolume}
          onChange={(value) => {
            void setAmbientVolume(value);
          }}
        />
        <View style={styles.actions}>
          <PixelButton label="REANUDAR" onPress={onResume} />
          <PixelButton label="MENU" variant="ghost" onPress={onMenu} />
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
    borderWidth: 4,
    borderColor: bit.gold,
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
