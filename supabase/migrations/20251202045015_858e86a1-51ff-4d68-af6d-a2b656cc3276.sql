-- Campaign settings table
CREATE TABLE IF NOT EXISTS public.campaign_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Quiz leads table
CREATE TABLE IF NOT EXISTS public.quiz_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  answers JSONB NOT NULL,
  current_jump INTEGER,
  potential_improvement INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  converted BOOLEAN DEFAULT false
);

-- Referral codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id),
  customer_email TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER DEFAULT 10,
  uses_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Referral uses table
CREATE TABLE IF NOT EXISTS public.referral_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID REFERENCES public.referral_codes(id),
  used_by_email TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaign_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_uses ENABLE ROW LEVEL SECURITY;

-- Campaign settings policies
CREATE POLICY "Anyone can view active campaigns"
  ON public.campaign_settings
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage campaigns"
  ON public.campaign_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Quiz leads policies
CREATE POLICY "Anyone can insert quiz leads"
  ON public.quiz_leads
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view quiz leads"
  ON public.quiz_leads
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update quiz leads"
  ON public.quiz_leads
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Referral codes policies
CREATE POLICY "Anyone can view referral codes by code"
  ON public.referral_codes
  FOR SELECT
  USING (true);

CREATE POLICY "System can insert referral codes"
  ON public.referral_codes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage referral codes"
  ON public.referral_codes
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Referral uses policies
CREATE POLICY "Anyone can insert referral uses"
  ON public.referral_uses
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view referral uses"
  ON public.referral_uses
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert initial campaign end date (30 Aralık 2025)
INSERT INTO public.campaign_settings (campaign_end_date, is_active)
VALUES ('2025-12-30 23:59:59+03:00', true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_campaign()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaign_settings_updated_at
  BEFORE UPDATE ON public.campaign_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_campaign();