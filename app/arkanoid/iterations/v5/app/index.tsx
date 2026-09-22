import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PixelText } from '../src/components/pixel/PixelText';
import { bit } from '../src/design-system/tokens';
import { useAvatar } from '../src/hooks/AvatarProvider';
import { useGame } from '../src/hooks/GameProvider';
import {
  AvatarPicker,
  AvatarPortrait,
  RailButton,
  VaporwaveBackdrop,
  type RailItemId,
} from '../src/modules/arkanoid-ui-kit';

export default function MenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { highScore, highScoreLoaded, refreshHighScore, startGame } = useGame();
  const { avatarId, setAvatarId } = useAvatar();
  const [expanded, setExpanded] = useState<RailItemId>('play');
  const [pickerOpen, setPickerOpen] = useState(false);

  React.useEffect(() => {
    void refreshHighScore();
  }, [refreshHighScore]);

  const onRail = (id: RailItemId) => {
    if (id !== expanded) {
      setExpanded(id);
      return;
    }
    if (id === 'play') {
      startGame();
      router.push('/game');
      return;
    }
    if (id === 'how') {
      router.push('/how-to');
      return;
    }
    setPickerOpen(true);
  };

  return (
    <VaporwaveBackdrop>
      <View style={[styles.safe, { paddingTop: Math.max(insets.top, 20), paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.row}>
          <View style={styles.hero}>
            <AvatarPortrait id={avatarId} />
            <View style={styles.brandRow}>
              <PixelText size="lg" color={bit.cyan}>
                ARKA
              </PixelText>
              <PixelText size="lg" color={bit.pink}>
                NOID
              </PixelText>
            </View>
            <PixelText size="xs" color={bit.gold}>
              HI-SCORE
            </PixelText>
            {highScoreLoaded ? (
              <PixelText size="md" color={bit.gold}>
                {highScore}
              </PixelText>
            ) : (
              <ActivityIndicator color={bit.gold} />
            )}
          </View>

          <View style={styles.rail}>
            <RailButton
              id="play"
              icon=">"
              label="JUGAR"
              expanded={expanded === 'play'}
              onPress={() => onRail('play')}
            />
            <RailButton
              id="how"
              icon="?"
              label="COMO JUGAR"
              expanded={expanded === 'how'}
              onPress={() => onRail('how')}
            />
            <RailButton
              id="avatar"
              icon="@"
              label="AVATAR"
              expanded={expanded === 'avatar'}
              onPress={() => onRail('avatar')}
            />
          </View>
        </View>
      </View>
      {pickerOpen ? (
        <AvatarPicker
          selected={avatarId}
          onSelect={setAvatarId}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </VaporwaveBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 12,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  hero: {
    flex: 65,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 10,
    paddingRight: 8,
  },
  brandRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rail: {
    flex: 35,
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 10,
  },
});
