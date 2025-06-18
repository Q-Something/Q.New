
-- 1. Add foreign key from tbh_answers.user_id to profiles.id
ALTER TABLE public.tbh_answers
  ADD CONSTRAINT tbh_answers_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles (id)
  ON DELETE CASCADE;

-- 2. Ensure one answer per user per TBH question (enforce at DB level for integrity)
ALTER TABLE public.tbh_answers
  ADD CONSTRAINT tbh_answers_one_per_user_per_question
  UNIQUE (question_id, user_id);
