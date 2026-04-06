-- Drop the overly permissive "Anyone can" policies
DROP POLICY IF EXISTS "Anyone can upload PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete PDFs" ON storage.objects;

-- Allow everyone to view/download PDFs from workout-pdfs (for customer downloads)
CREATE POLICY "Public read access to workout PDFs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'workout-pdfs');

-- Only allow uploads to workout-pdfs bucket (for admin use)
CREATE POLICY "Allow uploads to workout-pdfs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'workout-pdfs');

-- Allow updates to workout-pdfs
CREATE POLICY "Allow updates to workout-pdfs"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'workout-pdfs');

-- Allow deletes from workout-pdfs
CREATE POLICY "Allow deletes from workout-pdfs"
ON storage.objects
FOR DELETE
USING (bucket_id = 'workout-pdfs');