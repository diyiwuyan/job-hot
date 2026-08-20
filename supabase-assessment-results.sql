-- ============================================================
-- 登录用户测评结果
-- 每个账号、每种测评保存一份最新结果；重新测评后自动覆盖。
-- 执行方式：在 Supabase Dashboard > SQL Editor 中运行。
-- ============================================================

create table if not exists public.assessment_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id text not null,
  result_name text not null,
  answers jsonb not null default '{}'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, assessment_id)
);

create index if not exists idx_assessment_results_user
  on public.assessment_results(user_id, updated_at desc);

alter table public.assessment_results enable row level security;

drop policy if exists "Users can view own assessment results" on public.assessment_results;
create policy "Users can view own assessment results"
  on public.assessment_results for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own assessment results" on public.assessment_results;
create policy "Users can insert own assessment results"
  on public.assessment_results for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own assessment results" on public.assessment_results;
create policy "Users can update own assessment results"
  on public.assessment_results for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

