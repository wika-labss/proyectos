#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const pluginPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-modules-core',
  'android',
  'ExpoModulesCorePlugin.gradle',
);

if (!fs.existsSync(pluginPath)) {
  console.warn('[patch-expo-gradle] ExpoModulesCorePlugin.gradle not found');
  process.exit(0);
}

let text = fs.readFileSync(pluginPath, 'utf8');
const needle = 'from components.release';
if (!text.includes(needle)) {
  console.log('[patch-expo-gradle] already patched or layout changed');
  process.exit(0);
}

text = text.replace(
  'from components.release',
  'from components.findByName("release") ?: components.create("release")',
);
fs.writeFileSync(pluginPath, text);
console.log('[patch-expo-gradle] patched components.release for Gradle 8');
