#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const gradlePropsPath = path.join(__dirname, '..', 'android', 'gradle.properties');
if (!fs.existsSync(gradlePropsPath)) process.exit(0);

let props = fs.readFileSync(gradlePropsPath, 'utf8');
props = props
  .split('\n')
  .filter((line) => !line.startsWith('android.kotlinVersion'))
  .join('\n')
  .trimEnd();
props += '\n\nandroid.kotlinVersion=1.9.25\n';
fs.writeFileSync(gradlePropsPath, props);

const buildGradlePath = path.join(__dirname, '..', 'android', 'build.gradle');
if (fs.existsSync(buildGradlePath)) {
  let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
  const patch = `
subprojects { subproject ->
  subproject.plugins.withId('com.android.library') {
    subproject.android {
      publishing {
        singleVariant('release') {
          withSourcesJar()
        }
      }
    }
  }
}
`;
  if (!buildGradle.includes("singleVariant('release')")) {
    buildGradle = buildGradle.trimEnd() + patch;
    fs.writeFileSync(buildGradlePath, buildGradle);
  }
}

console.log('[post-prebuild] kotlin 1.9.25 + expo publishing patch');
