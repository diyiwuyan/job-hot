-- ============================================================
-- JOBHOT 我的求职工作台：投递管理、求职材料、练习记录
-- 执行方式：Supabase Dashboard → SQL Editor → Run
-- 所有业务数据和文件都按 auth.uid() 隔离。
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null check (char_length(company) between 1 and 120),
  job_title text not null check (char_length(job_title) between 1 and 160),
  source_url text,
  status text not null default 'saved'
    check (status in ('saved', 'preparing', 'applied', 'assessment', 'interview', 'offer', 'closed')),
  deadline date,
  next_action text check (next_action is null or char_length(next_action) <= 240),
  next_action_at date,
  notes text check (notes is null or char_length(notes) <= 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_job_applications_user_status
  on public.job_applications(user_id, status, updated_at desc);
create index if not exists idx_job_applications_user_deadline
  on public.job_applications(user_id, deadline)
  where deadline is not null;
create index if not exists idx_job_applications_user_next_action
  on public.job_applications(user_id, next_action_at)
  where next_action_at is not null;

alter table public.job_applications enable row level security;

drop policy if exists "Users can view own job applications" on public.job_applications;
create policy "Users can view own job applications"
  on public.job_applications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own job applications" on public.job_applications;
create policy "Users can insert own job applications"
  on public.job_applications for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own job applications" on public.job_applications;
create policy "Users can update own job applications"
  on public.job_applications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own job applications" on public.job_applications;
create policy "Users can delete own job applications"
  on public.job_applications for delete
  using (auth.uid() = user_id);


create table if not exists public.career_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'resume'
    check (kind in ('resume', 'portfolio', 'certificate', 'other')),
  name text not null check (char_length(name) between 1 and 200),
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint not null default 0 check (size_bytes between 0 and 10485760),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_career_documents_user
  on public.career_documents(user_id, kind, updated_at desc);

alter table public.career_documents enable row level security;

drop policy if exists "Users can view own career documents" on public.career_documents;
create policy "Users can view own career documents"
  on public.career_documents for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own career documents" on public.career_documents;
create policy "Users can insert own career documents"
  on public.career_documents for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own career documents" on public.career_documents;
create policy "Users can update own career documents"
  on public.career_documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own career documents" on public.career_documents;
create policy "Users can delete own career documents"
  on public.career_documents for delete
  using (auth.uid() = user_id);


create table if not exists public.practice_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'interview'
    check (kind in ('written', 'interview', 'group', 'case', 'technical', 'other')),
  title text not null check (char_length(title) between 1 and 160),
  score numeric(6,2),
  max_score numeric(6,2),
  duration_minutes integer check (duration_minutes is null or duration_minutes between 1 and 1440),
  practiced_at date not null default current_date,
  notes text check (notes is null or char_length(notes) <= 3000),
  next_action text check (next_action is null or char_length(next_action) <= 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (score is null or score >= 0),
  check (max_score is null or max_score > 0),
  check (score is null or max_score is null or score <= max_score)
);

create index if not exists idx_practice_records_user_date
  on public.practice_records(user_id, practiced_at desc, created_at desc);

alter table public.practice_records enable row level security;

drop policy if exists "Users can view own practice records" on public.practice_records;
create policy "Users can view own practice records"
  on public.practice_records for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own practice records" on public.practice_records;
create policy "Users can insert own practice records"
  on public.practice_records for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own practice records" on public.practice_records;
create policy "Users can update own practice records"
  on public.practice_records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own practice records" on public.practice_records;
create policy "Users can delete own practice records"
  on public.practice_records for delete
  using (auth.uid() = user_id);


-- 私有材料桶：文件不会获得永久公开 URL，只能通过登录用户的短时签名链接读取。
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'career-documents',
  'career-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload own career documents" on storage.objects;
create policy "Users can upload own career documents"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'career-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can read own career documents" on storage.objects;
create policy "Users can read own career documents"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'career-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update own career documents" on storage.objects;
create policy "Users can update own career documents"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'career-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'career-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own career documents" on storage.objects;
create policy "Users can delete own career documents"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'career-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
