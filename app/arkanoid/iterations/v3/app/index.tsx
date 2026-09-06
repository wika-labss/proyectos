import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmbientVolumeControl } from '../src/components/AmbientVolumeControl';
import { EightBitBackdrop } from '../src/components/pixel/EightBitBackdrop';
import { PixelButton } from '../src/components/pixel/PixelButton';
import { PixelText } from '../src/components/pixel/PixelText';
import { bit } from '../src/constants/theme';
import { useAmbientAudio } from '../src/hooks/AmbientAudioProvider';
import { useGame } from '../src/hooks/GameProvider';

export default function MenuScreen() {
  const router = useRouter();
  const { highScore, highScoreLoaded, refreshHighScore, startGame } = useGame();
  const { ambientVolume, setAmbientVolume } = useAmbientAudio();

  useEffect(() => {
    void refreshHighScore();
  }, [refreshHighScore]);

  const onPlay = () => {
    startGame();
    router.push('/game');
  };

  return (
    <EightBitBackdrop>
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <PixelText size="xs" color={bit.pink}>
            WIKA 8-BIT
          </PixelText>
          <PixelText size="xl" color={bit.gold}>
            ARKANOID
          </PixelText>
          <PixelText size="xs" color={bit.muted} style={styles.tagline}>
            ROMPE EL MURO
          </PixelText>
        </View>

        <View style={styles.scoreBlock}>
          <PixelText size="xs" color={bit.muted}>
            HI-SCORE
          </PixelText>
          {highScoreLoaded ? (
            <PixelText size="lg" color={bit.gold}>
              {highScore}
            </PixelText>
          ) : (
            <ActivityIndicator color={bit.gold} />
          )}
        </View>

        <AmbientVolumeControl
          volume={ambientVolume}
          onChange={(value) => {
            void setAmbientVolume(value);
          }}
        />

        <View style={styles.actions}>
          <PixelButton label="JUGAR" onPress={onPlay} />
          <PixelButton label="COMO JUGAR" variant="ghost" onPress={() => router.push('/how-to')} />
        </View>
      </SafeAreaView>
    </EightBitBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 36,
  },
  hero: {
    marginTop: 48,
    gap: 12,
    alignItems: 'center',
  },
  tagline: {
    textAlign: 'center',
  },
  scoreBlock: {
    alignItems: 'center',
    gap: 8,
  },
  actions: {
    gap: 12,
  },
});
