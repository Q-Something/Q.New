
-- 1. Table for TBH! questions
CREATE TABLE public.tbh_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  start_at timestamp with time zone NOT NULL,
  end_at timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'draft', -- 'draft', 'live', 'expired'
  best_answer_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Table for TBH! answers
CREATE TABLE public.tbh_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id uuid NOT NULL REFERENCES public.tbh_questions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL, -- foreign key to profiles.id
  answer_text text NOT NULL CHECK (char_length(answer_text) <= 300),
  created_at timestamp with time zone DEFAULT now(),
  is_best boolean NOT NULL DEFAULT false
);

-- 3. RLS: Enable and create policies
ALTER TABLE public.tbh_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tbh_answers ENABLE ROW LEVEL SECURITY;

-- TBH questions viewable by everyone (for display)
CREATE POLICY "TBH: Public can view questions" ON public.tbh_questions
  FOR SELECT
  USING (true);

-- TBH answers: user can SELECT their own & answers for live/expired questions (for gallery/future voting)
CREATE POLICY "TBH: User can view answers if their own or question is not draft" ON public.tbh_answers
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    question_id IN (SELECT id FROM public.tbh_questions WHERE status != 'draft')
  );

-- Users can insert answers for live TBH question (one answer per user per question)
CREATE POLICY "TBH: Users can answer live TBH" ON public.tbh_answers
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    question_id IN (SELECT id FROM public.tbh_questions WHERE status = 'live' AND now() BETWEEN start_at AND end_at)
  );

-- Users can update their own answer (if question still live, optional)
CREATE POLICY "TBH: Users can edit their own answer if live" ON public.tbh_answers
  FOR UPDATE
  USING (
    user_id = auth.uid() AND
    question_id IN (SELECT id FROM public.tbh_questions WHERE status = 'live' AND now() BETWEEN start_at AND end_at)
  );

-- Users can only delete their answer before expiry
CREATE POLICY "TBH: Users can delete their own answer before expiry" ON public.tbh_answers
  FOR DELETE
  USING (
    user_id = auth.uid() AND
    question_id IN (SELECT id FROM public.tbh_questions WHERE end_at > now())
  );

-- 4. (Admin superusers) - manage everything
-- (Recommend to manage with Supabase dashboard or via extra policies or future admin roles)

-- 5. Reference from answer to best_answer_id is optional, set only by admin

-- 6. Foreign key from tbh_answers.user_id to profiles.id (not enforced because auth.users is not publicly exposed by Supabase)
--     Enforced in code for now.
