
-- 1. Insert a user_points row for every profile who doesn't have one
INSERT INTO public.user_points (user_id, total_points, login_streak, spark_points, quiz_points, updated_at)
SELECT id, 0, 0, 0, 0, now()
FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.user_points);

-- 2. Create a trigger function so every new profile also gets a user_points row automatically
CREATE OR REPLACE FUNCTION public.create_user_points_on_profile_insert()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_points (user_id, total_points, login_streak, spark_points, quiz_points, updated_at)
    VALUES (NEW.id, 0, 0, 0, 0, now())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_user_points_on_profiles ON public.profiles;

CREATE TRIGGER trg_create_user_points_on_profiles
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.create_user_points_on_profile_insert();
