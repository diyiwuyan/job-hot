-- ============================================================
-- JOBHOT 管理端用户档案：只读权限
-- 执行方式：Supabase Dashboard → SQL Editor → Run
-- 依赖：public.is_admin()（由 supabase-fix-admin-rls.sql 提供）
-- 说明：只开放业务记录摘要；storage.objects 和私有简历原文件不向管理员开放。
-- ============================================================

drop policy if exists "Admins can read assessment summaries" on public.assessment_results;
create policy "Admins can read assessment summaries"
  on public.assessment_results for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read exam summaries" on public.exam_results;
create policy "Admins can read exam summaries"
  on public.exam_results for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read application summaries" on public.job_applications;
create policy "Admins can read application summaries"
  on public.job_applications for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read document metadata" on public.career_documents;
create policy "Admins can read document metadata"
  on public.career_documents for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read practice summaries" on public.practice_records;
create policy "Admins can read practice summaries"
  on public.practice_records for select to authenticated
  using (public.is_admin());

