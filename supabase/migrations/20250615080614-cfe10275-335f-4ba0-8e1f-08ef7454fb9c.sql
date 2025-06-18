
-- 1. Deduct 20 points from user_points on unfollow (delete from follows)
CREATE OR REPLACE FUNCTION public.deduct_points_on_unfollow()
RETURNS TRIGGER AS $$
BEGIN
  -- Only adjust points if the user is above zero (prevents negatives)
  UPDATE user_points
  SET total_points = GREATEST(total_points - 20, 0),
      spark_points = GREATEST(spark_points - 20, 0),
      updated_at = NOW()
  WHERE user_id = OLD.follower_id;
  
  -- Log point deduction in point_transactions
  INSERT INTO point_transactions (user_id, transaction_type, points, related_id)
  VALUES (OLD.follower_id, 'unfollow', -20, OLD.id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 2. Award 20 points on follow (insert into follows) [if not already present]
-- This duplicates logic from award_spark_points. Add as a trigger for follow too.
CREATE OR REPLACE FUNCTION public.add_points_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  already_given boolean;
BEGIN
  -- Prevent double points for same follow
  SELECT EXISTS (
    SELECT 1 FROM point_transactions
    WHERE user_id = NEW.follower_id
      AND transaction_type = 'spark'
      AND related_id = NEW.id
  ) INTO already_given;
  IF NOT already_given THEN
    UPDATE user_points
    SET total_points = total_points + 20,
        spark_points = spark_points + 20,
        updated_at = NOW()
    WHERE user_id = NEW.follower_id;
    INSERT INTO point_transactions (user_id, transaction_type, points, related_id)
    VALUES (NEW.follower_id, 'spark', 20, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach triggers to follows table
DROP TRIGGER IF EXISTS add_points_on_follow_trigger ON follows;
CREATE TRIGGER add_points_on_follow_trigger
AFTER INSERT ON follows
FOR EACH ROW
EXECUTE FUNCTION public.add_points_on_follow();

DROP TRIGGER IF EXISTS deduct_points_on_unfollow_trigger ON follows;
CREATE TRIGGER deduct_points_on_unfollow_trigger
AFTER DELETE ON follows
FOR EACH ROW
EXECUTE FUNCTION public.deduct_points_on_unfollow();
