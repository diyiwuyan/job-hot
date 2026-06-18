-- JOBHOT 订阅推送功能数据库表
-- 在 Supabase Dashboard → SQL Editor 中执行此脚本

-- 1. 用户订阅配置表
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  -- 订阅关键词（逗号分隔，如 "字节跳动,腾讯,AI"）
  keywords text[] default '{}' not null,
  -- 行业筛选（对应 category 枚举）
  categories text[] default '{}' not null,
  -- 企业类型筛选（对应 companyType 枚举）
  company_types text[] default '{}' not null,
  -- 城市筛选
  cities text[] default '{}' not null,
  -- 频道筛选 campus/intern
  channels text[] default '{}' not null,
  -- 推送频率: daily / weekly
  push_frequency text default 'daily' not null check (push_frequency in ('daily', 'weekly')),
  -- 是否激活推送
  is_active boolean default true not null,
  -- 是否付费用户（MVP 阶段暂不校验）
  is_paid boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- 每个用户只有一个订阅配置
  unique(user_id)
);

-- 2. 订阅匹配结果表（存储匹配到的职位信息）
create table if not exists public.subscription_matches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  feed_item_id text not null,
  title text not null,
  url text not null,
  source text,
  company_name text,
  location text,
  deadline text,
  channel text,
  category text,
  score integer default 0,
  matched_keywords text[] default '{}',
  is_read boolean default false not null,
  is_pushed boolean default false not null,
  matched_at timestamptz default now() not null,

  -- 同一用户不重复推同一条
  unique(user_id, feed_item_id)
);

-- 3. 启用 RLS
alter table public.subscriptions enable row level security;
alter table public.subscription_matches enable row level security;

-- 4. subscriptions RLS 策略
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own subscription"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own subscription"
  on public.subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can delete own subscription"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

-- 5. subscription_matches RLS 策略
create policy "Users can view own matches"
  on public.subscription_matches for select
  using (auth.uid() = user_id);

create policy "Users can delete own matches"
  on public.subscription_matches for delete
  using (auth.uid() = user_id);

-- 用户可以更新自己的匹配状态（标记已读）
create policy "Users can update own matches"
  on public.subscription_matches for update
  using (auth.uid() = user_id);

-- 注意: 匹配结果的插入由 Service Role Key 在 GitHub Actions 中完成，
-- Service Role 自动绕过 RLS，无需额外 insert 策略。

-- 6. 索引
create index if not exists idx_subscriptions_user on public.subscriptions(user_id);
create index if not exists idx_subscriptions_active on public.subscriptions(is_active) where is_active = true;
create index if not exists idx_matches_user on public.subscription_matches(user_id);
create index if not exists idx_matches_unread on public.subscription_matches(user_id, is_read) where is_read = false;
create index if not exists idx_matches_unpushed on public.subscription_matches(is_pushed) where is_pushed = false;

-- 7. updated_at 自动更新触发器
create or replace function update_modified_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.subscriptions
  for each row execute function update_modified_column();
