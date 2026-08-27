-- ==============================================================================
-- TASK COMMENTS TABLE, PERMISSIONS & RLS POLICIES FOR SUPABASE
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. Create task_comments table if not exists
CREATE TABLE IF NOT EXISTS public.task_comments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  test_id TEXT NOT NULL,
  tile_type TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  target_key TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT DEFAULT 'user',
  user_email TEXT,
  content TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  upvoted_by TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_task_comments_target ON public.task_comments(target_key);
CREATE INDEX IF NOT EXISTS idx_task_comments_created ON public.task_comments(created_at DESC);

-- 3. GRANT TABLE PERMISSIONS (Crucial for anon & authenticated Supabase clients)
GRANT ALL ON TABLE public.task_comments TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 4. Enable RLS and public access policy
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public and Admin can manage task comments" ON public.task_comments;
CREATE POLICY "Public and Admin can manage task comments"
  ON public.task_comments FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
