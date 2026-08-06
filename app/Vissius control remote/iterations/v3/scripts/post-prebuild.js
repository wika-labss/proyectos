#!/usr/bin/env node
/**
 * WIKA post-prebuild — Kotlin 1.9.25 + cleartext HTTP LAN (v3 pairing).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const gradlePropsPath = path.join(root, 'android', 'gradle.properties');
const buildGradlePath = path.join(root, 'android', 'build.gradle');
const manifestPath = path.join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');

if (!fs.existsSync(gradlePropsPath)) {
  console.warn('[post-prebuild] android/gradle.properties not found — skip');
  process.exit(0);
}

let props = fs.readFileSync(gradlePropsPath, 'utf8');
props = props
  .split('\n')
  .filter((line) => !line.startsWith('android.kotlinVersion'))
  .join('\n')
  .trimEnd();
props += '\n\nandroid.kotlinVersion=1.9.25\n';
fs.writeFileSync(gradlePropsPath, props);
console.log('[post-prebuild] Set android.kotlinVersion=1.9.25 in gradle.properties');

if (fs.existsSync(buildGradlePath)) {
  let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
  buildGradle = buildGradle.replace(/'1\.9\.24'/g, "'1.9.25'");
  fs.writeFileSync(buildGradlePath, buildGradle);
  console.log('[post-prebuild] Ensured Kotlin 1.9.25 in build.gradle');
}

// v3 URGENTE: sin cleartext, Android bloquea HTTP LAN → emparejamiento falla
if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  if (!manifest.includes('android:usesCleartextTraffic')) {
    manifest = manifest.replace(
      /<application\b([^>]*)>/,
      '<application$1 android:usesCleartextTraffic="true">',
    );
    fs.writeFileSync(manifestPath, manifest);
    console.log('[post-prebuild] Enabled android:usesCleartextTraffic=true');
  } else if (manifest.includes('android:usesCleartextTraffic="false"')) {
    manifest = manifest.replace(
      'android:usesCleartextTraffic="false"',
      'android:usesCleartextTraffic="true"',
    );
    fs.writeFileSync(manifestPath, manifest);
    console.log('[post-prebuild] Forced usesCleartextTraffic=true');
  } else {
    console.log('[post-prebuild] usesCleartextTraffic already enabled');
  }
}
