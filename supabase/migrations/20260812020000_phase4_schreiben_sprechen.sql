-- ==========================================
-- Migration: Phase 4 - Schreiben & Sprechen Modules
-- ==========================================

-- 1. Create writing_attempts table
CREATE TABLE IF NOT EXISTS public.writing_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'BESCHWERDE' | 'FORUMSBEITRAG'
    prompt_title TEXT NOT NULL,
    user_text TEXT NOT NULL,
    character_count INTEGER NOT NULL,
    duration_seconds INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on writing_attempts
ALTER TABLE public.writing_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own writing_attempts" ON public.writing_attempts
    FOR ALL USING (auth.uid() = user_id);

-- 2. Create speaking_topics table
CREATE TABLE IF NOT EXISTS public.speaking_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teil_number INTEGER NOT NULL, -- 1 (Teil 1A), 2 (Teil 2), 3 (Teil 3) or 58 (Forumsbeitrag)
    title TEXT NOT NULL,
    description TEXT,
    bullet_points JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on speaking_topics
ALTER TABLE public.speaking_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read speaking_topics" ON public.speaking_topics
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins manage speaking_topics" ON public.speaking_topics
    FOR ALL USING (public.is_admin());

-- Seed default topics for immediate testing
INSERT INTO public.speaking_topics (teil_number, title, description, bullet_points) VALUES
(1, 'Berufserfahrung & Werdegang', 'Stellen Sie Ihren bisherigen beruflichen Werdegang vor.', '["Ausbildung / Studium", "Wichtigste berufliche Stationen", "Zukünftige Pläne"]'::jsonb),
(1, 'Digitale Medien im Arbeitsalltag', 'Sprechen Sie über Vor- und Nachteile von Homeoffice und digitaler Kommunikation.', '["E-Mail vs Telefon", "Vor- und Nachteile von Homeoffice", "Persönliche Erfahrung"]'::jsonb),
(2, 'Weiterbildung im Betrieb', 'Präsentieren Sie Ihre Haltung zur ständigen beruflichen Fortbildung.', '["Warum ist Weiterbildung wichtig?", "Finanzierung durch den Arbeitgeber?", "Eigene Erfahrungen"]'::jsonb),
(2, 'Arbeitszeitmodelle', 'Präsentieren Sie Vor- und Nachteile von Gleitzeit und 4-Tage-Woche.', '["Gleitzeit vs starre Zeiten", "4-Tage-Woche bei vollem Gehalt", "Eigene Bewertung"]'::jsonb),
(3, 'Planung des Betriebsausflugs', 'Sie und Ihr Kollege sollen den jährlichen Sommer-Betriebsausflug organisieren.', '["Zielort und Termin", "Transportmittel", "Aktivitäten und Verpflegung"]'::jsonb),
(58, 'Gleitzeit vs. Feste Arbeitszeiten', 'Ein Diskussionsbeitrag zum Thema flexible Arbeitszeiten im Unternehmen.', '["Argumente für Gleitzeit", "Herausforderungen im Team", "Eigene Empfehlung"]'::jsonb),
(58, 'Künstliche Intelligenz am Arbeitsplatz', 'Ein Forumsbeitrag über den Einsatz von KI-Tools im Büroalltag.', '["Nutzen für die Produktivität", "Datenschutz & Risiken", "Fazit"]'::jsonb)
ON CONFLICT DO NOTHING;
