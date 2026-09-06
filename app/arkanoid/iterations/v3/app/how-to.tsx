import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { EightBitBackdrop } from '../src/components/pixel/EightBitBackdrop';
import { PixelButton } from '../src/components/pixel/PixelButton';
import { PixelText } from '../src/components/pixel/PixelText';
import { bit } from '../src/constants/theme';

const RULES = [
  'CONTROL A VAUS. TOCA PARA LANZAR.',
  '33 NIVELES. SI CAE LA BOLA, PIERDES UNA VIDA.',
  'CAPSULAS: ATRAPALAS CON LA PALA.',
  'L LASER  E ENLARGE  C CATCH',
  'S SLOW  B BREAK  D DISRUPT  P 1UP',
  'MUSICA CASTILLO EN LOOP. VOLUMEN EN MENU Y PAUSA.',
];

export default function HowToScreen() {
  const router = useRouter();
  return (
    <EightBitBackdrop>
      <View style={styles.safe}>
        <PixelText size="md" color={bit.gold}>
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
        <PixelButton label="VOLVER" variant="ghost" onPress={() => router.back()} />
      </View>
    </EightBitBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 28,
    justifyContent: 'space-between',
    gap: 16,
  },
  rules: {
    gap: 10,
    paddingBottom: 16,
  },
  ruleBox: {
    borderWidth: 3,
    borderColor: bit.wall,
    backgroundColor: bit.panel,
    padding: 10,
  },
});
