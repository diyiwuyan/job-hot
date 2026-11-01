-- Apply once in Supabase SQL Editor before relying on the new tracking RPCs.
-- Repairs legacy policies and prevents direct execution of privileged list RPCs.
begin;

alter table public.page_views add column if not exists city text;
alter table public.page_views add column if not exists region text;
alter table public.page_views add column if not exists country_code text;

drop policy if exists "Anyone can insert page views" on public.page_views;
drop policy if exists "Visitors can insert their own page views" on public.page_views;
create policy "Visitors can insert their own page views" on public.page_views
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
drop policy if exists "Anyone can update own page view duration" on public.page_views;

drop policy if exists "Anyone can insert events" on public.analytics_events;
drop policy if exists "Visitors can insert their own analytics events" on public.analytics_events;
create policy "Visitors can insert their own analytics events" on public.analytics_events
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

create or replace function public.record_page_view(
  page_session text,
  page_user uuid,
  page_path text,
  page_referrer text default null,
  page_agent text default null,
  page_screen_width integer default null,
  page_city text default null,
  page_region text default null,
  page_country_code text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id bigint;
begin
  if page_session is null or length(page_session) < 16 or length(page_session) > 128 or
     page_path is null or length(page_path) < 1 or length(page_path) > 512 or
     (page_user is not null and page_user is distinct from auth.uid()) then
    raise exception 'Invalid page view';
  end if;

  insert into public.page_views (
    session_id, user_id, path, referrer, user_agent, screen_width,
    city, region, country_code
  ) values (
    page_session, page_user, page_path, left(page_referrer, 1024),
    left(page_agent, 256), page_screen_width, left(page_city, 80),
    left(page_region, 80), left(page_country_code, 8)
  ) returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.record_page_duration(
  page_id bigint,
  page_session text,
  seconds_spent integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if page_id is null or page_session is null or length(page_session) < 16 or
     seconds_spent is null or seconds_spent < 0 or seconds_spent > 7200 then
    raise exception 'Invalid duration';
  end if;
  update public.page_views
  set duration_seconds = seconds_spent
  where id = page_id and session_id = page_session
    and (user_id is null or user_id = auth.uid());
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
    raise exception 'Admin access required';
  end if;
  if days_back is null or days_back < 1 or days_back > 180 then
    raise exception 'days_back must be between 1 and 180';
  end if;
  return query
  select coalesce(nullif(trim(pv.city), ''), '未识别'),
    coalesce(nullif(trim(pv.country_code), ''), '--'),
    count(distinct pv.session_id)::bigint,
    count(*)::bigint
  from public.page_views pv
  where pv.created_at >= now() - make_interval(days => days_back)
  group by 1, 2
  order by 3 desc, 4 desc, 1
  limit 100;
end;
$$;

revoke all on function public.record_page_view(text, uuid, text, text, text, integer, text, text, text) from public, anon, authenticated;
grant execute on function public.record_page_view(text, uuid, text, text, text, integer, text, text, text) to anon, authenticated;
revoke all on function public.record_page_duration(bigint, text, integer) from public, anon, authenticated;
grant execute on function public.record_page_duration(bigint, text, integer) to anon, authenticated;

-- PostgreSQL grants EXECUTE on new functions to PUBLIC by default. The old
-- admin_list_users() has no internal role check, so it must never be callable
-- through PostgREST, even when the safe wrapper exists.
do $$
declare fn record;
begin
  for fn in
    select p.oid::regprocedure as signature, p.proname as name
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and left(p.proname, 6) = 'admin_'
  loop
    execute format('revoke all on function %s from public, anon, authenticated', fn.signature);
    if fn.name <> 'admin_list_users' then
      execute format('grant execute on function %s to authenticated', fn.signature);
    end if;
  end loop;
end;
$$;

-- Older versions created these as definer views, bypassing table RLS.
do $$
declare view_name text;
begin
  foreach view_name in array array['daily_stats', 'hourly_stats', 'module_click_stats'] loop
    if to_regclass('public.' || view_name) is not null then
      execute format('alter view public.%I set (security_invoker = true)', view_name);
    end if;
  end loop;
end;
$$;

commit;
