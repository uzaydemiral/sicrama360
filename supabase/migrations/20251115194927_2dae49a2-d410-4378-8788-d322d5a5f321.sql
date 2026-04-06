-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hero-videos',
  'hero-videos',
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
);

-- Create storage policies for videos bucket
CREATE POLICY "Public can view hero videos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'hero-videos');

CREATE POLICY "Admins can upload hero videos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'hero-videos' AND
  (SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ))
);

CREATE POLICY "Admins can update hero videos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'hero-videos' AND
  (SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ))
);

CREATE POLICY "Admins can delete hero videos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'hero-videos' AND
  (SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ))
);

-- Add video_url column to products table
ALTER TABLE public.products
ADD COLUMN video_url TEXT;