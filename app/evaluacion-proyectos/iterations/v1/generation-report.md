# Generation report — Evaluación Proyectos v1

- Stack: Expo SDK 52, expo-router 4, TypeScript
- Engine: validación 1–5 + cliente PostgREST (`eval_projects`, `eval_evaluations`)
- UI: splash 5 s, login por nombre, home de 3 proyectos, detalle de scoring
- Persistencia: upsert por `(evaluator_name, project_id)`
- Supabase: tablas `eval_*` en `wdpvlmuescstqnliorkx` (límite Free de 2 proyectos activos)
