#!/usr/bin/env node
/**
 * WIKA post-prebuild — pin toolchain Expo SDK 52 can actually compile.
 * Android Studio 2026+ will otherwise bump AGP/Gradle until
 * expo-modules-core fails with: unknown property 'release'.
 */
const fs = require('fs');
const path = require('path');

const androidDir = path.join(__dirname, '..', 'android');
const gradlePropsPath = path.join(androidDir, 'gradle.properties');
const buildGradlePath = path.join(androidDir, 'build.gradle');
const wrapperPath = path.join(androidDir, 'gradle', 'wrapper', 'gradle-wrapper.properties');

const AGP = '8.6.1';
const GRADLE = '8.10.2';
const KOTLIN = '1.9.25';

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
props += `\n\nandroid.kotlinVersion=${KOTLIN}\n`;
fs.writeFileSync(gradlePropsPath, props);
console.log(`[post-prebuild] Set android.kotlinVersion=${KOTLIN} in gradle.properties`);

if (fs.existsSync(buildGradlePath)) {
  let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
  buildGradle = buildGradle.replace(/'1\.9\.24'/g, `'${KOTLIN}'`);
  buildGradle = buildGradle.replace(
    /classpath\(['"]com\.android\.tools\.build:gradle[^'"]*['"]\)/g,
    `classpath('com.android.tools.build:gradle:${AGP}')`
  );
  fs.writeFileSync(buildGradlePath, buildGradle);
  console.log(`[post-prebuild] Pinned AGP ${AGP} in build.gradle`);
}

if (fs.existsSync(wrapperPath)) {
  let wrapper = fs.readFileSync(wrapperPath, 'utf8');
  wrapper = wrapper.replace(
    /distributionUrl=.*/g,
    `distributionUrl=https\\://services.gradle.org/distributions/gradle-${GRADLE}-all.zip`
  );
  fs.writeFileSync(wrapperPath, wrapper);
  console.log(`[post-prebuild] Pinned Gradle ${GRADLE} in gradle-wrapper.properties`);
}
