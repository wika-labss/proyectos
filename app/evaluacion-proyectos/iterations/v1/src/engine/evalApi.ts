import { config } from '../constants/config';
import type { EvaluationInput, EvaluationPayload, Project } from './types';
import { toEvaluationPayload } from './validation';

export type EvalApiErrorCode = 'network' | 'not_found' | 'invalid_response' | 'config' | 'save';

export class EvalApiError extends Error {
  constructor(
    public readonly code: EvalApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'EvalApiError';
  }
}

function getConfig(): { baseUrl: string; anonKey: string } {
  const baseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? config.supabaseUrl).replace(/\/$/, '');
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? config.supabaseAnonKey;
  if (!anonKey) {
    throw new EvalApiError('config', 'Falta EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }
  return { baseUrl, anonKey };
}

function headers(): Record<string, string> {
  const { anonKey } = getConfig();
  return {
    Authorization: `Bearer ${anonKey}`,
    apikey: anonKey,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new EvalApiError('invalid_response', 'La API devolvió un cuerpo no JSON.');
  }
}

export async function fetchProjects(): Promise<Project[]> {
  const { baseUrl } = getConfig();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/rest/v1/eval_projects?select=id,slug,name,sort_order&order=sort_order.asc`, {
      method: 'GET',
      headers: headers(),
    });
  } catch {
    throw new EvalApiError('network', 'Sin red. No se pudieron cargar los proyectos.');
  }
  if (!response.ok) {
    throw new EvalApiError('invalid_response', `No se pudieron cargar los proyectos (${response.status}).`);
  }
  const data = await parseJson(response);
  if (!Array.isArray(data)) {
    throw new EvalApiError('invalid_response', 'Catálogo de proyectos inválido.');
  }
  return data.map((row) => {
    const item = row as Project;
    if (!item?.id || !item.slug || !item.name) {
      throw new EvalApiError('invalid_response', 'Proyecto incompleto en API.');
    }
    return {
      id: String(item.id),
      slug: String(item.slug),
      name: String(item.name),
      sort_order: Number(item.sort_order) || 0,
    };
  });
}

export async function fetchProjectBySlug(slug: string): Promise<Project> {
  const { baseUrl } = getConfig();
  let response: Response;
  try {
    response = await fetch(
      `${baseUrl}/rest/v1/eval_projects?slug=eq.${encodeURIComponent(slug)}&select=id,slug,name,sort_order`,
      { method: 'GET', headers: headers() },
    );
  } catch {
    throw new EvalApiError('network', 'Sin red. No se pudo cargar el proyecto.');
  }
  if (!response.ok) {
    throw new EvalApiError('invalid_response', `No se pudo cargar el proyecto (${response.status}).`);
  }
  const data = await parseJson(response);
  if (!Array.isArray(data) || data.length === 0) {
    throw new EvalApiError('not_found', 'Proyecto no encontrado.');
  }
  const item = data[0] as Project;
  return {
    id: String(item.id),
    slug: String(item.slug),
    name: String(item.name),
    sort_order: Number(item.sort_order) || 0,
  };
}

export async function saveEvaluation(input: EvaluationInput): Promise<void> {
  const payload: EvaluationPayload = toEvaluationPayload(input);
  const { baseUrl } = getConfig();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/rest/v1/eval_evaluations?on_conflict=evaluator_name,project_id`, {
      method: 'POST',
      headers: {
        ...headers(),
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new EvalApiError('network', 'Sin red. No se pudo guardar la evaluación.');
  }
  if (!response.ok) {
    throw new EvalApiError('save', `No se pudo guardar la evaluación (${response.status}).`);
  }
}
