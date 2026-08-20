-- ============================================================
-- JOBHOT 账号昵称与超级管理员密码重置
-- 执行方式：Supabase Dashboard → SQL Editor
-- 依赖：supabase-fix-admin-rls.sql 中的 public.is_admin()/is_super_admin()
-- 说明：Supabase Auth 不保存明文密码，因此只能重置密码，不能查看原密码。
-- ============================================================

create extension if not exists pgcrypto;

drop function if exists public.admin_list_users_safe();
drop function if exists public.admin_list_users();

create or replace function public.admin_list_users()
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
language sql
security definer
set search_path = ''
stable
as $$
  select
    u.id as user_id,
    u.email::text,
    coalesce(nullif(u.raw_user_meta_data ->> 'nickname', ''), split_part(u.email::text, '@', 1)) as nickname,
    u.created_at,
    u.last_sign_in_at,
    (u.email_confirmed_at is not null) as email_confirmed,
    a.role as admin_role,
    coalesce(pv.view_count, 0) as page_view_count,
    pv.last_active as last_active_at
  from auth.users u
  left join public.admins a on a.user_id = u.id
  left join (
    select
      user_id,
      count(*) as view_count,
      max(created_at) as last_active
    from public.page_views
    where user_id is not null
    group by user_id
  ) pv on pv.user_id = u.id
  order by u.created_at desc;
$$;

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
as $$
begin
  if not public.is_admin() then
    raise exception 'Permission denied: admin access required';
  end if;

  return query select * from public.admin_list_users();
end;
$$;

grant execute on function public.admin_list_users_safe() to authenticated;

create or replace function public.admin_update_user_nickname(
  target_user_id uuid,
  target_nickname text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_nickname text;
begin
  if not public.is_super_admin() then
    raise exception 'Permission denied: super_admin access required';
  end if;

  clean_nickname := btrim(coalesce(target_nickname, ''));
  if char_length(clean_nickname) < 2 or char_length(clean_nickname) > 24 then
    raise exception 'Nickname must be between 2 and 24 characters';
  end if;

  if not exists (select 1 from auth.users where id = target_user_id) then
    raise exception 'User not found';
  end if;

  update auth.users
  set
    raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('nickname', clean_nickname),
    updated_at = now()
  where id = target_user_id;

  return clean_nickname;
end;
$$;

grant execute on function public.admin_update_user_nickname(uuid, text) to authenticated;

create or replace function public.admin_set_user_password(
  target_user_id uuid,
  new_password text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_password text;
  crypto_schema text;
  hashed_password text;
begin
  if not public.is_super_admin() then
    raise exception 'Permission denied: super_admin access required';
  end if;

  clean_password := coalesce(new_password, '');
  if length(clean_password) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;

  if not exists (select 1 from auth.users where id = target_user_id) then
    raise exception 'User not found';
  end if;

  select n.nspname
    into crypto_schema
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where p.proname = 'crypt'
    and pg_get_function_identity_arguments(p.oid) = 'text, text'
  limit 1;

  if crypto_schema is null then
    raise exception 'pgcrypto crypt(text, text) is not available';
  end if;

  execute format('select %I.crypt($1, %I.gen_salt(''bf''))', crypto_schema, crypto_schema)
    into hashed_password
    using clean_password;

  update auth.users
  set
    encrypted_password = hashed_password,
    updated_at = now(),
    email_confirmed_at = coalesce(email_confirmed_at, now())
  where id = target_user_id;

  return 'updated';
end;
$$;

grant execute on function public.admin_set_user_password(uuid, text) to authenticated;
