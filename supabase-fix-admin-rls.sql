-- ============================================================
-- Fix: admins 表 RLS 无限递归 + 重新插入 super_admin
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ============================================================

-- Step 1: 删除有递归问题的旧策略
drop policy if exists "Admins can read admin list" on public.admins;
drop policy if exists "Super admin can add admins" on public.admins;
drop policy if exists "Super admin can remove admins" on public.admins;

-- Step 2: 用 security definer 函数替代直接子查询，打破递归
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid() and role = 'super_admin'
  );
$$;

-- Step 3: 重建无递归的 RLS 策略
create policy "Admins can read admin list"
  on public.admins for select
  using (public.is_admin());

create policy "Super admin can add admins"
  on public.admins for insert
  with check (public.is_super_admin());

create policy "Super admin can remove admins"
  on public.admins for delete
  using (public.is_super_admin() and user_id != auth.uid());

-- Step 4: 同步修复 page_views 和 analytics_events 的策略（也引用了 admins 表）
drop policy if exists "Admins can read page views" on public.page_views;
create policy "Admins can read page views"
  on public.page_views for select
  using (public.is_admin());

drop policy if exists "Admins can read events" on public.analytics_events;
create policy "Admins can read events"
  on public.analytics_events for select
  using (public.is_admin());

-- Step 5: 确保 diyiwuyan@163.com 是 super_admin
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'diyiwuyan@163.com' limit 1;
  if v_user_id is not null then
    insert into public.admins (user_id, email, role)
    values (v_user_id, 'diyiwuyan@163.com', 'super_admin')
    on conflict (user_id) do update set role = 'super_admin';
    raise notice 'Super admin set for user_id: %', v_user_id;
  else
    raise warning 'User diyiwuyan@163.com not found in auth.users!';
  end if;
end $$;
