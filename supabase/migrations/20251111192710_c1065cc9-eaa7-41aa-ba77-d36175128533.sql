-- Add redirect_url column to orders table
ALTER TABLE public.orders 
ADD COLUMN redirect_url TEXT;