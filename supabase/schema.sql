-- ==========================================
-- BERUF B2 TRAINER - SUPABASE PRODUCTION SCHEMA
-- Project: b2_beruf_trainer
-- URL: https://alhjcauzfaugdvmmhpjs.supabase.co
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Syncs with Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
  is_premium BOOLEAN NOT NULL DEFAULT false,
  premium_expires_at TIMESTAMPTZ,
  daily_exam_attempts_remaining INT DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" 
  ON public.profiles FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, is_premium)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE WHEN NEW.email = 'luck34y@yahoo.com' THEN 'admin' ELSE 'user' END,
    CASE WHEN NEW.email = 'luck34y@yahoo.com' THEN true ELSE false END
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

CREATE POLICY "Modelltests are viewable by all authenticated & anonymous users"
  ON public.modelltests FOR SELECT USING (true);

CREATE POLICY "Only admins can modify modelltests"
  ON public.modelltests FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
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

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promo codes to validate"
  ON public.promo_codes FOR SELECT USING (true);

CREATE POLICY "Anyone can update promo code use count"
  ON public.promo_codes FOR UPDATE USING (true);

CREATE POLICY "Admins can manage promo codes"
  ON public.promo_codes FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. FORUMSBEITRAG TOPICS TABLE (Q58)
CREATE TABLE IF NOT EXISTS public.forumsbeitrag_topics (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.forumsbeitrag_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Forumsbeitrag topics viewable by everyone" 
  ON public.forumsbeitrag_topics FOR SELECT USING (true);

-- 5. SPRECHEN TOPICS TABLE
CREATE TABLE IF NOT EXISTS public.sprechen_topics (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'part2' or 'part3'
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sprechen_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sprechen topics viewable by everyone" 
  ON public.sprechen_topics FOR SELECT USING (true);

-- 6. WRITTEN ESSAYS TABLE
CREATE TABLE IF NOT EXISTS public.written_essays (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  essay_type TEXT NOT NULL, -- 'beschwerde' or 'forumsbeitrag'
  topic_title TEXT NOT NULL,
  text TEXT NOT NULL,
  char_count INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.written_essays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and manage their own written essays"
  ON public.written_essays FOR ALL USING (auth.uid() = user_id);

-- 7. TILE RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.tile_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tile_type TEXT NOT NULL,
  modelltest_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  score INT NOT NULL,
  max_score INT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tile_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their tile results"
  ON public.tile_results FOR ALL USING (auth.uid() = user_id);

-- 8. FULL EXAM RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.full_exam_results (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score INT NOT NULL,
  max_total_score INT NOT NULL,
  passed BOOLEAN NOT NULL,
  tile_breakdown JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.full_exam_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their full exam results"
  ON public.full_exam_results FOR ALL USING (auth.uid() = user_id);
