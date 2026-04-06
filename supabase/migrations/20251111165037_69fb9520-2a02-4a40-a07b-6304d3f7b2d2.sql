-- Add INSERT policy to orders table to prevent direct client access
-- Only edge functions with service role key can create orders

CREATE POLICY "No direct order creation"
ON public.orders
FOR INSERT
WITH CHECK (false);

-- Update table comment to reflect all security measures
COMMENT ON TABLE public.orders IS 'Orders are managed exclusively by edge functions using service role key. No direct client access allowed for any operation (SELECT, INSERT, UPDATE, DELETE).';