-- Drop existing table and recreate from scratch
DROP TABLE IF EXISTS public.rate_limit_tracking CASCADE;

-- Create rate limiting tracking table
CREATE TABLE public.rate_limit_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_rate_limit_ip_endpoint 
  ON public.rate_limit_tracking(ip_address, endpoint, window_start);

-- Enable RLS
ALTER TABLE public.rate_limit_tracking ENABLE ROW LEVEL SECURITY;

-- No direct access policies (only edge functions should access this)
CREATE POLICY "No direct access to rate limiting" 
  ON public.rate_limit_tracking 
  FOR ALL 
  USING (false);

-- Create function to clean up old rate limit entries
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limit_tracking
  WHERE window_start < (now() - INTERVAL '24 hours');
END;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_rate_limit_tracking_updated_at
  BEFORE UPDATE ON public.rate_limit_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();