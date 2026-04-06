-- Create discount_codes table
CREATE TABLE public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percent', 'fixed')),
  value NUMERIC NOT NULL CHECK (value > 0),
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on discount_codes
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can view active discount codes (for validation)
CREATE POLICY "Anyone can view active discount codes"
ON public.discount_codes
FOR SELECT
USING (is_active = true);

-- Admins can manage discount codes
CREATE POLICY "Admins can manage discount codes"
ON public.discount_codes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_discount_codes_updated_at
BEFORE UPDATE ON public.discount_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing discount codes
INSERT INTO public.discount_codes (code, type, value, is_active) VALUES
  ('ATHLEVO20', 'percent', 20, true),
  ('ATHLEVO50', 'percent', 50, true),
  ('DENEME100', 'fixed', 100, true);

-- Remove public SELECT policies from storage.objects for workout-pdfs
DROP POLICY IF EXISTS "Public read access for workout-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to workout PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can download PDFs" ON storage.objects;

-- Add admin-only SELECT policy for workout-pdfs
CREATE POLICY "Admin only select from workout-pdfs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'workout-pdfs'
  AND has_role(auth.uid(), 'admin'::app_role)
);