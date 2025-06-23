
import React, { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const ProfileLeaderboardSummary: React.FC<{ userId: string }> = ({ userId }) => {
  const [rank, setRank] = useState<number | null>(null);
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    async function fetchLeaderboardInfo() {
      // Get top 100 users by points and check self rank globally
      const { data } = await supabase
        .from("user_points")
        .select("user_id,total_points")
        .order("total_points", { ascending: false });
      if (data && data.length) {
        const idx = data.findIndex(u => u.user_id === userId);
        setRank(idx >= 0 ? idx + 1 : null);

        // Find self's points
        const myself = data.find(u => u.user_id === userId);
        setPoints(myself?.total_points || null);
      }
    }
    fetchLeaderboardInfo();
  }, [userId]);

  if (rank == null || points == null) return null;

  return (
    <div className="flex gap-2 items-center bg-yellow-50 border border-yellow-200 rounded px-3 py-1 mt-3 text-yellow-800">
      <Trophy className="w-5 h-5 text-yellow-500" />
      <span className="font-semibold">Rank #{rank}</span>
      <span className="ml-2">({points} pts)</span>
    </div>
  );
};
