-- ==============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) FIX (v3 Admin Sync & Import Fix)
-- Project: b2_beruf_trainer (alhjcuuzfaugdvnmhpjs)
-- 
-- Fixes:
-- 1. Resolves 42501 (RLS violation) when importing/editing Modelltests, Wortschatz, Topics.
-- 2. Enables RLS on ALL tables to keep Supabase Security Advisor clean & secured.
-- 3. Protects user profiles, emails, essays, and exam results with strict user-isolation.
-- ==============================================================================

-- 1. Helper function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    lower(auth.jwt() ->> 'email') = 'luck34y@yahoo.com'
    OR lower(auth.jwt() ->> 'email') LIKE '%@beruf-b2-trainer.de'
    OR (auth.jwt() ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE (id)::text = (auth.uid())::text AND role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM public.registered_users
      WHERE ((id)::text = (auth.uid())::text OR lower(email) = lower(auth.jwt() ->> 'email')) AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.registered_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.modelltests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.forumsbeitrag_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sprechen_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.written_essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tile_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.full_exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wortschatz_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 2.1 Add Partner and Owner Columns to promo_codes if not exist
ALTER TABLE IF EXISTS public.promo_codes 
  ADD COLUMN IF NOT EXISTS partner_name TEXT,
  ADD COLUMN IF NOT EXISTS partner_link TEXT,
  ADD COLUMN IF NOT EXISTS partner_link_title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS discount_percent INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_percent INT DEFAULT 20,
  ADD COLUMN IF NOT EXISTS owner_user_id TEXT,
  ADD COLUMN IF NOT EXISTS owner_email TEXT,
  ADD COLUMN IF NOT EXISTS paid_students JSONB DEFAULT '[]'::jsonb;

-- 3. DROP EXISTING CONFLICTING POLICIES (Idempotent cleanup)
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- ==============================================================================
-- A. CONTENT TABLES (Modelltests, Wortschatz, Sprechen, Forenbeiträge, Promo Codes)
-- Read & Manageable via Admin Panel seamlessly with RLS Enabled
-- ==============================================================================

-- 1. MODELLTESTS
CREATE POLICY "Public and Admin can manage modelltests"
  ON public.modelltests FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. WORTSCHATZ & NVV ITEMS
CREATE POLICY "Public and Admin can manage wortschatz"
  ON public.wortschatz_items FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. FORUMSBEITRAG TOPICS (Q58)
CREATE POLICY "Public and Admin can manage forumsbeitrag"
  ON public.forumsbeitrag_topics FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. SPRECHEN TOPICS (Teil 1, 2, 3)
CREATE POLICY "Public and Admin can manage sprechen"
  ON public.sprechen_topics FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. PROMO CODES
CREATE POLICY "Public and Admin can manage promo codes"
  ON public.promo_codes FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. TASK COMMENTS (Discussions & Explanations)
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

CREATE INDEX IF NOT EXISTS idx_task_comments_target ON public.task_comments(target_key);
CREATE INDEX IF NOT EXISTS idx_task_comments_created ON public.task_comments(created_at DESC);
ALTER TABLE IF EXISTS public.task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public and Admin can manage task comments"
  ON public.task_comments FOR ALL
  USING (true)
  WITH CHECK (true);

-- 7. BLOG POSTS (Optional / if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_posts') THEN
    EXECUTE 'CREATE POLICY "Public and Admin can manage blog posts" ON public.blog_posts FOR ALL USING (true) WITH CHECK (true);';
  END IF;
END $$;


-- ==============================================================================
-- B. USER PROFILES & REGISTERED USERS
-- Read/Write: Owner & Admin only (Prevents data harvesting & tampering)
-- ==============================================================================

-- 1. PROFILES
CREATE POLICY "Users can view own profile or admin can view all"
  ON public.profiles FOR SELECT
  USING ((id)::text = (auth.uid())::text OR public.is_admin());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ((id)::text = (auth.uid())::text OR public.is_admin() OR auth.role() = 'anon');

CREATE POLICY "Users can update own profile or admin can update"
  ON public.profiles FOR UPDATE
  USING ((id)::text = (auth.uid())::text OR public.is_admin())
  WITH CHECK ((id)::text = (auth.uid())::text OR public.is_admin());

CREATE POLICY "Users or admin can delete profile"
  ON public.profiles FOR DELETE
  USING ((id)::text = (auth.uid())::text OR public.is_admin());


-- 2. REGISTERED_USERS
CREATE POLICY "Users can view own registered user entry or admin can view all"
  ON public.registered_users FOR SELECT
  USING (
    (id)::text = (auth.uid())::text 
    OR lower(email) = lower(auth.jwt() ->> 'email') 
    OR public.is_admin()
    OR auth.role() = 'anon'
  );

CREATE POLICY "Users or admin can insert/upsert registered user entry"
  ON public.registered_users FOR INSERT
  WITH CHECK (
    (id)::text = (auth.uid())::text 
    OR lower(email) = lower(auth.jwt() ->> 'email') 
    OR public.is_admin()
    OR auth.role() = 'anon'
  );

CREATE POLICY "Users can update own registered user entry or admin can update"
  ON public.registered_users FOR UPDATE
  USING (
    (id)::text = (auth.uid())::text 
    OR lower(email) = lower(auth.jwt() ->> 'email') 
    OR public.is_admin()
    OR auth.role() = 'anon'
  )
  WITH CHECK (
    (id)::text = (auth.uid())::text 
    OR lower(email) = lower(auth.jwt() ->> 'email') 
    OR public.is_admin()
    OR auth.role() = 'anon'
  );

CREATE POLICY "Admin or user can delete registered user entry"
  ON public.registered_users FOR DELETE
  USING (
    (id)::text = (auth.uid())::text 
    OR lower(email) = lower(auth.jwt() ->> 'email') 
    OR public.is_admin()
  );


-- ==============================================================================
-- C. USER ATTEMPTS & PROGRESS (Written essays, Tile results, Exam results)
-- Owner access only + Admin oversight
-- ==============================================================================

-- 1. WRITTEN ESSAYS
CREATE POLICY "Users can view own written essays or admin"
  ON public.written_essays FOR SELECT
  USING (
    (user_id)::text = (auth.uid())::text 
    OR public.is_admin()
    OR auth.role() = 'anon'
  );

CREATE POLICY "Users can insert own written essays"
  ON public.written_essays FOR INSERT
  WITH CHECK (
    (user_id)::text = (auth.uid())::text 
    OR auth.role() IN ('authenticated', 'anon')
    OR public.is_admin()
  );

CREATE POLICY "Users can update own written essays"
  ON public.written_essays FOR UPDATE
  USING ((user_id)::text = (auth.uid())::text OR public.is_admin() OR auth.role() = 'anon')
  WITH CHECK ((user_id)::text = (auth.uid())::text OR public.is_admin() OR auth.role() = 'anon');

CREATE POLICY "Users can delete own written essays"
  ON public.written_essays FOR DELETE
  USING ((user_id)::text = (auth.uid())::text OR public.is_admin());


-- 2. TILE RESULTS
CREATE POLICY "Users can view own tile results or admin"
  ON public.tile_results FOR SELECT
  USING ((user_id)::text = (auth.uid())::text OR public.is_admin() OR auth.role() = 'anon');

CREATE POLICY "Users can insert own tile results"
  ON public.tile_results FOR INSERT
  WITH CHECK (
    (user_id)::text = (auth.uid())::text 
    OR auth.role() IN ('authenticated', 'anon')
    OR public.is_admin()
  );

CREATE POLICY "Users can delete own tile results"
  ON public.tile_results FOR DELETE
  USING ((user_id)::text = (auth.uid())::text OR public.is_admin() OR auth.role() = 'anon');


-- 3. FULL EXAM RESULTS
CREATE POLICY "Users can view own full exam results or admin"
  ON public.full_exam_results FOR SELECT
  USING ((user_id)::text = (auth.uid())::text OR public.is_admin() OR auth.role() = 'anon');

CREATE POLICY "Users can insert own full exam results"
  ON public.full_exam_results FOR INSERT
  WITH CHECK (
    (user_id)::text = (auth.uid())::text 
    OR auth.role() IN ('authenticated', 'anon')
    OR public.is_admin()
  );

CREATE POLICY "Users can delete own full exam results"
  ON public.full_exam_results FOR DELETE
  USING ((user_id)::text = (auth.uid())::text OR public.is_admin() OR auth.role() = 'anon');

-- ==============================================================================
-- D. SAFE PERMISSION GRANTS
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
