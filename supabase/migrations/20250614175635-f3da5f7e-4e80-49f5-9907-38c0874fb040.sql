
-- 1. Create a database function to get leaderboard results with display_name using LEFT JOIN

CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  student_id uuid,
  display_name text,
  total_score integer,
  correct_count integer,
  incorrect_count integer,
  student_class text,
  student_stream text,
  test_id uuid
)
LANGUAGE sql
AS $$
  SELECT 
    s.student_id,
    p.display_name,
    s.total_score,
    s.correct_count,
    s.incorrect_count,
    s.student_class,
    s.student_stream,
    s.test_id
  FROM public.study_test_submissions s
    LEFT JOIN public.profiles p ON s.student_id = p.id
  ORDER BY s.total_score DESC
  LIMIT 20;
$$;

-- (Optional) To allow all users to call this function for leaderboard display (read-only)
-- You can enable execution for the anon role if needed:
GRANT EXECUTE ON FUNCTION public.get_leaderboard TO anon, authenticated;
