
-- 1. Delete any point transactions with a null user_id (data fix)
DELETE FROM point_transactions WHERE user_id IS NULL;

-- 2. Retry the sync logic: For each user, insert a zero-point 'sync' transaction to trigger recalculation.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT DISTINCT user_id FROM user_points LOOP
    INSERT INTO point_transactions (user_id, transaction_type, points)
    VALUES (r.user_id, 'sync', 0)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
