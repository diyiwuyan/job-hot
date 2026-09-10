-- ============================================================
-- JOBHOT 访客城市统计与管理员用户档案
-- 在 Supabase Dashboard -> SQL Editor 中执行。
-- 目的：启用访问统计、城市汇总、测评结果与管理员只读档案。
-- 隐私边界：不保存或展示原始 IP；城市由前端得到的粗粒度位置写入。
-- ============================================================

create extension if not exists pgcrypto;

-- 管理员角色 -------------------------------------------------
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (select 1 from public.admins where user_id = auth.uid() and role = 'super_admin');
$$;

drop policy if exists "Admins can read admin list" on public.admins;
drop policy if exists "Super admin can add admins" on public.admins;
drop policy if exists "Super admin can remove admins" on public.admins;
create policy "Admins can read admin list" on public.admins for select to authenticated using (public.is_admin());
create policy "Super admin can add admins" on public.admins for insert to authenticated with check (public.is_super_admin());
create policy "Super admin can remove admins" on public.admins for delete to authenticated using (public.is_super_admin() and user_id <> auth.uid());

-- 访问与使用事件 ------------------------------------------------
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  session_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  path text not null,
  referrer text,
  user_agent text,
  screen_width integer,
  duration_seconds integer not null default 0,
  city text,
  region text,
  country_code text,
  created_at timestamptz not null default now()
);

alter table public.page_views add column if not exists city text;
alter table public.page_views add column if not exists region text;
alter table public.page_views add column if not exists country_code text;
alter table public.page_views enable row level security;

drop policy if exists "Anyone can insert page views" on public.page_views;
drop policy if exists "Visitors can insert their own page views" on public.page_views;
drop policy if exists "Admins can read page views" on public.page_views;
drop policy if exists "Anyone can update own page view duration" on public.page_views;
drop policy if exists "Signed-in users can update their own page view duration" on public.page_views;
create policy "Visitors can insert their own page views" on public.page_views for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
create policy "Admins can read page views" on public.page_views for select to authenticated using (public.is_admin());
create policy "Signed-in users can update their own page view duration" on public.page_views for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  session_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  event_target text,
  event_data jsonb not null default '{}'::jsonb,
  path text not null,
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;
drop policy if exists "Anyone can insert events" on public.analytics_events;
drop policy if exists "Visitors can insert their own analytics events" on public.analytics_events;
drop policy if exists "Admins can read events" on public.analytics_events;
drop policy if exists "Admins can read analytics events" on public.analytics_events;
create policy "Visitors can insert their own analytics events" on public.analytics_events for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
create policy "Admins can read analytics events" on public.analytics_events for select to authenticated using (public.is_admin());

create index if not exists idx_page_views_created_at on public.page_views (created_at desc);
create index if not exists idx_page_views_user_created_at on public.page_views (user_id, created_at desc) where user_id is not null;
create index if not exists idx_page_views_city_created_at on public.page_views (city, created_at desc) where city is not null;
create index if not exists idx_analytics_events_created_at on public.analytics_events (created_at desc);
create index if not exists idx_analytics_events_user_created_at on public.analytics_events (user_id, created_at desc) where user_id is not null;

-- 登录后的测评与笔试记录 --------------------------------------
create table if not exists public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id text not null,
  result_name text not null,
  answers jsonb not null default '{}'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, assessment_id)
);

create table if not exists public.exam_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id text not null,
  score integer not null,
  total integer not null,
  duration_seconds integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.assessment_results enable row level security;
alter table public.exam_results enable row level security;
drop policy if exists "Users can view own assessment results" on public.assessment_results;
drop policy if exists "Users and admins can view assessment results" on public.assessment_results;
drop policy if exists "Users can insert own assessment results" on public.assessment_results;
drop policy if exists "Users can update own assessment results" on public.assessment_results;
create policy "Users and admins can view assessment results" on public.assessment_results for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "Users can insert own assessment results" on public.assessment_results for insert to authenticated with check (user_id = auth.uid());
create policy "Users can update own assessment results" on public.assessment_results for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Users and admins can view exam results" on public.exam_results;
drop policy if exists "Users can insert own exam results" on public.exam_results;
create policy "Users and admins can view exam results" on public.exam_results for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "Users can insert own exam results" on public.exam_results for insert to authenticated with check (user_id = auth.uid());
create index if not exists idx_assessment_results_user_updated on public.assessment_results (user_id, updated_at desc);
create index if not exists idx_exam_results_user_created on public.exam_results (user_id, created_at desc);

