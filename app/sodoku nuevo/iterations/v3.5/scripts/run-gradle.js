/**
 * Wrapper Gradle multiplataforma (Windows usa gradlew.bat, Unix ./gradlew).
 * Uso: node scripts/run-gradle.js assembleRelease
 */
const { spawnSync } = require('child_process');
const path = require('path');

const task = process.argv[2];
if (!task) {
  console.error('Uso: node scripts/run-gradle.js <tarea-gradle>');
  process.exit(1);
}

const androidDir = path.join(__dirname, '..', 'android');
const isWin = process.platform === 'win32';
const gradlew = isWin ? 'gradlew.bat' : './gradlew';

const result = spawnSync(gradlew, [task], {
  cwd: androidDir,
  stdio: 'inherit',
  shell: isWin,
});

process.exit(result.status ?? 1);
