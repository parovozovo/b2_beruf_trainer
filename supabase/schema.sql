-- ==========================================
-- BERUF B2 TRAINER - SUPABASE PRODUCTION SCHEMA (PERMISSIVE RLS FOR EASY SYNC)
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles viewable" ON public.profiles;
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public profiles insert" ON public.profiles;
CREATE POLICY "Public profiles insert" ON public.profiles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public profiles update" ON public.profiles;
CREATE POLICY "Public profiles update" ON public.profiles FOR UPDATE USING (true);

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

ALTER TABLE public.modelltests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Modelltests read all" ON public.modelltests;
CREATE POLICY "Modelltests read all" ON public.modelltests FOR SELECT USING (true);
DROP POLICY IF EXISTS "Modelltests write all" ON public.modelltests;
CREATE POLICY "Modelltests write all" ON public.modelltests FOR ALL USING (true) WITH CHECK (true);

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

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Promo codes all" ON public.promo_codes;
CREATE POLICY "Promo codes all" ON public.promo_codes FOR ALL USING (true) WITH CHECK (true);

-- 4. FORUMSBEITRAG TOPICS TABLE (Q58)
CREATE TABLE IF NOT EXISTS public.forumsbeitrag_topics (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.forumsbeitrag_topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Forumsbeitrag topics all" ON public.forumsbeitrag_topics;
CREATE POLICY "Forumsbeitrag topics all" ON public.forumsbeitrag_topics FOR ALL USING (true) WITH CHECK (true);

-- 5. SPRECHEN TOPICS TABLE
CREATE TABLE IF NOT EXISTS public.sprechen_topics (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sprechen_topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Sprechen topics all" ON public.sprechen_topics;
CREATE POLICY "Sprechen topics all" ON public.sprechen_topics FOR ALL USING (true) WITH CHECK (true);

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

ALTER TABLE public.written_essays ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Written essays all" ON public.written_essays;
CREATE POLICY "Written essays all" ON public.written_essays FOR ALL USING (true) WITH CHECK (true);

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

ALTER TABLE public.tile_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tile results all" ON public.tile_results;
CREATE POLICY "Tile results all" ON public.tile_results FOR ALL USING (true) WITH CHECK (true);

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

ALTER TABLE public.full_exam_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Full exam results all" ON public.full_exam_results;
CREATE POLICY "Full exam results all" ON public.full_exam_results FOR ALL USING (true) WITH CHECK (true);
