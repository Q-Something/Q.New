
-- 1. Table to track total and category points (overall and breakdown)
CREATE TABLE public.user_points (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  login_streak INTEGER NOT NULL DEFAULT 0,
  spark_points INTEGER NOT NULL DEFAULT 0,
  quiz_points INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Table to track each user's daily login streak and visits
CREATE TABLE public.daily_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  -- Used to track one visit per day
  UNIQUE(user_id, visit_date)
);

-- 3. Table to log all point-related activities (for transparency/debugging)
CREATE TABLE public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- e.g. 'login', 'quiz', 'spark', 'streak_bonus'
  points INTEGER NOT NULL,
  related_id UUID, -- can be row id for the related entity, e.g., quiz submission id, spark id
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Policy: Secure user-specific tables, allow only user to see their own
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can read their points" ON public.user_points FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User can update only their row" ON public.user_points FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "User can insert row for self" ON public.user_points FOR INSERT WITH CHECK (user_id = auth.uid());

ALTER TABLE public.daily_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can read their visits" ON public.daily_visits FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User can insert their visits" ON public.daily_visits FOR INSERT WITH CHECK (user_id = auth.uid());

ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can read their transactions" ON public.point_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User can insert their own transactions" ON public.point_transactions FOR INSERT WITH CHECK (user_id = auth.uid());

-- 5. Indexes for performance
CREATE INDEX idx_user_points_total_points ON public.user_points(total_points DESC);
CREATE INDEX idx_point_transactions_user_id ON public.point_transactions(user_id);

-- 6. Trigger: When a 'follow' (spark) is created, award 20pts exactly once per connection
CREATE OR REPLACE FUNCTION public.award_spark_points()
RETURNS trigger AS $$
DECLARE
  has_points boolean;
BEGIN
  -- Prevent duplicate points for the same connection
  SELECT EXISTS (
    SELECT 1 FROM public.point_transactions
    WHERE user_id = NEW.follower_id
      AND transaction_type = 'spark'
      AND related_id = NEW.id
  ) INTO has_points;
  IF NOT has_points THEN
    -- Insert point transaction for the follower
    INSERT INTO public.point_transactions (user_id, transaction_type, points, related_id)
      VALUES (NEW.follower_id, 'spark', 20, NEW.id);

    -- Upsert user_points (increment spark_points and total_points)
    INSERT INTO public.user_points (user_id, spark_points, total_points)
      VALUES (NEW.follower_id, 20, 20)
    ON CONFLICT (user_id)
      DO UPDATE SET
        spark_points = user_points.spark_points + 20,
        total_points = user_points.total_points + 20,
        updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_award_spark_points ON public.follows;
CREATE TRIGGER tr_award_spark_points
AFTER INSERT ON public.follows
FOR EACH ROW
EXECUTE FUNCTION public.award_spark_points();

-- 7. Trigger: Award points for daily login/visit (5 pts/day + streak calculation logic in code)
-- We'll do this logic client-side or via edge functions, but setup table allows logging

-- 8. Trigger: When a quiz is submitted, award points based on correct answers
CREATE OR REPLACE FUNCTION public.award_quiz_points()
RETURNS trigger AS $$
DECLARE
  quiz_pts integer := NEW.correct_count;
BEGIN
  IF quiz_pts > 0 THEN
    -- Log transaction
    INSERT INTO public.point_transactions (user_id, transaction_type, points, related_id)
      VALUES (NEW.student_id, 'quiz', quiz_pts, NEW.id);

    -- Upsert user_points for quiz points and total
    INSERT INTO public.user_points (user_id, quiz_points, total_points)
      VALUES (NEW.student_id, quiz_pts, quiz_pts)
    ON CONFLICT (user_id)
      DO UPDATE SET
        quiz_points = user_points.quiz_points + quiz_pts,
        total_points = user_points.total_points + quiz_pts,
        updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_award_quiz_points ON public.study_test_submissions;
CREATE TRIGGER tr_award_quiz_points
AFTER INSERT ON public.study_test_submissions
FOR EACH ROW
EXECUTE FUNCTION public.award_quiz_points();
