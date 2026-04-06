-- Allow updates to products table (for admin PDF uploads)
CREATE POLICY "Allow PDF URL updates"
ON products
FOR UPDATE
USING (true)
WITH CHECK (true);