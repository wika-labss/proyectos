#!/usr/bin/env node
/**
 * WIKA post-prebuild — Kotlin 1.9.25 + release signed with debug keystore for sideload.
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
    .trimEnd();
  props += '\n\nandroid.kotlinVersion=1.9.25\n';
  fs.writeFileSync(gradlePropsPath, props);
  console.log('[post-prebuild] Set android.kotlinVersion=1.9.25');
}

if (fs.existsSync(buildGradlePath)) {
  let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
  buildGradle = buildGradle.replace(/'1\.9\.24'/g, "'1.9.25'");
  fs.writeFileSync(buildGradlePath, buildGradle);
}

if (fs.existsSync(appGradlePath)) {
  let appGradle = fs.readFileSync(appGradlePath, 'utf8');
  if (!appGradle.includes('signingConfig signingConfigs.debug')) {
    appGradle = appGradle.replace(
      /buildTypes\s*\{[\s\S]*?release\s*\{/,
      (block) => {
        if (block.includes('signingConfig')) return block;
        return block.replace(
          /release\s*\{/,
          'release {\n            signingConfig signingConfigs.debug',
        );
      },
    );
    fs.writeFileSync(appGradlePath, appGradle);
    console.log('[post-prebuild] Release signed with debug keystore for sideload');
  }
}
