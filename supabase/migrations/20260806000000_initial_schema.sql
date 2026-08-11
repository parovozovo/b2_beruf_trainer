-- ==========================================
-- Migration: telc B2 Beruf Exam Simulator Initial Schema & Seed Data
-- ==========================================

-- 1. Create Enums
CREATE TYPE public.user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE public.task_type AS ENUM ('MATCHING', 'MULTIPLE_CHOICE', 'SPRACHBAUSTEINE', 'AUDIO_CHOICE');

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role public.user_role NOT NULL DEFAULT 'USER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Exams Table
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    level VARCHAR(50) NOT NULL DEFAULT 'B2_Beruf',
    time_limit_minutes INTEGER NOT NULL DEFAULT 45,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Exam Sections Table
CREATE TABLE IF NOT EXISTS public.exam_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.exam_sections(id) ON DELETE CASCADE,
    teil_number INTEGER NOT NULL,
    type public.task_type NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create User Attempts Table
CREATE TABLE IF NOT EXISTS public.user_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_exam_sections_exam_id ON public.exam_sections(exam_id);
CREATE INDEX IF NOT EXISTS idx_tasks_section_id ON public.tasks(section_id);
CREATE INDEX IF NOT EXISTS idx_user_attempts_user_id ON public.user_attempts(user_id);

-- USER SYNC TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role)
    VALUES (new.id, new.email, 'USER')
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ROW LEVEL SECURITY
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_attempts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Users view profile" ON public.users FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Exams viewable" ON public.exams FOR SELECT USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "Exams admin" ON public.exams FOR ALL USING (public.is_admin());
CREATE POLICY "Sections viewable" ON public.exam_sections FOR SELECT USING (TRUE);
CREATE POLICY "Sections admin" ON public.exam_sections FOR ALL USING (public.is_admin());
CREATE POLICY "Tasks viewable" ON public.tasks FOR SELECT USING (TRUE);
CREATE POLICY "Tasks admin" ON public.tasks FOR ALL USING (public.is_admin());
CREATE POLICY "Attempts user" ON public.user_attempts FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- ==========================================
-- COMPLETE 8 SECTIONS SEED FOR MODELLTEST 1
-- ==========================================
DO $$
DECLARE
    v_exam_id UUID;
    s1 UUID; s2 UUID; s3 UUID; s4 UUID; s5 UUID; s6 UUID; s7 UUID; s8 UUID;
