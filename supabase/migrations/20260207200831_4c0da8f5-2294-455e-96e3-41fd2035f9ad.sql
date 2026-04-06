-- Create upsell_events table for tracking analytics
CREATE TABLE public.upsell_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'accept', 'decline')),
  upsell_price NUMERIC NOT NULL,
  base_order_amount NUMERIC,
  customer_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.upsell_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view upsell events
CREATE POLICY "Admins can view upsell events"
ON public.upsell_events
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow insert from edge functions (service role) and anonymous for tracking
CREATE POLICY "Anyone can insert upsell events"
ON public.upsell_events
FOR INSERT
WITH CHECK (true);

-- Create index for faster analytics queries
CREATE INDEX idx_upsell_events_created_at ON public.upsell_events(created_at DESC);
CREATE INDEX idx_upsell_events_type ON public.upsell_events(event_type);