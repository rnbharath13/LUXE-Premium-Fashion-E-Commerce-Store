-- Migration 002: Add idempotency_key and payment_status to orders
-- Run this in Supabase SQL Editor before deploying the new checkout flow.

-- Idempotency key: lets the client retry checkout safely (double-click, network blip, retry)
-- without creating duplicate orders. Stored as nullable text; uniqueness enforced per-user
-- so different users can use overlapping keys (defence in depth — they shouldn't, but).
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS idempotency_key text;

CREATE UNIQUE INDEX IF NOT EXISTS orders_user_idem_unique
  ON public.orders (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Payment status: tracks whether the order has been paid for. Decoupled from `status`
-- (which tracks fulfilment: pending/processing/shipped/delivered/cancelled) so we can
-- represent e.g. shipped+paid, pending+paid (card), pending+pending (cash on delivery), etc.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Backfill: existing orders are assumed paid (pre-migration state was always-paid mock).
UPDATE public.orders SET payment_status = 'paid' WHERE payment_status IS NULL;
