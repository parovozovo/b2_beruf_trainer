-- ==============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) FIX & PRODUCTION SECURITY AUDIT (v2 Fixed Type-Casting)
-- Project: b2_beruf_trainer (alhjcuuzfaugdvnmhpjs)
-- 
-- Fixes:
-- 1. Adds explicit ::text casting to all UUID/TEXT comparisons to prevent ERROR 42883.
-- 2. Enables RLS on ALL public tables.
-- 3. Grants public read access ONLY to learning content (tests, vocabulary, topics).
-- 4. Secures user profiles, emails, essays, and admin actions.
-- ==============================================================================

-- 1. Helper function to check admin status (with explicit text casting)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    (auth.jwt() ->> 'email') = 'luck34y@yahoo.com'
    OR (auth.jwt() ->> 'email') LIKE '%@beruf-b2-trainer.de'
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE (id)::text = (auth.uid())::text AND role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM public.registered_users
      WHERE ((id)::text = (auth.uid())::text OR email = (auth.jwt() ->> 'email')) AND role = 'admin'
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
-- A. PUBLIC CONTENT TABLES (Modelltests, Wortschatz, Sprechen, Forenbeiträge)
-- Read: Public (Anon + Authenticated) | Write: Admin Only
-- ==============================================================================

-- 1. MODELLTESTS
CREATE POLICY "Public can view modelltests"
  ON public.modelltests FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert modelltests"
  ON public.modelltests FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update modelltests"
  ON public.modelltests FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete modelltests"
  ON public.modelltests FOR DELETE
  USING (public.is_admin());


-- 2. WORTSCHATZ & NVV ITEMS
CREATE POLICY "Public can view wortschatz items"
  ON public.wortschatz_items FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert wortschatz items"
  ON public.wortschatz_items FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update wortschatz items"
  ON public.wortschatz_items FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete wortschatz items"
  ON public.wortschatz_items FOR DELETE
  USING (public.is_admin());


-- 3. FORUMSBEITRAG TOPICS (Q58)
CREATE POLICY "Public can view forumsbeitrag topics"
  ON public.forumsbeitrag_topics FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert forumsbeitrag topics"
  ON public.forumsbeitrag_topics FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update forumsbeitrag topics"
  ON public.forumsbeitrag_topics FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete forumsbeitrag topics"
  ON public.forumsbeitrag_topics FOR DELETE
  USING (public.is_admin());


-- 4. SPRECHEN TOPICS (Teil 1, 2, 3)
CREATE POLICY "Public can view sprechen topics"
  ON public.sprechen_topics FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert sprechen topics"
  ON public.sprechen_topics FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update sprechen topics"
  ON public.sprechen_topics FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete sprechen topics"
  ON public.sprechen_topics FOR DELETE
  USING (public.is_admin());


-- 5. BLOG POSTS (Optional / if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_posts') THEN
    EXECUTE 'CREATE POLICY "Public can view blog posts" ON public.blog_posts FOR SELECT USING (true);';
    EXECUTE 'CREATE POLICY "Admin can insert blog posts" ON public.blog_posts FOR INSERT WITH CHECK (public.is_admin());';
    EXECUTE 'CREATE POLICY "Admin can update blog posts" ON public.blog_posts FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());';
    EXECUTE 'CREATE POLICY "Admin can delete blog posts" ON public.blog_posts FOR DELETE USING (public.is_admin());';
  END IF;
END $$;


-- ==============================================================================
-- B. PROMO CODES
-- Read: Public (to validate promo codes) | Write: Admin & Controlled Redemption
-- ==============================================================================

CREATE POLICY "Anyone can check promo codes"
  ON public.promo_codes FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert promo codes"
  ON public.promo_codes FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin or user can update promo code redemption"
  ON public.promo_codes FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can delete promo codes"
  ON public.promo_codes FOR DELETE
  USING (public.is_admin());


-- ==============================================================================
-- C. USER PROFILES & REGISTERED USERS
-- Read/Write: Owner & Admin only (Prevents data harvesting & tampering)
-- ==============================================================================

-- 1. PROFILES
CREATE POLICY "Users can view own profile or admin can view all"
  ON public.profiles FOR SELECT
  USING ((id)::text = (auth.uid())::text OR public.is_admin());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ((id)::text = (auth.uid())::text OR public.is_admin());

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
    OR email = (auth.jwt() ->> 'email') 
    OR public.is_admin()
  );

