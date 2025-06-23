
-- 1. New table: Track daily streak collections for each user (7 days per streak)
CREATE TABLE public.daily_streak_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  streak_start_date DATE NOT NULL,
  streak_day INTEGER NOT NULL CHECK (streak_day >= 1 AND streak_day <= 7),
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, streak_start_date, streak_day)
);

-- 2. Remove old daily login points auto-award trigger
DROP TRIGGER IF EXISTS trg_award_login_points ON public.daily_visits;
DROP FUNCTION IF EXISTS public.award_login_points();

-- 3. Remove old streak bonus trigger, we will now use daily_streak_collections (optional - only if moving completely; can leave as is for now)
-- DROP TRIGGER IF EXISTS trg_award_streak_bonus ON public.daily_visits;
-- DROP FUNCTION IF EXISTS public.award_streak_bonus();

-- 4. Quiz logic: Update trigger to award +3 for correct, -2 for incorrect (overwrite)
CREATE OR REPLACE FUNCTION public.award_quiz_points()
RETURNS trigger AS $$
DECLARE
  total_pts int := 0;
  correct int := 0;
  incorrect int := 0;
  ans jsonb;
  q_id uuid;
  q_correct character;
BEGIN
  -- For each answer, award points
  FOR ans IN SELECT * FROM jsonb_each(NEW.answers)
  LOOP
    q_id := ans.key::uuid;
    SELECT correct_option INTO q_correct FROM study_test_questions WHERE id = q_id;
    IF q_correct IS NOT NULL THEN
      IF ans.value->>'ans' = q_correct THEN
        total_pts := total_pts + 3;
        correct := correct + 1;
      ELSE
        total_pts := total_pts - 2;
        incorrect := incorrect + 1;
      END IF;
    END IF;
  END LOOP;

  -- Log transaction (can be negative)
  INSERT INTO public.point_transactions (user_id, transaction_type, points, related_id)
    VALUES (NEW.student_id, 'quiz', total_pts, NEW.id);

  -- Upsert user_points for quiz points and total
  INSERT INTO public.user_points (user_id, quiz_points, total_points)
    VALUES (NEW.student_id, GREATEST(total_pts,0), GREATEST(total_pts,0))
  ON CONFLICT (user_id)
    DO UPDATE SET
      quiz_points = user_points.quiz_points + GREATEST(total_pts,0),
      total_points = user_points.total_points + total_pts,
      updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_award_quiz_points ON public.study_test_submissions;
CREATE TRIGGER tr_award_quiz_points
AFTER INSERT ON public.study_test_submissions
FOR EACH ROW
EXECUTE FUNCTION public.award_quiz_points();

-- 5. Spark: No change needed, already 1 spark = 20 points (see previous function)
-- Add spark column to user_points table for clarity if wanted (optional/skip if already exists)
-- ALTER TABLE public.user_points ADD COLUMN IF NOT EXISTS spark_points INTEGER NOT NULL DEFAULT 0;

-- 6. Points collection: Add trigger to award points on daily_streak_collections insert
CREATE OR REPLACE FUNCTION public.award_streak_collection_points()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.point_transactions (user_id, transaction_type, points, related_id)
    VALUES (NEW.user_id, 'streak_collect', 5, NEW.id);
  
  INSERT INTO public.user_points (user_id, total_points, updated_at)
    VALUES (NEW.user_id, 5, now())
  ON CONFLICT (user_id) DO UPDATE
    SET total_points = user_points.total_points + 5,
        updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_award_streak_collection_points ON public.daily_streak_collections;
CREATE TRIGGER trg_award_streak_collection_points
AFTER INSERT ON public.daily_streak_collections
FOR EACH ROW
EXECUTE FUNCTION public.award_streak_collection_points();

-- 7. Leaderboard shows from user_points (no db change needed)

-- 8. (Optional) Remove old code for daily_visits/logins if not used elsewhere.
