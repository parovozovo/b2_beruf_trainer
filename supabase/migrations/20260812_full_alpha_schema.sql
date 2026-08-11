-- ========================================================
-- CONSOLIDATED FULL ALPHA SCHEMA FOR TELC B2 BERUF SIMULATOR
-- Migration File: 20260812_full_alpha_schema.sql
-- Run this single file in Supabase SQL Editor to initialize.
-- ========================================================

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.task_type AS ENUM ('MATCHING', 'SPRACHBAUSTEINE', 'AUDIO_CHOICE', 'MULTIPLE_CHOICE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. PUBLIC USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role public.user_role NOT NULL DEFAULT 'USER'::public.user_role,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. EXAMS TABLE
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    level TEXT NOT NULL DEFAULT 'B2_Beruf',
    time_limit_minutes INTEGER NOT NULL DEFAULT 45,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. EXAM SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.exam_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES public.exam_sections(id) ON DELETE CASCADE,
    teil_number INTEGER NOT NULL DEFAULT 1,
    type public.task_type NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    order_index INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. USER ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.user_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    mode TEXT NOT NULL DEFAULT 'SIMULATION',
    score INTEGER NOT NULL DEFAULT 0,
    total_possible INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    teil_scores JSONB DEFAULT '{}'::jsonb,
    is_completed BOOLEAN NOT NULL DEFAULT TRUE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PROMO CODES TABLE
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 30,
    max_uses INTEGER NOT NULL DEFAULT 10,
    current_uses INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. WRITING ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.writing_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    prompt_title TEXT NOT NULL,
    user_text TEXT NOT NULL,
    character_count INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. SPEAKING & Q58 TOPICS TABLE
CREATE TABLE IF NOT EXISTS public.speaking_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teil_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    bullet_points JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES & HELPER FUNCTIONS
-- ========================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_topics ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'ADMIN'::public.user_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users RLS
CREATE POLICY "Public profiles read" ON public.users FOR SELECT USING (TRUE);
CREATE POLICY "Users update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Exams RLS
CREATE POLICY "Public read published exams" ON public.exams FOR SELECT USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "Admins full access to exams" ON public.exams FOR ALL USING (public.is_admin());

-- Exam Sections RLS
CREATE POLICY "Public read exam sections" ON public.exam_sections FOR SELECT USING (TRUE);
CREATE POLICY "Admins full access to exam sections" ON public.exam_sections FOR ALL USING (public.is_admin());

-- Tasks RLS
CREATE POLICY "Public read tasks" ON public.tasks FOR SELECT USING (TRUE);
CREATE POLICY "Admins full access to tasks" ON public.tasks FOR ALL USING (public.is_admin());

-- User Attempts RLS
CREATE POLICY "Users manage own attempts" ON public.user_attempts FOR ALL USING (auth.uid() = user_id);

-- Writing Attempts RLS
CREATE POLICY "Users manage own writing attempts" ON public.writing_attempts FOR ALL USING (auth.uid() = user_id);

-- Speaking Topics RLS
CREATE POLICY "Public read speaking topics" ON public.speaking_topics FOR SELECT USING (TRUE);
CREATE POLICY "Admins full access to speaking topics" ON public.speaking_topics FOR ALL USING (public.is_admin());

-- Promo Codes RLS
CREATE POLICY "Public read active promo codes" ON public.promo_codes FOR SELECT USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "Admins full access to promo codes" ON public.promo_codes FOR ALL USING (public.is_admin());

-- ========================================================
-- RPC FUNCTIONS
-- ========================================================

-- Redeem Promo Code RPC
CREATE OR REPLACE FUNCTION public.redeem_promo_code(input_code TEXT)
RETURNS JSONB AS $$
DECLARE
    found_code RECORD;
    user_id_val UUID;
BEGIN
    user_id_val := auth.uid();
    IF user_id_val IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Nutzer ist nicht angemeldet.');
    END IF;

    SELECT * INTO found_code FROM public.promo_codes
    WHERE UPPER(code) = UPPER(input_code) AND is_active = TRUE;

    IF found_code IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Ungültiger oder abgelaufener Promo-Code.');
    END IF;

    IF found_code.current_uses >= found_code.max_uses THEN
        RETURN jsonb_build_object('success', false, 'message', 'Dieser Promo-Code hat das maximale Nutzungslimit erreicht.');
    END IF;

    -- Update promo code usage count
    UPDATE public.promo_codes
    SET current_uses = current_uses + 1
    WHERE id = found_code.id;

    -- Upgrade user account to Premium
    UPDATE public.users
    SET is_premium = TRUE
    WHERE id = user_id_val;

    RETURN jsonb_build_object('success', true, 'message', 'Promo-Code erfolgreich eingelöst! Premium freigeschaltet.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auth User Sync Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role, is_premium)
    VALUES (
        NEW.id,
        NEW.email,
        CASE WHEN LOWER(NEW.email) = 'luck34y@yahoo.com' THEN 'ADMIN'::public.user_role ELSE 'USER'::public.user_role END,
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

-- ========================================================
-- SEED DEFAULT TOPICS FOR SPRECHEN & SCHREIBEN Q58
-- ========================================================

INSERT INTO public.speaking_topics (teil_number, title, description, bullet_points) VALUES
(1, 'Berufserfahrung & Werdegang', 'Stellen Sie Ihren bisherigen beruflichen Werdegang vor.', '["Ausbildung / Studium", "Wichtigste berufliche Stationen", "Zukünftige Pläne"]'::jsonb),
(1, 'Digitale Medien im Arbeitsalltag', 'Sprechen Sie über Vor- und Nachteile von Homeoffice und digitaler Kommunikation.', '["E-Mail vs Telefon", "Vor- und Nachteile von Homeoffice", "Persönliche Erfahrung"]'::jsonb),
(2, 'Weiterbildung im Betrieb', 'Präsentieren Sie Ihre Haltung zur ständigen beruflichen Fortbildung.', '["Warum ist Weiterbildung wichtig?", "Finanzierung durch den Arbeitgeber?", "Eigene Erfahrungen"]'::jsonb),
(2, 'Arbeitszeitmodelle', 'Präsentieren Sie Vor- und Nachteile von Gleitzeit und 4-Tage-Woche.', '["Gleitzeit vs starre Zeiten", "4-Tage-Woche bei vollem Gehalt", "Eigene Bewertung"]'::jsonb),
(3, 'Planung des Betriebsausflugs', 'Sie und Ihr Kollege sollen den jährlichen Sommer-Betriebsausflug organisieren.', '["Zielort und Termin", "Transportmittel", "Aktivitäten und Verpflegung"]'::jsonb),
(58, 'Gleitzeit vs. Feste Arbeitszeiten', 'Ein Diskussionsbeitrag zum Thema flexible Arbeitszeiten im Unternehmen.', '["Argumente für Gleitzeit", "Herausforderungen im Team", "Eigene Empfehlung"]'::jsonb),
(58, 'Künstliche Intelligenz am Arbeitsplatz', 'Ein Forumsbeitrag über den Einsatz von KI-Tools im Büroalltag.', '["Nutzen für die Produktivität", "Datenschutz & Risiken", "Fazit"]'::jsonb)
ON CONFLICT DO NOTHING;

-- ========================================================
-- ADMIN ELEVATION QUERY (FOR LUCK34Y@YAHOO.COM)
-- ========================================================

UPDATE public.users
SET role = 'ADMIN'::public.user_role,
    is_premium = TRUE
WHERE LOWER(email) = 'luck34y@yahoo.com';
