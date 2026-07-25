-- JOBHOT 职业坐标岗位库
-- 由 scripts/seed-career-atlas.ts 使用 service role 自动同步。
-- 也可以在 Supabase Dashboard → SQL Editor 中手动执行本文件。

create extension if not exists pgcrypto;

create table if not exists public.career_industries (
  id text primary key,
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.career_roles (
  slug text primary key,
  name text not null,
  english text not null,
  family text not null,
  seniority text not null default '初级',
  purpose text not null,
  interests text[] not null default '{}',
  strengths text[] not null default '{}',
  styles text[] not null default '{}',
  keywords text[] not null default '{}',
  outputs text[] not null default '{}',
  requirements text[] not null default '{}',
  gaps text[] not null default '{}',
  salary text[] not null default '{}',
  growth text[] not null default '{}',
  industries text[] not null default '{}',
  core_skills text[] not null default '{}',
  work_context text not null default '',
  adjacent text[] not null default '{}',
  entry text not null default '',
  confidence text not null default '低' check (confidence in ('中', '低')),
  evidence_status text not null default '编辑种子' check (evidence_status in ('编辑种子', 'JD观察', '从业者复核')),
  is_published boolean not null default true,
  sort_order integer not null default 0,
  last_reviewed_at date,
  updated_at timestamptz not null default now()
);

create table if not exists public.career_role_jd_signals (
  id uuid primary key default gen_random_uuid(),
  role_slug text not null references public.career_roles(slug) on delete cascade,
  label text not null,
  note text not null default '',
  sample_count integer not null default 0,
  source_urls text[] not null default '{}',
  confidence text not null default '低' check (confidence in ('高', '中', '低')),
  updated_at timestamptz not null default now(),
  unique(role_slug, label)
);

create table if not exists public.career_role_salary_observations (
  id uuid primary key default gen_random_uuid(),
  role_slug text not null references public.career_roles(slug) on delete cascade,
  title text not null,
  city text not null,
  level text not null,
  industry text not null,
  annual_range text not null,
  employment text not null,
  source_name text not null,
  source_url text not null,
  caveat text not null default '',
  captured_at date not null default current_date,
  unique(role_slug, source_url)
);

create index if not exists idx_career_roles_family on public.career_roles(family);
create index if not exists idx_career_roles_industries on public.career_roles using gin(industries);
create index if not exists idx_career_roles_published on public.career_roles(is_published, sort_order);
create index if not exists idx_career_role_jd_role on public.career_role_jd_signals(role_slug);
create index if not exists idx_career_salary_role on public.career_role_salary_observations(role_slug);

alter table public.career_industries enable row level security;
alter table public.career_roles enable row level security;
alter table public.career_role_jd_signals enable row level security;
alter table public.career_role_salary_observations enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'career_industries' and policyname = 'Anyone can view published career industries') then
    create policy "Anyone can view published career industries" on public.career_industries for select using (is_published = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'career_roles' and policyname = 'Anyone can view published career roles') then
    create policy "Anyone can view published career roles" on public.career_roles for select using (is_published = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'career_role_jd_signals' and policyname = 'Anyone can view career JD signals') then
    create policy "Anyone can view career JD signals" on public.career_role_jd_signals for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'career_role_salary_observations' and policyname = 'Anyone can view career salary observations') then
    create policy "Anyone can view career salary observations" on public.career_role_salary_observations for select using (true);
  end if;
end $$;

insert into public.career_industries (id, name, description, sort_order)
values
  ('internet-software', '互联网与软件', '软件、平台、SaaS、人工智能与数字产品。', 10),
  ('finance-insurance', '金融与保险', '银行、证券、基金、保险、支付与金融科技。', 20),
  ('manufacturing-industry', '制造与工业', '装备、汽车、电子、化工、材料与智能制造。', 30),
  ('new-energy', '新能源与能源', '光伏、储能、风电、电力与能源服务。', 40),
  ('consumer-retail', '消费与零售', '消费品牌、电商、零售、餐饮与生活服务。', 50),
  ('supply-chain-logistics', '供应链与物流', '采购、仓储、物流、贸易与供应链管理。', 60),
  ('healthcare-pharma', '医疗与医药', '医院、医药、器械、临床研究与健康服务。', 70),
  ('education-research', '教育与科研', '学校、培训、科研院所、课程与知识服务。', 80),
  ('professional-services', '咨询与专业服务', '咨询、审计、法律、人力与企业服务。', 90),
  ('soe-public', '国央企与公共服务', '国央企、政府相关机构、公共基础设施与公共事务。', 100),
  ('construction-real-estate', '建筑与房地产', '建筑、工程、地产、物业与城市更新。', 110),
  ('media-culture', '传媒与文化', '媒体、内容、出版、影视、广告与文化创意。', 120),
  ('agriculture-food', '农业与食品', '农业科技、食品研发、食品质量与农产品供应链。', 130),
  ('environment-esg', '环保与ESG', '环境治理、碳管理、可持续发展与ESG服务。', 140)
on conflict (id) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order, updated_at = now();
