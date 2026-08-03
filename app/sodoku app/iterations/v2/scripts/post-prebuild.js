#!/usr/bin/env node
/**
 * WIKA post-prebuild — ensures Kotlin 1.9.25 and Android SDK path after expo prebuild.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const rootDir = path.join(__dirname, '..');
const androidDir = path.join(rootDir, 'android');
const gradlePropsPath = path.join(androidDir, 'gradle.properties');
const buildGradlePath = path.join(androidDir, 'build.gradle');
const localPropsPath = path.join(androidDir, 'local.properties');

function findAndroidSdk() {
  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    process.platform === 'win32'
      ? path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk')
      : path.join(os.homedir(), 'Library', 'Android', 'sdk'),
    path.join(os.homedir(), 'Android', 'Sdk'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function ensureLocalProperties() {
  if (!fs.existsSync(androidDir)) {
    return;
  }

  const sdkDir = findAndroidSdk();
  if (!sdkDir) {
    console.warn('[post-prebuild] Android SDK not found. Set ANDROID_HOME or create android/local.properties');
    return;
  }

  const sdkDirEscaped = sdkDir.replace(/\\/g, '/');
  fs.writeFileSync(localPropsPath, `sdk.dir=${sdkDirEscaped}\n`);
  console.log(`[post-prebuild] Set sdk.dir in local.properties → ${sdkDirEscaped}`);
}

if (!fs.existsSync(gradlePropsPath)) {
  console.warn('[post-prebuild] android/gradle.properties not found — skip');
  process.exit(0);
}

ensureLocalProperties();

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
