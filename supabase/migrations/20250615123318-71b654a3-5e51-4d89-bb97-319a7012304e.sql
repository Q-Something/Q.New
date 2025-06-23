
-- Remove previously failed insert policy if exists
DROP POLICY IF EXISTS "Authenticated users can upload to qstory" ON storage.objects;

-- Corrected INSERT policy: only WITH CHECK used
CREATE POLICY "Authenticated users can upload to qstory"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'qstory' AND auth.role() = 'authenticated'
  );