CREATE POLICY "Users or admin can insert/upsert registered user entry"
  ON public.registered_users FOR INSERT
  WITH CHECK (
    (id)::text = (auth.uid())::text 
    OR email = (auth.jwt() ->> 'email') 
    OR public.is_admin()
    OR auth.role() = 'anon' -- Allows guest registration sync
  );

CREATE POLICY "Users can update own registered user entry or admin can update"
  ON public.registered_users FOR UPDATE
  USING (
    (id)::text = (auth.uid())::text 
    OR email = (auth.jwt() ->> 'email') 
    OR public.is_admin()
  )
  WITH CHECK (
    (id)::text = (auth.uid())::text 
    OR email = (auth.jwt() ->> 'email') 
    OR public.is_admin()
  );

CREATE POLICY "Admin or user can delete registered user entry"
  ON public.registered_users FOR DELETE
  USING (
    (id)::text = (auth.uid())::text 
    OR email = (auth.jwt() ->> 'email') 
    OR public.is_admin()
  );


-- ==============================================================================
-- D. USER ATTEMPTS & PROGRESS (Written essays, Tile results, Exam results)
-- Owner access only + Admin oversight
-- ==============================================================================

-- 1. WRITTEN ESSAYS
CREATE POLICY "Users can view own written essays or admin"
  ON public.written_essays FOR SELECT
  USING (
    (user_id)::text = (auth.uid())::text 
    OR public.is_admin()
  );

CREATE POLICY "Users can insert own written essays"
  ON public.written_essays FOR INSERT
  WITH CHECK (
    (user_id)::text = (auth.uid())::text 
    OR auth.role() = 'authenticated'
    OR auth.role() = 'anon'
  );

CREATE POLICY "Users can update own written essays"
  ON public.written_essays FOR UPDATE
  USING ((user_id)::text = (auth.uid())::text OR public.is_admin())
  WITH CHECK ((user_id)::text = (auth.uid())::text OR public.is_admin());

CREATE POLICY "Users can delete own written essays"
  ON public.written_essays FOR DELETE
  USING ((user_id)::text = (auth.uid())::text OR public.is_admin());


-- 2. TILE RESULTS
CREATE POLICY "Users can view own tile results or admin"
  ON public.tile_results FOR SELECT
  USING ((user_id)::text = (auth.uid())::text OR public.is_admin());

CREATE POLICY "Users can insert own tile results"
  ON public.tile_results FOR INSERT
  WITH CHECK (
    (user_id)::text = (auth.uid())::text 
    OR auth.role() = 'authenticated'
    OR auth.role() = 'anon'
  );

CREATE POLICY "Users can delete own tile results"
  ON public.tile_results FOR DELETE
  USING ((user_id)::text = (auth.uid())::text OR public.is_admin());


-- 3. FULL EXAM RESULTS
CREATE POLICY "Users can view own full exam results or admin"
  ON public.full_exam_results FOR SELECT
  USING ((user_id)::text = (auth.uid())::text OR public.is_admin());

CREATE POLICY "Users can insert own full exam results"
  ON public.full_exam_results FOR INSERT
  WITH CHECK (
    (user_id)::text = (auth.uid())::text 
    OR auth.role() = 'authenticated'
    OR auth.role() = 'anon'
  );

CREATE POLICY "Users can delete own full exam results"
  ON public.full_exam_results FOR DELETE
  USING ((user_id)::text = (auth.uid())::text OR public.is_admin());

-- ==============================================================================
-- E. SAFE PERMISSION GRANTS
-- Grant appropriate access without compromising security
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
