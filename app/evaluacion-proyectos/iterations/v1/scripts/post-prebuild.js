#!/usr/bin/env node
/**
 * WIKA post-prebuild — Kotlin 1.9.25, arm64-only APK, debug-signed release for sideload.
 */
const fs = require('fs');
const path = require('path');

const gradlePropsPath = path.join(__dirname, '..', 'android', 'gradle.properties');
const buildGradlePath = path.join(__dirname, '..', 'android', 'build.gradle');
const appGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

if (fs.existsSync(gradlePropsPath)) {
  let props = fs.readFileSync(gradlePropsPath, 'utf8');
  props = props
    .split('\n')
    .filter((line) => !line.startsWith('android.kotlinVersion'))
    .join('\n')
    .replace(/^reactNativeArchitectures=.*/m, 'reactNativeArchitectures=arm64-v8a');
  if (!props.includes('android.kotlinVersion')) {
    props = `${props.trimEnd()}\n\nandroid.kotlinVersion=1.9.25\n`;
  }
  fs.writeFileSync(gradlePropsPath, props);
  console.log('[post-prebuild] Kotlin 1.9.25 + arm64-v8a');
}

if (fs.existsSync(buildGradlePath)) {
  let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
  buildGradle = buildGradle.replace(/'1\.9\.24'/g, "'1.9.25'");
  fs.writeFileSync(buildGradlePath, buildGradle);
}

if (fs.existsSync(appGradlePath)) {
  let appGradle = fs.readFileSync(appGradlePath, 'utf8');
  let changed = false;
  if (!appGradle.includes('signingConfig signingConfigs.debug')) {
    appGradle = appGradle.replace(
      /release\s*\{/,
      'release {\n            signingConfig signingConfigs.debug',
    );
    changed = true;
    console.log('[post-prebuild] Release signed with debug keystore for sideload');
  }
  if (!appGradle.includes('abiFilters')) {
    appGradle = appGradle.replace(
      /versionName "1\.0\.0"/,
      'versionName "1.0.0"\n        ndk {\n            abiFilters "arm64-v8a"\n        }',
    );
    changed = true;
    console.log('[post-prebuild] abiFilters arm64-v8a');
  }
  if (changed) fs.writeFileSync(appGradlePath, appGradle);
}
