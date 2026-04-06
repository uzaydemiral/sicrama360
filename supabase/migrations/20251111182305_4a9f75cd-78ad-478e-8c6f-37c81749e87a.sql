-- Allow authenticated users to upload files to workout-pdfs bucket
CREATE POLICY "Authenticated users can upload PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'workout-pdfs');

-- Allow authenticated users to update PDFs
CREATE POLICY "Authenticated users can update PDFs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'workout-pdfs');

-- Allow authenticated users to delete PDFs
CREATE POLICY "Authenticated users can delete PDFs"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'workout-pdfs');