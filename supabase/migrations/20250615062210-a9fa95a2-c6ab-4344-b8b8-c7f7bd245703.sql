
-- 1. Trigger function: aggregate all points from point_transactions into user_points table
CREATE OR REPLACE FUNCTION public.update_user_points_from_transactions()
RETURNS trigger AS $$
DECLARE
  agg RECORD;
BEGIN
  SELECT 
    COALESCE(SUM(points), 0) AS total_points,
    COALESCE(SUM(points) FILTER (WHERE transaction_type = 'quiz'), 0) AS quiz_points,
    COALESCE(SUM(points) FILTER (WHERE transaction_type = 'spark'), 0) AS spark_points
    INTO agg
    FROM point_transactions
    WHERE user_id = NEW.user_id;

  INSERT INTO user_points (user_id, total_points, quiz_points, spark_points, updated_at)
    VALUES (NEW.user_id, agg.total_points, agg.quiz_points, agg.spark_points, now())
  ON CONFLICT (user_id) DO UPDATE
    SET 
      total_points = agg.total_points,
      quiz_points = agg.quiz_points,
      spark_points = agg.spark_points,
      updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_user_points_on_point_transactions ON public.point_transactions;
CREATE TRIGGER trg_update_user_points_on_point_transactions
AFTER INSERT OR UPDATE OR DELETE ON public.point_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_user_points_from_transactions();

-- 2. Streak: Function to calculate login streak based on daily_visits and update user_points
CREATE OR REPLACE FUNCTION public.update_login_streak()
RETURNS trigger AS $$
DECLARE
  streak INT := 0;
  prev_date DATE := NULL;
  r RECORD;
BEGIN
  FOR r IN
    SELECT visit_date FROM daily_visits
    WHERE user_id = NEW.user_id
    ORDER BY visit_date DESC
  LOOP
    IF prev_date IS NULL THEN
      streak := 1;
    ELSIF prev_date = r.visit_date + INTERVAL '1 day' THEN
      streak := streak + 1;
    ELSE
      EXIT;
    END IF;
    prev_date := r.visit_date;
  END LOOP;
  UPDATE user_points SET login_streak = streak, updated_at = now() WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_streak_on_daily_visits ON public.daily_visits;
CREATE TRIGGER trg_update_streak_on_daily_visits
AFTER INSERT ON public.daily_visits
FOR EACH ROW
EXECUTE FUNCTION public.update_login_streak();

-- 3. Streak bonus: Award bonus points for 7/14/30-day streaks if milestone reached (only once per milestone)
CREATE OR REPLACE FUNCTION public.award_streak_bonus()
RETURNS trigger AS $$
DECLARE
  streak INT;
  last_award INT := 0;
BEGIN
  SELECT login_streak INTO streak FROM user_points WHERE user_id = NEW.user_id;
  SELECT MAX(CASE WHEN transaction_type = 'streak_bonus' THEN points END) INTO last_award
    FROM point_transactions WHERE user_id = NEW.user_id;

  IF streak = 7 AND last_award IS DISTINCT FROM 7 THEN
    -- 7-day streak
    INSERT INTO point_transactions (user_id, transaction_type, points)
      VALUES (NEW.user_id, 'streak_bonus', 7);
  ELSIF streak = 14 AND last_award IS DISTINCT FROM 14 THEN
    INSERT INTO point_transactions (user_id, transaction_type, points)
      VALUES (NEW.user_id, 'streak_bonus', 14);
  ELSIF streak = 30 AND last_award IS DISTINCT FROM 30 THEN
    INSERT INTO point_transactions (user_id, transaction_type, points)
      VALUES (NEW.user_id, 'streak_bonus', 30);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_award_streak_bonus ON public.daily_visits;
CREATE TRIGGER trg_award_streak_bonus
AFTER INSERT ON public.daily_visits
FOR EACH ROW
EXECUTE FUNCTION public.award_streak_bonus();

-- 4. Backfill/force refresh all user_points (runs ONCE manually)
-- DO NOT include this as a trigger, run just once
-- (Uncomment and run once, or run via SQL Editor as a manual command)
-- INSERT INTO user_points (user_id, total_points, quiz_points, spark_points, updated_at)
-- SELECT user_id,
--   COALESCE(SUM(points),0),
--   COALESCE(SUM(points) FILTER (WHERE transaction_type = 'quiz'),0),
--   COALESCE(SUM(points) FILTER (WHERE transaction_type = 'spark'),0),
--   now()
-- FROM point_transactions
-- GROUP BY user_id
-- ON CONFLICT (user_id) DO UPDATE SET
--    total_points = EXCLUDED.total_points,
--    quiz_points = EXCLUDED.quiz_points,
--    spark_points = EXCLUDED.spark_points,
--    updated_at = now();
