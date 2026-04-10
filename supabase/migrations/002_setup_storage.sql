-- 002_setup_storage.sql
-- Enable Supabase Storage bucket for image uploads

-- Create the CMS media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cms-media',
  'CMS Media',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Public policy: anyone can view files
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'cms-media');

-- Authenticated users can upload
CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cms-media' 
    AND auth.role() = 'authenticated'
  );

-- Authenticated users can delete
CREATE POLICY "Authenticated Delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'cms-media' 
    AND auth.role() = 'authenticated'
  );

-- Also allow service role (our API server) to do anything
-- (Service role bypasses RLS anyway, but this documents intent)

SELECT 'Storage bucket cms-media created!' AS result;
