CREATE POLICY "Anyone can view active discount codes"
  ON public.discount_codes
  FOR SELECT
  USING (is_active = true);