-- Remove the policy that exposes all active discount codes to everyone
DROP POLICY IF EXISTS "Anyone can view active discount codes" ON discount_codes;