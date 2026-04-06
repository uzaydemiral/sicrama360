-- Fix critical security issues in orders table

-- Drop all existing policies first
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow order creation during payment" ON public.orders;
DROP POLICY IF EXISTS "No public order viewing" ON public.orders;
DROP POLICY IF EXISTS "Backend can update orders" ON public.orders;
DROP POLICY IF EXISTS "No order deletion" ON public.orders;

-- Create secure policies

-- 1. Allow order creation during payment process (public edge function with service role)
-- Edge functions use service role key, so they bypass RLS
-- No policy needed for INSERT since edge functions handle this securely

-- 2. No direct order viewing through client
-- Only backend/admin tools can view orders using service role key
CREATE POLICY "No direct order access"
ON public.orders
FOR SELECT
USING (false);

-- 3. No updates from client
-- Only edge functions with service role key can update
CREATE POLICY "No direct order updates"
ON public.orders
FOR UPDATE
USING (false);

-- 4. No deletions allowed
CREATE POLICY "No order deletion"
ON public.orders
FOR DELETE
USING (false);

-- Add comments for clarity
COMMENT ON TABLE public.orders IS 'Orders are managed exclusively by edge functions using service role key. No direct client access.';
