-- Evaluación interna Vissiuss: catálogo de proyectos + notas 1–5.
-- Tablas prefijadas eval_* para convivir con el histórico de licitaciones
-- en mercado-publico (límite Free: 2 proyectos activos en la org).

create table public.eval_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order int not null default 0
);

create table public.eval_evaluations (
  id uuid primary key default gen_random_uuid(),
  evaluator_name text not null,
  project_id uuid not null references public.eval_projects(id) on delete restrict,
  functionality smallint not null check (functionality between 1 and 5),
  design smallint not null check (design between 1 and 5),
  business_proposal smallint not null check (business_proposal between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint eval_evaluations_name_len check (char_length(trim(evaluator_name)) between 2 and 80),
  constraint eval_evaluations_unique unique (evaluator_name, project_id)
);

create index eval_evaluations_project_idx on public.eval_evaluations (project_id);

insert into public.eval_projects (slug, name, sort_order) values
  ('alan', 'Proyecto Alan', 1),
  ('alvaro', 'Proyecto Alvaro', 2),
  ('joaquin', 'Proyecto Joaquin', 3);

create or replace function public.eval_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger eval_evaluations_updated_at
before update on public.eval_evaluations
for each row execute function public.eval_set_updated_at();

alter table public.eval_projects enable row level security;
alter table public.eval_evaluations enable row level security;

create policy eval_projects_select
  on public.eval_projects
  for select
  to anon, authenticated
  using (true);

create policy eval_evaluations_insert
  on public.eval_evaluations
  for insert
  to anon, authenticated
  with check (
    char_length(trim(evaluator_name)) between 2 and 80
    and functionality between 1 and 5
    and design between 1 and 5
    and business_proposal between 1 and 5
  );

create policy eval_evaluations_update
  on public.eval_evaluations
  for update
  to anon, authenticated
  using (true)
  with check (
    char_length(trim(evaluator_name)) between 2 and 80
    and functionality between 1 and 5
    and design between 1 and 5
    and business_proposal between 1 and 5
  );

-- SELECT is required for Postgres RLS UPDATE/upsert to locate the row.
-- The mobile UI never lists or averages scores.
create policy eval_evaluations_select
  on public.eval_evaluations
  for select
  to anon, authenticated
  using (true);

grant select on public.eval_projects to anon, authenticated;
grant select, insert, update on public.eval_evaluations to anon, authenticated;