-- 工作台、材料和练习记录对管理员开放只读摘要；私有文件本体保持不可见。
drop policy if exists "Admins can read application summaries" on public.job_applications;
create policy "Admins can read application summaries" on public.job_applications for select to authenticated using (public.is_admin());
drop policy if exists "Admins can read document metadata" on public.career_documents;
create policy "Admins can read document metadata" on public.career_documents for select to authenticated using (public.is_admin());
drop policy if exists "Admins can read practice summaries" on public.practice_records;
create policy "Admins can read practice summaries" on public.practice_records for select to authenticated using (public.is_admin());

-- 管理员安全用户清单与城市汇总 -------------------------------
-- 旧版本若已创建过同名函数，其返回字段与当前版本不同；先移除后重建。
drop function if exists public.admin_list_users_safe();
create or replace function public.admin_list_users_safe()
returns table (
  user_id uuid,
  email text,
  nickname text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  email_confirmed boolean,
  admin_role text,
  page_view_count bigint,
  last_active_at timestamptz
)
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  if not public.is_admin() then
    raise exception 'Permission denied: admin access required';
  end if;
  return query
  select u.id, u.email::text, nullif(u.raw_user_meta_data ->> 'nickname', ''), u.created_at, u.last_sign_in_at,
    (u.email_confirmed_at is not null), a.role,
    coalesce(pv.view_count, 0), pv.last_active
  from auth.users u
  left join public.admins a on a.user_id = u.id
  left join (
    select user_id, count(*)::bigint as view_count, max(created_at) as last_active
    from public.page_views where user_id is not null group by user_id
  ) pv on pv.user_id = u.id
  order by u.created_at desc;
end;
$$;

create or replace function public.admin_city_stats(days_back integer default 30)
returns table (city text, country_code text, unique_visitors bigint, page_views bigint)
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  if not public.is_admin() then
    raise exception 'Permission denied: admin access required';
  end if;
  if days_back < 1 or days_back > 180 then
    raise exception 'days_back must be between 1 and 180';
  end if;
  return query
  select coalesce(nullif(trim(pv.city), ''), '未识别') as city,
    coalesce(nullif(trim(pv.country_code), ''), '--') as country_code,
    count(distinct pv.session_id)::bigint as unique_visitors,
    count(*)::bigint as page_views
  from public.page_views pv
  where pv.created_at >= now() - make_interval(days => days_back)
  group by 1, 2
  order by unique_visitors desc, page_views desc, city asc
  limit 100;
end;
$$;

grant execute on function public.admin_list_users_safe() to authenticated;
grant execute on function public.admin_city_stats(integer) to authenticated;

-- 既有统计视图使用调用者权限，避免普通登录用户读取整体数据。
create or replace view public.daily_stats with (security_invoker = true) as
select date_trunc('day', created_at at time zone 'Asia/Shanghai')::date as day,
  count(distinct session_id) as unique_visitors,
  count(*) as page_views,
  round(avg(duration_seconds)) as avg_duration_seconds
from public.page_views group by 1 order by 1 desc;

create or replace view public.hourly_stats with (security_invoker = true) as
select date_trunc('day', created_at at time zone 'Asia/Shanghai')::date as day,
  extract(hour from created_at at time zone 'Asia/Shanghai')::integer as hour,
  count(distinct session_id) as unique_visitors,
  count(*) as page_views
from public.page_views group by 1, 2 order by 1 desc, 2;

create or replace view public.module_click_stats with (security_invoker = true) as
select date_trunc('day', created_at at time zone 'Asia/Shanghai')::date as day,
  event_target as module, count(*) as clicks
from public.analytics_events where event_type = 'module_click'
group by 1, 2 order by 1 desc, 3 desc;

grant select on public.daily_stats, public.hourly_stats, public.module_click_stats to authenticated;

-- 将已注册的主账号设为超级管理员；若该账号尚未在本站注册，会安全跳过。
do $$
declare v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'diyiwuyan@163.com' limit 1;
  if v_user_id is not null then
    insert into public.admins (user_id, email, role) values (v_user_id, 'diyiwuyan@163.com', 'super_admin')
    on conflict (user_id) do update set role = 'super_admin';
  end if;
end $$;
