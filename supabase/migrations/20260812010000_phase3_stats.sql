-- ==========================================
-- Migration: Phase 3 - Game Modes & User Statistics
-- ==========================================

-- 1. Extend user_attempts table for Training vs Simulation modes and per-Teil breakdown
ALTER TABLE public.user_attempts
ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'SIMULATION',
ADD COLUMN IF NOT EXISTS total_possible INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS teil_scores JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Index user_attempts for fast stats queries
CREATE INDEX IF NOT EXISTS idx_user_attempts_user_mode ON public.user_attempts(user_id, mode);
