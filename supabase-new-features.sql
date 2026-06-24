-- ============================================================
-- 新功能表：笔试成绩、宣讲会预约、许愿池
-- 执行方式：在 Supabase Dashboard > SQL Editor 中运行
-- ============================================================

-- 1. 笔试训练成绩表
CREATE TABLE IF NOT EXISTS public.exam_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL DEFAULT 20,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exam_results_user ON public.exam_results(user_id, exam_id);

ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exam results"
  ON public.exam_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exam results"
  ON public.exam_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- 2. 宣讲会预约提醒表
CREATE TABLE IF NOT EXISTS public.talk_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  talk_title TEXT NOT NULL,
  company TEXT,
  talk_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, talk_title)
);

CREATE INDEX IF NOT EXISTS idx_talk_reminders_user ON public.talk_reminders(user_id);

ALTER TABLE public.talk_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders"
  ON public.talk_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON public.talk_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can upsert own reminders"
  ON public.talk_reminders FOR UPDATE
  USING (auth.uid() = user_id);


-- 3. 许愿池表（匿名，不关联用户）
CREATE TABLE IF NOT EXISTS public.wishes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL CHECK (char_length(content) <= 200),
  company_type TEXT,
  emoji TEXT DEFAULT '🌟',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wishes_created ON public.wishes(created_at DESC);

ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wishes"
  ON public.wishes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert wishes"
  ON public.wishes FOR INSERT
  WITH CHECK (true);
