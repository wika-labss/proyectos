import React, { useRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, fontFamily, fontSize, fontWeight, layout, radius, spacing } from '../../constants/theme';

type Props = {
  uri: string | null;
  onCapture: (uri: string) => void;
};

export function CameraCapture({ uri, onCapture }: Props) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  async function take() {
    if (!permission?.granted) {
      const next = await requestPermission();
      if (!next.granted) return;
    }
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    if (photo?.uri) onCapture(photo.uri);
  }

  if (!permission) {
    return <View style={styles.frame} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.frame}>
        <Text style={styles.error}>Sin permiso de cámara no se puede fotografiar el pedido.</Text>
        <Pressable onPress={() => void requestPermission()} style={styles.button}>
          <Text style={styles.buttonText}>Permitir cámara</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {uri ? (
        <Image source={{ uri }} style={styles.frame} />
      ) : (
        <CameraView ref={cameraRef} style={styles.frame} facing="back" />
      )}
      <Pressable onPress={() => void take()} style={styles.button}>
        <Text style={styles.buttonText}>{uri ? 'Tomar otra' : 'Sacar foto'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  frame: {
    height: 280,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  error: {
    color: colors.error,
    fontFamily: fontFamily.base,
    fontSize: fontSize.sm,
    padding: spacing.md,
  },
  button: {
    minHeight: layout.touchMin,
    maxWidth: layout.ctaMaxWidth,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  buttonText: {
    color: colors.surface,
    fontFamily: fontFamily.base,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
