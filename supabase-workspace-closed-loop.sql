-- JOBHOT 求职工作台五步闭环升级（可在现有项目重复执行）
-- Supabase Dashboard → SQL Editor → New query → Run

alter table public.job_applications
  add column if not exists workflow_data jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'job_applications_workflow_data_object'
      and conrelid = 'public.job_applications'::regclass
  ) then
    alter table public.job_applications
      add constraint job_applications_workflow_data_object
      check (jsonb_typeof(workflow_data) = 'object');
  end if;
end $$;

create index if not exists idx_job_applications_user_priority
  on public.job_applications(user_id, ((workflow_data ->> 'priority')), updated_at desc);

comment on column public.job_applications.workflow_data is
  '岗位核验、优先级、JD与简历版本、投递渠道、面试反馈及迭代动作等五步闭环数据。';
