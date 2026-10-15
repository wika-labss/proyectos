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
  // Los módulos expo* ya declaran singleVariant('release') vía ExpoModulesCorePlugin
  // (useExpoPublishing). Declararlo otra vez aquí provoca
  // "Using singleVariant publishing DSL multiple times". Por eso excluimos expo*.
  const patch = `
subprojects { subproject ->
  subproject.plugins.withId('com.android.library') {
    if (!subproject.name.startsWith('expo')) {
      subproject.android {
        publishing {
          singleVariant('release') {
            withSourcesJar()
          }
        }
      }
    }
  }
}
`;
  if (!buildGradle.includes("singleVariant('release')")) {
    buildGradle = buildGradle.trimEnd() + patch;
    fs.writeFileSync(buildGradlePath, buildGradle);
  } else if (!buildGradle.includes("!subproject.name.startsWith('expo')")) {
    // Reemplaza el bloque antiguo (sin exclusión de expo*) por el nuevo.
    buildGradle = buildGradle.replace(
      /\nsubprojects \{ subproject ->[\s\S]*?\n\}\n?$/,
      patch,
    );
    fs.writeFileSync(buildGradlePath, buildGradle);
  }
}

console.log('[post-prebuild] kotlin 1.9.25 + expo publishing patch');
