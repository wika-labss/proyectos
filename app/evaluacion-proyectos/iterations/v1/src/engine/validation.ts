import {
  NAME_MAX,
  NAME_MIN,
  SCORE_MAX,
  SCORE_MIN,
  type EvaluationInput,
  type EvaluationPayload,
  type Score,
  type ValidationIssue,
} from './types';

export function normalizeEvaluatorName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export function isValidEvaluatorName(name: string): boolean {
  const n = normalizeEvaluatorName(name);
  return n.length >= NAME_MIN && n.length <= NAME_MAX;
}

export function isValidScore(value: unknown): value is Score {
  return typeof value === 'number' && Number.isInteger(value) && value >= SCORE_MIN && value <= SCORE_MAX;
}

export function validateEvaluation(input: EvaluationInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!isValidEvaluatorName(input.evaluatorName)) {
    issues.push({ field: 'evaluatorName', message: 'El nombre debe tener entre 2 y 80 caracteres.' });
  }
  if (!input.projectId) {
    issues.push({ field: 'projectId', message: 'Falta el proyecto.' });
  }
  if (!isValidScore(input.functionality)) {
    issues.push({ field: 'functionality', message: 'Funcionalidad: elige 1 a 5.' });
  }
  if (!isValidScore(input.design)) {
    issues.push({ field: 'design', message: 'Diseño: elige 1 a 5.' });
  }
  if (!isValidScore(input.businessProposal)) {
    issues.push({ field: 'businessProposal', message: 'Propuesta de negocio: elige 1 a 5.' });
  }
  return issues;
}

export function canSubmitEvaluation(input: EvaluationInput): boolean {
  return validateEvaluation(input).length === 0;
}

export function toEvaluationPayload(input: EvaluationInput): EvaluationPayload {
  const issues = validateEvaluation(input);
  if (issues.length > 0 || !isValidScore(input.functionality) || !isValidScore(input.design) || !isValidScore(input.businessProposal)) {
    throw new Error(issues[0]?.message ?? 'Evaluación inválida.');
  }
  return {
    evaluator_name: normalizeEvaluatorName(input.evaluatorName),
    project_id: input.projectId,
    functionality: input.functionality,
    design: input.design,
    business_proposal: input.businessProposal,
  };
}
