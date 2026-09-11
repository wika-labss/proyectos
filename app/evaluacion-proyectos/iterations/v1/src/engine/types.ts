export const SCORE_MIN = 1;
export const SCORE_MAX = 5;
export const NAME_MIN = 2;
export const NAME_MAX = 80;

export type Project = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
};

export type EvaluationInput = {
  evaluatorName: string;
  projectId: string;
  functionality: number | null;
  design: number | null;
  businessProposal: number | null;
};

export type EvaluationPayload = {
  evaluator_name: string;
  project_id: string;
  functionality: number;
  design: number;
  business_proposal: number;
};

export type ValidationIssue = {
  field: 'evaluatorName' | 'projectId' | 'functionality' | 'design' | 'businessProposal';
  message: string;
};

export type Score = 1 | 2 | 3 | 4 | 5;

export const SCORE_VALUES: Score[] = [1, 2, 3, 4, 5];
