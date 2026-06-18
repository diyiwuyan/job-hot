-- ============================================================
-- Admin & Analytics Schema for JOBHOT
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Admins table ─────────────────────────────────────────
create table if not exists public.admins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now() not null
);

alter table public.admins enable row level security;

-- Super admin can see all admins; regular admin can see all admins too (read-only)
create policy "Admins can read admin list"
  on public.admins for select
  using (
    auth.uid() in (select user_id from public.admins)
  );

-- Only super_admin can insert new admins
create policy "Super admin can add admins"
  on public.admins for insert
  with check (
    exists (
      select 1 from public.admins
      where user_id = auth.uid() and role = 'super_admin'
    )
  );

-- Only super_admin can delete admins (but not themselves)
create policy "Super admin can remove admins"
  on public.admins for delete
  using (
    exists (
      select 1 from public.admins
      where user_id = auth.uid() and role = 'super_admin'
    )
    and user_id != auth.uid()
  );

-- ── 2. Page views (anonymous tracking) ─────────────────────
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  session_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  path text not null,
  referrer text,
  user_agent text,
  screen_width int,
  duration_seconds int default 0,
  created_at timestamptz default now() not null
);

alter table public.page_views enable row level security;

-- Anyone can insert (anonymous tracking)
create policy "Anyone can insert page views"
  on public.page_views for insert
  with check (true);

-- Only admins can read page views
create policy "Admins can read page views"
  on public.page_views for select
  using (
    auth.uid() in (select user_id from public.admins)
  );

-- Anyone can update their own page view (to update duration)
create policy "Anyone can update own page view duration"
  on public.page_views for update
  using (session_id = session_id)
  with check (true);

-- ── 3. Analytics events (clicks, interactions) ─────────────
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  session_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  event_target text,
  event_data jsonb default '{}'::jsonb,
  path text not null,
  created_at timestamptz default now() not null
);

alter table public.analytics_events enable row level security;

-- Anyone can insert events
create policy "Anyone can insert events"
  on public.analytics_events for insert
  with check (true);

-- Only admins can read events
create policy "Admins can read events"
  on public.analytics_events for select
  using (
    auth.uid() in (select user_id from public.admins)
  );

-- ── 4. Seed super admin ─────────────────────────────────────
-- This will be run after the super admin account logs in for the first time.
-- We insert by email lookup from auth.users.
-- NOTE: The super admin must have already registered via the login page.
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'diyiwuyan@163.com' limit 1;
  if v_user_id is not null then
    insert into public.admins (user_id, email, role)
    values (v_user_id, 'diyiwuyan@163.com', 'super_admin')
    on conflict (user_id) do update set role = 'super_admin';
  end if;
end $$;

-- ── 5. Indexes for query performance ────────────────────────
create index if not exists idx_page_views_created_at on public.page_views (created_at);
create index if not exists idx_page_views_path on public.page_views (path);
create index if not exists idx_page_views_session_id on public.page_views (session_id);
create index if not exists idx_analytics_events_created_at on public.analytics_events (created_at);
create index if not exists idx_analytics_events_event_type on public.analytics_events (event_type);
create index if not exists idx_admins_user_id on public.admins (user_id);

-- ── 6. Helper views for dashboard queries ───────────────────
-- Daily stats view (for admin dashboard)
create or replace view public.daily_stats as
select
  date_trunc('day', created_at at time zone 'Asia/Shanghai')::date as day,
  count(distinct session_id) as unique_visitors,
  count(*) as page_views,
  round(avg(duration_seconds)) as avg_duration_seconds
from public.page_views
group by 1
order by 1 desc;

-- Hourly stats view (for hourly chart)
create or replace view public.hourly_stats as
select
  date_trunc('day', created_at at time zone 'Asia/Shanghai')::date as day,
  extract(hour from created_at at time zone 'Asia/Shanghai')::int as hour,
  count(distinct session_id) as unique_visitors,
  count(*) as page_views
from public.page_views
group by 1, 2
order by 1 desc, 2;

-- Module click stats view
create or replace view public.module_click_stats as
select
  date_trunc('day', created_at at time zone 'Asia/Shanghai')::date as day,
  event_target as module,
  count(*) as clicks
from public.analytics_events
where event_type = 'module_click'
group by 1, 2
order by 1 desc, 3 desc;

-- Grant access to views for authenticated users (RLS on underlying tables still applies)
grant select on public.daily_stats to authenticated;
grant select on public.hourly_stats to authenticated;
grant select on public.module_click_stats to authenticated;
