
-- 1. Add STREAM field to study_questions (for grades 11/12)
ALTER TABLE public.study_questions
  ADD COLUMN IF NOT EXISTS stream TEXT; -- PCM, PCB, Commerce, Humanities, or NULL for 1-10

-- 2. Add submission_deadline and time_limit_sec (in seconds) for each question
ALTER TABLE public.study_questions
  ADD COLUMN IF NOT EXISTS submission_deadline TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS time_limit_sec INT;

-- 3. Add stream and class to user profiles (registration/class selection)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS class TEXT,
  ADD COLUMN IF NOT EXISTS stream TEXT; -- PCM, PCB, Commerce, Humanities, or NULL

-- 4. For leaderboard: create a materialized view for quick top scores per day/week (can adjust in next steps as needed)
-- Daily Leaderboard view (per grade and stream)
CREATE MATERIALIZED VIEW IF NOT EXISTS study_leaderboard_daily AS
SELECT
  q.grade,
  q.stream,
  s.student_id,
  COUNT(*) FILTER (WHERE s.is_correct) AS correct_count,
  SUM(s.is_correct::int * GREATEST(0, 60-s.time_taken_sec)) AS score, -- Example: max 60s/question, faster = higher
  DATE(s.created_at) AS quiz_date
FROM public.study_submissions s
JOIN public.study_questions q ON s.question_id = q.id
WHERE s.created_at >= (CURRENT_DATE - INTERVAL '2 week')
GROUP BY q.grade, q.stream, s.student_id, DATE(s.created_at);

-- Weekly Leaderboard (aggregate per week)
CREATE MATERIALIZED VIEW IF NOT EXISTS study_leaderboard_weekly AS
SELECT
  q.grade,
  q.stream,
  s.student_id,
  COUNT(*) FILTER (WHERE s.is_correct) AS correct_count,
  SUM(s.is_correct::int * GREATEST(0, 60-s.time_taken_sec)) AS score, -- Example: max 60s/question, faster = higher
  TO_CHAR(DATE_TRUNC('week', s.created_at), 'YYYY-"W"IW') AS quiz_week
FROM public.study_submissions s
JOIN public.study_questions q ON s.question_id = q.id
WHERE s.created_at >= (CURRENT_DATE - INTERVAL '6 week')
GROUP BY q.grade, q.stream, s.student_id, TO_CHAR(DATE_TRUNC('week', s.created_at), 'YYYY-"W"IW');
