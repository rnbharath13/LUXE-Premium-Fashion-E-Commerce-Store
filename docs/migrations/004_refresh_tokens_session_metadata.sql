-- Migration 004: Add device + activity metadata to refresh_tokens
-- Purpose: power the "Active Sessions" dashboard. Each refresh_tokens row is one device session.
-- Captured on creation; last_used_at advances on every successful rotation.

ALTER TABLE public.refresh_tokens
  ADD COLUMN IF NOT EXISTS user_agent   text,
  ADD COLUMN IF NOT EXISTS ip           text,
  ADD COLUMN IF NOT EXISTS last_used_at timestamptz DEFAULT now();

-- Lookups by user_id are frequent (list sessions). Index narrows to non-revoked rows.
CREATE INDEX IF NOT EXISTS refresh_tokens_user_active_idx
  ON public.refresh_tokens (user_id, last_used_at DESC)
  WHERE revoked = false;
