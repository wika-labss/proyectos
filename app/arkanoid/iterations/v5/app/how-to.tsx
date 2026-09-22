import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PixelText } from '../src/components/pixel/PixelText';
import { bit, chrome } from '../src/design-system/tokens';
import { ChromeButton, VaporwaveBackdrop } from '../src/modules/arkanoid-ui-kit';

const RULES = [
  'CONTROL A VAUS CON EL SLIDER.',
  'TOCA EL TABLERO PARA LANZAR.',
  '33 NIVELES. SI CAE LA BOLA, PIERDES UNA VIDA.',
  'CAPSULAS: ATRAPALAS CON LA PALA.',
  'L LASER  E ENLARGE  C CATCH',
  'S SLOW  B BREAK  D DISRUPT  P 1UP',
  'SIN MUSICA. PERFIL LOCAL. SIN CUENTAS.',
];

export default function HowToScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <VaporwaveBackdrop>
      <View
        style={[
          styles.safe,
          { paddingTop: Math.max(insets.top, 28), paddingBottom: insets.bottom + 16 },
        ]}
      >
        <PixelText size="md" color={bit.cyan}>
          COMO JUGAR
        </PixelText>
        <ScrollView contentContainerStyle={styles.rules}>
          {RULES.map((rule) => (
            <View key={rule} style={styles.ruleBox}>
              <PixelText size="xs" color={bit.ink}>
                {rule}
              </PixelText>
            </View>
          ))}
        </ScrollView>
        <ChromeButton label="VOLVER" variant="ghost" onPress={() => router.back()} />
      </View>
    </VaporwaveBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    gap: 16,
  },
  rules: {
    gap: 10,
    paddingBottom: 16,
  },
  ruleBox: {
    borderWidth: chrome.outline,
    borderColor: bit.cyan,
    backgroundColor: bit.panel,
    padding: 10,
  },
});
