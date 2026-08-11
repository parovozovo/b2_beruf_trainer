-- ==========================================
-- Migration: Alpha Phase 1 - Auth, Premium System & Promo Codes
-- ==========================================

-- 1. Add is_premium column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Add is_premium column to exams table
ALTER TABLE public.exams
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Create promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 30,
    max_uses INTEGER NOT NULL DEFAULT 1,
    current_uses INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on promo_codes
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Promo codes policies
CREATE POLICY "Admins full promo_codes access" ON public.promo_codes
    FOR ALL USING (public.is_admin());

-- 4. Function for safe atomic promo code redemption by authenticated user
CREATE OR REPLACE FUNCTION public.redeem_promo_code(p_code TEXT)
RETURNS JSONB AS $$
DECLARE
    v_promo RECORD;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
    END IF;

    -- Fetch promo code
    SELECT * INTO v_promo
    FROM public.promo_codes
    WHERE LOWER(code) = LOWER(TRIM(p_code)) AND is_active = TRUE;

    IF v_promo IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid or inactive promo code');
    END IF;

    IF v_promo.current_uses >= v_promo.max_uses THEN
        RETURN jsonb_build_object('success', false, 'message', 'Promo code usage limit reached');
    END IF;

    -- Increment usage counter
    UPDATE public.promo_codes
    SET current_uses = current_uses + 1
    WHERE id = v_promo.id;

    -- Upgrade user to Premium
    UPDATE public.users
    SET is_premium = TRUE
    WHERE id = v_user_id;

    RETURN jsonb_build_object('success', true, 'message', 'Account successfully upgraded to Premium!');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Auto sync trigger to set luck34y@yahoo.com as ADMIN and Premium
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role, is_premium)
    VALUES (
        new.id,
        new.email,
        CASE WHEN LOWER(new.email) = 'luck34y@yahoo.com' THEN 'ADMIN'::public.user_role ELSE 'USER'::public.user_role END,
        CASE WHEN LOWER(new.email) = 'luck34y@yahoo.com' THEN TRUE ELSE FALSE END
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = CASE WHEN LOWER(EXCLUDED.email) = 'luck34y@yahoo.com' THEN 'ADMIN'::public.user_role ELSE public.users.role END,
        is_premium = CASE WHEN LOWER(EXCLUDED.email) = 'luck34y@yahoo.com' THEN TRUE ELSE public.users.is_premium END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
