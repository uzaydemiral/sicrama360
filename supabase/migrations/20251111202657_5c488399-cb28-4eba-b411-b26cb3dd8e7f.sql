-- Add access token columns to orders table
ALTER TABLE public.orders 
ADD COLUMN access_token TEXT UNIQUE,
ADD COLUMN token_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster token lookups
CREATE INDEX idx_orders_access_token ON public.orders(access_token) WHERE access_token IS NOT NULL;