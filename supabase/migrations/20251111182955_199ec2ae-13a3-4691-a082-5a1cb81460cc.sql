-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete PDFs" ON storage.objects;

-- Allow anyone to upload files to workout-pdfs bucket (for admin use)
CREATE POLICY "Anyone can upload PDFs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'workout-pdfs');

-- Allow anyone to update PDFs
CREATE POLICY "Anyone can update PDFs"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'workout-pdfs');

-- Allow anyone to delete PDFs
CREATE POLICY "Anyone can delete PDFs"
ON storage.objects
FOR DELETE
USING (bucket_id = 'workout-pdfs');