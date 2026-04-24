-- Add output_json column to generations (non-breaking, nullable)
ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS output_json JSONB;

COMMENT ON COLUMN public.generations.output_json IS 'Full rescue pack output as JSON: { shortReply, warmReply, firmReply, privateMessage, whatNotToSay[], actionChecklist[], flagGuidance }';

-- Create payments table for Lemon Squeezy checkout records
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'pro', 'agency')),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  lemon_order_id TEXT UNIQUE,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users view own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- No insert/update/delete policies for regular users:
-- Payments are created by the Lemon Squeezy webhook handler using the service role key,
-- which bypasses RLS.

-- Timestamp update helper (reuse if exists, otherwise create)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payments_set_updated_at ON public.payments;
CREATE TRIGGER payments_set_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_email ON public.payments(email);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);