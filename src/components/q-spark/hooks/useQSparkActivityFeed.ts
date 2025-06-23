
import { useEffect, useState } from "react";
import { fetchQSparkActivityFeed } from "@/lib/api/q-spark-activity-api";

export function useQSparkActivityFeed(limit = 4) {
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshId, setRefreshId] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchQSparkActivityFeed(limit).then(feed => {
      setActivity(feed);
      setLoading(false);
    });
  }, [limit, refreshId]);

  const refresh = () => setRefreshId((r) => r + 1);

  return { activity, loading, refresh };
}
