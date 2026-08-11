-- ==========================================
-- Migration: Phase 4.5 - Clean RBAC & Admin Elevation
-- ==========================================

-- 1. Helper function to check if current user is ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'ADMIN'::public.user_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. SQL Snippet to elevate luck34y@yahoo.com to ADMIN and PREMIUM
UPDATE public.users
SET role = 'ADMIN'::public.user_role,
    is_premium = TRUE
WHERE LOWER(email) = 'luck34y@yahoo.com';