BEGIN
    -- Insert Modelltest 1
    INSERT INTO public.exams (title, level, time_limit_minutes, is_published)
    VALUES ('Modelltest 1 - telc B2 Beruf', 'B2_Beruf', 45, TRUE)
    RETURNING id INTO v_exam_id;

    -- 8 Official telc B2 Beruf Sections
    INSERT INTO public.exam_sections (exam_id, title, order_index) VALUES (v_exam_id, 'Leseverstehen Teil 1 (Matching)', 1) RETURNING id INTO s1;
    INSERT INTO public.exam_sections (exam_id, title, order_index) VALUES (v_exam_id, 'Leseverstehen Teil 2 (Multiple Choice)', 2) RETURNING id INTO s2;
    INSERT INTO public.exam_sections (exam_id, title, order_index) VALUES (v_exam_id, 'Leseverstehen Teil 3 (Matching)', 3) RETURNING id INTO s3;
    INSERT INTO public.exam_sections (exam_id, title, order_index) VALUES (v_exam_id, 'Sprachbausteine Teil 1 (Wortschatz)', 4) RETURNING id INTO s4;
    INSERT INTO public.exam_sections (exam_id, title, order_index) VALUES (v_exam_id, 'Sprachbausteine Teil 2 (Grammatik)', 5) RETURNING id INTO s5;
    INSERT INTO public.exam_sections (exam_id, title, order_index) VALUES (v_exam_id, 'Hörverstehen Teil 1 (Richtig/Falsch)', 6) RETURNING id INTO s6;
    INSERT INTO public.exam_sections (exam_id, title, order_index) VALUES (v_exam_id, 'Hörverstehen Teil 2 (Auskunft)', 7) RETURNING id INTO s7;
    INSERT INTO public.exam_sections (exam_id, title, order_index) VALUES (v_exam_id, 'Hörverstehen Teil 3 (Unterhaltung)', 8) RETURNING id INTO s8;

    -- Tasks for Section 1: Leseverstehen Teil 1
    INSERT INTO public.tasks (section_id, teil_number, type, order_index, content) VALUES (
        s1, 1, 'MATCHING', 1,
        '{
          "variant_name": "Variante A: Stellenangebote",
          "instructions": "Lesen Sie die Texte 1-4 und die Überschriften a-f. Welche Überschrift passt zu welchem Text?",
          "texts": [
            { "id": "t1", "text": "Wir suchen ab sofort eine motivierte Fachkraft im Bereich Kundenservice. Erfahrene Bewerber bevorzugt." },
            { "id": "t2", "text": "Bitte beachten Sie die neuen Sicherheitsvorschriften bezüglich Arbeitsschutz im Betrieb." },
            { "id": "t3", "text": "Fortbildung IT-Sicherheit: Am Donnerstag findet von 9:00 bis 12:00 Uhr eine Schulung im Raum 302 statt." },
            { "id": "t4", "text": "Firmenausflug 2026: Bitte tragen Sie sich bis Freitag in die Teilnehmerliste am Empfang ein." }
          ],
          "options": [
            { "id": "o_a", "text": "a) Stellenangebot im Bereich Kundenservice" },
            { "id": "o_b", "text": "b) Neue Regeln für Arbeitssicherheit" },
            { "id": "o_c", "text": "c) Schulung zur IT-Sicherheit" },
            { "id": "o_d", "text": "d) Anmeldung zum Betriebsausflug" },
            { "id": "o_e", "text": "e) Änderung der Kantinenpreise" }
          ],
          "correct_answers": { "t1": "o_a", "t2": "o_b", "t3": "o_c", "t4": "o_d" }
        }'::jsonb
    );

    -- Tasks for Section 2: Leseverstehen Teil 2
    INSERT INTO public.tasks (section_id, teil_number, type, order_index, content) VALUES (
        s2, 2, 'MULTIPLE_CHOICE', 2,
        '{
          "variant_name": "Variante A: Standorterweiterung",
          "instructions": "Lesen Sie den folgenden Text und beantworten Sie die Fragen 6-10.",
          "passage": "Die Firma TechLogis GmbH erweitert ihren Standort in Frankfurt. Aufgrund der steigenden Nachfrage im Logistiksektor werden 50 neue Arbeitsplätze in den Bereichen Lagerlogistik, Fuhrparkmanagement und Kundensupport geschaffen. Die Geschäftsleitung betont, dass insbesondere Bewerber mit Berufserfahrung und guten Deutschkenntnissen gesucht werden.",
          "questions": [
            { "id": "q6", "text": "Warum schafft die TechLogis GmbH neue Stellen?", "options": ["Wegen steigender Nachfrage im Logistiksektor", "Wegen einer Firmenfusion in Berlin", "Wegen Schließung alter Abteilungen"], "correct": "Wegen steigender Nachfrage im Logistiksektor" },
            { "id": "q7", "text": "Wie viele Arbeitsplätze entstehen neu?", "options": ["25 Arbeitsplätze", "50 Arbeitsplätze", "100 Arbeitsplätze"], "correct": "50 Arbeitsplätze" }
          ]
        }'::jsonb
    );

    -- Tasks for Section 3: Leseverstehen Teil 3
    INSERT INTO public.tasks (section_id, teil_number, type, order_index, content) VALUES (
        s3, 3, 'MATCHING', 3,
        '{
          "variant_name": "Variante A: Betriebliche Mitteilungen",
          "instructions": "Lesen Sie die Informationen 1-3 und wählen Sie die passende Zuordnung.",
          "texts": [
            { "id": "t11", "text": "Wartungsarbeiten an Aufzügen von 8:00 bis 11:00 Uhr. Nutzen Sie bitte das Treppenhaus." },
            { "id": "t12", "text": "Neue Parkkarten sind ab sofort in der Personalabteilung abholbereit." }
          ],
          "options": [
            { "id": "o_11", "text": "a) Hinweis zu Aufzugswartung und Treppenhaus" },
            { "id": "o_12", "text": "b) Abholung von Parkkarten" }
          ],
          "correct_answers": { "t11": "o_11", "t12": "o_12" }
        }'::jsonb
    );

    -- Tasks for Section 4: Sprachbausteine Teil 1
    INSERT INTO public.tasks (section_id, teil_number, type, order_index, content) VALUES (
        s4, 1, 'SPRACHBAUSTEINE', 4,
        '{
          "variant_name": "Variante A: Bewerbungsanschreiben",
          "instructions": "Lesen Sie den folgenden Text. Welche Wörter (a, b oder c) passen in die Lücken 21-25?",
          "text_template": "Sehr geehrte Damen und Herren, hiermit {gap_21} ich mich um die Stelle als Buchhalter. Ich verfüge über langjährige {gap_22} im Finanzwesen.",
          "gaps": {
            "gap_21": { "options": ["bewerbe", "interessiere", "freue"], "correct": "bewerbe" },
            "gap_22": { "options": ["Erfahrung", "Erfahrungen", "Erfahren"], "correct": "Erfahrung" }
          }
        }'::jsonb
    );

    -- Tasks for Section 5: Sprachbausteine Teil 2
    INSERT INTO public.tasks (section_id, teil_number, type, order_index, content) VALUES (
        s5, 2, 'SPRACHBAUSTEINE', 5,
        '{
          "variant_name": "Variante A: Beschwerdebrief Grammatik",
          "instructions": "Welche grammikatischen Formate passen in die Lücken 31-35?",
          "text_template": "Bezugnehmend auf Ihr Schreiben vom 12. Mai teilen wir Ihnen {gap_31} dass die Lieferung {gap_32} verzögert hat.",
          "gaps": {
            "gap_31": { "options": ["mit", "über", "an"], "correct": "mit" },
            "gap_32": { "options": ["sich", "ihn", "es"], "correct": "sich" }
          }
        }'::jsonb
    );

    -- Tasks for Section 6: Hörverstehen Teil 1
    INSERT INTO public.tasks (section_id, teil_number, type, order_index, content) VALUES (
        s6, 1, 'AUDIO_CHOICE', 6,
        '{
          "variant_name": "Variante A: Telefongespräch",
          "instructions": "Sie hören ein Gespräch. Ist die Aussage dazu richtig oder falsch?",
          "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          "play_limit": 1,
          "questions": [
            { "id": "q1", "text": "Der Bewerber hat bereits im Ausland gearbeitet.", "options": ["Richtig", "Falsch"], "correct": "Richtig" },
            { "id": "q2", "text": "Das Vorstellungsgespräch findet am Dienstag statt.", "options": ["Richtig", "Falsch"], "correct": "Falsch" }
          ]
        }'::jsonb
    );

    -- Tasks for Section 7: Hörverstehen Teil 2
    INSERT INTO public.tasks (section_id, teil_number, type, order_index, content) VALUES (
        s7, 2, 'AUDIO_CHOICE', 7,
        '{
          "variant_name": "Variante A: Durchsage Produktion",
          "instructions": "Sie hören eine Durchsage im Betrieb. Wählen Sie die richtige Lösung.",
          "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          "play_limit": 1,
          "questions": [
            { "id": "q6", "text": "Wann beginnt die Schicht?", "options": ["Um 6:00 Uhr", "Um 7:00 Uhr", "Um 8:00 Uhr"], "correct": "Um 6:00 Uhr" }
          ]
        }'::jsonb
    );

    -- Tasks for Section 8: Hörverstehen Teil 3
    INSERT INTO public.tasks (section_id, teil_number, type, order_index, content) VALUES (
        s8, 3, 'AUDIO_CHOICE', 8,
        '{
          "variant_name": "Variante A: Teambesprechung",
          "instructions": "Sie hören eine Teambesprechung. Welche Aussage trifft zu?",
          "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
          "play_limit": 1,
          "questions": [
            { "id": "q11", "text": "Das neue Projekt startet im September.", "options": ["Richtig", "Falsch"], "correct": "Richtig" }
          ]
        }'::jsonb
    );

END $$;
