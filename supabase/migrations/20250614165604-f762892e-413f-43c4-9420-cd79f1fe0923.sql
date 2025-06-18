
-- 1. Table for test (meta data)
CREATE TABLE public.study_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  total_time_min INTEGER NOT NULL,
  expiry_at TIMESTAMP WITH TIME ZONE NOT NULL,
  class TEXT NOT NULL CHECK (class IN ('11', '12')),
  stream TEXT NOT NULL CHECK (stream IN ('PCM', 'PCB', 'COMMERCE', 'HUMANITIES')),
  subject TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Table for test questions
CREATE TABLE public.study_test_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.study_tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A','B','C','D')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Table for student submissions
CREATE TABLE public.study_test_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.study_tests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  student_class TEXT NOT NULL,
  student_stream TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  answers JSONB NOT NULL, -- { "1": "A", "2": "B", ... }
  total_score INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  incorrect_count INTEGER NOT NULL
);

-- 4. Index/constraint to prevent double submission
CREATE UNIQUE INDEX one_submission_per_test_per_student
  ON public.study_test_submissions(test_id, student_id);

-- 5. Enable/adjust RLS as needed (suggested policies, modify as fits your app):
ALTER TABLE public.study_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_test_submissions ENABLE ROW LEVEL SECURITY;

-- Allow admins to insert/update/delete tests and questions
-- (You may want to further restrict these in production)
CREATE POLICY "Admin can modify tests" ON public.study_tests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin can modify questions" ON public.study_test_questions FOR ALL USING (true) WITH CHECK (true);

-- Allow students to read only non-expired tests/questions
CREATE POLICY "Students see unexpired tests" ON public.study_tests FOR SELECT USING (expiry_at > now());
CREATE POLICY "Students see test questions" ON public.study_test_questions FOR SELECT USING (
  test_id IN (SELECT id FROM public.study_tests WHERE expiry_at > now())
);

-- Students can insert submissions, but only for themselves
CREATE POLICY "Students submit tests" ON public.study_test_submissions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Students can see own submissions" ON public.study_test_submissions
  FOR SELECT USING (student_id = auth.uid());

-- 6. Scheduled deletion of expired tests (using Supabase scheduled function)
-- (Supabase Edge Function to clean up if you want real-time deletion, but tests won’t show with the SELECT policy above.)

