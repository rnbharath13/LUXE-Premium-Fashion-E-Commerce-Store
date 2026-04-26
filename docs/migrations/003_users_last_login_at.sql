-- Migration 003: Track last successful login timestamp on users
-- Purpose: audit trail / suspicious-activity detection ("login from a new device" alerts later).

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

-- Index supports queries like "users active in last 30 days" without a sequential scan.
CREATE INDEX IF NOT EXISTS users_last_login_at_idx
  ON public.users (last_login_at DESC NULLS LAST);
