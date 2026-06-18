-- ============================================================
-- Account Management RPC functions for JOBHOT Admin
-- Run this in Supabase Dashboard → SQL Editor
-- Requires: supabase-fix-admin-rls.sql executed first
-- ============================================================

-- ── 1. List all registered users (admin only) ────────────────
-- Returns user list with email, registration time, last sign-in,
-- admin role (if any), and activity stats.
create or replace function public.admin_list_users()
returns table (
  user_id uuid,
  email text,
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

-- Grant execute to authenticated (RLS check inside the function)
-- We wrap with is_admin() check at the application level,
-- but also add a safety check here:
create or replace function public.admin_list_users_safe()
returns table (
  user_id uuid,
  email text,
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
  -- Only admins can call this
  if not public.is_admin() then
    raise exception 'Permission denied: admin access required';
  end if;

  return query select * from public.admin_list_users();
end;
$$;

grant execute on function public.admin_list_users_safe() to authenticated;

-- ── 2. Set/remove admin role (super_admin only) ──────────────
create or replace function public.admin_set_role(
  target_user_id uuid,
  target_role text  -- 'admin', 'super_admin', or null to remove
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Only super_admin can change roles
  if not public.is_super_admin() then
    raise exception 'Permission denied: super_admin access required';
  end if;

  -- Cannot change own role
  if target_user_id = auth.uid() then
    raise exception 'Cannot change your own role';
  end if;

  -- Validate role value
  if target_role is not null and target_role not in ('admin', 'super_admin') then
    raise exception 'Invalid role: must be admin, super_admin, or null';
  end if;

  if target_role is null then
    -- Remove admin
    delete from public.admins where user_id = target_user_id;
    return 'removed';
  else
    -- Upsert admin record
    -- First get the email
    declare
      v_email text;
    begin
      select email into v_email from auth.users where id = target_user_id;
      if v_email is null then
        raise exception 'User not found';
      end if;

      insert into public.admins (user_id, email, role, granted_by)
      values (target_user_id, v_email, target_role, auth.uid())
      on conflict (user_id) do update set role = target_role;

      return target_role;
    end;
  end if;
end;
$$;

grant execute on function public.admin_set_role(uuid, text) to authenticated;

-- ── 3. Delete user account (super_admin only) ────────────────
-- This removes the user from auth.users (cascade deletes admins, bookmarks, etc.)
create or replace function public.admin_delete_user(target_user_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Permission denied: super_admin access required';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'Cannot delete your own account';
  end if;

  -- Check user exists
  if not exists (select 1 from auth.users where id = target_user_id) then
    raise exception 'User not found';
  end if;

  -- Delete from auth.users (cascades to admins, bookmarks, etc.)
  delete from auth.users where id = target_user_id;

  return 'deleted';
end;
$$;

grant execute on function public.admin_delete_user(uuid) to authenticated;
