-- ========================================================
-- PRODUCTION DATABASE SCHEMA FOR TELC B2 BERUF EXAM SIMULATOR
-- File: supabase/migrations/20260812_production_schema.sql
-- ========================================================

-- 1. ENUMS & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. USERS TABLE & AUTOMATIC SYNC WITH SUPABASE AUTH
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'USER',
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.users FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins can update user profiles"
  ON public.users FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

-- Trigger: Automatically insert new Auth users into public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, is_premium)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN LOWER(NEW.email) = 'luck34y@yahoo.com' THEN 'ADMIN'::user_role ELSE 'USER'::user_role END,
    CASE WHEN LOWER(NEW.email) = 'luck34y@yahoo.com' THEN TRUE ELSE FALSE END
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

-- 3. EXAMS TABLE
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'B2_Beruf',
  time_limit_minutes INT NOT NULL DEFAULT 45,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published exams"
  ON public.exams FOR SELECT
  USING (is_published = TRUE OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins can manage exams"
  ON public.exams FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

-- 4. SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  part_id TEXT NOT NULL,
  title TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sections"
  ON public.sections FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage sections"
  ON public.sections FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

-- 5. TASKS TABLE (Atomic Variants)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
  teil_number INT NOT NULL,
  type TEXT NOT NULL,
  content JSONB NOT NULL,
  order_index INT NOT NULL DEFAULT 1,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-hidden tasks"
  ON public.tasks FOR SELECT
  USING (is_hidden = FALSE OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins can manage tasks"
  ON public.tasks FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

-- 6. USER ATTEMPTS (Exam & Training Results)
CREATE TABLE IF NOT EXISTS public.user_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL,
  mode TEXT NOT NULL DEFAULT 'TRAINING',
  score INT NOT NULL DEFAULT 0,
  total_possible INT NOT NULL DEFAULT 0,
  duration_seconds INT NOT NULL DEFAULT 0,
  teil_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_completed BOOLEAN NOT NULL DEFAULT TRUE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts"
  ON public.user_attempts FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Users can insert own attempts"
  ON public.user_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7. WRITING ATTEMPTS (Schreiben Simulator Logs)
CREATE TABLE IF NOT EXISTS public.writing_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'BESCHWERDE' or 'FORUMSBEITRAG'
  prompt_title TEXT NOT NULL,
  user_text TEXT NOT NULL,
  character_count INT NOT NULL DEFAULT 0,
  duration_seconds INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.writing_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own writing attempts"
  ON public.writing_attempts FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Users can insert own writing attempts"
  ON public.writing_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 8. SPEAKING TOPICS (Sprechen T2/T3 & Schreiben Q58 Topics)
CREATE TABLE IF NOT EXISTS public.speaking_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teil_number INT NOT NULL, -- 2, 3, or 58
  title TEXT NOT NULL,
  description TEXT,
  bullet_points JSONB DEFAULT '[]'::jsonb,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.speaking_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-hidden topics"
  ON public.speaking_topics FOR SELECT
  USING (is_hidden = FALSE OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins can manage topics"
  ON public.speaking_topics FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

-- 9. PROMO CODES & SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  duration_days INT NOT NULL DEFAULT 30,
  max_uses INT NOT NULL DEFAULT 10,
  current_uses INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage promo codes"
  ON public.promo_codes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  promo_code_id UUID REFERENCES public.promo_codes(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

-- Function to Redeem Promo Code
CREATE OR REPLACE FUNCTION public.redeem_promo_code(p_code TEXT)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_promo RECORD;
  v_expires TIMESTAMPTZ;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Nicht authentifiziert');
  END IF;

  SELECT * INTO v_promo FROM public.promo_codes
  WHERE UPPER(code) = UPPER(TRIM(p_code)) AND is_active = TRUE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ungültiger oder inaktiver Promo-Code');
  END IF;

  IF v_promo.current_uses >= v_promo.max_uses THEN
    RETURN jsonb_build_object('success', false, 'error', 'Dieser Promo-Code ist abgelaufen');
  END IF;

  v_expires := NOW() + (v_promo.duration_days || ' days')::INTERVAL;

  UPDATE public.promo_codes
  SET current_uses = current_uses + 1
  WHERE id = v_promo.id;

  INSERT INTO public.user_subscriptions (user_id, promo_code_id, expires_at)
  VALUES (v_user_id, v_promo.id, v_expires);

  UPDATE public.users
  SET is_premium = TRUE
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'expires_at', v_expires,
    'duration_days', v_promo.duration_days
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. IMMEDIATE ADMIN ELEVATION QUERY FOR LUCK34Y@YAHOO.COM
UPDATE public.users
SET role = 'ADMIN', is_premium = TRUE
WHERE LOWER(email) = 'luck34y@yahoo.com';
