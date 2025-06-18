
-- 1. Create a trigger function to award 5 login points for each new daily visit (once per day per user)
CREATE OR REPLACE FUNCTION public.award_login_points()
RETURNS trigger AS $$
DECLARE
  awarded_today boolean;
BEGIN
  -- Check if login points already awarded today
  SELECT true INTO awarded_today FROM public.point_transactions
    WHERE user_id = NEW.user_id
      AND transaction_type = 'login'
      AND DATE(created_at) = NEW.visit_date
    LIMIT 1;
  IF NOT awarded_today THEN
    INSERT INTO public.point_transactions (user_id, transaction_type, points, related_id, created_at)
      VALUES (NEW.user_id, 'login', 5, NEW.id, now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Drop any previous login-award triggers on daily_visits
DROP TRIGGER IF EXISTS trg_award_login_points ON public.daily_visits;

-- 3. Create the new trigger (AFTER INSERT)
CREATE TRIGGER trg_award_login_points
AFTER INSERT ON public.daily_visits
FOR EACH ROW
EXECUTE FUNCTION public.award_login_points();
