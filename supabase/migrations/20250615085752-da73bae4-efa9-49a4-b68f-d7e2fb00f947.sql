
-- 1. Recalculate and force spark_points to match followers_count * 20 for everyone
UPDATE user_points up
SET spark_points = COALESCE(p.followers_count, 0) * 20
FROM profiles p
WHERE up.user_id = p.id;

-- 2. Ensure total_points is at least as much as spark_points + quiz_points
UPDATE user_points
SET total_points = GREATEST(
  COALESCE(spark_points,0) + COALESCE(quiz_points,0),
  COALESCE(total_points,0)
);
