#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-17-openjdk-amd64}"
export PATH="$JAVA_HOME/bin:$PATH"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"

echo "=== WIKA APK Release — Evaluación Proyectos v1 ==="
echo "Genera un APK autónomo: el bundle JS va embebido, no necesita Metro."
echo "Java: $(java -version 2>&1 | head -n1)"

echo ""
echo "[1/4] prebuild android"
npx expo prebuild --platform android --non-interactive
node scripts/post-prebuild.js

echo ""
echo "[2/4] Android SDK"
LOCAL_PROPS="$ROOT/android/local.properties"
if [[ -f "$LOCAL_PROPS" ]]; then
  echo "Usando android/local.properties existente"
else
  echo "sdk.dir=$ANDROID_HOME" > "$LOCAL_PROPS"
  echo "Escrito android/local.properties desde ANDROID_HOME"
fi

echo ""
echo "[3/4] gradle assembleRelease"
cd android
./gradlew assembleRelease
cd ..

APK_SRC="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
APK_DST="$ROOT/evaluacion-proyectos-v1-release.apk"
cp -f "$APK_SRC" "$APK_DST"

echo ""
echo "[4/4] Listo"
echo "APK: $APK_DST"
echo "Instalar: adb install -r \"$APK_DST\""
