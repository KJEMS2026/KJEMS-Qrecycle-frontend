ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to select storage objects for authenticated users" AS objects_select_policy ON storage.objects
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to insert storage objects for authenticated users" AS objects_insert_policy ON storage.objects
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update storage objects for authenticated users" AS objects_update_policy ON storage.objects
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to delete storage objects for authenticated users" AS objects_delete_policy ON storage.objects
  FOR DELETE
  USING (auth.role() = 'authenticated');

