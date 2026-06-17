-- JOBHOT 收藏功能数据库表
-- 在 Supabase Dashboard → SQL Editor 中执行此脚本

-- 1. 创建 bookmarks 表
create table if not exists public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  feed_item_id text not null,
  title text,
  url text,
  source text,
  created_at timestamptz default now() not null,
  
  -- 同一个用户不能重复收藏同一条
  unique(user_id, feed_item_id)
);

-- 2. 启用 RLS（行级安全策略）
alter table public.bookmarks enable row level security;

-- 3. 用户只能查看自己的收藏
create policy "Users can view own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

-- 4. 用户只能插入自己的收藏
create policy "Users can insert own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

-- 5. 用户只能删除自己的收藏
create policy "Users can delete own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- 6. 为查询性能建索引
create index if not exists idx_bookmarks_user_id on public.bookmarks(user_id);
create index if not exists idx_bookmarks_feed_item on public.bookmarks(user_id, feed_item_id);
