-- ============================================================
-- JOBHOT 求职训练营：介绍、课程、作业打卡、统计
-- 执行方式：Supabase Dashboard → SQL Editor
-- 依赖：supabase-fix-admin-rls.sql 中的 public.is_admin()
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.career_camp_settings (
  key text primary key default 'main',
  intro_title text not null default 'JOBHOT 求职训练营',
  intro_body text not null default '系统化完成简历、投递、笔试、面试和 offer 选择训练。',
  intro_image_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.career_camp_lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.career_camp_tasks (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.career_camp_lessons(id) on delete cascade,
  title text not null,
  description text not null default '',
  due_at timestamptz,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.career_camp_submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.career_camp_tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null default '',
  file_url text,
  status text not null default 'submitted' check (status in ('submitted', 'reviewed')),
  teacher_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(task_id, user_id)
);

insert into public.career_camp_settings (key)
values ('main')
on conflict (key) do nothing;

create index if not exists idx_camp_lessons_order on public.career_camp_lessons(is_published, sort_order);
create index if not exists idx_camp_tasks_lesson on public.career_camp_tasks(lesson_id, is_published, sort_order);
create index if not exists idx_camp_submissions_task on public.career_camp_submissions(task_id);
create index if not exists idx_camp_submissions_user on public.career_camp_submissions(user_id);

alter table public.career_camp_settings enable row level security;
alter table public.career_camp_lessons enable row level security;
alter table public.career_camp_tasks enable row level security;
alter table public.career_camp_submissions enable row level security;

drop policy if exists "Anyone can read camp settings" on public.career_camp_settings;
create policy "Anyone can read camp settings"
  on public.career_camp_settings for select
  using (true);

drop policy if exists "Admins can manage camp settings" on public.career_camp_settings;
create policy "Admins can manage camp settings"
  on public.career_camp_settings for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Anyone can read published camp lessons" on public.career_camp_lessons;
create policy "Anyone can read published camp lessons"
  on public.career_camp_lessons for select
  using (is_published = true or public.is_admin());

drop policy if exists "Admins can manage camp lessons" on public.career_camp_lessons;
create policy "Admins can manage camp lessons"
  on public.career_camp_lessons for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Anyone can read published camp tasks" on public.career_camp_tasks;
create policy "Anyone can read published camp tasks"
  on public.career_camp_tasks for select
  using (is_published = true or public.is_admin());

drop policy if exists "Admins can manage camp tasks" on public.career_camp_tasks;
create policy "Admins can manage camp tasks"
  on public.career_camp_tasks for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Users and admins can read camp submissions" on public.career_camp_submissions;
create policy "Users and admins can read camp submissions"
  on public.career_camp_submissions for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can submit own camp homework" on public.career_camp_submissions;
create policy "Users can submit own camp homework"
  on public.career_camp_submissions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users and admins can update camp submissions" on public.career_camp_submissions;
create policy "Users and admins can update camp submissions"
  on public.career_camp_submissions for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

insert into storage.buckets (id, name, public)
values ('career-camp-homework', 'career-camp-homework', true)
on conflict (id) do nothing;

drop policy if exists "Users can upload own camp homework files" on storage.objects;
create policy "Users can upload own camp homework files"
  on storage.objects for insert
  with check (
    bucket_id = 'career-camp-homework'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users and admins can read camp homework files" on storage.objects;
create policy "Users and admins can read camp homework files"
  on storage.objects for select
  using (
    bucket_id = 'career-camp-homework'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  );
