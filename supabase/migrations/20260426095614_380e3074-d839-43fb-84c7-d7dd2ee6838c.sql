-- 1. Backfill any existing NULL user_id rows would be needed before NOT NULL.
--    (Currently table is empty per security scan; this is a no-op safeguard.)
DELETE FROM public.payments WHERE user_id IS NULL;

-- 2. Enforce that every payment record is owned by a user.
--    This prevents webhook/admin inserts from creating "invisible" rows that
--    bypass the SELECT RLS policy `(auth.uid() = user_id)`.
ALTER TABLE public.payments
  ALTER COLUMN user_id SET NOT NULL;

-- 3. Rename the vendor-specific column to a provider-agnostic name.
--    The application no longer references `lemon_order_id`; the new column
--    is intentionally generic so a future Polar webhook can populate it
--    without a second migration.
ALTER TABLE public.payments
  RENAME COLUMN lemon_order_id TO provider_order_id;
