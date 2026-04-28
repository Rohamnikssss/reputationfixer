-- Add 'paid' value to app_role enum for paid users
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'paid';