#!/usr/bin/env node
/**
 * WIKA post-prebuild — ensures Kotlin 1.9.25 is set after expo prebuild.
 */
const fs = require('fs');
const path = require('path');

const gradlePropsPath = path.join(__dirname, '..', 'android', 'gradle.properties');
const buildGradlePath = path.join(__dirname, '..', 'android', 'build.gradle');

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

const manifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  if (!manifest.includes('android:largeHeap')) {
    manifest = manifest.replace('<application ', '<application android:largeHeap="true" ');
    fs.writeFileSync(manifestPath, manifest);
    console.log('[post-prebuild] Set android:largeHeap=true');
  }
}

const appJsonPath = path.join(__dirname, '..', 'app.json');
const appGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');
if (fs.existsSync(appJsonPath) && fs.existsSync(appGradlePath)) {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  const versionName = appJson.expo.version;
  const versionCode = appJson.expo.android.versionCode;
  let appGradle = fs.readFileSync(appGradlePath, 'utf8');
  appGradle = appGradle
    .replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
    .replace(/versionName\s+"[^"]+"/, `versionName "${versionName}"`);
  fs.writeFileSync(appGradlePath, appGradle);
  console.log(`[post-prebuild] versionName ${versionName} versionCode ${versionCode}`);
}
