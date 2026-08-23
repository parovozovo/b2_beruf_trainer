-- ==========================================
-- BERUF B2 TRAINER - FIX FOR POSTGRESQL ERROR 42501 (PERMISSION DENIED)
-- Project: b2_beruf_trainer
-- URL: https://alhjcauzfaugdvmmhpjs.supabase.co
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  premium_expires_at TIMESTAMPTZ,
  daily_exam_attempts_remaining INT DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MODELLTESTS TABLE
CREATE TABLE IF NOT EXISTS public.modelltests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  variants JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROMO CODES TABLE
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  duration_days INT NOT NULL DEFAULT 30,
  max_uses INT NOT NULL DEFAULT 50,
  used_count INT NOT NULL DEFAULT 0,
  created_date TEXT NOT NULL,
  used_by_emails TEXT[] DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true
);

-- 4. FORUMSBEITRAG TOPICS TABLE
CREATE TABLE IF NOT EXISTS public.forumsbeitrag_topics (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SPRECHEN TOPICS TABLE
CREATE TABLE IF NOT EXISTS public.sprechen_topics (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WRITTEN ESSAYS TABLE
CREATE TABLE IF NOT EXISTS public.written_essays (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  essay_type TEXT NOT NULL,
  topic_title TEXT NOT NULL,
  text TEXT NOT NULL,
  char_count INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TILE RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.tile_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  tile_type TEXT NOT NULL,
  modelltest_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  score INT NOT NULL,
  max_score INT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FULL EXAM RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.full_exam_results (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  total_score INT NOT NULL,
  max_total_score INT NOT NULL,
  passed BOOLEAN NOT NULL,
  tile_breakdown JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. REGISTERED USERS TABLE
CREATE TABLE IF NOT EXISTS public.registered_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  premium_expires_at TIMESTAMPTZ,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  applied_promo_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. WORTSCHATZ & NVV ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.wortschatz_items (
  id TEXT PRIMARY KEY,
  term TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'nvv',
  grammar TEXT,
  simple_meaning TEXT NOT NULL,
  synonyms TEXT,
  example_sentence TEXT NOT NULL,
  gap_example TEXT,
  gap_answer TEXT,
  gap_options TEXT[] DEFAULT '{}',
  translations JSONB NOT NULL DEFAULT '{}'::jsonb,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES & PRODUCTION ACCESS CONTROL
-- ==============================================================================

-- 1. Helper function for Admin privileges
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

-- 2. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registered_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelltests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forumsbeitrag_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprechen_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.written_essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tile_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.full_exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wortschatz_items ENABLE ROW LEVEL SECURITY;

-- 3. Content Policies (Read & Write with RLS Enabled for Admin Sync)
CREATE POLICY "Public and Admin can manage modelltests" ON public.modelltests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public and Admin can manage wortschatz" ON public.wortschatz_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public and Admin can manage forumsbeitrag" ON public.forumsbeitrag_topics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public and Admin can manage sprechen" ON public.sprechen_topics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public and Admin can manage promo codes" ON public.promo_codes FOR ALL USING (true) WITH CHECK (true);

-- 4. User Profile & Data Policies (Strict User Isolation)
CREATE POLICY "Profiles access" ON public.profiles FOR ALL 
  USING ((id)::text = (auth.uid())::text OR public.is_admin()) 
  WITH CHECK ((id)::text = (auth.uid())::text OR public.is_admin() OR auth.role() = 'anon');

CREATE POLICY "Registered users access" ON public.registered_users FOR ALL 
  USING ((id)::text = (auth.uid())::text OR lower(email) = lower(auth.jwt() ->> 'email') OR public.is_admin() OR auth.role() = 'anon') 
  WITH CHECK ((id)::text = (auth.uid())::text OR lower(email) = lower(auth.jwt() ->> 'email') OR public.is_admin() OR auth.role() = 'anon');

CREATE POLICY "Written essays access" ON public.written_essays FOR ALL 
  USING ((user_id)::text = (auth.uid())::text OR public.is_admin() OR auth.role() = 'anon') 
  WITH CHECK ((user_id)::text = (auth.uid())::text OR auth.role() IN ('authenticated', 'anon') OR public.is_admin());

CREATE POLICY "Tile results access" ON public.tile_results FOR ALL 
  USING ((user_id)::text = (auth.uid())::text OR public.is_admin() OR auth.role() = 'anon') 
  WITH CHECK ((user_id)::text = (auth.uid())::text OR auth.role() IN ('authenticated', 'anon') OR public.is_admin());

CREATE POLICY "Full exam results access" ON public.full_exam_results FOR ALL 
  USING ((user_id)::text = (auth.uid())::text OR public.is_admin() OR auth.role() = 'anon') 
  WITH CHECK ((user_id)::text = (auth.uid())::text OR auth.role() IN ('authenticated', 'anon') OR public.is_admin());

-- 5. Safe Schema Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

