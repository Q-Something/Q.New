
-- 1. Table: study_questions
CREATE TABLE public.study_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  grade INT NOT NULL,
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  choices TEXT[] NOT NULL,
  correct_index INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS: Only admins/volunteers can insert; everyone can select for their grade.
ALTER TABLE public.study_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view questions for their grade"
  ON public.study_questions
  FOR SELECT
  USING (true);

CREATE POLICY "Volunteers and admins can insert questions"
  ON public.study_questions
  FOR INSERT
  WITH CHECK (
    (EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'volunteer')
    ))
  );

-- 2. Table: study_submissions
CREATE TABLE public.study_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.study_questions(id) ON DELETE CASCADE,
  selected_index INT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken_sec INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS: Only student can insert/select their submissions, no updates/deletes
ALTER TABLE public.study_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student can insert their own submissions"
  ON public.study_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Student can read their own submissions"
  ON public.study_submissions
  FOR SELECT
  USING (auth.uid() = student_id);

-- 3. Table: study_badges
CREATE TABLE public.study_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL, -- class_topper, school_topper, etc.
  week TEXT NOT NULL, -- e.g. '2025-W24' or '2025-06-10'
  awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS: Only admins can insert badges; students can read their badges
ALTER TABLE public.study_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can award badges"
  ON public.study_badges
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Student can see their badges"
  ON public.study_badges
  FOR SELECT
  USING (auth.uid() = student_id);
