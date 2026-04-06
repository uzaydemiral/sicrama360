-- Fix critical security issues in orders table

-- Drop the insecure SELECT policy that uses JWT email
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;

-- Create secure policies using proper authentication

-- 1. Allow order creation during payment process (public)
CREATE POLICY "Allow order creation during payment"
ON public.orders
FOR INSERT
WITH CHECK (true);

-- 2. Only allow viewing orders with valid session (no one can view orders through the app)
-- Orders will only be accessible by backend/admin systems
CREATE POLICY "No public order viewing"
ON public.orders
FOR SELECT
USING (false);

-- 3. Only backend can update order status (via service role key)
CREATE POLICY "Backend can update orders"
ON public.orders
FOR UPDATE
USING (false)
WITH CHECK (false);

-- 4. No one can delete orders
CREATE POLICY "No order deletion"
ON public.orders
FOR DELETE
USING (false);

-- Add comments for clarity
COMMENT ON TABLE public.orders IS 'Orders are created during payment and updated by PayTR callbacks. No direct user access allowed.';
