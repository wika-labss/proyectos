/**
 * Smoke V1 — engine + API (no React Native).
 * Run: npm run smoke
 */
import assert from 'node:assert/strict';
import {
  canSubmitEvaluation,
  fetchProjects,
  isValidEvaluatorName,
  normalizeEvaluatorName,
  saveEvaluation,
  toEvaluationPayload,
  validateEvaluation,
} from '../src/engine';
import { config } from '../src/constants/config';

function testNameAndScores() {
  assert.equal(isValidEvaluatorName('A'), false);
  assert.equal(isValidEvaluatorName('  Jo  '), true);
  assert.equal(normalizeEvaluatorName('  Ana   María '), 'Ana María');
  const invalid = validateEvaluation({
    evaluatorName: 'x',
    projectId: '',
    functionality: 0,
    design: 6,
    businessProposal: null,
  });
  assert.equal(invalid.length >= 4, true);
  assert.equal(
    canSubmitEvaluation({
      evaluatorName: 'Vissiuss',
      projectId: 'abc',
      functionality: 5,
      design: 4,
      businessProposal: 3,
    }),
    true,
  );
  const payload = toEvaluationPayload({
    evaluatorName: '  Vissiuss  ',
    projectId: 'abc',
    functionality: 5,
    design: 4,
    businessProposal: 3,
  });
  assert.equal(payload.evaluator_name, 'Vissiuss');
  assert.equal(payload.business_proposal, 3);
}

function testConfig() {
  assert.equal(config.supabaseUrl.includes('wdpvlmuescstqnliorkx'), true);
}

async function testLiveApi() {
  const projects = await fetchProjects();
  assert.equal(projects.length, 3);
  const slugs = projects.map((p) => p.slug).sort();
  assert.deepEqual(slugs, ['alan', 'alvaro', 'joaquin']);
  const alan = projects.find((p) => p.slug === 'alan');
  assert.ok(alan);
  await saveEvaluation({
    evaluatorName: 'smoke-v1',
    projectId: alan.id,
    functionality: 5,
    design: 4,
    businessProposal: 3,
  });
}

async function main() {
  testNameAndScores();
  testConfig();
  await testLiveApi();
  console.log('smoke-v1 ok');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
