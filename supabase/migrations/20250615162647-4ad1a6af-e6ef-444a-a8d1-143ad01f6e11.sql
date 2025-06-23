
-- Enable INSERT for authenticated users on tbh_questions
CREATE POLICY "Allow authenticated users to insert TBH questions"
  ON public.tbh_questions
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
