
import React, { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
export const ProfileStreakSummary: React.FC<{ userId: string }> = ({ userId }) => {
  const [streak, setStreak] = useState<number | null>(null);
  useEffect(() => {
    async function fetchStreak() {
      const { data } = await supabase
        .from("user_points")
        .select("login_streak")
        .eq("user_id", userId)
        .maybeSingle();
      setStreak(data?.login_streak ?? null);
    }
    fetchStreak();
  }, [userId]);
  if (streak == null) return null;
  return (
    <div className="flex gap-2 items-center bg-orange-50 border border-orange-200 rounded px-3 py-1 text-orange-700 mt-1">
      <Flame className="w-5 h-5 text-orange-500" />
      <span className="font-semibold">{streak}-day streak</span>
    </div>
  );
};
